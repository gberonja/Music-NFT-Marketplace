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


const isPlaying = ref(false)
const audio = ref(null)
const buyLoading = ref(false)
const buyError = ref(null)


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
    return props.nft.owner.toLowerCase() === account.value.toLowerCase()
})


const isSeller = computed(() => {
    if (!props.nft || !account.value) return false
    return props.nft.seller.toLowerCase() === account.value.toLowerCase()
})


const togglePlay = () => {
    if (!audio.value) return

    if (isPlaying.value) {
        audio.value.pause()
    } else {
        audio.value.play()
    }

    isPlaying.value = !isPlaying.value
}


const onAudioLoaded = (el) => {
    if (!el) return

    audio.value = el

    el.addEventListener('ended', () => {
        isPlaying.value = false
    })

    el.addEventListener('pause', () => {
        isPlaying.value = false
    })

    el.addEventListener('play', () => {
        isPlaying.value = true
    })
}


async function buyNFT() {
    if (!isConnected.value) {
        alert('Morate se povezati s novčanikom za kupnju NFT-a')
        return
    }

    try {
        buyLoading.value = true
        buyError.value = null

        await marketplaceStore.buyNFT(props.nft.tokenId, props.nft.price)


    } catch (e) {
        console.error('Greška pri kupnji NFT-a:', e)
        buyError.value = e.message || 'Greška pri kupnji NFT-a'
    } finally {
        buyLoading.value = false
    }
}
</script>

<template>
    <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg">
        <!-- Audio element (hidden) -->
        <audio :src="audioUrl" ref="onAudioLoaded" class="hidden"></audio>

        <!-- Cover Image s Play gumbom -->
        <div class="relative aspect-square overflow-hidden bg-gray-100">
            <img :src="imageUrl" alt="Cover" class="w-full h-full object-cover">

            <button v-if="audioUrl" @click.stop="togglePlay"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity hover:bg-opacity-30">
                <div class="bg-white bg-opacity-80 rounded-full p-3">
                    <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600"
                        viewBox="0 0 20 20" fill="currentColor">
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
                </div>
            </button>
        </div>

        <!-- NFT Info -->
        <div class="p-4">
            <h3 class="text-lg font-semibold truncate">{{ nft.metadata?.name || 'Untitled' }}</h3>
            <p class="text-gray-600 text-sm mb-2">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

            <!-- Cijena -->
            <div v-if="nft.price && nft.isActive" class="flex justify-between items-center mt-2">
                <span class="text-gray-700">Cijena:</span>
                <span class="font-semibold text-blue-600">{{ formatPrice(nft.price) }}</span>
            </div>

            <!-- Gumbi -->
            <div class="mt-4 space-y-2">
                <!-- Kupnja gumb -->
                <button v-if="nft.isActive && isConnected && !isSeller && !isOwner" @click.stop="buyNFT"
                    :disabled="buyLoading"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="buyLoading">Kupnja...</span>
                    <span v-else>Kupi NFT</span>
                </button>

                <!-- Status/poruka -->
                <div v-if="isSeller" class="text-center text-sm text-blue-600">
                    Vi prodajete ovaj NFT
                </div>

                <div v-if="isOwner && !nft.isActive" class="text-center text-sm text-blue-600">
                    Vi posjedujete ovaj NFT
                </div>

                <!-- Greška pri kupnji -->
                <div v-if="buyError" class="text-center text-xs text-red-600">
                    {{ buyError }}
                </div>

                <!-- Detalji gumb -->
                <router-link :to="`/nft/${nft.tokenId}`"
                    class="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-2 rounded-md">
                    Detalji
                </router-link>
            </div>
        </div>
    </div>
</template>