import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeb3Store } from './web3Store'
import { ethers } from 'ethers'

export const useMarketplaceStore = defineStore('marketplace', () => {
  const web3Store = useWeb3Store()
  
  const listedItems = ref([])
  const loadingItems = ref(false)
  const error = ref(null)
  
  async function fetchListedItems() {
    if (!web3Store.marketplaceContract) {
      error.value = 'Marketplace contract not initialized'
      return
    }
    
    try {
      loadingItems.value = true
      error.value = null
      
      const items = await web3Store.marketplaceContract.getAllListedItems()
      const itemsWithMetadata = []
      
      for (const item of items) {
        try {
          const tokenURI = await web3Store.musicNFTContract.tokenURI(item.tokenId)
          
          let metadata = {}
          if (tokenURI) {
            const cid = tokenURI.replace('ipfs://', '')
            const metadataURL = `https://ipfs.io/ipfs/${cid}`
            
            const response = await fetch(metadataURL)
            if (response.ok) {
              metadata = await response.json()
            }
          }
          
          itemsWithMetadata.push({
            tokenId: item.tokenId.toString(),
            seller: item.seller,
            owner: item.owner,
            price: item.price.toString(),
            isActive: item.isActive,
            metadata
          })
        } catch (err) {
          console.error(`Error fetching metadata for token ${item.tokenId}:`, err)
        }
      }
      
      listedItems.value = itemsWithMetadata
    } catch (e) {
      console.error('Error fetching NFTs:', e)
      error.value = `Error fetching NFTs: ${e.message || 'Unknown error'}`
    } finally {
      loadingItems.value = false
    }
  }

  async function buyNFT(tokenId, price) {
    if (!web3Store.isConnected) {
      throw new Error('You must connect wallet')
    }
    
    if (!web3Store.marketplaceContract) {
      throw new Error('Marketplace contract not initialized')
    }
    
    try {
      const transaction = await web3Store.marketplaceContract.buyItem(tokenId, {
        value: price
      })
      await transaction.wait()
      await fetchListedItems()
      return true
    } catch (e) {
      console.error('Error buying NFT:', e)
      throw new Error(`Error buying NFT: ${e.message || 'Unknown error'}`)
    }
  }
  
  async function fetchNFTDetails(tokenId) {
    if (!web3Store.musicNFTContract || !web3Store.marketplaceContract) {
      throw new Error('Contracts not initialized')
    }
    
    try {
      const existingItem = listedItems.value.find(item => item.tokenId === tokenId)
      if (existingItem) {
        return existingItem
      }
      
      const listedItem = await web3Store.marketplaceContract.getListedItem(tokenId)
      const tokenURI = await web3Store.musicNFTContract.tokenURI(tokenId)
      const owner = await web3Store.musicNFTContract.ownerOf(tokenId)
      const [creator, royaltyPercentage] = await web3Store.musicNFTContract.getRoyaltyInfo(tokenId)
  
      let metadata = {}
      if (tokenURI) {
        const cid = tokenURI.replace('ipfs://', '')
        const metadataURL = `https://ipfs.io/ipfs/${cid}`
        
        const response = await fetch(metadataURL)
        if (response.ok) {
          metadata = await response.json()
        }
      }
      
      return {
        tokenId,
        seller: listedItem.isActive ? listedItem.seller : ethers.constants.AddressZero,
        owner,
        creator,
        royaltyPercentage: royaltyPercentage.toString(),
        price: listedItem.isActive ? listedItem.price.toString() : '0',
        isActive: listedItem.isActive,
        metadata
      }
    } catch (e) {
      console.error(`Error fetching details for token ${tokenId}:`, e)
      throw new Error(`Error fetching details: ${e.message || 'Unknown error'}`)
    }
  }
  
  return {
    listedItems,
    loadingItems,
    error,
    fetchListedItems,
    buyNFT,
    fetchNFTDetails
  }
})