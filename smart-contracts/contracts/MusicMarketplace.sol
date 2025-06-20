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

    // NOVO: Praćenje prodaja po korisnicima
    mapping(address => uint256) private _userSales;
    mapping(address => uint256) private _userPurchases;

    // NOVO: Aktivni ponude (bidding)
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Bid[]) private _tokenBids;
    mapping(uint256 => uint256) private _minBidPrice;

    // Events
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

    // POBOLJŠANA listItem funkcija s kategorijom
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

    // NOVA: Funkcija za postavljanje minimalne cijene za bidding
    function setMinBidPrice(uint256 tokenId, uint256 minPrice) external {
        require(
            _listedItems[tokenId].seller == msg.sender,
            "Only seller can set min bid price"
        );
        require(_listedItems[tokenId].isActive, "Item is not listed");
        _minBidPrice[tokenId] = minPrice;
    }

    // NOVA: Funkcija za bidding
    function placeBid(uint256 tokenId) external payable {
        require(_listedItems[tokenId].isActive, "Item is not for sale");
        require(
            msg.sender != _listedItems[tokenId].seller,
            "Seller cannot bid on own item"
        );
        require(msg.value >= _minBidPrice[tokenId], "Bid too low");

        // Provjeri da li je bid veći od trenutno najvećeg
        Bid[] storage bids = _tokenBids[tokenId];
        if (bids.length > 0) {
            require(
                msg.value > bids[bids.length - 1].amount,
                "Bid must be higher than current highest"
            );

            // Vrati novac prethodnom bideru
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

    // NOVA: Prihvaćanje bid-a
    function acceptBid(uint256 tokenId) external nonReentrant {
        require(
            _listedItems[tokenId].seller == msg.sender,
            "Only seller can accept bid"
        );
        require(_listedItems[tokenId].isActive, "Item is not listed");

        Bid[] storage bids = _tokenBids[tokenId];
        require(bids.length > 0, "No bids available");

        Bid memory highestBid = bids[bids.length - 1];

        // Izvrši prodaju s bid cijenom
        _executeSale(tokenId, highestBid.bidder, highestBid.amount);

        emit BidAccepted(
            tokenId,
            msg.sender,
            highestBid.bidder,
            highestBid.amount
        );
    }

    // Postojeća buyItem funkcija
    function buyItem(uint256 tokenId) external payable nonReentrant {
        ListedItem storage item = _listedItems[tokenId];
        require(item.isActive, "Item is not for sale");
        require(msg.value >= item.price, "Insufficient funds sent");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        _executeSale(tokenId, msg.sender, item.price);

        // Refund excess payment
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - item.price
            }("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }

    // NOVA: Privatna funkcija za izvršavanje prodaje
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

        // Povećaj brojače prodaja/kupnji
        _userSales[item.seller]++;
        _userPurchases[buyer]++;

        // Pošalji royalty
        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(creator).call{
                value: royaltyAmount
            }("");
            require(royaltySuccess, "Failed to send royalty");
        }

        // Pošalji marketplace fee
        if (marketplaceAmount > 0) {
            (bool feeSuccess, ) = payable(owner()).call{
                value: marketplaceAmount
            }("");
            require(feeSuccess, "Failed to send marketplace fee");
        }

        // Pošalji novac prodavatelju
        (bool sellerSuccess, ) = payable(item.seller).call{value: sellerAmount}(
            ""
        );
        require(sellerSuccess, "Failed to send payment to seller");

        // Transfer NFT-a
        musicNFTContract.safeTransferFrom(item.seller, buyer, tokenId);

        // Očisti bidove
        delete _tokenBids[tokenId];
        delete _minBidPrice[tokenId];

        emit ItemSold(tokenId, item.seller, buyer, salePrice);
    }

    // NOVE: Getter funkcije za analitiku
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

        // Prebroji matches
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

        // Stvori rezultat
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

    // Postojeće funkcije ostaju iste...
    function cancelListing(uint256 tokenId) external {
        ListedItem storage item = _listedItems[tokenId];
        require(item.isActive, "Item is not listed");
        require(item.seller == msg.sender, "Only seller can cancel listing");

        item.isActive = false;

        // Vrati novac svim biderima
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
