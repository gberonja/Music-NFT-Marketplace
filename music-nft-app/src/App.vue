<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-2xl font-bold">🎵 MusicNFT Marketplace</h1>
      <p v-if="account" class="text-sm">Connected: {{ account.slice(0, 6) }}...{{ account.slice(-4) }}</p>
      <button v-else @click="connectWallet" class="bg-blue-800 px-4 py-2 rounded mt-2">
        Connect Wallet
      </button>
    </header>

    <main class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Create Music NFT -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">🎤 Create Music NFT</h2>
          <form @submit.prevent="createMusic">
            <input v-model="newMusic.title" placeholder="Song Title" class="w-full p-2 border rounded mb-2" required />
            <input v-model="newMusic.artist" placeholder="Artist Name" class="w-full p-2 border rounded mb-2"
              required />
            <input v-model="newMusic.ipfsHash" placeholder="IPFS Hash (or URL)" class="w-full p-2 border rounded mb-2"
              required />
            <input v-model="newMusic.price" placeholder="Price in ETH" type="number" step="0.001"
              class="w-full p-2 border rounded mb-4" required />
            <button type="submit" class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              :disabled="!account">
              Create NFT
            </button>
          </form>
        </div>

        <!-- Marketplace -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">🏪 Marketplace</h2>
          <button @click="loadAllMusic" class="w-full bg-blue-500 text-white p-2 rounded mb-4">
            Refresh Marketplace
          </button>

          <div v-if="allMusic.length === 0" class="text-gray-500">
            No music available
          </div>

          <div v-for="(music, index) in allMusic" :key="index" class="border-b pb-2 mb-2">
            <h3 class="font-bold">{{ music.title }}</h3>
            <p class="text-sm text-gray-600">by {{ music.artist }}</p>
            <p class="text-sm">Price: {{ formatEther(music.price) }} ETH</p>
            <p class="text-xs">Owner: {{ music.owner.slice(0, 6) }}...{{ music.owner.slice(-4) }}</p>

            <button v-if="music.forSale && music.owner !== account" @click="buyMusic(index, music.price)"
              class="bg-orange-500 text-white px-3 py-1 rounded text-sm mt-1 hover:bg-orange-600">
              Buy Now
            </button>
            <span v-else-if="music.owner === account" class="text-green-600 text-sm">
              You own this
            </span>
            <span v-else class="text-gray-500 text-sm">
              Not for sale
            </span>
          </div>
        </div>

        <!-- My Collection -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4">💿 My Collection</h2>
          <button @click="loadMyMusic" class="w-full bg-purple-500 text-white p-2 rounded mb-4">
            Load My Music
          </button>

          <div v-if="myMusic.length === 0" class="text-gray-500">
            You don't own any music NFTs
          </div>

          <div v-for="(music, index) in myMusic" :key="index" class="border-b pb-2 mb-2">
            <h3 class="font-bold">{{ music.title }}</h3>
            <p class="text-sm text-gray-600">by {{ music.artist }}</p>
            <p class="text-sm">{{ music.forSale ? 'For Sale' : 'Not for sale' }}</p>

            <div v-if="!music.forSale" class="mt-2">
              <input v-model="resalePrice" placeholder="Resale price (ETH)" type="number" step="0.001"
                class="w-full p-1 border rounded text-sm mb-1" />
              <button @click="setForSale(index, resalePrice)"
                class="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600">
                Put for Sale
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-6 p-4 bg-gray-100 rounded">
        {{ statusMessage }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

// Contract setup
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
const contractABI = [
  "function createMusic(string memory _title, string memory _artist, string memory _ipfsHash, uint256 _price) public",
  "function buyMusic(uint256 _tokenId) public payable",
  "function setForSale(uint256 _tokenId, uint256 _price) public",
  "function getAllMusic() public view returns (tuple(string title, string artist, string ipfsHash, address owner, uint256 price, bool forSale)[])",
  "function getMyMusic() public view returns (tuple(string title, string artist, string ipfsHash, address owner, uint256 price, bool forSale)[])",
  "function tokenCounter() public view returns (uint256)",
  "event MusicCreated(uint256 tokenId, string title, string artist, address owner)",
  "event MusicSold(uint256 tokenId, address from, address to, uint256 price)"
]

// Reactive data
const account = ref('')
const provider = ref(null)
const signer = ref(null)
const contract = ref(null)
const statusMessage = ref('')

const newMusic = ref({
  title: '',
  artist: '',
  ipfsHash: '',
  price: ''
})

const allMusic = ref([])
const myMusic = ref([])
const resalePrice = ref('')

// Utility functions
const formatEther = (weiValue) => {
  return ethers.utils.formatEther(weiValue.toString())
}

const parseEther = (etherValue) => {
  return ethers.utils.parseEther(etherValue.toString())
}

const setStatus = (message) => {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}

// Wallet connection
const connectWallet = async () => {
  try {
    const ethProvider = await detectEthereumProvider()
    if (!ethProvider) {
      alert('MetaMask not detected!')
      return
    }

    await ethProvider.request({ method: 'eth_requestAccounts' })
    provider.value = new ethers.providers.Web3Provider(ethProvider)
    signer.value = provider.value.getSigner()
    account.value = await signer.value.getAddress()

    if (contractAddress) {
      contract.value = new ethers.Contract(contractAddress, contractABI, signer.value)
      setStatus('Connected to wallet and contract!')
    } else {
      setStatus('Contract address not set in .env file')
    }
  } catch (error) {
    console.error('Connection error:', error)
    setStatus('Failed to connect wallet')
  }
}

// Contract functions
const createMusic = async () => {
  if (!contract.value) {
    setStatus('Connect wallet first!')
    return
  }

  try {
    setStatus('Creating music NFT...')
    const priceInWei = parseEther(newMusic.value.price)

    const tx = await contract.value.createMusic(
      newMusic.value.title,
      newMusic.value.artist,
      newMusic.value.ipfsHash,
      priceInWei
    )

    await tx.wait()
    setStatus('Music NFT created successfully!')

    // Reset form
    newMusic.value = { title: '', artist: '', ipfsHash: '', price: '' }

    // Refresh data
    loadAllMusic()
    loadMyMusic()
  } catch (error) {
    console.error('Create music error:', error)
    setStatus('Failed to create music NFT: ' + error.message)
  }
}

const buyMusic = async (tokenId, price) => {
  if (!contract.value) {
    setStatus('Connect wallet first!')
    return
  }

  try {
    setStatus('Buying music NFT...')
    const tx = await contract.value.buyMusic(tokenId, { value: price })
    await tx.wait()
    setStatus('Music NFT purchased successfully!')

    // Refresh data
    loadAllMusic()
    loadMyMusic()
  } catch (error) {
    console.error('Buy music error:', error)
    setStatus('Failed to buy music NFT: ' + error.message)
  }
}

const setForSale = async (tokenId, price) => {
  if (!contract.value || !price) {
    setStatus('Connect wallet and enter price!')
    return
  }

  try {
    setStatus('Setting music for sale...')
    const priceInWei = parseEther(price)
    const tx = await contract.value.setForSale(tokenId, priceInWei)
    await tx.wait()
    setStatus('Music NFT set for sale!')

    resalePrice.value = ''
    loadMyMusic()
    loadAllMusic()
  } catch (error) {
    console.error('Set for sale error:', error)
    setStatus('Failed to set for sale: ' + error.message)
  }
}

const loadAllMusic = async () => {
  if (!contract.value) return

  try {
    const musicList = await contract.value.getAllMusic()
    allMusic.value = musicList
    setStatus('Marketplace loaded!')
  } catch (error) {
    console.error('Load all music error:', error)
    setStatus('Failed to load marketplace')
  }
}

const loadMyMusic = async () => {
  if (!contract.value) return

  try {
    const musicList = await contract.value.getMyMusic()
    myMusic.value = musicList
    setStatus('Your collection loaded!')
  } catch (error) {
    console.error('Load my music error:', error)
    setStatus('Failed to load your collection')
  }
}

// Initialize on component mount
onMounted(() => {
  connectWallet()
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.container {
  max-width: 1200px;
}
</style>