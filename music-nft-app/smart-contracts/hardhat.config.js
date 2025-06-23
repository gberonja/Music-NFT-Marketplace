require("@nomiclabs/hardhat-ethers");
const { task } = require("hardhat/config");

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545", 
      chainId: 1337
    }
  },
  defaultNetwork: "localhost"
};

task("deploy", "Deploy Music contracts with Auction system", async (taskArgs, hre) => {
  console.log("Deploying contracts...");
  
  // Deploy SimpleMusic first
  console.log("1. Deploying SimpleMusic contract...");
  const SimpleMusic = await hre.ethers.getContractFactory('SimpleMusic');
  const musicContract = await SimpleMusic.deploy();
  await musicContract.deployed();
  console.log('✅ SimpleMusic deployed to:', musicContract.address);
  
  // Deploy MusicAuction
  console.log("2. Deploying MusicAuction contract...");
  const MusicAuction = await hre.ethers.getContractFactory('MusicAuction');
  const auctionContract = await MusicAuction.deploy(musicContract.address);
  await auctionContract.deployed();
  console.log('✅ MusicAuction deployed to:', auctionContract.address);
  
  // Connect contracts
  console.log("3. Connecting contracts...");
  await musicContract.setAuctionContract(auctionContract.address);
  console.log('✅ Contracts connected successfully!');
  
  console.log('\n🎉 Deployment completed!');
  console.log('\n📝 ADD TO YOUR .env FILE:');
  console.log(`VITE_MUSIC_CONTRACT_ADDRESS=${musicContract.address}`);
  console.log(`VITE_AUCTION_CONTRACT_ADDRESS=${auctionContract.address}`);
  console.log('\n🚀 Start your Vue app: npm run dev');
});