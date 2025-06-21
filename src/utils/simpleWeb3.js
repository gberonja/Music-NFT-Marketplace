const MUSIC_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export async function testTransaction(account) {
  try {
    console.log("Sending test transaction...")
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: MUSIC_NFT_ADDRESS,
        value: '0x0', // 0 ETH
        gas: '0x5208' // 21,000 gas
      }]
    })
    
    console.log("Test transaction sent:", txHash)
    return { hash: txHash }
    
  } catch (error) {
    console.error("Test transaction error:", error)
    throw error
  }
}

export async function mintNFTBasic(account, tokenURI, royalty) {
  try {
    // Basic contract call - mintMusic function signature
    const functionSignature = "0x3b1f3e0d" // mintMusic signature
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: MUSIC_NFT_ADDRESS,
        gas: '0x493E0', // 300,000
        data: functionSignature
      }]
    })
    
    return { hash: txHash }
    
  } catch (error) {
    throw error
  }
}