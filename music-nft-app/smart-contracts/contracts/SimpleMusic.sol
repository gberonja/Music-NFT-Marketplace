// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleMusic {
    struct Song {
        string title;
        string artist;
        uint256 price;
        address owner;
        bool forSale;
        bool isAuction;
        uint256 auctionId;
    }

    Song[] public songs;
    address public auctionContract;

    event SongCreated(uint256 id, string title, address owner);
    event SongSold(uint256 id, address from, address to);
    event AuctionStarted(uint256 songId, uint256 auctionId);

    modifier onlyOwner(uint256 _songId) {
        require(songs[_songId].owner == msg.sender, "Not the owner");
        _;
    }

    function setAuctionContract(address _auctionContract) external {
        require(auctionContract == address(0), "Auction contract already set");
        auctionContract = _auctionContract;
    }

    function createSong(
        string memory _title,
        string memory _artist,
        uint256 _price
    ) public {
        songs.push(
            Song({
                title: _title,
                artist: _artist,
                price: _price,
                owner: msg.sender,
                forSale: true,
                isAuction: false,
                auctionId: 0
            })
        );

        emit SongCreated(songs.length - 1, _title, msg.sender);
    }

    function buySong(uint256 _id) public payable {
        require(_id < songs.length, "Song does not exist");
        Song storage song = songs[_id];
        require(
            song.forSale && !song.isAuction,
            "Song not for sale or is in auction"
        );
        require(msg.value >= song.price, "Not enough payment");
        require(song.owner != msg.sender, "Cannot buy your own song");

        address oldOwner = song.owner;
        song.owner = msg.sender;
        song.forSale = false;

        payable(oldOwner).transfer(msg.value);

        emit SongSold(_id, oldOwner, msg.sender);
    }

    function startAuction(
        uint256 _songId,
        uint256 _startingBid,
        uint256 _duration
    ) external onlyOwner(_songId) {
        require(auctionContract != address(0), "Auction contract not set");
        require(
            songs[_songId].forSale && !songs[_songId].isAuction,
            "Song not available for auction"
        );

        songs[_songId].isAuction = true;
        songs[_songId].forSale = false;

        uint256 auctionId = MusicAuction(auctionContract).createAuction(
            _songId,
            _startingBid,
            _duration,
            msg.sender
        );
        songs[_songId].auctionId = auctionId;

        emit AuctionStarted(_songId, auctionId);
    }

    function transferOwnership(uint256 _songId, address _newOwner) external {
        require(
            msg.sender == auctionContract,
            "Only auction contract can transfer"
        );
        songs[_songId].owner = _newOwner;
        songs[_songId].isAuction = false;
        songs[_songId].auctionId = 0;
    }

    function getSongCount() public view returns (uint256) {
        return songs.length;
    }
}

contract MusicAuction {
    struct Auction {
        uint256 songId;
        address seller;
        uint256 startingBid;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        bool exists;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;

    uint256 public auctionCounter;
    SimpleMusic public musicContract;

    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed songId,
        uint256 startingBid,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 amount
    );

    constructor(address _musicContract) {
        musicContract = SimpleMusic(_musicContract);
    }

    function createAuction(
        uint256 _songId,
        uint256 _startingBid,
        uint256 _duration,
        address _seller
    ) external returns (uint256) {
        require(
            msg.sender == address(musicContract),
            "Only music contract can create auctions"
        );

        uint256 auctionId = auctionCounter++;

        auctions[auctionId] = Auction({
            songId: _songId,
            seller: _seller,
            startingBid: _startingBid,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + _duration,
            ended: false,
            exists: true
        });

        emit AuctionCreated(
            auctionId,
            _songId,
            _startingBid,
            block.timestamp + _duration
        );
        return auctionId;
    }

    function placeBid(uint256 _auctionId) external payable {
        Auction storage auction = auctions[_auctionId];
        require(auction.exists, "Auction does not exist");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(
            msg.value > auction.highestBid,
            "Bid must be higher than current highest"
        );
        require(
            msg.value >= auction.startingBid,
            "Bid must be at least starting bid"
        );
        require(
            msg.sender != auction.seller,
            "Seller cannot bid on own auction"
        );

        if (auction.highestBidder != address(0)) {
            pendingReturns[_auctionId][auction.highestBidder] += auction
                .highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(auction.exists, "Auction does not exist");
        require(
            block.timestamp >= auction.endTime,
            "Auction has not ended yet"
        );
        require(!auction.ended, "Auction already ended");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            musicContract.transferOwnership(
                auction.songId,
                auction.highestBidder
            );
            payable(auction.seller).transfer(auction.highestBid);
            emit AuctionEnded(
                _auctionId,
                auction.highestBidder,
                auction.highestBid
            );
        } else {
            emit AuctionEnded(_auctionId, address(0), 0);
        }
    }

    function withdraw(uint256 _auctionId) external {
        uint256 amount = pendingReturns[_auctionId][msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingReturns[_auctionId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getAuction(
        uint256 _auctionId
    )
        external
        view
        returns (
            uint256 songId,
            address seller,
            uint256 startingBid,
            uint256 highestBid,
            address highestBidder,
            uint256 endTime,
            bool ended,
            uint256 timeLeft
        )
    {
        Auction storage auction = auctions[_auctionId];
        require(auction.exists, "Auction does not exist");

        uint256 timeRemaining = 0;
        if (block.timestamp < auction.endTime) {
            timeRemaining = auction.endTime - block.timestamp;
        }

        return (
            auction.songId,
            auction.seller,
            auction.startingBid,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.ended,
            timeRemaining
        );
    }

    function getActiveAuctions() external view returns (uint256[] memory) {
        uint256[] memory activeAuctions = new uint256[](auctionCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < auctionCounter; i++) {
            if (
                auctions[i].exists &&
                !auctions[i].ended &&
                block.timestamp < auctions[i].endTime
            ) {
                activeAuctions[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeAuctions[i];
        }

        return result;
    }
}
