<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'

const web3Store = useWeb3Store()
const { isConnected, musicNFTContract } = storeToRefs(web3Store)

const title = ref('')
const artist = ref('')
const price = ref('')
const uploading = ref(false)

async function createNFT() {
  if (!isConnected.value) {
    alert('Connect MetaMask wallet!')
    return
  }

  if (!title.value || !artist.value || !price.value) {
    alert('Please fill all fields')
    return
  }

  try {
    uploading.value = true

    const demoTokenURI = `demo://music/${Date.now()}`
    const royaltyPercentage = 500

    console.log('Creating NFT...', {
      title: title.value,
      artist: artist.value,
      price: price.value
    })

    const transaction = await musicNFTContract.value.mintMusic(
      web3Store.account,
      demoTokenURI,
      royaltyPercentage
    )

    await transaction.wait()

    alert(`NFT successfully created!\n\nTitle: ${title.value}\nArtist: ${artist.value}`)

    title.value = ''
    artist.value = ''
    price.value = ''

  } catch (error) {
    console.error('NFT creation error:', error)
    alert('Error creating NFT')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8">Create Music NFT</h1>

      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">

        <div v-if="!isConnected" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p class="text-yellow-800 text-sm">
            <strong>Note:</strong> Connect MetaMask wallet to create NFTs
          </p>
        </div>

        <form @submit.prevent="createNFT" class="space-y-6">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Song Title *
            </label>
            <input v-model="title" type="text" placeholder="e.g. Summer Vibes" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Artist *
            </label>
            <input v-model="artist" type="text" placeholder="Your name or band name" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Price (ETH) *
            </label>
            <input v-model="price" type="number" step="0.01" min="0" placeholder="0.1" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-800 text-sm">
              <strong>Royalty:</strong> You will automatically receive 5% from every resale of your NFT!
            </p>
          </div>

          <button type="submit" :disabled="!isConnected || uploading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="uploading">Creating NFT...</span>
            <span v-else>Create NFT</span>
          </button>

        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 text-xs">
            <strong>Demo version:</strong> Real file upload will be implemented in production
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>