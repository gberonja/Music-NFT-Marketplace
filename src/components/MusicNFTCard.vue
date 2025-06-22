<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { getIPFSUrl } from '../services/ipfsService'
import { ethers } from 'ethers'

const web3Store = useWeb3Store()
const marketplaceStore = useMarketplaceStore()
const { isConnected, account } = storeToRefs(web3Store)

const props = defineProps({
  nft: {
    type: Object,
    required: true
  }
})

const buyLoading = ref(false)
const showDetails = ref(false)

const extractCID = (ipfsUrl) => {
  if (!ipfsUrl) return null
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '')
  }
  return ipfsUrl
}

const imageUrl = computed(() => {
  if (!props.nft.metadata || !props.nft.metadata.image) {
    return 'https://via.placeholder.com/300x300/6366f1/white?text=Music+NFT'
  }
  const cid = extractCID(props.nft.metadata.image)
  return getIPFSUrl(cid)
})

const audioUrl = computed(() => {
  if (!props.nft.metadata || !props.nft.metadata.audio) return null
  const cid = extractCID(props.nft.metadata.audio)
  return getIPFSUrl(cid)
})

const formatPrice = (weiPrice) => {
  if (!weiPrice) return '0 ETH'
  try {
    return `${parseFloat(ethers.utils.formatEther(weiPrice)).toFixed(3)} ETH`
  } catch (e) {
    return '0 ETH'
  }
}

const isSeller = computed(() => {
  if (!props.nft || !account.value) return false
  return props.nft.seller?.toLowerCase() === account.value.toLowerCase()
})

const canBuy = computed(() => {
  return isConnected.value &&
    props.nft.isActive &&
    !isSeller.value &&
    !buyLoading.value
})

async function buyNFT() {
  if (!canBuy.value) {
    if (!isConnected.value) {
      alert('Please connect your wallet to purchase NFTs')
    }
    return
  }

  try {
    buyLoading.value = true

    console.log('Buying NFT:', {
      tokenId: props.nft.tokenId,
      price: props.nft.price,
      seller: props.nft.seller
    })

    await marketplaceStore.buyNFT(props.nft.tokenId, props.nft.price)
    alert(`Successfully purchased: ${props.nft.metadata?.name || 'NFT'}!`)

  } catch (e) {
    console.error('Error buying NFT:', e)

    let errorMessage = 'Unknown error'
    if (e.message) {
      errorMessage = e.message
    } else if (e.reason) {
      errorMessage = e.reason
    }

    alert(`Purchase failed: ${errorMessage}`)
  } finally {
    buyLoading.value = false
  }
}

function toggleDetails() {
  showDetails.value = !showDetails.value
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    <!-- Image -->
    <div class="relative aspect-square bg-gray-200 group">
      <img :src="imageUrl" :alt="nft.metadata?.name || 'NFT Cover'"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="$event.target.src = 'https://via.placeholder.com/300x300/6366f1/white?text=Music+NFT'">

      <!-- Overlay with details button -->
      <div
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <button @click="toggleDetails"
          class="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {{ showDetails ? 'Hide Details' : 'View Details' }}
        </button>
      </div>

      <!-- Status Badge -->
      <div class="absolute top-3 left-3">
        <span v-if="nft.isActive" class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          For Sale
        </span>
        <span v-else class="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Not Listed
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Basic Info -->
      <div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ nft.metadata?.name || 'Untitled' }}
        </h3>
        <p class="text-gray-600 text-sm truncate">
          by {{ nft.metadata?.artist || 'Unknown Artist' }}
        </p>
        <p v-if="nft.metadata?.genre" class="text-gray-500 text-xs mt-1">
          {{ nft.metadata.genre }}
        </p>
      </div>

      <!-- Expanded Details -->
      <div v-if="showDetails" class="mb-4 p-3 bg-gray-50 rounded-lg">
        <p v-if="nft.metadata?.description" class="text-sm text-gray-700 mb-2">
          {{ nft.metadata.description }}
        </p>
        <div class="text-xs text-gray-500 space-y-1">
          <p><strong>Token ID:</strong> {{ nft.tokenId }}</p>
          <p><strong>Seller:</strong> {{ nft.seller ? `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` : 'Unknown'
            }}</p>
          <p v-if="nft.category"><strong>Category:</strong> {{ nft.category }}</p>
        </div>
      </div>

      <!-- Audio Player -->
      <div v-if="audioUrl" class="mb-4">
        <audio controls class="w-full h-8" preload="none">
          <source :src="audioUrl" type="audio/mpeg">
          <source :src="audioUrl" type="audio/wav">
          <source :src="audioUrl" type="audio/ogg">
          Your browser does not support the audio element.
        </audio>
      </div>

      <!-- Price and Action -->
      <div v-if="nft.price && nft.isActive" class="mb-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Price</p>
            <p class="font-bold text-blue-600 text-lg">{{ formatPrice(nft.price) }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button v-if="canBuy" @click="buyNFT" :disabled="buyLoading"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ buyLoading ? 'Purchasing...' : 'Buy Now' }}
        </button>

        <button v-else-if="!isConnected" @click="web3Store.connectWallet"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
          Connect Wallet
        </button>

        <button v-else-if="isSeller" disabled
          class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed">
          Your NFT
        </button>

        <button v-else-if="!nft.isActive" disabled
          class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed">
          Not for Sale
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
audio::-webkit-media-controls-panel {
  background-color: #f3f4f6;
}

audio::-webkit-media-controls-current-time-display,
audio::-webkit-media-controls-time-remaining-display {
  color: #374151;
  font-size: 11px;
}
</style>