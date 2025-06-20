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
    <div class="aspect-square bg-gray-200">
      <img :src="imageUrl" :alt="nft.metadata?.name || 'NFT Cover'" class="w-full h-full object-cover rounded-t-lg">
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold truncate">{{ nft.metadata?.name || 'Untitled' }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

      <div v-if="audioUrl" class="mb-4">
        <audio controls class="w-full">
          <source :src="audioUrl" type="audio/mpeg">
          Vaš pregljednik ne podržava audio element.
        </audio>
      </div>

      <div v-if="nft.price && nft.isActive" class="mb-4">
        <span class="font-bold text-blue-600 text-lg">{{ formatPrice(nft.price) }}</span>
      </div>

      <button v-if="nft.isActive && isConnected && !isSeller" @click="buyNFT" :disabled="buyLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        {{ buyLoading ? 'Kupnja...' : 'Kupi NFT' }}
      </button>
    </div>
  </div>
</template>