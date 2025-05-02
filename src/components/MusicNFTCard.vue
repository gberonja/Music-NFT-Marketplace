<script setup>
import { ref, computed } from 'vue'
import { getIPFSUrl } from '../services/ipfsService'

const props = defineProps({
    nft: {
        type: Object,
        required: true
    }
})

// Audio player state
const isPlaying = ref(false)
const audio = ref(null)

// Extract CID from ipfs:// URL
const extractCID = (ipfsUrl) => {
    if (!ipfsUrl) return null
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', '')
    }
    return ipfsUrl
}

// Compute image URL
const imageUrl = computed(() => {
    if (!props.nft.metadata || !props.nft.metadata.image) return '/default-cover.jpg'
    const cid = extractCID(props.nft.metadata.image)
    return getIPFSUrl(cid)
})

// Compute audio URL
const audioUrl = computed(() => {
    if (!props.nft.metadata || !props.nft.metadata.audio) return null
    const cid = extractCID(props.nft.metadata.audio)
    return getIPFSUrl(cid)
})

// Format price from wei to ETH
const formatPrice = (weiPrice) => {
    if (!weiPrice) return '0 ETH'
    // Convert wei to ETH
    const ethers = window.ethers
    return `${ethers.utils.formatEther(weiPrice)} ETH`
}

// Handle play button click
const togglePlay = () => {
    if (!audio.value) return

    if (isPlaying.value) {
        audio.value.pause()
    } else {
        audio.value.play()
    }

    isPlaying.value = !isPlaying.value
}

// Add event listeners to audio element
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
</script>

<template>
    <div
        class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-[1.02]">
        <!-- Audio element (hidden) -->
        <audio :src="audioUrl" ref="onAudioLoaded" class="hidden"></audio>

        <!-- Cover Image with Play Button -->
        <div class="relative aspect-square overflow-hidden bg-gray-100">
            <img :src="imageUrl" alt="Cover" class="w-full h-full object-cover">

            <button v-if="audioUrl" @click="togglePlay"
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

            <!-- Price (if listed) -->
            <div v-if="nft.price" class="flex justify-between items-center mt-2">
                <span class="text-gray-700">Cijena:</span>
                <span class="font-semibold text-blue-600">{{ formatPrice(nft.price) }}</span>
            </div>

            <!-- View Details Button -->
            <div class="mt-4">
                <router-link :to="`/nft/${nft.tokenId}`"
                    class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md">
                    Detalji
                </router-link>
            </div>
        </div>
    </div>
</template>