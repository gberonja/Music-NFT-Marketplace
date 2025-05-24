<script setup>
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useWeb3Store } from '../store/web3Store'
import MusicNFTCard from '../components/MusicNFTCard.vue'

const marketplaceStore = useMarketplaceStore()
const web3Store = useWeb3Store()

const {
    filteredAndSortedItems,
    loadingItems,
    error,
    filters
} = storeToRefs(marketplaceStore)

const { isConnected } = storeToRefs(web3Store)

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

        <!-- Jednostavna pretraga -->
        <div class="mb-8 bg-white shadow-md rounded-lg p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pretraži</label>
                    <input v-model="filters.search" type="text" placeholder="Traži NFT-ove..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min. cijena (ETH)</label>
                    <input v-model="filters.minPrice" type="number" step="0.001" min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max. cijena (ETH)</label>
                    <input v-model="filters.maxPrice" type="number" step="0.001" min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div class="flex items-end">
                    <button @click="marketplaceStore.resetFilters()"
                        class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                        Resetiraj
                    </button>
                </div>
            </div>
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
            </div>

            <div v-if="loadingItems" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="filteredAndSortedItems.length === 0" class="text-center py-12">
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Nema NFT-ova</h3>
                <p class="text-gray-500 mb-4">Pokušajte s drugim filterima.</p>
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