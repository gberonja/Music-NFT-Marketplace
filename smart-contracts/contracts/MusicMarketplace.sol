// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./MusicNFT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusicMarketplace is ReentrancyGuard, Ownable {
    MusicNFT private musicNFTContract;

    struct ListedItem {
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        bool isActive;
        uint256 listedAt;
        string category;
    }

    uint256 private marketplaceFee = 250;
    uint256 private constant MAX_ROYALTY = 1000;
    uint256 private constant MAX_MARKETPLACE_FEE = 1000;

    mapping(uint256 => ListedItem) private _listedItems;
    uint256[] private _allListedTokenIds;

    mapping(address => uint256) private _userSales;
    mapping(address => uint256) private _userPurchases;

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Bid[]) private _tokenBids;
    mapping(uint256 => uint256) private _minBidPrice;

    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        string category
    );
    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event ItemCanceled(uint256 indexed tokenId, address indexed seller);
    event MarketplaceFeeUpdated(uint256 newFee);
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    event BidAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed bidder,
        uint256 amount
    );

    constructor(address musicNFTAddress) {
        musicNFTContract = MusicNFT(musicNFTAddress);
    }

    function listItem(
        uint256 tokenId,
        uint256 price,
        string memory category
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(bytes(category).length > 0, "Category cannot be empty");
        require(
            musicNFTContract.ownerOf(tokenId) == msg.sender,
            "You don't own this token"
        );
        require(
            musicNFTContract.getApproved(tokenId) == address(this) ||
                musicNFTContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer token"
        );

        _listedItems[tokenId] = ListedItem({
            tokenId: tokenId,
            seller: msg.sender,
            owner: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp,
            category: category
        });

        _allListedTokenIds.push(tokenId);
        emit ItemListed(tokenId, msg.sender, price, category);
    }

    function listItem(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            musicNFTContract.ownerOf(tokenId) == msg.sender,
            "You don't own this token"
        );
        require(
            musicNFTContract.getApproved(tokenId) == address(this) ||
                musicNFTContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer token"
        );

        _listedItems[tokenId] = ListedItem({
            tokenId: tokenId,
            seller: msg.sender,
            owner: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp,
            category: "Music"
        });

        _allListedTokenIds.push(tokenId);
        emit ItemListed(tokenId, msg.sender, price, "Music");
    }

    function setMinBidPrice(uint256 tokenId, uint256 minPrice) external {
        require(
            _listedItems[tokenId].seller == msg.sender,
            "Only seller can set min bid price"
        );
        require(_listedItems[tokenId].isActive, "Item is not listed");
        _minBidPrice[tokenId] = minPrice;
    }

    function placeBid(uint256 tokenId) external payable {
        require(_listedItems[tokenId].isActive, "Item is not for sale");
        require(
            msg.sender != _listedItems[tokenId].seller,
            "Seller cannot bid on own item"
        );
        require(msg.value >= _minBidPrice[tokenId], "Bid too low");

        Bid[] storage bids = _tokenBids[tokenId];
        if (bids.length > 0) {
            require(
                msg.value > bids[bids.length - 1].amount,
                "Bid must be higher than current highest"
            );

            (bool success, ) = payable(bids[bids.length - 1].bidder).call{
                value: bids[bids.length - 1].amount
            }("");
            require(success, "Failed to refund previous bidder");
        }

        bids.push(
            Bid({
                bidder: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function acceptBid(uint256 tokenId) external nonReentrant {
        require(
            _listedItems[tokenId].seller == msg.sender,
            "Only seller can accept bid"
        );
        require(_listedItems[tokenId].isActive, "Item is not listed");

        Bid[] storage bids = _tokenBids[tokenId];
        require(bids.length > 0, "No bids available");

        Bid memory highestBid = bids[bids.length - 1];

        _executeSale(tokenId, highestBid.bidder, highestBid.amount);

        emit BidAccepted(
            tokenId,
            msg.sender,
            highestBid.bidder,
            highestBid.amount
        );
    }

    function buyItem(uint256 tokenId) external payable nonReentrant {
        ListedItem storage item = _listedItems[tokenId];
        require(item.isActive, "Item is not for sale");
        require(msg.value >= item.price, "Insufficient funds sent");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        _executeSale(tokenId, msg.sender, item.price);

        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - item.price
            }("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }

    function _executeSale(
        uint256 tokenId,
        address buyer,
        uint256 salePrice
    ) private {
        ListedItem storage item = _listedItems[tokenId];

        (address creator, uint256 royaltyPercentage) = musicNFTContract
            .getRoyaltyInfo(tokenId);
        uint256 royaltyAmount = (salePrice * royaltyPercentage) / 10000;
        uint256 marketplaceAmount = (salePrice * marketplaceFee) / 10000;
        uint256 sellerAmount = salePrice - royaltyAmount - marketplaceAmount;

        item.isActive = false;
        item.owner = buyer;

        _userSales[item.seller]++;
        _userPurchases[buyer]++;

        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(creator).call{
                value: royaltyAmount
            }("");
            require(royaltySuccess, "Failed to send royalty");
        }

        if (marketplaceAmount > 0) {
            (bool feeSuccess, ) = payable(owner()).call{
                value: marketplaceAmount
            }("");
            require(feeSuccess, "Failed to send marketplace fee");
        }

        (bool sellerSuccess, ) = payable(item.seller).call{value: sellerAmount}(
            ""
        );
        require(sellerSuccess, "Failed to send payment to seller");

        musicNFTContract.safeTransferFrom(item.seller, buyer, tokenId);

        delete _tokenBids[tokenId];
        delete _minBidPrice[tokenId];

        emit ItemSold(tokenId, item.seller, buyer, salePrice);
    }

    function getUserSales(address user) external view returns (uint256) {
        return _userSales[user];
    }

    function getUserPurchases(address user) external view returns (uint256) {
        return _userPurchases[user];
    }

    function getTokenBids(
        uint256 tokenId
    ) external view returns (Bid[] memory) {
        return _tokenBids[tokenId];
    }

    function getItemsByCategory(
        string memory category
    ) external view returns (ListedItem[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < _allListedTokenIds.length; i++) {
            uint256 tokenId = _allListedTokenIds[i];
            if (
                _listedItems[tokenId].isActive &&
                keccak256(bytes(_listedItems[tokenId].category)) ==
                keccak256(bytes(category))
            ) {
                count++;
            }
        }

        ListedItem[] memory result = new ListedItem[](count);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < _allListedTokenIds.length; i++) {
            uint256 tokenId = _allListedTokenIds[i];
            if (
                _listedItems[tokenId].isActive &&
                keccak256(bytes(_listedItems[tokenId].category)) ==
                keccak256(bytes(category))
            ) {
                result[resultIndex] = _listedItems[tokenId];
                resultIndex++;
            }
        }

        return result;
    }

    function cancelListing(uint256 tokenId) external {
        ListedItem storage item = _listedItems[tokenId];
        require(item.isActive, "Item is not listed");
        require(item.seller == msg.sender, "Only seller can cancel listing");

        item.isActive = false;

        Bid[] storage bids = _tokenBids[tokenId];
        for (uint256 i = 0; i < bids.length; i++) {
            (bool success, ) = payable(bids[i].bidder).call{
                value: bids[i].amount
            }("");
            require(success, "Failed to refund bidder");
        }

        delete _tokenBids[tokenId];
        delete _minBidPrice[tokenId];

        emit ItemCanceled(tokenId, msg.sender);
    }

    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_MARKETPLACE_FEE, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    function getAllListedItems() external view returns (ListedItem[] memory) {
        uint256 activeItemCount = 0;
        for (uint256 i = 0; i < _allListedTokenIds.length; i++) {
            if (_listedItems[_allListedTokenIds[i]].isActive) {
                activeItemCount++;
            }
        }

        ListedItem[] memory items = new ListedItem[](activeItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _allListedTokenIds.length; i++) {
            uint256 tokenId = _allListedTokenIds[i];
            ListedItem storage item = _listedItems[tokenId];
            if (item.isActive) {
                items[currentIndex] = item;
                currentIndex++;
            }
        }

        return items;
    }

    function getListedItem(
        uint256 tokenId
    ) external view returns (ListedItem memory) {
        return _listedItems[tokenId];
    }

    function getMarketplaceFee() external view returns (uint256) {
        return marketplaceFee;
    }
}
