import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import MusicNFTABI from '../../smart-contracts/artifacts/contracts/MusicNFT.sol/MusicNFT.json'
import MusicMarketplaceABI from '../../smart-contracts/artifacts/contracts/MusicMarketplace.sol/MusicMarketplace.json'

export const useWeb3Store = defineStore('web3', () => {
  const isConnected = ref(false)
  const account = ref('')
  const provider = ref(null)
  const signer = ref(null)
  const musicNFTContract = ref(null)
  const marketplaceContract = ref(null)
  
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
        console.log('Wallet connected:', account.value)
      } else {
        alert('Please install MetaMask!')
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Error connecting to wallet')
    }
  }

  function disconnectWallet() {
    isConnected.value = false
    account.value = ''
    provider.value = null
    signer.value = null
    musicNFTContract.value = null
    marketplaceContract.value = null
    console.log('Wallet disconnected')
  }

  return {
    isConnected,
    account,
    provider,
    signer,
    musicNFTContract,
    marketplaceContract,
    connectWallet,
    disconnectWallet
  }
})