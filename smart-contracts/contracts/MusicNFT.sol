// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MusicNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) private _tokenRoyalties;
    mapping(uint256 => address) private _originalCreators;

    event MusicNFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint256 royaltyPercentage
    );

    constructor() ERC721("MusicNFT", "MNFT") {}

    function mintMusic(
        address recipient,
        string memory _tokenURI,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty cannot exceed 10%");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        _tokenRoyalties[newTokenId] = royaltyPercentage;
        _originalCreators[newTokenId] = recipient;

        emit MusicNFTCreated(
            newTokenId,
            recipient,
            _tokenURI,
            royaltyPercentage
        );

        return newTokenId;
    }

    function getRoyaltyInfo(
        uint256 tokenId
    ) external view returns (address, uint256) {
        require(_exists(tokenId), "Token does not exist");
        return (_originalCreators[tokenId], _tokenRoyalties[tokenId]);
    }

    function getOriginalCreator(
        uint256 tokenId
    ) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _originalCreators[tokenId];
    }
}
