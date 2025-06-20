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
    alert('Povežite se s MetaMask novčanikom!')
    return
  }

  if (!title.value || !artist.value || !price.value) {
    alert('Molimo popunite sva polja')
    return
  }

  try {
    uploading.value = true

    // Jednostavan demo - bez stvarnog upload-a datoteka
    const demoTokenURI = `demo://music/${Date.now()}`
    const royaltyPercentage = 500 // 5%

    console.log('Kreiranje NFT-a...', {
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

    alert(`🎉 NFT uspješno kreiran!\n\nNaslov: ${title.value}\nIzvođač: ${artist.value}`)

    // Reset forma
    title.value = ''
    artist.value = ''
    price.value = ''

  } catch (error) {
    console.error('Greška pri kreiranju NFT-a:', error)
    alert('Greška pri kreiranju NFT-a')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8">🎤 Kreiraj Glazbeni NFT</h1>

      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">

        <!-- Connect wallet poruka -->
        <div v-if="!isConnected" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p class="text-yellow-800 text-sm">
            <strong>⚠️ Napomena:</strong> Povežite se s MetaMask novčanikom za kreiranje NFT-a
          </p>
        </div>

        <form @submit.prevent="createNFT" class="space-y-6">

          <!-- Naslov -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              🎵 Naslov pjesme *
            </label>
            <input v-model="title" type="text" placeholder="npr. Summer Vibes" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Izvođač -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              👤 Izvođač *
            </label>
            <input v-model="artist" type="text" placeholder="Vaše ime ili naziv benda" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Cijena -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              💰 Cijena (ETH) *
            </label>
            <input v-model="price" type="number" step="0.01" min="0" placeholder="0.1" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Info o royalty -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-800 text-sm">
              <strong>ℹ️ Royalty:</strong> Automatski ćete primati 5% od svake preprodaje vašeg NFT-a!
            </p>
          </div>

          <!-- Submit gumb -->
          <button type="submit" :disabled="!isConnected || uploading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="uploading">⏳ Kreiranje NFT-a...</span>
            <span v-else>🚀 Kreiraj NFT</span>
          </button>

        </form>

        <!-- Demo napomena -->
        <div class="mt-6 text-center">
          <p class="text-gray-500 text-xs">
            📝 <strong>Demo verzija:</strong> Stvarni upload datoteka bit će implementiran u produkciji
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