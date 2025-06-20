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

    struct MusicMetadata {
        string genre;
        uint256 duration;
        uint256 releaseYear;
        bool isExplicit;
    }

    mapping(uint256 => MusicMetadata) private _musicMetadata;

    event MusicNFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint256 royaltyPercentage,
        string genre
    );

    constructor() ERC721("MusicNFT", "MNFT") {}

    function mintMusic(
        address recipient,
        string memory _tokenURI,
        uint256 royaltyPercentage,
        string memory genre,
        uint256 duration,
        uint256 releaseYear,
        bool isExplicit
    ) public returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty cannot exceed 10%");
        require(bytes(genre).length > 0, "Genre cannot be empty");
        require(duration > 0, "Duration must be greater than 0");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        _tokenRoyalties[newTokenId] = royaltyPercentage;
        _originalCreators[newTokenId] = recipient;

        _musicMetadata[newTokenId] = MusicMetadata({
            genre: genre,
            duration: duration,
            releaseYear: releaseYear,
            isExplicit: isExplicit
        });

        emit MusicNFTCreated(
            newTokenId,
            recipient,
            _tokenURI,
            royaltyPercentage,
            genre
        );

        return newTokenId;
    }

    function mintMusic(
        address recipient,
        string memory _tokenURI,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        return
            mintMusic(
                recipient,
                _tokenURI,
                royaltyPercentage,
                "Unknown",
                0,
                2023,
                false
            );
    }

    function getMusicMetadata(
        uint256 tokenId
    )
        external
        view
        returns (
            string memory genre,
            uint256 duration,
            uint256 releaseYear,
            bool isExplicit
        )
    {
        require(_exists(tokenId), "Token does not exist");
        MusicMetadata memory metadata = _musicMetadata[tokenId];
        return (
            metadata.genre,
            metadata.duration,
            metadata.releaseYear,
            metadata.isExplicit
        );
    }

    function getTokensByGenre(
        string memory genre
    ) external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIds.current();
        uint256[] memory tempResult = new uint256[](totalTokens);
        uint256 resultCount = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (
                keccak256(bytes(_musicMetadata[i].genre)) ==
                keccak256(bytes(genre))
            ) {
                tempResult[resultCount] = i;
                resultCount++;
            }
        }

        uint256[] memory result = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = tempResult[i];
        }

        return result;
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

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
