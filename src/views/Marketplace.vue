<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { useMarketplaceStore } from '../store/marketplaceStore'
import MusicNFTCard from '../components/MusicNFTCard.vue'

const web3Store = useWeb3Store()
const marketplaceStore = useMarketplaceStore()

const { isConnected, isReady, error: web3Error } = storeToRefs(web3Store)
const { listedItems, loadingItems, error: marketplaceError } = storeToRefs(marketplaceStore)

const searchTerm = ref('')

const filteredNFTs = computed(() => {
    let filtered = listedItems.value

    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(nft =>
            nft.metadata?.name?.toLowerCase().includes(term) ||
            nft.metadata?.artist?.toLowerCase().includes(term)
        )
    }

    return filtered.filter(nft => nft.isActive)
})

async function connectWallet() {
    try {
        await web3Store.connectWallet()
        if (web3Store.isReady) {
            await marketplaceStore.fetchListedItems()
        }
    } catch (err) {
        console.error('Connection failed:', err)
    }
}

async function loadMarketplace() {
    if (web3Store.isReady) {
        await marketplaceStore.fetchListedItems()
    }
}

onMounted(() => {
    console.log('🎬 Marketplace mounted')
    // Ne auto-connectaj, samo čekaj da user klikne
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold text-center mb-8">Music NFT Marketplace</h1>

            <!-- Connection Status -->
            <div v-if="!isConnected"
                class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto text-center">
                <h2 class="text-lg font-semibold text-yellow-800 mb-2">Connect Your Wallet</h2>
                <p class="text-yellow-700 mb-4">Connect MetaMask to view and purchase music NFTs</p>
                <button @click="connectWallet"
                    class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium">
                    Connect MetaMask
                </button>
            </div>

            <!-- Loading Contracts -->
            <div v-else-if="!isReady"
                class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p class="text-blue-800">Loading contracts...</p>
            </div>

            <!-- Errors -->
            <div v-if="web3Error || marketplaceError"
                class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <p class="text-red-800 text-sm">
                    <strong>Error:</strong> {{ web3Error || marketplaceError }}
                </p>
                <button @click="loadMarketplace"
                    class="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                    Retry
                </button>
            </div>

            <!-- Connected and Ready -->
            <div v-if="isReady">
                <!-- Search -->
                <div class="max-w-md mx-auto mb-8">
                    <input v-model="searchTerm" type="text" placeholder="Search music or artist..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>

                <!-- Load Button -->
                <div class="text-center mb-6">
                    <button @click="loadMarketplace" :disabled="loadingItems"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50">
                        {{ loadingItems ? 'Loading...' : 'Load Marketplace' }}
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="loadingItems" class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Loading NFTs from blockchain...</p>
                </div>

                <!-- NFT Grid -->
                <div v-else-if="filteredNFTs.length > 0"
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <MusicNFTCard v-for="nft in filteredNFTs" :key="nft.tokenId" :nft="nft" />
                </div>

                <!-- Empty State -->
                <div v-else-if="!loadingItems" class="text-center py-12">
                    <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-4xl text-gray-400">🎵</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No NFTs Found</h3>
                    <p class="text-gray-500 mb-6">Be the first to create and list a music NFT!</p>
                    <router-link to="/upload"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block">
                        Create Your First NFT
                    </router-link>
                </div>

                <!-- Results Info -->
                <div v-if="!loadingItems" class="text-center mt-6 text-gray-600 text-sm">
                    {{ filteredNFTs.length }} NFT{{ filteredNFTs.length !== 1 ? 's' : '' }} found
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
}
</style>