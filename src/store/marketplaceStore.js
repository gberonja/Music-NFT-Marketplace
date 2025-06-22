import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeb3Store } from './web3Store'

export const useMarketplaceStore = defineStore('marketplace', () => {
  const web3Store = useWeb3Store()
  
  const listedItems = ref([])
  const loadingItems = ref(false)
  const error = ref(null)
  
  async function fetchListedItems() {
    if (!web3Store.isReady) {
      error.value = 'Wallet not connected'
      return
    }
    
    try {
      loadingItems.value = true
      error.value = null
      
      console.log('📦 Fetching marketplace items...')
      
      const items = await web3Store.marketplaceContract.getAllListedItems()
      console.log('✅ Got items:', items.length)
      
      const processedItems = []
      
      for (const item of items) {
        try {
          console.log(`Processing token ${item.tokenId}...`)
          
          let metadata = {
            name: 'Unknown Track',
            artist: 'Unknown Artist',
            description: '',
            image: null,
            audio: null
          }
          
          try {
            const tokenURI = await web3Store.musicNFTContract.tokenURI(item.tokenId)
            
            if (tokenURI && tokenURI.startsWith('ipfs://')) {
              const cid = tokenURI.replace('ipfs://', '')
              const metadataURL = `https://ipfs.io/ipfs/${cid}`
              
              const response = await fetch(metadataURL, { timeout: 5000 })
              if (response.ok) {
                const fetchedMetadata = await response.json()
                metadata = { ...metadata, ...fetchedMetadata }
                console.log(`✅ Metadata loaded for ${item.tokenId}`)
              }
            }
          } catch (metaError) {
            console.warn(`Metadata failed for ${item.tokenId}:`, metaError)
          }
          
          processedItems.push({
            tokenId: item.tokenId.toString(),
            seller: item.seller,
            owner: item.owner,
            price: item.price.toString(),
            isActive: item.isActive,
            category: item.category || 'Music',
            metadata
          })
          
        } catch (itemError) {
          console.error(`Error processing item:`, itemError)
        }
      }
      
      listedItems.value = processedItems
      console.log(`🎉 Loaded ${processedItems.length} marketplace items`)
      
    } catch (err) {
      console.error('❌ Marketplace fetch error:', err)
      error.value = err.message || 'Failed to load marketplace'
      listedItems.value = []
    } finally {
      loadingItems.value = false
    }
  }

  async function buyNFT(tokenId, price) {
    if (!web3Store.isReady) {
      throw new Error('Wallet not connected')
    }
    
    try {
      console.log(`🛒 Buying NFT ${tokenId} for ${price} wei`)
      
      const transaction = await web3Store.marketplaceContract.buyItem(tokenId, {
        value: price,
        gasLimit: 300000
      })
      
      console.log('Transaction sent:', transaction.hash)
      await transaction.wait()
      console.log('✅ Purchase confirmed!')
      
      // Refresh marketplace
      await fetchListedItems()
      return true
      
    } catch (err) {
      console.error('❌ Purchase error:', err)
      throw new Error(err.message || 'Purchase failed')
    }
  }

  async function listNFT(tokenId, priceInWei, category = 'Music') {
    if (!web3Store.isReady) {
      throw new Error('Contracts not initialized')
    }
    
    try {
      console.log(`📋 Listing NFT ${tokenId} for ${priceInWei.toString()} wei`)
      
      // Debug: Check available functions
      console.log('🔍 Available marketplace functions:')
      try {
        const functions = Object.keys(web3Store.marketplaceContract.functions || {})
        console.log('Functions:', functions)
      } catch (e) {
        console.log('Could not list functions due to proxy issue')
      }
      
      // First approve the marketplace to transfer the NFT
      console.log('✅ Approving marketplace...')
      const approveTx = await web3Store.musicNFTContract.approve(
        web3Store.marketplaceAddress,
        tokenId
      )
      await approveTx.wait()
      console.log('✅ Approval confirmed')
      
      // Try different listItem function signatures
      console.log('📋 Attempting to list item...')
      
      let listTx
      
      try {
        // Try explicit function signature first
        console.log('🧪 Trying explicit listItem signature...')
        listTx = await web3Store.marketplaceContract['listItem(uint256,uint256)'](
          tokenId,
          priceInWei
        )
        console.log('✅ Explicit signature worked')
        
      } catch (explicitError) {
        console.log('⚠️ Explicit signature failed, trying basic call...')
        console.log('Error:', explicitError.message)
        
        try {
          // Try basic function call
          console.log('🧪 Trying basic listItem call...')
          listTx = await web3Store.marketplaceContract.listItem(
            tokenId,
            priceInWei
          )
          console.log('✅ Basic call worked')
          
        } catch (basicError) {
          console.log('⚠️ Basic call failed, trying with category...')
          console.log('Error:', basicError.message)
          
          try {
            // Try with category parameter
            console.log('🧪 Trying listItem with category...')
            listTx = await web3Store.marketplaceContract['listItem(uint256,uint256,string)'](
              tokenId,
              priceInWei,
              category
            )
            console.log('✅ Category version worked')
            
          } catch (categoryError) {
            console.error('❌ All listItem attempts failed!')
            console.error('Explicit error:', explicitError.message)
            console.error('Basic error:', basicError.message)
            console.error('Category error:', categoryError.message)
            throw new Error('listItem function not available on marketplace contract')
          }
        }
      }
      
      await listTx.wait()
      console.log('✅ Listing confirmed')
      
      // Refresh marketplace
      await fetchListedItems()
      return true
      
    } catch (err) {
      console.error('❌ Listing error:', err)
      
      let errorMessage = 'Listing failed'
      
      if (err.code === 4001) {
        errorMessage = 'Transaction cancelled by user'
      } else if (err.message?.includes('not approved')) {
        errorMessage = 'Marketplace not approved to transfer NFT'
      } else if (err.message?.includes('listItem function not available')) {
        errorMessage = 'Marketplace contract missing listItem function - check smart contract deployment'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      throw new Error(errorMessage)
    }
  }

  return {
    listedItems,
    loadingItems,
    error,
    fetchListedItems,
    buyNFT,
    listNFT  // Add this!
  }
})