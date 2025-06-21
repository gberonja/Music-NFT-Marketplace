<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { testTransaction } from '../utils/simpleWeb3'

const web3Store = useWeb3Store()
const { isConnected, account } = storeToRefs(web3Store)

const title = ref('')
const artist = ref('')
const price = ref('')
const uploading = ref(false)

async function createNFT() {
  console.log("=== TEST NFT ===");

  if (!isConnected.value) {
    alert('Connect MetaMask!')
    return
  }

  if (!title.value || !artist.value) {
    alert('Fill title and artist')
    return
  }

  try {
    uploading.value = true

    const result = await testTransaction(account.value)

    alert(`Test transaction sent!\nTX: ${result.hash}`)

    title.value = ''
    artist.value = ''
    price.value = ''

  } catch (error) {
    console.error('ERROR:', error);

    if (error.code === 4001) {
      alert('Cancelled by user');
    } else {
      alert(`Error: ${error.message}`);
    }
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
              <strong>Test Version:</strong> This will send a test transaction to verify connection.
            </p>
          </div>

          <button type="submit" :disabled="!isConnected || uploading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="uploading">Sending Test...</span>
            <span v-else>Test Transaction</span>
          </button>

        </form>

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