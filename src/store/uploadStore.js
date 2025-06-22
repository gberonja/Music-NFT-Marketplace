import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeb3Store } from './web3Store'
import { uploadFileToIPFS, uploadMetadataToIPFS } from '../services/ipfsService'
import { ethers } from 'ethers'

export const useUploadStore = defineStore('upload', () => {
  const web3Store = useWeb3Store()
  
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)
  const successMessage = ref('')

  const title = ref('')
  const artist = ref('')
  const description = ref('')
  const genre = ref('Electronic')
  const coverImage = ref(null)
  const audioFile = ref(null)
  const royaltyPercentage = ref(5)
  const price = ref('')
  
  const coverImageUrl = ref('')
  const audioFileUrl = ref('')
  
  const genres = [
    'Electronic', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 
    'Folk', 'Reggae', 'Blues', 'Country', 'R&B', 'Other'
  ]
  
  function resetForm() {
    title.value = ''
    artist.value = ''
    description.value = ''
    genre.value = 'Electronic'
    coverImage.value = null
    audioFile.value = null
    royaltyPercentage.value = 5
    price.value = ''
    coverImageUrl.value = ''
    audioFileUrl.value = ''
    error.value = null
    successMessage.value = ''
    uploadProgress.value = 0
  }
  
  function setCoverImage(file) {
    coverImage.value = file
    if (file) {
      coverImageUrl.value = URL.createObjectURL(file)
    } else {
      coverImageUrl.value = ''
    }
  }
  
  function setAudioFile(file) {
    audioFile.value = file
    if (file) {
      audioFileUrl.value = URL.createObjectURL(file)
    } else {
      audioFileUrl.value = ''
    }
  }
  
  async function uploadAndMint() {
    if (!web3Store.isReady) {
      error.value = 'Please connect your wallet and ensure contracts are loaded'
      return
    }
    
    if (!title.value || !artist.value || !coverImage.value || !audioFile.value) {
      error.value = 'Please fill all required fields (title, artist, cover image, audio file)'
      return
    }
    
    if (royaltyPercentage.value < 0 || royaltyPercentage.value > 10) {
      error.value = 'Royalty percentage must be between 0 and 10'
      return
    }
    
    try {
      isUploading.value = true
      error.value = null
      successMessage.value = ''
      
      console.log('🎬 Starting NFT creation process...')
      
      // Step 1: Upload cover image to IPFS (Mock)
      uploadProgress.value = 10
      console.log('📤 Uploading cover image...')
      const coverImageCID = await uploadFileToIPFS(coverImage.value)
      console.log('✅ Cover image uploaded:', coverImageCID)
      
      // Step 2: Upload audio file to IPFS (Mock)
      uploadProgress.value = 40
      console.log('📤 Uploading audio file...')
      const audioCID = await uploadFileToIPFS(audioFile.value)
      console.log('✅ Audio file uploaded:', audioCID)
      
      // Step 3: Create and upload metadata (with duration info)
      uploadProgress.value = 70
      console.log('📋 Creating metadata...')
      const metadata = {
        name: title.value,
        artist: artist.value,
        description: description.value || `${title.value} by ${artist.value}`,
        image: `ipfs://${coverImageCID}`,
        audio: `ipfs://${audioCID}`,
        genre: genre.value,
        // Add duration to metadata instead of contract
        duration: 180, // 3 minutes in seconds
        releaseYear: new Date().getFullYear(),
        attributes: [
          {
            trait_type: 'Artist',
            value: artist.value
          },
          {
            trait_type: 'Genre', 
            value: genre.value
          },
          {
            trait_type: 'Duration',
            value: '3:00'
          },
          {
            trait_type: 'Type',
            value: 'Music NFT'
          },
          {
            trait_type: 'Royalty',
            value: `${royaltyPercentage.value}%`
          }
        ],
        external_url: 'https://musicnft-marketplace.com',
        background_color: '6366f1'
      }
      
      const metadataCID = await uploadMetadataToIPFS(metadata)
      console.log('✅ Metadata uploaded:', metadataCID)
      
      // Step 4: Mint the NFT on blockchain using BASIC mintMusic only
      uploadProgress.value = 85
      console.log('⛏️ Minting NFT on blockchain...')
      const tokenURI = `ipfs://${metadataCID}`
      const royaltyBasisPoints = Math.floor(royaltyPercentage.value * 100)
      
      console.log('🔗 Using BASIC mintMusic with these parameters:')
      console.log('- Address:', web3Store.account)
      console.log('- Token URI:', tokenURI)
      console.log('- Royalty (basis points):', royaltyBasisPoints)
      
      // Only use the basic mintMusic function (3 parameters)
      console.log('🧪 Calling basic mintMusic...')
      
      const transaction = await web3Store.musicNFTContract.mintMusic(
        web3Store.account,
        tokenURI,
        royaltyBasisPoints
      )
      
      console.log('✅ Basic mintMusic successful!')
      console.log('📝 Transaction hash:', transaction.hash)
      console.log('⏳ Waiting for confirmation...')
      
      const receipt = await transaction.wait()
      console.log('✅ Mint transaction confirmed:', receipt.transactionHash)
      
      // Get the token ID from events
      let tokenId = null
      try {
        console.log('🔍 Looking for token ID in events...')
        console.log('Receipt events:', receipt.events?.length || 0)
        
        // Look for Transfer event (standard ERC721) - safer approach
        const transferEvent = receipt.events?.find(event => {
          try {
            return event.event === 'Transfer' && 
                   event.args && 
                   event.args[0] === '0x0000000000000000000000000000000000000000' // from address (mint)
          } catch (e) {
            return false
          }
        })
        
        if (transferEvent && transferEvent.args) {
          tokenId = transferEvent.args[2]?.toString() // tokenId is 3rd argument
          console.log('🎯 Token ID from Transfer event:', tokenId)
        }
        
        // Fallback: look for any event with tokenId
        if (!tokenId) {
          for (const event of receipt.events || []) {
            try {
              if (event.args && event.args.tokenId) {
                tokenId = event.args.tokenId.toString()
                console.log('🎯 Token ID from event args:', tokenId)
                break
              }
            } catch (e) {
              // Continue to next event
            }
          }
        }
        
        // Last resort: extract from logs
        if (!tokenId && receipt.logs && receipt.logs.length > 0) {
          console.log('🔍 Attempting to extract token ID from logs...')
          // For Transfer events, token ID is typically in the 3rd topic or data
          for (const log of receipt.logs) {
            if (log.topics && log.topics.length >= 4) {
              try {
                const potentialTokenId = ethers.BigNumber.from(log.topics[3]).toString()
                if (potentialTokenId && potentialTokenId !== '0') {
                  tokenId = potentialTokenId
                  console.log('🎯 Token ID from log topics:', tokenId)
                  break
                }
              } catch (e) {
                // Continue to next log
              }
            }
          }
        }
        
      } catch (eventError) {
        console.warn('Could not parse token ID from events:', eventError.message)
        tokenId = 'Unknown'
      }
      
      uploadProgress.value = 95
      
      let listingMessage = ''
      
      // Step 5: Auto-list if price is provided
      if (price.value && parseFloat(price.value) > 0 && tokenId && tokenId !== 'Unknown') {
        try {
          console.log('🏪 Auto-listing NFT...')
          const priceInWei = ethers.utils.parseEther(price.value)
          
          // First approve marketplace
          console.log('✅ Approving marketplace...')
          const approveTx = await web3Store.musicNFTContract.approve(
            web3Store.marketplaceAddress,
            tokenId
          )
          await approveTx.wait()
          console.log('✅ Approval confirmed')
          
          // Then list the item (use basic version)
          console.log('📋 Listing on marketplace...')
          const listTx = await web3Store.marketplaceContract.listItem(
            tokenId,
            priceInWei
          )
          await listTx.wait()
          console.log('✅ Listing confirmed')
          
          listingMessage = ` Listed for ${price.value} ETH on marketplace!`
          
        } catch (listError) {
          console.error('⚠️ Auto-listing failed:', listError)
          listingMessage = ` (Auto-listing failed - you can list manually from your profile)`
        }
      }
      
      uploadProgress.value = 100
      
      const finalMessage = tokenId && tokenId !== 'Unknown'
        ? `🎉 NFT successfully created! Token ID: ${tokenId}.${listingMessage}`
        : `🎉 NFT successfully created!${listingMessage}`
        
      successMessage.value = finalMessage
      
      console.log('🎊 NFT creation completed successfully!')
      
      // Reset form after success
      setTimeout(() => {
        resetForm()
      }, 3000)
      
    } catch (e) {
      console.error('❌ Upload or minting error:', e)
      
      let errorMessage = 'Unknown error occurred'
      
      if (e.code === 4001) {
        errorMessage = 'Transaction cancelled by user'
      } else if (e.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees'
      } else if (e.message?.includes('execution reverted')) {
        if (e.message.includes('Duration must be greater than 0')) {
          errorMessage = 'Smart contract validation error: Even basic mintMusic requires duration validation. Check contract code.'
        } else {
          errorMessage = 'Smart contract error - please check contract deployment'
        }
      } else if (e.message?.includes('network')) {
        errorMessage = 'Network error - please check blockchain connection'
      } else if (e.reason) {
        errorMessage = e.reason
      } else if (e.message) {
        errorMessage = e.message
      }
      
      error.value = `Error: ${errorMessage}`
    } finally {
      isUploading.value = false
    }
  }
  
  return {
    isUploading,
    uploadProgress,
    error,
    successMessage,
    title,
    artist,
    description,
    genre,
    genres,
    coverImage,
    audioFile,
    royaltyPercentage,
    price,
    coverImageUrl,
    audioFileUrl,
    resetForm,
    setCoverImage,
    setAudioFile,
    uploadAndMint
  }
})