// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleMusic {
    
    struct Song {
        string title;
        string artist;
        uint256 price;
        address owner;
        bool forSale;
    }
    
    Song[] public songs;
    
    event SongCreated(uint256 id, string title, address owner);
    event SongSold(uint256 id, address from, address to);
    
    function createSong(string memory _title, string memory _artist, uint256 _price) public {
        songs.push(Song({
            title: _title,
            artist: _artist,
            price: _price,
            owner: msg.sender,
            forSale: true
        }));
        
        emit SongCreated(songs.length - 1, _title, msg.sender);
    }
    
    function buySong(uint256 _id) public payable {
        require(_id < songs.length, "Song does not exist");
        Song storage song = songs[_id];
        require(song.forSale, "Song not for sale");
        require(msg.value >= song.price, "Not enough payment");
        require(song.owner != msg.sender, "Cannot buy your own song");
        
        address oldOwner = song.owner;
        song.owner = msg.sender;
        song.forSale = false;
        
        payable(oldOwner).transfer(msg.value);
        
        emit SongSold(_id, oldOwner, msg.sender);
    }
    
    function getSongCount() public view returns (uint256) {
        return songs.length;
    }
}
