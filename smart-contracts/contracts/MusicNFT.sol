// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MusicNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Mapiranje token ID-a na royalty postotak
    mapping(uint256 => uint256) private _tokenRoyalties;
    
    // Mapiranje token ID-a na originalnog autora
    mapping(uint256 => address) private _originalCreators;
    
    // Event prilikom kreiranja novog NFT-a
    event MusicNFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,  /* lokacija metapodataka tokena */
        uint256 royaltyPercentage /* # tantijemi */
    );

    constructor() ERC721("MusicNFT", "MNFT") Ownable(msg.sender) {}

    function mintMusic(
        address recipient,
        string memory tokenURI,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty cannot exceed 10%");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Postavljanje royalty postotka i kreator informacija
        _tokenRoyalties[newTokenId] = royaltyPercentage;
        _originalCreators[newTokenId] = recipient;
        
        emit MusicNFTCreated(newTokenId, recipient, tokenURI, royaltyPercentage);
        
        return newTokenId;
    }
    
    /**
     * @dev Dohvaća informacije o royalty naknadi za token
     * @param tokenId ID tokena
     * @return Adresa primatelja royalty naknade i postotak royalty naknade
     */
    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address, uint256) 
    {
        require(_exists(tokenId), "Token does not exist");
        return (_originalCreators[tokenId], _tokenRoyalties[tokenId]);
    }
    
    /**
     * @dev Dohvaća adresu originalnog kreatora tokena
     * @param tokenId ID tokena
     */
    function getOriginalCreator(uint256 tokenId) 
        external 
        view 
        returns (address) 
    {
        require(_exists(tokenId), "Token does not exist");
        return _originalCreators[tokenId];
    }
    
    /**
     * @dev Implementacija _beforeTokenTransfer funkcije za ERC721Enumerable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override potrebnih funkcija zbog višestrukog nasljeđivanja
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }
}