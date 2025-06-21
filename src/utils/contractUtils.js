// src/utils/contractUtils.js
import { ethers } from 'ethers'

const MUSIC_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const MARKETPLACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

// Simplified ABI - samo funkcije koje trebamo
const MUSIC_NFT_ABI = [
  "function mintMusic(address recipient, string _tokenURI, uint256 royaltyPercentage) public returns (uint256)",
  "function mintMusic(address recipient, string _tokenURI, uint256 royaltyPercentage, string genre, uint256 duration, uint256 releaseYear, bool isExplicit) public returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
]

const MARKETPLACE_ABI = [
  "function getAllListedItems() external view returns (tuple(uint256,address,address,uint256,bool,uint256,string)[])",
  "function buyItem(uint256 tokenId) external payable"
]

export async function mintMusicNFT(signer, recipient, tokenURI, royaltyPercentage) {
  try {
    // Direct contract call bez proxy
    const provider = signer.provider
    
    // ABI encode the function call
    const contractInterface = new ethers.utils.Interface(MUSIC_NFT_ABI)
    const data = contractInterface.encodeFunctionData("mintMusic(address,string,uint256)", [
      recipient,
      tokenURI,
      royaltyPercentage
    ])
    
    console.log("Sending raw transaction...", {
      to: MUSIC_NFT_ADDRESS,
      data: data,
      from: await signer.getAddress()
    })
    
    // Send raw transaction
    const tx = await signer.sendTransaction({
      to: MUSIC_NFT_ADDRESS,
      data: data,
      gasLimit: ethers.utils.hexlify(300000), // 300k gas limit
    })
    
    console.log("Transaction sent:", tx.hash)
    
    const receipt = await tx.wait()
    console.log("Transaction confirmed:", receipt)
    
    return { transaction: tx, receipt: receipt }
    
  } catch (error) {
    console.error("Mint error:", error)
    throw error
  }
}

export async function buyMarketplaceItem(signer, tokenId, price) {
  try {
    const contractInterface = new ethers.utils.Interface(MARKETPLACE_ABI)
    const data = contractInterface.encodeFunctionData("buyItem", [tokenId])
    
    const tx = await signer.sendTransaction({
      to: MARKETPLACE_ADDRESS,
      data: data,
      value: price,
      gasLimit: ethers.utils.hexlify(300000),
    })
    
    const receipt = await tx.wait()
    return { transaction: tx, receipt: receipt }
    
  } catch (error) {
    console.error("Buy error:", error)
    throw error
  }
}

export { MUSIC_NFT_ADDRESS, MARKETPLACE_ADDRESS }