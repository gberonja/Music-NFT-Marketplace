import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWeb3Store } from './web3Store'
import { uploadFileToIPFS, uploadMetadataToIPFS } from '../services/ipfsService'

export const useUploadStore = defineStore('upload', () => {

  const web3Store = useWeb3Store()
  

  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)
  const successMessage = ref('')

  const title = ref('')
  const artist = ref('')
  const description = ref('')
  const coverImage = ref(null)
  const audioFile = ref(null)
  const royaltyPercentage = ref(5) 
  

  const coverImageUrl = ref('')
  const audioFileUrl = ref('')
  

  function resetForm() {
    title.value = ''
    artist.value = ''
    description.value = ''
    coverImage.value = null
    audioFile.value = null
    royaltyPercentage.value = 5
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
    if (!web3Store.isConnected) {
      error.value = 'Morate se povezati s novčanikom prije uploada'
      return
    }
    
    if (!title.value || !artist.value || !coverImage.value || !audioFile.value) {
      error.value = 'Popunite sva obavezna polja'
      return
    }
    
    try {
      isUploading.value = true
      error.value = null
      successMessage.value = ''
      

      uploadProgress.value = 10
      const coverImageCID = await uploadFileToIPFS(coverImage.value)
      
 
      uploadProgress.value = 40
      const audioCID = await uploadFileToIPFS(audioFile.value)
      

      uploadProgress.value = 70
      const metadata = {
        name: title.value,
        artist: artist.value,
        description: description.value,
        image: coverImageCID,
        audio: audioCID,
        attributes: [
          {
            trait_type: 'Artist',
            value: artist.value
          },
          {
            trait_type: 'Type',
            value: 'Music NFT'
          }
        ]
      }
      
      const metadataCID = await uploadMetadataToIPFS(metadata)
      

      uploadProgress.value = 85
      const tokenURI = `ipfs://${metadataCID}`
      const royaltyBasisPoints = royaltyPercentage.value * 100 // Konverzija postotka u basis points
      
      const transaction = await web3Store.musicNFTContract.mintMusic(
        web3Store.account,
        tokenURI,
        royaltyBasisPoints
      )
      
      await transaction.wait()
      

      uploadProgress.value = 100
      successMessage.value = 'NFT je uspješno kreiran!'
      
      resetForm()
    } catch (e) {
      console.error('Greška pri uploadu ili mintanju:', e)
      error.value = `Greška: ${e.message || 'Nepoznata greška pri uploadu'}`
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
    coverImage,
    audioFile,
    royaltyPercentage,
    coverImageUrl,
    audioFileUrl,
    

    resetForm,
    setCoverImage,
    setAudioFile,
    uploadAndMint
  }
})