<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200">
      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-light text-stone-800 tracking-wide">MusicStore</h1>
            <p class="text-stone-500 mt-2 font-light">Decentralized music marketplace with auctions</p>
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

      <div class="grid lg:grid-cols-3 gap-8">
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
                <div v-if="song.isAuction" class="mt-2">
                  <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-light">
                    🔨 In Auction
                  </span>
                </div>
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

                  <!-- Actions -->
                  <div>
                    <!-- Buy button -->
                    <button v-if="song.forSale && song.owner !== account && !song.isAuction"
                      @click="buySong(song.id, song.price)" :disabled="loading"
                      class="bg-stone-800 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-50">
                      {{ loading ? 'Buying...' : 'Buy' }}
                    </button>

                    <!-- Start Auction button -->
                    <button v-else-if="song.owner === account && !song.isAuction && song.forSale"
                      @click="showAuctionDialog(song)"
                      class="bg-purple-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-purple-700 transition-colors">
                      Start Auction
                    </button>

                    <!-- Owned status -->
                    <span v-else-if="song.owner === account"
                      class="text-green-600 font-light text-sm flex items-center">
                      <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Owned
                    </span>

                    <!-- In auction status -->
                    <span v-else-if="song.isAuction" class="text-purple-600 font-light text-sm">
                      In Auction
                    </span>

                    <!-- Sold status -->
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

        <!-- Active Auctions -->
        <div class="bg-white border border-stone-200 p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-light text-stone-800">Live Auctions</h2>
            <button @click="loadActiveAuctions" :disabled="loading"
              class="text-stone-600 hover:text-stone-800 font-light tracking-wide underline underline-offset-4 disabled:opacity-50">
              Refresh
            </button>
          </div>

          <div v-if="activeAuctions.length === 0" class="text-center py-8">
            <p class="text-stone-400 font-light">No active auctions</p>
            <p class="text-stone-300 font-light text-sm mt-2">Start one from your songs! ←</p>
          </div>

          <div class="space-y-6">
            <div v-for="auction in activeAuctions" :key="auction.id" class="border border-stone-200 p-4 rounded-lg">

              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-medium text-stone-800">{{ auction.title }}</h3>
                  <p class="text-stone-500 font-light">{{ auction.artist }}</p>
                </div>
                <div class="text-right">
                  <p class="text-red-600 font-medium">{{ formatTimeLeft(auction.timeLeft) }}</p>
                  <p class="text-xs text-stone-400">Time left</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 mb-4 text-sm">
                <div>
                  <p class="text-stone-600">Starting bid</p>
                  <p class="font-medium">{{ formatEther(auction.startingBid) }} ETH</p>
                </div>
                <div>
                  <p class="text-stone-600">Current highest bid</p>
                  <p class="font-medium text-green-600">
                    {{ auction.highestBid > 0 ? formatEther(auction.highestBid) + ' ETH' : 'No bids yet' }}
                  </p>
                </div>
              </div>

              <div v-if="auction.highestBidder !== '0x0000000000000000000000000000000000000000'" class="mb-4">
                <p class="text-xs text-stone-400">
                  Leading: {{ auction.highestBidder.slice(0, 6) }}...{{ auction.highestBidder.slice(-4) }}
                  <span v-if="auction.highestBidder === account" class="text-green-600">(You)</span>
                </p>
              </div>

              <!-- Bid input -->
              <div v-if="auction.seller !== account && auction.timeLeft > 0" class="space-y-2">
                <input v-model="bidAmount"
                  :placeholder="`Min: ${formatEther(auction.highestBid > 0 ? auction.highestBid : auction.startingBid)} ETH`"
                  type="number" step="0.001"
                  class="w-full p-2 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light text-sm">
                <button @click="placeBid(auction.id, bidAmount)"
                  :disabled="!bidAmount || loading || parseFloat(bidAmount) <= parseFloat(formatEther(auction.highestBid > 0 ? auction.highestBid : auction.startingBid))"
                  class="w-full bg-stone-800 text-white py-2 text-sm font-light hover:bg-stone-700 disabled:opacity-50 transition-colors">
                  Place Bid
                </button>
              </div>

              <!-- End auction button -->
              <div v-else-if="auction.timeLeft <= 0 && !auction.ended">
                <button @click="endAuction(auction.id)" :disabled="loading"
                  class="w-full bg-red-600 text-white py-2 font-light hover:bg-red-700 transition-colors disabled:opacity-50">
                  End Auction
                </button>
              </div>

              <!-- Your auction -->
              <div v-else-if="auction.seller === account">
                <p class="text-stone-500 font-light text-sm text-center py-2">Your auction</p>
              </div>
            </div>
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

    <!-- Auction Dialog -->
    <div v-if="showAuctionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 border border-stone-200 max-w-md w-full mx-4">
        <h3 class="text-xl font-light text-stone-800 mb-6">Start Auction</h3>
        <div class="space-y-4">
          <div>
            <p class="text-stone-600 mb-2">Song: <span class="font-medium">{{ selectedSong?.title }}</span></p>
            <p class="text-stone-600 mb-4">Artist: <span class="font-medium">{{ selectedSong?.artist }}</span></p>
          </div>
          <div>
            <label class="block text-stone-600 mb-2">Starting Bid (ETH)</label>
            <input v-model="auctionStartingBid" type="number" step="0.001" min="0.001" placeholder="0.01"
              class="w-full p-3 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light">
          </div>
          <div>
            <label class="block text-stone-600 mb-2">Duration</label>
            <select v-model="auctionDuration"
              class="w-full p-3 border-b border-stone-200 bg-transparent focus:border-stone-400 focus:outline-none font-light">
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
              <option value="1800">30 minutes</option>
              <option value="3600">1 hour</option>
            </select>
          </div>
          <div class="flex space-x-4 pt-4">
            <button @click="cancelAuctionDialog"
              class="flex-1 border border-stone-300 text-stone-600 py-3 font-light hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button @click="startAuction" :disabled="!auctionStartingBid || loading"
              class="flex-1 bg-stone-800 text-white py-3 font-light hover:bg-stone-700 disabled:opacity-50 transition-colors">
              {{ loading ? 'Starting...' : 'Start Auction' }}
            </button>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'


