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
</script>

<template>
  <div class="bg-white rounded-lg shadow-md">
    <!-- Cover Image -->
    <div class="aspect-square bg-gray-200">
      <img :src="imageUrl" :alt="nft.metadata?.name || 'NFT Cover'" class="w-full h-full object-cover rounded-lg">
    </div>

    <!-- NFT Info -->
    <div class="p-4">
      <h3 class="text-lg font-semibold truncate">{{ nft.metadata?.name || 'Untitled' }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

      <!-- Audio Player -->
      <div v-if="audioUrl" class="mb-4">
        <audio controls class="w-full">
          <source :src="audioUrl" type="audio/mpeg">
          Vaš pregljednik ne podržava audio element.
        </audio>
      </div>

      <!-- Cijena -->
      <div v-if="nft.price && nft.isActive" class="flex justify-between items-center mb-4">
        <span class="text-gray-700 text-sm">Cijena:</span>
        <span class="font-bold text-blue-600 text-lg">{{ formatPrice(nft.price) }}</span>
      </div>

      <!-- Gumbi -->
      <div class="space-y-2">
        <!-- Kupnja gumb -->
        <button v-if="nft.isActive && isConnected && !isSeller && !isOwner" @click="buyNFT" :disabled="buyLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
          {{ buyLoading ? 'Kupnja...' : 'Kupi NFT' }}
        </button>

        <!-- Status badges -->
        <div v-if="isSeller" class="text-center">
          <span class="text-blue-600 text-sm">Vi prodajete</span>
        </div>

        <div v-if="isOwner && !nft.isActive" class="text-center">
          <span class="text-green-600 text-sm">Vaš NFT</span>
        </div>
      </div>
    </div>
  </div>
</template>