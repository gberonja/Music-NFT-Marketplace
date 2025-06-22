<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200">
      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-light text-stone-800 tracking-wide">MusicStore</h1>
            <p class="text-stone-500 mt-2 font-light">Decentralized music marketplace</p>
          </div>

          <!-- Network Status -->
          <div v-if="account" class="text-right">
            <div class="flex items-center text-sm text-stone-600 mb-1">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Localhost Network
            </div>
            <p class="text-xs text-stone-400 font-mono">{{ account.slice(0, 6) }}...{{ account.slice(-4) }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-6 py-12">
      <!-- Connection Status -->
      <div class="mb-12">
        <div v-if="!account" class="text-center">
          <button @click="connectWallet" :disabled="loading"
            class="bg-stone-800 text-white px-8 py-3 rounded-none font-light tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-50">
            {{ loading ? 'Connecting...' : 'Connect Wallet' }}
          </button>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-12">
        <!-- Create Song -->
        <div class="bg-white border border-stone-200 p-8">
          <h2 class="text-2xl font-light text-stone-800 mb-8">Create Song</h2>
          <div class="space-y-6">
            <div>
              <input v-model="title" placeholder="Song title" maxlength="50"
                class="w-full p-4 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light"
                :class="{ 'border-red-300': titleError }">
              <p v-if="titleError" class="text-red-500 text-xs mt-1">{{ titleError }}</p>
            </div>
            <div>
              <input v-model="artist" placeholder="Artist name" maxlength="30"
                class="w-full p-4 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light"
                :class="{ 'border-red-300': artistError }">
              <p v-if="artistError" class="text-red-500 text-xs mt-1">{{ artistError }}</p>
            </div>
            <div>
              <input v-model="price" placeholder="Price in ETH (e.g., 0.01)" type="number" step="0.001" min="0.001"
                max="100"
                class="w-full p-4 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light"
                :class="{ 'border-red-300': priceError }">
              <p v-if="priceError" class="text-red-500 text-xs mt-1">{{ priceError }}</p>
              <p v-else-if="price" class="text-stone-500 text-xs mt-1">≈ ${{ formatUSD(price) }} USD</p>
            </div>
            <button @click="createSong" :disabled="!isFormValid || loading"
              :class="isFormValid && !loading ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-300 cursor-not-allowed'"
              class="w-full text-white py-4 font-light tracking-wide transition-colors">
              {{ loading ? 'Creating...' : 'Create Song' }}
            </button>
          </div>
        </div>

        <!-- Songs List -->
        <div class="bg-white border border-stone-200 p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-light text-stone-800">Available Songs</h2>
            <button @click="loadSongs" :disabled="loading"
              class="text-stone-600 hover:text-stone-800 font-light tracking-wide underline underline-offset-4 disabled:opacity-50">
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input v-model="searchQuery" placeholder="Search songs or artists..."
              class="w-full p-3 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light text-sm">
          </div>

          <!-- Loading state -->
          <div v-if="loading && songs.length === 0" class="text-center py-12">
            <div
              class="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-3">
            </div>
            <p class="text-stone-400 font-light">Loading songs...</p>
          </div>

          <!-- No songs -->
          <div v-else-if="filteredSongs.length === 0 && songs.length === 0" class="text-center py-12">
            <p class="text-stone-400 font-light">No songs available</p>
            <p class="text-stone-300 font-light text-sm mt-2">Create the first one! ↖</p>
          </div>

          <!-- No search results -->
          <div v-else-if="filteredSongs.length === 0 && searchQuery" class="text-center py-12">
            <p class="text-stone-400 font-light">No songs match "{{ searchQuery }}"</p>
            <button @click="searchQuery = ''" class="text-stone-600 hover:text-stone-800 text-sm underline mt-2">
              Clear search
            </button>
          </div>

          <!-- Songs grid -->
          <div class="space-y-6">
            <div v-for="(song, index) in filteredSongs" :key="index"
              class="border-b border-stone-100 pb-6 last:border-b-0 hover:bg-stone-25 transition-colors p-3 -m-3 rounded">

              <div class="mb-4">
                <h3 class="text-lg font-medium text-stone-800 mb-1">{{ song.title }}</h3>
                <p class="text-stone-500 font-light">{{ song.artist }}</p>
              </div>

              <div class="flex justify-between items-center text-sm">
                <div class="space-y-1">
                  <p class="text-stone-800 font-medium">{{ formatEther(song.price) }} ETH</p>
                  <p class="text-stone-500 text-xs">≈ ${{ formatUSD(formatEther(song.price)) }} USD</p>
                  <p class="text-stone-400 font-mono text-xs">{{ song.owner.slice(0, 6) }}...{{ song.owner.slice(-4) }}
                  </p>
                </div>

                <div class="flex items-center space-x-3">
                  <!-- Share button -->
                  <button @click="shareMusic(song)" class="text-stone-400 hover:text-stone-600 text-xs">
                    Share
                  </button>

                  <!-- Buy/Status -->
                  <div>
                    <button v-if="song.forSale && song.owner !== account" @click="buySong(index, song.price)"
                      :disabled="loading"
                      class="bg-stone-800 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-50">
                      {{ loading ? 'Buying...' : 'Buy' }}
                    </button>
                    <span v-else-if="song.owner === account"
                      class="text-green-600 font-light text-sm flex items-center">
                      <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Owned
                    </span>
                    <span v-else class="text-stone-400 font-light text-sm">
                      Sold
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Songs count -->
          <div v-if="songs.length > 0" class="mt-8 text-center">
            <p class="text-stone-400 font-light text-sm">
              {{ filteredSongs.length }} of {{ songs.length }} songs
              <span v-if="searchQuery">(filtered)</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Status bar -->
      <div v-if="status" class="mt-12 text-center">
        <p class="text-stone-600 font-light bg-white border border-stone-200 px-6 py-3 inline-block">
          {{ status }}
        </p>
      </div>
    </main>

    <!-- Toast notifications -->
    <div v-if="notification" :class="`fixed top-4 right-4 p-4 border z-50 max-w-sm transition-all duration-300 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
        'bg-red-50 border-red-200 text-red-800'
      }`">
      <div class="flex justify-between items-center">
        <p class="font-light">{{ notification.message }}</p>
        <button @click="notification = null" class="ml-4 text-current opacity-70 hover:opacity-100">×</button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-stone-200 mt-20">
      <div class="container mx-auto px-6 py-8 text-center">
        <p class="text-stone-400 font-light text-sm">
          Built with Vue.js & Ethereum • FIPU 2025 🎓
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
const contractABI = [
  "function createSong(string _title, string _artist, uint256 _price) public",
  "function buySong(uint256 _id) public payable",
  "function getSongCount() public view returns (uint256)",
  "function songs(uint256) public view returns (string,string,uint256,address,bool)"
]

// State
const account = ref('')
const contract = ref(null)
const status = ref('')
const loading = ref(false)
const notification = ref(null)

const title = ref('')
const artist = ref('')
const price = ref('')
const searchQuery = ref('')
const songs = ref([])

// Form validation
const titleError = computed(() => {
  if (!title.value) return ''
  if (title.value.length < 2) return 'Title must be at least 2 characters'
  if (title.value.length > 50) return 'Title too long'
  return ''
})

const artistError = computed(() => {
  if (!artist.value) return ''
  if (artist.value.length < 2) return 'Artist name must be at least 2 characters'
  if (artist.value.length > 30) return 'Artist name too long'
  return ''
})

const priceError = computed(() => {
  if (!price.value) return ''
  if (parseFloat(price.value) < 0.001) return 'Minimum price is 0.001 ETH'
  if (parseFloat(price.value) > 100) return 'Maximum price is 100 ETH'
  return ''
})

const isFormValid = computed(() => {
  return title.value.trim() &&
    artist.value.trim() &&
    price.value > 0 &&
    !titleError.value &&
    !artistError.value &&
    !priceError.value
})

// Filtered songs
const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  )
})

// Utility functions
const formatEther = (wei) => ethers.utils.formatEther(wei.toString())
const parseEther = (eth) => ethers.utils.parseEther(eth.toString())
const formatUSD = (eth) => (parseFloat(eth) * 2500).toFixed(2) // ~$2500 per ETH

const showNotification = (message, type = 'success') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const shareMusic = (song) => {
  if (navigator.share) {
    navigator.share({
      title: `${song.title} by ${song.artist}`,
      text: `Check out this music NFT: ${song.title} by ${song.artist}`,
      url: window.location.href
    }).catch(err => console.log('Share failed', err))
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${song.title} by ${song.artist} - ${window.location.href}`)
    showNotification('Song link copied to clipboard!')
  }
}

