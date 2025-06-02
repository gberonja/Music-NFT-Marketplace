<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useWeb3Store } from '../store/web3Store'
import { getIPFSUrl } from '../services/ipfsService'
import { ethers } from 'ethers'
import { watch } from 'vue'

const route = useRoute()
const router = useRouter()
const marketplaceStore = useMarketplaceStore()
const web3Store = useWeb3Store()

const { isConnected, account } = storeToRefs(web3Store)

const tokenId = route.params.id
const nft = ref(null)
const loading = ref(true)
const error = ref(null)
const buyLoading = ref(false)
const buySuccess = ref(false)
const buyError = ref(null)


const isPlaying = ref(false)
const audio = ref(null)

async function fetchNFTDetails() {
    try {
        loading.value = true
        error.value = null

        nft.value = await marketplaceStore.fetchNFTDetails(tokenId)
    } catch (e) {
        console.error('Greška pri dohvaćanju NFT detalja:', e)
        error.value = e.message || 'Greška pri dohvaćanju detalja NFT-a'
    } finally {
        loading.value = false
    }
}


async function buyNFT() {
    if (!isConnected.value) {
        alert('Morate se povezati s novčanikom za kupnju NFT-a')
        return
    }

    if (!nft.value || !nft.value.isActive) {
        alert('NFT nije dostupan za kupnju')
        return
    }

    try {
        buyLoading.value = true
        buyError.value = null
        buySuccess.value = false

        await marketplaceStore.buyNFT(tokenId, nft.value.price)

        buySuccess.value = true

        await fetchNFTDetails()
    } catch (e) {
        console.error('Greška pri kupnji NFT-a:', e)
        buyError.value = e.message || 'Greška pri kupnji NFT-a'
    } finally {
        buyLoading.value = false
    }
}


const extractCID = (ipfsUrl) => {
    if (!ipfsUrl) return null
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', '')
    }
    return ipfsUrl
}


const imageUrl = computed(() => {
    if (!nft.value || !nft.value.metadata || !nft.value.metadata.image) return '/default-cover.jpg'
    const cid = extractCID(nft.value.metadata.image)
    return getIPFSUrl(cid)
})


const audioUrl = computed(() => {
    if (!nft.value || !nft.value.metadata || !nft.value.metadata.audio) return null
    const cid = extractCID(nft.value.metadata.audio)
    return getIPFSUrl(cid)
})


const formatPrice = (weiPrice) => {
    if (!weiPrice) return '0 ETH'
    return `${ethers.utils.formatEther(weiPrice)} ETH`
}


const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}


const isOwner = computed(() => {
    if (!nft.value || !account.value) return false
    return nft.value.owner.toLowerCase() === account.value.toLowerCase()
})


const isSeller = computed(() => {
    if (!nft.value || !account.value) return false
    return nft.value.seller.toLowerCase() === account.value.toLowerCase()
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


onMounted(async () => {
    if (web3Store.musicNFTContract && web3Store.marketplaceContract) {
        await fetchNFTDetails()
    } else {
        const unwatch = watch(() => web3Store.musicNFTContract, async (newVal) => {
            if (newVal) {
                await fetchNFTDetails()
                unwatch()
            }
        })
    }
})
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <button @click="router.go(-1)" class="mb-6 flex items-center text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 010 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd" />
            </svg>
            Natrag na Marketplace
        </button>

        <div v-if="loading" class="flex justify-center items-center my-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p class="font-bold">Greška</p>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="nft" class="bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Audio element (hidden) -->
            <audio :src="audioUrl" ref="onAudioLoaded" class="hidden"></audio>

            <div class="md:flex">
                <!-- Cover Image s Play gumbom -->
                <div class="md:w-1/3 relative">
                    <div class="relative aspect-square">
                        <img :src="imageUrl" alt="Cover" class="w-full h-full object-cover">

                        <button v-if="audioUrl" @click="togglePlay"
                            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity hover:bg-opacity-30">
                            <div class="bg-white bg-opacity-80 rounded-full p-4">
                                <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg"
                                    class="h-12 w-12 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clip-rule="evenodd" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Detalji NFT-a -->
                <div class="md:w-2/3 p-6">
                    <h1 class="text-3xl font-bold mb-2">{{ nft.metadata?.name || 'Untitled' }}</h1>
                    <p class="text-xl text-gray-600 mb-4">{{ nft.metadata?.artist || 'Unknown Artist' }}</p>

                    <div class="bg-gray-100 p-4 rounded-lg mb-6">
                        <p class="mb-4">{{ nft.metadata?.description || 'Nema opisa' }}</p>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">Token ID</p>
                                <p class="font-semibold">{{ nft.tokenId }}</p>
                            </div>

                            <div>
                                <p class="text-sm text-gray-500">Status</p>
                                <p class="font-semibold">
                                    <span v-if="nft.isActive" class="text-green-600">Na prodaji</span>
                                    <span v-else class="text-gray-600">Nije na prodaji</span>
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-gray-500">Vlasnik</p>
                                <p class="font-semibold">{{ formatAddress(nft.owner) }}</p>
                            </div>

                            <div>
                                <p class="text-sm text-gray-500">Kreator</p>
                                <p class="font-semibold">{{ formatAddress(nft.creator) }}</p>
                            </div>

                            <div>
                                <p class="text-sm text-gray-500">Royalty postotak</p>
                                <p class="font-semibold">{{ (Number(nft.royaltyPercentage) / 100).toFixed(2) }}%</p>
                            </div>

                            <div v-if="nft.isActive">
                                <p class="text-sm text-gray-500">Prodavatelj</p>
                                <p class="font-semibold">{{ formatAddress(nft.seller) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Cijena i gumbi za kupnju -->
                    <div v-if="nft.isActive && !isSeller" class="flex flex-col items-start">
                        <div class="mb-4">
                            <p class="text-gray-600 mb-1">Cijena:</p>
                            <p class="text-3xl font-bold text-blue-600">{{ formatPrice(nft.price) }}</p>
                        </div>

                        <button v-if="isConnected && !isOwner && !isSeller" @click="buyNFT" :disabled="buyLoading"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="buyLoading">Kupnja u tijeku...</span>
                            <span v-else>Kupi NFT</span>
                        </button>

                        <button v-else-if="!isConnected" @click="web3Store.connectWallet"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
                            Poveži Novčanik za Kupnju
                        </button>

                        <div v-if="buySuccess" class="mt-4 bg-green-100 text-green-700 p-3 rounded-lg">
                            Uspješna kupnja! Sada ste vlasnik ovog NFT-a.
                        </div>

                        <div v-if="buyError" class="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
                            Greška pri kupnji: {{ buyError }}
                        </div>
                    </div><!-- Poruka za vlasnika -->
                    <div v-else-if="isOwner && !nft.isActive" class="bg-blue-100 text-blue-700 p-4 rounded-lg">
                        <p class="font-semibold">Vi ste vlasnik ovog NFT-a</p>
                        <p>Da biste ga postavili na prodaju, idite na svoj Profil i odaberite opciju "Listaj na
                            tržištu".</p>
                    </div>

                    <!-- Poruka za prodavatelja -->
                    <div v-else-if="isSeller" class="bg-blue-100 text-blue-700 p-4 rounded-lg">
                        <p class="font-semibold">Vi prodajete ovaj NFT</p>
                        <p>Trenutna cijena: {{ formatPrice(nft.price) }}</p>
                        <p>Za uklanjanje s tržišta, idite na svoj Profil.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>