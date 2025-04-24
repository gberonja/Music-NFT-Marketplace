import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

import MusicNFTABI from '../../smart-contracts/artifacts/contracts/MusicNFT.sol/MusicNFT.json'
import MusicMarketplaceABI from '../../smart-contracts/artifacts/contracts/MusicMarketplace.sol/MusicMarketplace.json'

export const useWeb3Store = defineStore('web3', {
  state: () => ({
    isConnected: false,
    account: null,
    chainId: null,
    provider: null,
    signer: null,
    musicNFTContract: null,
    marketplaceContract: null,
    musicNFTAddress: import.meta.env.VITE_MUSICNFT_ADDRESS || null,
    marketplaceAddress: import.meta.env.VITE_MARKETPLACE_ADDRESS || null,
    error: null
  }),
  
  actions: {
    async connectWallet() {
      try {
        this.error = null
        const provider = await detectEthereumProvider()
        
        if (provider) {
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          const chainId = await provider.request({ method: 'eth_chainId' })
          
          this.account = accounts[0]
          this.chainId = chainId
          
          this.provider = new ethers.providers.Web3Provider(window.ethereum)
          this.signer = this.provider.getSigner()
          
          if (this.musicNFTAddress && this.marketplaceAddress) {
            this.initContracts()
          }
          
          this.isConnected = true
          
          window.ethereum.on('accountsChanged', this.handleAccountsChanged)
          window.ethereum.on('chainChanged', this.handleChainChanged)
        } else {
          this.error = 'Molimo instalirajte MetaMask!'
          console.error('MetaMask nije instaliran')
        }
      } catch (error) {
        this.error = error.message || 'Greška pri povezivanju s novčanikom'
        console.error('Greška pri povezivanju s novčanikom:', error)
      }
    },
    
    async initContracts() {
      try {
        this.musicNFTContract = new ethers.Contract(
          this.musicNFTAddress,
          MusicNFTABI.abi,
          this.signer
        )
        
        this.marketplaceContract = new ethers.Contract(
          this.marketplaceAddress,
          MusicMarketplaceABI.abi,
          this.signer
        )
      } catch (error) {
        this.error = 'Greška pri inicijalizaciji ugovora'
        console.error('Greška pri inicijalizaciji ugovora:', error)
      }
    },
    
    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.disconnectWallet()
      } else {
        this.account = accounts[0]
      }
    },
    
    handleChainChanged(chainId) {
      window.location.reload()
    },
    
    disconnectWallet() {
      this.isConnected = false
      this.account = null
      this.chainId = null
      this.provider = null
      this.signer = null
      this.musicNFTContract = null
      this.marketplaceContract = null
      
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', this.handleChainChanged)
      }
    }
  }
})