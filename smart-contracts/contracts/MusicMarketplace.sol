// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./MusicNFT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusicMarketplace is ReentrancyGuard, Ownable {
    // Reference na MusicNFT ugovor
    MusicNFT private musicNFTContract;
    
    // Struktura za praćenje stavki na prodaji
    struct ListedItem {
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        bool isActive;
    }
    
    // Fee za tržište (u basis points, 250 = 2.5%)
    uint256 private marketplaceFee = 250;
    
    // Mapiranje token ID-a na podatke o listanju
    mapping(uint256 => ListedItem) private _listedItems;
    
    // Lista svih token ID-ova na prodaji
    uint256[] private _allListedTokenIds;
    
    // Događaji
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ItemCanceled(uint256 indexed tokenId, address indexed seller);
    event MarketplaceFeeUpdated(uint256 newFee);

    constructor(address musicNFTAddress) Ownable(msg.sender) {
        musicNFTContract = MusicNFT(musicNFTAddress);
    }
    
    /**
     * @dev Postavlja novu MusicNFT adresu ugovora (samo vlasnik)
     * @param newAddress Nova adresa MusicNFT ugovora
     */
    function setMusicNFTContract(address newAddress) external onlyOwner {
        musicNFTContract = MusicNFT(newAddress);
    }
    
    /**
     * @dev Postavlja novu naknadu za tržište (samo vlasnik)
     * @param newFee Nova naknada u basis points (100 = 1%)
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }
    
    /**
     * @dev Vraća trenutnu naknadu za tržište
     */
    function getMarketplaceFee() external view returns (uint256) {
        return marketplaceFee;
    }
    
    /**
     * @dev Stavlja NFT na prodaju
     * @param tokenId ID tokena za prodaju
     * @param price Cijena u wei
     */
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
    
    /**
     * @dev Kupuje NFT s tržišta
     * @param tokenId ID tokena za kupnju
     */
    function buyItem(uint256 tokenId) external payable nonReentrant {
        ListedItem storage item = _listedItems[tokenId];
        
        require(item.isActive, "Item is not for sale");
        require(msg.value >= item.price, "Insufficient funds sent");
        require(msg.sender != item.seller, "Seller cannot buy their own item");
        
        // Izračun naknada
        (address creator, uint256 royaltyPercentage) = musicNFTContract.getRoyaltyInfo(tokenId);
        uint256 royaltyAmount = (item.price * royaltyPercentage) / 10000;
        uint256 marketplaceAmount = (item.price * marketplaceFee) / 10000;
        uint256 sellerAmount = item.price - royaltyAmount - marketplaceAmount;
        
        // Transferi
        item.isActive = false;
        item.owner = msg.sender;
        
        // Plaćanje royalty naknade originalnom kreatoru
        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(creator).call{value: royaltyAmount}("");
            require(royaltySuccess, "Failed to send royalty");
        }
        
        // Plaćanje tržišne naknade vlasniku tržišta
        if (marketplaceAmount > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: marketplaceAmount}("");
            require(feeSuccess, "Failed to send marketplace fee");
        }
        
        // Plaćanje prodavatelju
        (bool sellerSuccess, ) = payable(item.seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Failed to send payment to seller");
        
        // Transfer NFT-a kupcu
        musicNFTContract.safeTransferFrom(item.seller, msg.sender, tokenId);
        
        emit ItemSold(tokenId, item.seller, msg.sender, item.price);
        
        // Povrat viška poslanih sredstava (ako postoji)
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - item.price}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }
    
    /**
     * @dev Poništava listanje NFT-a
     * @param tokenId ID tokena
     */
    function cancelListing(uint256 tokenId) external {
        ListedItem storage item = _listedItems[tokenId];
        
        require(item.isActive, "Item is not listed");
        require(item.seller == msg.sender, "Only seller can cancel listing");
        
        item.isActive = false;
        
        emit ItemCanceled(tokenId, msg.sender);
    }
    
    /**
     * @dev Dohvaća sve aktivne stavke na prodaji
     */
    function getAllListedItems() external view returns (ListedItem[] memory) {
        uint256 activeItemCount = 0;
        
        // Brojanje aktivnih stavki
        for (uint256 i = 0; i < _allListedTokenIds.length; i++) {
            if (_listedItems[_allListedTokenIds[i]].isActive) {
                activeItemCount++;
            }
        }
        
        // Kreiranje i punjenje polja s aktivnim stavkama
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
    
    /**
     * @dev Dohvaća informacije o specifičnoj stavci
     * @param tokenId ID tokena
     */
    function getListedItem(uint256 tokenId) external view returns (ListedItem memory) {
        return _listedItems[tokenId];
    }
}