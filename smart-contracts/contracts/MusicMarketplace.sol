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
    }

    uint256 private marketplaceFee = 250;
    mapping(uint256 => ListedItem) private _listedItems;
    uint256[] private _allListedTokenIds;

    event ItemListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event ItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event ItemCanceled(uint256 indexed tokenId, address indexed seller);
    event MarketplaceFeeUpdated(uint256 newFee);

    constructor(address musicNFTAddress) {
        musicNFTContract = MusicNFT(musicNFTAddress);
    }

    function setMusicNFTContract(address newAddress) external onlyOwner {
        musicNFTContract = MusicNFT(newAddress);
    }

    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    function getMarketplaceFee() external view returns (uint256) {
        return marketplaceFee;
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
            isActive: true
        });

        _allListedTokenIds.push(tokenId);
        emit ItemListed(tokenId, msg.sender, price);
    }

    function buyItem(uint256 tokenId) external payable nonReentrant {
        ListedItem storage item = _listedItems[tokenId];

        require(item.isActive, "Item is not for sale");
        require(msg.value >= item.price, "Insufficient funds sent");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        (address creator, uint256 royaltyPercentage) = musicNFTContract
            .getRoyaltyInfo(tokenId);
        uint256 royaltyAmount = (item.price * royaltyPercentage) / 10000;
        uint256 marketplaceAmount = (item.price * marketplaceFee) / 10000;
        uint256 sellerAmount = item.price - royaltyAmount - marketplaceAmount;

        item.isActive = false;
        item.owner = msg.sender;

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

        musicNFTContract.safeTransferFrom(item.seller, msg.sender, tokenId);
        emit ItemSold(tokenId, item.seller, msg.sender, item.price);

        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - item.price
            }("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }

    function cancelListing(uint256 tokenId) external {
        ListedItem storage item = _listedItems[tokenId];

        require(item.isActive, "Item is not listed");
        require(item.seller == msg.sender, "Only seller can cancel listing");

        item.isActive = false;
        emit ItemCanceled(tokenId, msg.sender);
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
}
