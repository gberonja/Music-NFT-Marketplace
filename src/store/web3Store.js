import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

// Contract ABIs - Extended with all necessary functions
const MUSIC_NFT_ABI = [
  // Basic ERC721
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  
  // Custom functions - try both signatures
  "function mintMusic(address recipient, string memory _tokenURI, uint256 royaltyPercentage) public returns (uint256)",
  "function mintMusic(address recipient, string memory _tokenURI, uint256 royaltyPercentage, string memory genre, uint256 duration, uint256 releaseYear, bool isExplicit) public returns (uint256)",
  "function getRoyaltyInfo(uint256 tokenId) external view returns (address, uint256)",
  "function getOriginalCreator(uint256 tokenId) external view returns (address)",
  
  // Events
  "event MusicNFTCreated(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 royaltyPercentage, string genre)"
]

const MARKETPLACE_ABI = [
  // All possible listItem signatures
  "function listItem(uint256 tokenId, uint256 price, string memory category) external",
  "function listItem(uint256 tokenId, uint256 price) external", 
  "function buyItem(uint256 tokenId) external payable",
  "function cancelListing(uint256 tokenId) external",
  "function getAllListedItems() external view returns (tuple(uint256,address,address,uint256,bool,uint256,string)[])",
  "function getListedItem(uint256 tokenId) external view returns (tuple(uint256,address,address,uint256,bool,uint256,string))",
  "function getMarketplaceFee() external view returns (uint256)"
]

export const useWeb3Store = defineStore('web3', () => {
  const isConnected = ref(false)
  const account = ref('')
  const provider = ref(null)
  const signer = ref(null)
  const musicNFTContract = ref(null)
  const marketplaceContract = ref(null)
  const error = ref(null)
  
  const musicNFTAddress = import.meta.env.VITE_MUSICNFT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

  const isReady = computed(() => {
    return isConnected.value && musicNFTContract.value && marketplaceContract.value
  })

  async function connectWallet() {
    try {
      console.log('🔗 Connecting wallet...')
      error.value = null
      
      const ethereumProvider = await detectEthereumProvider()
      
      if (!ethereumProvider) {
        throw new Error('Please install MetaMask!')
      }

      console.log('📱 MetaMask detected')
      
      const accounts = await ethereumProvider.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      
      console.log('👤 Account found:', accounts[0])
      
      // Check network
      const chainId = await ethereumProvider.request({ method: 'eth_chainId' })
      console.log('🌐 Chain ID:', chainId)
      
      if (chainId !== '0x539') { // 1337 in hex
        try {
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }]
          })
        } catch (switchError) {
          throw new Error('Please switch to Localhost 8545 network (Chain ID: 1337)')
        }
      }
      
      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const signerInstance = web3Provider.getSigner()
      
      console.log('⚡ Creating contracts...')
      
      // Create contracts
      const musicContract = new ethers.Contract(
        musicNFTAddress,
        MUSIC_NFT_ABI,
        signerInstance
      )
      
      const marketContract = new ethers.Contract(
        marketplaceAddress,
        MARKETPLACE_ABI,
        signerInstance
      )
      
      // Test contracts
      console.log('🧪 Testing contracts...')
      try {
        const totalSupply = await musicContract.totalSupply()
        console.log('✅ MusicNFT contract OK, total supply:', totalSupply.toString())
        
        // Safer way to test functions without accessing proxy properties
        try {
          console.log('🔍 Testing mintMusic function availability...')
          // Just test that the interface has the function without calling it
          const hasExtendedMint = musicContract.interface.getFunction('mintMusic(address,string,uint256,string,uint256,uint256,bool)')
          const hasBasicMint = musicContract.interface.getFunction('mintMusic(address,string,uint256)')
          
          if (hasExtendedMint) {
            console.log('✅ Extended mintMusic function available')
          }
          if (hasBasicMint) {
            console.log('✅ Basic mintMusic function available')
          }
        } catch (funcTestError) {
          console.warn('⚠️ Could not verify mintMusic functions:', funcTestError.message)
          console.log('✅ Contract interface seems valid, proceeding...')
        }
        
      } catch (err) {
        console.error('❌ MusicNFT contract failed:', err)
        throw new Error('MusicNFT contract not found. Please check deployment.')
      }
      
      try {
        await marketContract.getMarketplaceFee()
        console.log('✅ Marketplace contract OK')
      } catch (err) {
        console.error('❌ Marketplace contract failed:', err)
        throw new Error('Marketplace contract not found. Please check deployment.')
      }
      
      // Update state
      account.value = accounts[0]
      provider.value = web3Provider
      signer.value = signerInstance
      musicNFTContract.value = musicContract
      marketplaceContract.value = marketContract
      isConnected.value = true
      
      console.log('🎉 Wallet connected successfully!')
      
      // Setup listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', () => window.location.reload())
      
    } catch (err) {
      console.error('❌ Connection error:', err)
      error.value = err.message
      disconnectWallet()
      throw err
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (account.value !== accounts[0]) {
      // Account changed, reconnect
      disconnectWallet()
      setTimeout(connectWallet, 100)
    }
  }

  function disconnectWallet() {
    console.log('🔌 Disconnecting wallet...')
    
    isConnected.value = false
    account.value = ''
    provider.value = null
    signer.value = null
    musicNFTContract.value = null
    marketplaceContract.value = null
    error.value = null
    
    if (window.ethereum) {
      window.ethereum.removeAllListeners()
    }
  }

  return {
    isConnected,
    account,
    provider,
    signer,
    musicNFTContract,
    marketplaceContract,
    musicNFTAddress,
    marketplaceAddress,
    error,
    isReady,
    connectWallet,
    disconnectWallet
  }
})