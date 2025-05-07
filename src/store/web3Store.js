import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'


import MusicNFTABI from '../../smart-contracts/artifacts/contracts/MusicNFT.sol/MusicNFT.json'
import MusicMarketplaceABI from '../../smart-contracts/artifacts/contracts/MusicMarketplace.sol/MusicMarketplace.json'

export const useWeb3Store = defineStore('web3', () => {
  const isConnected = ref(false)
  const account = ref(null)
  const chainId = ref(null)
  const provider = ref(null)
  const signer = ref(null)
  const musicNFTContract = ref(null)
  const marketplaceContract = ref(null)
  const musicNFTAddress = ref(import.meta.env.VITE_MUSICNFT_ADDRESS || null)
  const marketplaceAddress = ref(import.meta.env.VITE_MARKETPLACE_ADDRESS || null)
  const error = ref(null)


  const contractsInitialized = computed(() => {
    return !!musicNFTContract.value && !!marketplaceContract.value
  })

  async function connectWallet() {
    try {
      error.value = null
      const ethereumProvider = await detectEthereumProvider()
      
      if (ethereumProvider) {
        const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' })
        const currentChainId = await ethereumProvider.request({ method: 'eth_chainId' })
        
        account.value = accounts[0]
        chainId.value = currentChainId
        
        provider.value = new ethers.providers.Web3Provider(window.ethereum)
        signer.value = provider.value.getSigner()
        
        if (musicNFTAddress.value && marketplaceAddress.value) {
          await initContracts()
        }
        
        isConnected.value = true
        
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
      } else {
        error.value = 'Molimo instalirajte MetaMask!'
        console.error('MetaMask nije instaliran')
      }
    } catch (err) {
      error.value = err.message || 'Greška pri povezivanju s novčanikom'
      console.error('Greška pri povezivanju s novčanikom:', err)
    }
  }
  
  async function initContracts() {
    try {
      musicNFTContract.value = new ethers.Contract(
        musicNFTAddress.value,
        MusicNFTABI.abi,
        signer.value
      )
      
      marketplaceContract.value = new ethers.Contract(
        marketplaceAddress.value,
        MusicMarketplaceABI.abi,
        signer.value
      )
    } catch (err) {
      error.value = 'Greška pri inicijalizaciji ugovora'
      console.error('Greška pri inicijalizaciji ugovora:', err)
    }
  }
  
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      account.value = accounts[0]
    }
  }
  
  function handleChainChanged() {
    window.location.reload()
  }
  
  function disconnectWallet() {
    isConnected.value = false
    account.value = null
    chainId.value = null
    provider.value = null
    signer.value = null
    musicNFTContract.value = null
    marketplaceContract.value = null
    
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  return {

    isConnected,
    account,
    chainId,
    provider,
    signer,
    musicNFTContract,
    marketplaceContract,
    musicNFTAddress,
    marketplaceAddress,
    error,
    

    contractsInitialized,
    
  
    connectWallet,
    initContracts,
    disconnectWallet
  }
})