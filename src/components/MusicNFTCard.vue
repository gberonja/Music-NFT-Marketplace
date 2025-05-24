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
const imageLoaded = ref(false)
const imageError = ref(false)

const extractCID = (ipfsUrl) => {
  if (!ipfsUrl) return null
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '')
  }
  return ipfsUrl
}

const imageUrl = computed(() => {
  if (!props.nft.metadata || !props.nft.metadata.image) return '/default-cover.jpg'
  const cid = extractCID(props.nft.metadata.image)
  return getIPFSUrl(cid)
})

const formatPrice = (weiPrice) => {
  if (!weiPrice) return '0 ETH'
  return `${ethers.utils.formatEther(weiPrice)} ETH`
}

const isOwner = computed(() => {
  if (!props.nft || !account.value) return false
  return props.nft.owner?.toLowerCase() === account.value.toLowerCase() ||
    props.nft.seller?.toLowerCase() === account.value.toLowerCase()
})

const isSeller = computed(() => {
  if (!props.nft || !account.value) return false
  return props.nft.seller?.toLowerCase() === account.value.toLowerCase()
})

async function buyNFT() {
  if (!isConnected.value) {
    alert('Morate se povezati s novčanikom za kupnju NFT-a')
    return
  }

  try {
    buyLoading.value = true
    await marketplaceStore.buyNFT(props.nft.tokenId, props.nft.price)
    alert(`Uspješno ste kupili: ${props.nft.metadata?.name || 'NFT'}`)
  } catch (e) {
    console.error('Greška pri kupnji NFT-a:', e)
    alert(`Greška pri kupnji: ${e.message || 'Nepoznata greška'}`)
  } finally {
    buyLoading.value = false
  }
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Cover Image -->
    <div class="relative aspect-square bg-gray-200">
      <!-- Loading placeholder -->
      <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Image -->
      <img :src="imageUrl" :alt="nft.metadata?.name || 'NFT Cover'" class="w-full h-full object-cover"
        :class="{ 'opacity-0': !imageLoaded }" @load="handleImageLoad" @error="handleImageError">

      <!-- Error fallback -->
      <div v-if="imageError" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- NFT Info -->
    <div class="p-4">
      <h3 class="text-lg font-semibold truncate">{{ nft.metadata?.name || 'Untitled' }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

      <!-- Cijena -->
      <div v-if="nft.price && nft.isActive" class="flex justify-between items-center mb-4">
        <span class="text-gray-700 text-sm">Cijena:</span>
        <span class="font-bold text-blue-600 text-lg">{{ formatPrice(nft.price) }}</span>
      </div>

      <!-- Gumbi -->
      <div class="space-y-2">
        <!-- Kupnja gumb -->
        <button v-if="nft.isActive && isConnected && !isSeller && !isOwner" @click="buyNFT" :disabled="buyLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50">
          {{ buyLoading ? 'Kupnja...' : 'Kupi NFT' }}
        </button>

        <!-- Status badges -->
        <div v-if="isSeller" class="text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Vi prodajete
          </span>
        </div>

        <div v-if="isOwner && !nft.isActive" class="text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Vaš NFT
          </span>
        </div>

        <!-- Detalji gumb -->
        <router-link :to="`/nft/${nft.tokenId}`"
          class="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 rounded-lg transition-colors">
          Pogledaj detalje
        </router-link>
      </div>
    </div>
  </div>
</template>