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

task("deploy", "Deploy SimpleMusic", async (taskArgs, hre) => {
  const SimpleMusic = await hre.ethers.getContractFactory('SimpleMusic');
  const music = await SimpleMusic.deploy();
  await music.deployed();
  console.log('SimpleMusic deployed to:', music.address);
});