const musicContractAddress = import.meta.env.VITE_MUSIC_CONTRACT_ADDRESS
const auctionContractAddress = import.meta.env.VITE_AUCTION_CONTRACT_ADDRESS


const musicContractABI = [
  "function createSong(string memory _title, string memory _artist, uint256 _price) public",
  "function buySong(uint256 _id) public payable",
  "function startAuction(uint256 _songId, uint256 _startingBid, uint256 _duration) external",
  "function getSongCount() public view returns (uint256)",
  "function songs(uint256) public view returns (string,string,uint256,address,bool,bool,uint256)"
]

const auctionContractABI = [
  "function placeBid(uint256 _auctionId) external payable",
  "function endAuction(uint256 _auctionId) external",
  "function withdraw(uint256 _auctionId) external",
  "function getAuction(uint256 _auctionId) external view returns (uint256,address,uint256,uint256,address,uint256,bool,uint256)",
  "function getActiveAuctions() external view returns (uint256[])"
]


const account = ref('')
const contract = ref(null)
const auctionContract = ref(null)
const status = ref('')
const loading = ref(false)
const notification = ref(null)

const title = ref('')
const artist = ref('')
const price = ref('')
const searchQuery = ref('')
const songs = ref([])
const activeAuctions = ref([])


const showAuctionModal = ref(false)
const selectedSong = ref(null)
const auctionStartingBid = ref('')
const auctionDuration = ref(600)
const bidAmount = ref('')


let auctionTimer = null


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


const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  )
})


const formatEther = (wei) => ethers.utils.formatEther(wei.toString())
const parseEther = (eth) => ethers.utils.parseEther(eth.toString())
const formatUSD = (eth) => (parseFloat(eth) * 2500).toFixed(2) // ~$2500 per ETH

