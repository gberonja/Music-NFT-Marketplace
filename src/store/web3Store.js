import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

// Import ABI-jeva
import MusicNFTABI from '../../smart-contracts/artifacts/contracts/MusicNFT.sol/MusicNFT.json'
import MusicMarketplaceABI from '../../smart-contracts/artifacts/contracts/MusicMarketplace.sol/MusicMarketplace.json'

export const useWeb3Store = defineStore('web3', () => {
  const isConnected = ref(false)
  const account = ref('')
  const provider = ref(null)
  const signer = ref(null)
  const musicNFTContract = ref(null)
  const marketplaceContract = ref(null)
  
  // Contract adrese iz .env
  const musicNFTAddress = import.meta.env.VITE_MUSICNFT_ADDRESS
  const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS

  async function connectWallet() {
    try {
      const ethereumProvider = await detectEthereumProvider()
      
      if (ethereumProvider) {
        const accounts = await ethereumProvider.request({ 
          method: 'eth_requestAccounts' 
        })
        
        account.value = accounts[0]
        provider.value = new ethers.providers.Web3Provider(window.ethereum)
        signer.value = provider.value.getSigner()
        
        // Stvori contract instance
        musicNFTContract.value = new ethers.Contract(
          musicNFTAddress,
          MusicNFTABI.abi,
          signer.value
        )
        
        marketplaceContract.value = new ethers.Contract(
          marketplaceAddress,
          MusicMarketplaceABI.abi,
          signer.value
        )
        
        isConnected.value = true
        console.log('Wallet povezan:', account.value)
      } else {
        alert('Molimo instalirajte MetaMask!')
      }
    } catch (error) {
      console.error('Greška pri povezivanju:', error)
      alert('Greška pri povezivanju s novčanikom')
    }
  }

  return {
    isConnected,
    account,
    connectWallet,
    musicNFTContract,
    marketplaceContract
  }
})