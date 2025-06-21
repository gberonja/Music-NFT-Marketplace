import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

export const useWeb3Store = defineStore('web3', () => {
  const isConnected = ref(false)
  const account = ref('')
  const provider = ref(null)
  const signer = ref(null)
  
  const musicNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const marketplaceAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

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
        
        isConnected.value = true
        console.log('Wallet connected:', account.value)
        console.log('Ready for transactions!')
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
    console.log('Wallet disconnected')
  }

  return {
    isConnected,
    account,
    provider,
    signer,
    musicNFTAddress,
    marketplaceAddress,
    connectWallet,
    disconnectWallet
  }
})