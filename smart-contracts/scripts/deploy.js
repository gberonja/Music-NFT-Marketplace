const { ethers } = require("hardhat");

async function main() {
  console.log("Započinjem deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MusicNFT = await ethers.getContractFactory("MusicNFT");
  const musicNFT = await MusicNFT.deploy();
  await musicNFT.deployed();
  console.log("MusicNFT deployed to:", musicNFT.address);

  const MusicMarketplace = await ethers.getContractFactory("MusicMarketplace");
  const musicMarketplace = await MusicMarketplace.deploy(musicNFT.address);
  await musicMarketplace.deployed();
  console.log("MusicMarketplace deployed to:", musicMarketplace.address);

  console.log("Deployment završen!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });