const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MusicMarketplace", function () {
  let MusicNFT;
  let musicNFT;
  let MusicMarketplace;
  let marketplace;
  let owner;
  let artist;
  let buyer;
  let tokenId;
  
  // Priprema enviromenta
  beforeEach(async function () {
    [owner, artist, buyer] = await ethers.getSigners();
    
    // Deployanje
    MusicNFT = await ethers.getContractFactory("MusicNFT");
    musicNFT = await MusicNFT.deploy();
    await musicNFT.deployed();
    
    MusicMarketplace = await ethers.getContractFactory("MusicMarketplace");
    marketplace = await MusicMarketplace.deploy(musicNFT.address);
    await marketplace.deployed();
    
    // NFT
    const tokenURI = "ipfs://QmExample";
    const royaltyPercentage = 500;
    const tx = await musicNFT.connect(artist).mintMusic(artist.address, tokenURI, royaltyPercentage);
    const receipt = await tx.wait();
    tokenId = 1;
    
    // Approve marketplace za transfer NFT-a
    await musicNFT.connect(artist).approve(marketplace.address, tokenId);
  });

  // Test za listanje NFT-a
  it("Treba listati NFT na tržištu", async function () {
    const price = ethers.utils.parseEther("1"); // 1 ETH
    
    await marketplace.connect(artist).listItem(tokenId, price);
    
    const listedItem = await marketplace.getListedItem(tokenId);
    expect(listedItem.tokenId).to.equal(tokenId);
    expect(listedItem.seller).to.equal(artist.address);
    expect(listedItem.price).to.equal(price);
    expect(listedItem.isActive).to.be.true;
  });

  // Testovi i provjere
  it("Treba omogućiti kupnju NFT-a i isplatiti royalty", async function () {
    const price = ethers.utils.parseEther("1");
    
    await marketplace.connect(artist).listItem(tokenId, price);
    
    const initialArtistBalance = await artist.getBalance();
    const initialOwnerBalance = await owner.getBalance();
    
    await marketplace.connect(buyer).buyItem(tokenId, { value: price });
    

    expect(await musicNFT.ownerOf(tokenId)).to.equal(buyer.address);
    
    const listedItem = await marketplace.getListedItem(tokenId);
    expect(listedItem.isActive).to.be.false;
    
    const finalArtistBalance = await artist.getBalance();
    const finalOwnerBalance = await owner.getBalance();
    

    const royaltyAmount = price.mul(500).div(10000);
    const marketplaceFee = price.mul(250).div(10000);
    const sellerAmount = price.sub(royaltyAmount).sub(marketplaceFee);
    

    expect(finalArtistBalance.sub(initialArtistBalance)).to.be.closeTo(
      sellerAmount.add(royaltyAmount),
      ethers.utils.parseEther("0.01") 
    );
    
    expect(finalOwnerBalance.sub(initialOwnerBalance)).to.be.closeTo(
      marketplaceFee,
      ethers.utils.parseEther("0.01")
    );
  });


  it("Treba dopustiti prodavatelju da poništi listanje", async function () {
    const price = ethers.utils.parseEther("1");
    

    await marketplace.connect(artist).listItem(tokenId, price);
    

    await marketplace.connect(artist).cancelListing(tokenId);
    

    const listedItem = await marketplace.getListedItem(tokenId);
    expect(listedItem.isActive).to.be.false;
  });


  it("Treba dopustiti vlasniku da promijeni marketplace naknadu", async function () {
    const newFee = 300
    
    await marketplace.connect(owner).setMarketplaceFee(newFee);
    
    expect(await marketplace.getMarketplaceFee()).to.equal(newFee);
  });
});