const formatTimeLeft = (seconds) => {
  if (seconds <= 0) return 'Ended'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

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


    contract.value = new ethers.Contract(musicContractAddress, musicContractABI, signer)
    auctionContract.value = new ethers.Contract(auctionContractAddress, auctionContractABI, signer)

    status.value = 'Connected successfully'
    showNotification('Wallet connected successfully!')

    // Load data
    loadSongs()
    loadActiveAuctions()

    // Start auction timer
    startAuctionTimer()
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

const buySong = async (songId, songPrice) => {
  if (!contract.value) return

  loading.value = true
  try {
    status.value = 'Purchasing song...'
    const tx = await contract.value.buySong(songId, { value: songPrice })
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

  try {
    const count = await contract.value.getSongCount()
    const loadedSongs = []

    for (let i = 0; i < count; i++) {
      const song = await contract.value.songs(i)
      loadedSongs.push({
        id: i,
        title: song[0],
        artist: song[1],
        price: song[2],
        owner: song[3],
        forSale: song[4],
        isAuction: song[5],
        auctionId: song[6]
      })
    }

    songs.value = loadedSongs
    status.value = `${loadedSongs.length} songs loaded`
  } catch (error) {
    console.error('Load error:', error)
    showNotification('Failed to load songs', 'error')
  }
}


const showAuctionDialog = (song) => {
  selectedSong.value = song
  auctionStartingBid.value = ''
  showAuctionModal.value = true
}

const cancelAuctionDialog = () => {
  showAuctionModal.value = false
  selectedSong.value = null
  auctionStartingBid.value = ''
}

const startAuction = async () => {
  if (!contract.value || !selectedSong.value || !auctionStartingBid.value) return

  loading.value = true
  try {
    status.value = 'Starting auction...'
    const tx = await contract.value.startAuction(
      selectedSong.value.id,
      parseEther(auctionStartingBid.value),
      parseInt(auctionDuration.value)
    )
    await tx.wait()

    showNotification(`Auction started for "${selectedSong.value.title}"!`)
    cancelAuctionDialog()
    loadSongs()
    loadActiveAuctions()
  } catch (error) {
    console.error('Start auction error:', error)
    showNotification('Failed to start auction', 'error')
  } finally {
    loading.value = false
  }
}

const placeBid = async (auctionId, bidAmountETH) => {
  if (!auctionContract.value || !bidAmountETH) return

  loading.value = true
  try {
    status.value = 'Placing bid...'
    const tx = await auctionContract.value.placeBid(auctionId, {
      value: parseEther(bidAmountETH)
    })
    await tx.wait()
    showNotification('Bid placed successfully!')
    bidAmount.value = ''
    loadActiveAuctions()
  } catch (error) {
    console.error('Place bid error:', error)
    showNotification('Failed to place bid', 'error')
  } finally {
    loading.value = false
  }
}

const endAuction = async (auctionId) => {
  if (!auctionContract.value) return

  loading.value = true
  try {
    status.value = 'Ending auction...'
    const tx = await auctionContract.value.endAuction(auctionId)
    await tx.wait()
    showNotification('Auction ended successfully!')
    loadActiveAuctions()
    loadSongs()
  } catch (error) {
    console.error('End auction error:', error)
    showNotification('Failed to end auction', 'error')
  } finally {
    loading.value = false
  }
}

const loadActiveAuctions = async () => {
  if (!auctionContract.value || !contract.value) return

  try {
    const auctionIds = await auctionContract.value.getActiveAuctions()
    const auctionsData = []

    for (let id of auctionIds) {
      const auction = await auctionContract.value.getAuction(id)
      const song = await contract.value.songs(auction[0]) // songId

      auctionsData.push({
        id: id.toString(),
        songId: auction[0].toString(),
        title: song[0],
        artist: song[1],
        seller: auction[1],
        startingBid: auction[2],
        highestBid: auction[3],
        highestBidder: auction[4],
        endTime: auction[5],
        ended: auction[6],
        timeLeft: auction[7]
      })
    }

    activeAuctions.value = auctionsData
  } catch (error) {
    console.error('Load auctions error:', error)
  }
}


const startAuctionTimer = () => {

  auctionTimer = setInterval(() => {
    activeAuctions.value = activeAuctions.value.map(auction => ({
      ...auction,
      timeLeft: Math.max(0, auction.timeLeft - 1)
    }))
  }, 1000)
}

const stopAuctionTimer = () => {
  if (auctionTimer) {
    clearInterval(auctionTimer)
    auctionTimer = null
  }
}


onMounted(() => {
  connectWallet()
})

onUnmounted(() => {
  stopAuctionTimer()
})
</script>

<style>
.container {
  max-width: 1400px;
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