<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { getIPFSUrl } from '../services/ipfsService'
import { audioPlayer } from '../services/audioPlayerService'
import { toast } from '../services/notificationService'
import { ethers } from 'ethers'

const web3Store = useWeb3Store()
const marketplaceStore = useMarketplaceStore()
const { isConnected, account } = storeToRefs(web3Store)

const props = defineProps({
  nft: {
    type: Object,
    required: true
  },
  hideActions: {
    type: Boolean,
    default: false
  }
})


const buyLoading = ref(false)
const buyError = ref(null)
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


const audioUrl = computed(() => {
  if (!props.nft.metadata || !props.nft.metadata.audio) return null
  const cid = extractCID(props.nft.metadata.audio)
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


const isCurrentTrack = computed(() => {
  return audioPlayer.state.currentTrack?.tokenId === props.nft.tokenId
})


const isPlaying = computed(() => {
  return isCurrentTrack.value && audioPlayer.state.isPlaying
})


const handlePlayClick = () => {
  if (!audioUrl.value) return

  const trackData = {
    tokenId: props.nft.tokenId,
    title: props.nft.metadata?.name || 'Untitled',
    artist: props.nft.metadata?.artist || 'Unknown Artist',
    audioUrl: audioUrl.value,
    imageUrl: imageUrl.value
  }

  if (isCurrentTrack.value) {
    audioPlayer.togglePlay()
  } else {
    audioPlayer.setTrack(trackData)
    audioPlayer.play()
    toast.success(`Reprodukcija: ${trackData.title}`)
  }
}


const addToPlaylist = () => {
  if (!audioUrl.value) return

  const trackData = {
    tokenId: props.nft.tokenId,
    title: props.nft.metadata?.name || 'Untitled',
    artist: props.nft.metadata?.artist || 'Unknown Artist',
    audioUrl: audioUrl.value,
    imageUrl: imageUrl.value
  }


  const currentPlaylist = [...audioPlayer.state.playlist]
  currentPlaylist.push(trackData)
  audioPlayer.setPlaylist(currentPlaylist)
  toast.info(`Dodano u playlist: ${trackData.title}`)
}


async function buyNFT() {
  if (!isConnected.value) {
    toast.warning('Morate se povezati s novčanikom za kupnju NFT-a')
    return
  }

  try {
    buyLoading.value = true
    buyError.value = null

    await marketplaceStore.buyNFT(props.nft.tokenId, props.nft.price)
    toast.success(`Uspješno ste kupili: ${props.nft.metadata?.name || 'NFT'}`)
  } catch (e) {
    console.error('Greška pri kupnji NFT-a:', e)
    buyError.value = e.message || 'Greška pri kupnji NFT-a'
    toast.error(`Greška pri kupnji: ${e.message || 'Nepoznata greška'}`)
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
  <div
    class="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
    <!-- Cover Image s Play gumbom -->
    <div
      class="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
      <!-- Loading placeholder -->
      <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Image -->
      <img :src="imageUrl" :alt="nft.metadata?.name || 'NFT Cover'"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        :class="{ 'opacity-0': !imageLoaded }" @load="handleImageLoad" @error="handleImageError">

      <!-- Error fallback -->
      <div v-if="imageError" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Play overlay -->
      <div v-if="audioUrl && imageLoaded"
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
        <button @click.stop="handlePlayClick"
          class="transform scale-0 group-hover:scale-100 transition-all duration-300 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 shadow-lg">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" viewBox="0 0 20 20"
            fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" viewBox="0 0 20 20"
            fill="currentColor">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Indikator trenutne reprodukcije -->
      <div v-if="isCurrentTrack" class="absolute top-3 left-3">
        <div class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2 shadow-lg">
          <div v-if="isPlaying" class="flex space-x-0.5">
            <div class="w-1 h-3 bg-white rounded animate-pulse"></div>
            <div class="w-1 h-3 bg-white rounded animate-pulse" style="animation-delay: 0.1s"></div>
            <div class="w-1 h-3 bg-white rounded animate-pulse" style="animation-delay: 0.2s"></div>
          </div>
          <span>{{ isPlaying ? 'Playing' : 'Paused' }}</span>
        </div>
      </div>

      <!-- Dodaj u playlist gumb -->
      <div v-if="audioUrl" class="absolute top-3 right-3">
        <button @click.stop="addToPlaylist"
          class="bg-white dark:bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-110"
          title="Dodaj u playlist">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20"
            fill="currentColor">
            <path fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- NFT Info -->
    <div class="p-4 dark:text-white">
      <h3
        class="text-lg font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {{ nft.metadata?.name || 'Untitled' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

      <!-- Cijena -->
      <div v-if="nft.price && nft.isActive" class="flex justify-between items-center mb-4">
        <span class="text-gray-700 dark:text-gray-300 text-sm">Cijena:</span>
        <span class="font-bold text-blue-600 dark:text-blue-400 text-lg">{{ formatPrice(nft.price) }}</span>
      </div>

      <!-- Gumbi -->
      <div v-if="!hideActions" class="space-y-2">
        <!-- Kupnja gumb -->
        <button v-if="nft.isActive && isConnected && !isSeller && !isOwner" @click.stop="buyNFT" :disabled="buyLoading"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium relative overflow-hidden">
          <div v-if="buyLoading" class="absolute inset-0 flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </div>
          <span :class="{ 'opacity-0': buyLoading }">
            {{ buyLoading ? '' : 'Kupi NFT' }}
          </span>
        </button>

        <!-- Status badges -->
        <div v-if="isSeller" class="text-center">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clip-rule="evenodd" />
            </svg>
            Vi prodajete
          </span>
        </div>

        <div v-if="isOwner && !nft.isActive" class="text-center">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            Vaš NFT
          </span>
        </div>

        <!-- Detalji gumb -->
        <router-link :to="`/nft/${nft.tokenId}`"
          class="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium">
          Pogledaj detalje
        </router-link>
      </div>
    </div>
  </div>
</template>