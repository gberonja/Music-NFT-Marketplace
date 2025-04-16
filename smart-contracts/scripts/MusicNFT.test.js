const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusicNFT", function () {
  let MusicNFT;
  let musicNFT;
  let owner;
  let artist;
  let buyer;

  // Deployanje novog ugovora
  beforeEach(async function () {
    [owner, artist, buyer] = await ethers.getSigners();
    
    MusicNFT = await ethers.getContractFactory("MusicNFT");
    musicNFT = await MusicNFT.deploy();
    await musicNFT.deployed();
  });

  // Test za mintanje novog NFT-a
  it("Treba mintati novi NFT i postaviti ispravne royalty informacije", async function () {
    const tokenURI = "ipfs://QmTzGaX5kWAyYZ4xLp3uS2U2Lc7MZALa7M2kCZcGK7sBHd";
    const royaltyPercentage = 500; // postotak (5%)
    
    // provjere
    await musicNFT.connect(artist).mintMusic(artist.address, tokenURI, royaltyPercentage);
    
    expect(await musicNFT.ownerOf(1)).to.equal(artist.address);
    
    expect(await musicNFT.tokenURI(1)).to.equal(tokenURI);
    
    const [creator, percentage] = await musicNFT.getRoyaltyInfo(1);
    expect(creator).to.equal(artist.address);
    expect(percentage).to.equal(royaltyPercentage);
  });

  // Testovi
  it("Treba odbiti mintanje s prevelikim royalty postotkom", async function () {
    const tokenURI = "ipfs://QmExample";
    const tooHighRoyalty = 1500; // 15%
    
    await expect(
      musicNFT.connect(artist).mintMusic(artist.address, tokenURI, tooHighRoyalty)
    ).to.be.revertedWith("Royalty cannot exceed 10%");
  });

  // Test
  it("Treba ispravno dohvatiti originalnog kreatora", async function () {
    const tokenURI = "ipfs://QmExample";
    const royaltyPercentage = 300; // 3%
    
    await musicNFT.connect(artist).mintMusic(artist.address, tokenURI, royaltyPercentage);
    
    expect(await musicNFT.getOriginalCreator(1)).to.equal(artist.address);
  });
});