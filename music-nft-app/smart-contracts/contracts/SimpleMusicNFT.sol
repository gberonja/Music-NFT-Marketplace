// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleMusicNFT {
    struct Music {
        string title;
        string artist;
        string ipfsHash;
        address owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => Music) public musicTokens;
    uint256 public tokenCounter;

    event MusicCreated(
        uint256 tokenId,
        string title,
        string artist,
        address owner
    );
    event MusicSold(uint256 tokenId, address from, address to, uint256 price);

    constructor() {
        tokenCounter = 0;
    }

    function createMusic(
        string memory _title,
        string memory _artist,
        string memory _ipfsHash,
        uint256 _price
    ) public {
        musicTokens[tokenCounter] = Music({
            title: _title,
            artist: _artist,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            price: _price,
            forSale: true
        });

        emit MusicCreated(tokenCounter, _title, _artist, msg.sender);
        tokenCounter++;
    }

    function buyMusic(uint256 _tokenId) public payable {
        Music storage music = musicTokens[_tokenId];
        require(music.forSale, "Music not for sale");
        require(msg.value >= music.price, "Insufficient payment");
        require(music.owner != msg.sender, "Cannot buy your own music");

        address previousOwner = music.owner;
        music.owner = msg.sender;
        music.forSale = false;

        // Transfer payment to previous owner
        payable(previousOwner).transfer(msg.value);

        emit MusicSold(_tokenId, previousOwner, msg.sender, msg.value);
    }

    function setForSale(uint256 _tokenId, uint256 _price) public {
        require(musicTokens[_tokenId].owner == msg.sender, "Not the owner");
        musicTokens[_tokenId].forSale = true;
        musicTokens[_tokenId].price = _price;
    }

    function getAllMusic() public view returns (Music[] memory) {
        Music[] memory allMusic = new Music[](tokenCounter);
        for (uint256 i = 0; i < tokenCounter; i++) {
            allMusic[i] = musicTokens[i];
        }
        return allMusic;
    }

    function getMyMusic() public view returns (Music[] memory) {
        uint256 myCount = 0;

        // Count my music first
        for (uint256 i = 0; i < tokenCounter; i++) {
            if (musicTokens[i].owner == msg.sender) {
                myCount++;
            }
        }

        // Create array and fill it
        Music[] memory myMusic = new Music[](myCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < tokenCounter; i++) {
            if (musicTokens[i].owner == msg.sender) {
                myMusic[currentIndex] = musicTokens[i];
                currentIndex++;
            }
        }

        return myMusic;
    }
}