const connectWallet = async () => {
  loading.value = true
  try {
    const ethProvider = await detectEthereumProvider()
    if (!ethProvider) {
      alert('MetaMask not detected! Please install MetaMask.')
      return
    }

    await ethProvider.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.providers.Web3Provider(ethProvider)
    const signer = provider.getSigner()
    account.value = await signer.getAddress()
    contract.value = new ethers.Contract(contractAddress, contractABI, signer)

    status.value = 'Connected successfully'
    showNotification('Wallet connected successfully!')
    loadSongs()
  } catch (error) {
    console.error('Connection error:', error)
    showNotification('Failed to connect wallet', 'error')
  } finally {
    loading.value = false
  }
}

const createSong = async () => {
  if (!contract.value || !isFormValid.value) return

  loading.value = true
  try {
    status.value = 'Creating song...'
    const tx = await contract.value.createSong(
      title.value.trim(),
      artist.value.trim(),
      parseEther(price.value)
    )

    await tx.wait()
    status.value = 'Song created successfully!'
    showNotification(`"${title.value}" created successfully!`)

    // Reset form
    title.value = ''
    artist.value = ''
    price.value = ''

    loadSongs()
  } catch (error) {
    console.error('Create error:', error)
    status.value = 'Failed to create song'
    showNotification('Failed to create song. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const buySong = async (id, songPrice) => {
  if (!contract.value) return

  loading.value = true
  try {
    status.value = 'Purchasing song...'
    const tx = await contract.value.buySong(id, { value: songPrice })
    await tx.wait()
    status.value = 'Song purchased successfully!'
    showNotification('Song purchased successfully!')
    loadSongs()
  } catch (error) {
    console.error('Buy error:', error)
    status.value = 'Failed to purchase song'
    showNotification('Failed to purchase song. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const loadSongs = async () => {
  if (!contract.value) return

  loading.value = true
  try {
    const count = await contract.value.getSongCount()
    const loadedSongs = []

    for (let i = 0; i < count; i++) {
      const song = await contract.value.songs(i)
      loadedSongs.push({
        title: song[0],
        artist: song[1],
        price: song[2],
        owner: song[3],
        forSale: song[4]
      })
    }

    songs.value = loadedSongs
    status.value = `${loadedSongs.length} songs loaded`
  } catch (error) {
    console.error('Load error:', error)
    status.value = 'Failed to load songs'
    showNotification('Failed to load songs', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  connectWallet()
})
</script>

<style>
.container {
  max-width: 1200px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover effect */
.hover\:bg-stone-25:hover {
  background-color: #fafaf9;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f5f4;
}

::-webkit-scrollbar-thumb {
  background: #a8a29e;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #78716c;
}
</style>