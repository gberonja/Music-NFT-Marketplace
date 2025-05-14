<script setup>
import { onMounted, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useWeb3Store } from '../store/web3Store'
import MusicNFTCard from '../components/MusicNFTCard.vue'
import AdvancedSearch from '../components/AdvancedSearch.vue'
import MarketAnalytics from '../components/MarketAnalytics.vue'
import RecommendationEngine from '../components/RecommendationEngine.vue'

const marketplaceStore = useMarketplaceStore()
const web3Store = useWeb3Store()

const {
    filteredAndSortedItems,
    loadingItems,
    error
} = storeToRefs(marketplaceStore)

const { isConnected } = storeToRefs(web3Store)


const showAnalytics = ref(true)
const showRecommendations = ref(true)


onMounted(async () => {
    if (web3Store.contractsInitialized) {
        await marketplaceStore.fetchListedItems()
    }
})


watch(() => web3Store.contractsInitialized, async (newVal) => {
    if (newVal) {
        await marketplaceStore.fetchListedItems()
    }
}, { immediate: true })
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8 text-center">Glazbeni NFT Marketplace</h1>

        <!-- Error poruka -->
        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p class="font-bold">Greška</p>
            <p>{{ error }}</p>
        </div>

        <!-- Preporuke za povezane korisnike -->
        <div v-if="isConnected && showRecommendations" class="mb-8">
            <RecommendationEngine />
        </div>

        <!-- Napredna pretraga -->
        <div class="mb-8">
            <AdvancedSearch />
        </div>

        <!-- Tržišna analitika -->
        <div v-if="showAnalytics" class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Tržišna analitika</h2>
                <button @click="showAnalytics = false" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <MarketAnalytics />
        </div>

        <!-- Prikaz NFT-ova -->
        <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold">
                    Dostupni NFT-ovi
                    <span class="text-gray-500 text-base">
                        ({{ filteredAndSortedItems.length }})
                    </span>
                </h2>

                <div class="flex space-x-2">
                    <!-- Toggle gumbovi -->
                    <button v-if="!showAnalytics" @click="showAnalytics = true"
                        class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded">
                        Prikaži analitiku
                    </button>

                    <button v-if="isConnected && !showRecommendations" @click="showRecommendations = true"
                        class="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded">
                        Prikaži preporuke
                    </button>
                </div>
            </div>

            <div v-if="loadingItems" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="filteredAndSortedItems.length === 0" class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Nema NFT-ova koji odgovaraju vašoj pretrazi</h3>
                <p class="text-gray-500 mb-4">Pokušajte s drugim filterima ili pretragom.</p>
                <button @click="marketplaceStore.resetFilters()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Resetiraj filtere
                </button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MusicNFTCard v-for="nft in filteredAndSortedItems" :key="nft.tokenId" :nft="nft" />
            </div>
        </div>
    </div>
</template>