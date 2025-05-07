<script setup>
import { onMounted, watch, ref } from 'vue'
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
    filters,
    sortOption
} = storeToRefs(marketplaceStore)

const { isConnected } = storeToRefs(web3Store)


onMounted(async () => {
    if (web3Store.marketplaceContract) {
        await marketplaceStore.fetchListedItems()
    }
})

watch(() => web3Store.marketplaceContract, async (newVal) => {
    if (newVal) {
        await marketplaceStore.fetchListedItems()
    }
}, { immediate: true })


function handleResetFilters() {
    marketplaceStore.resetFilters()
}
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8 text-center">Glazbeni NFT Marketplace</h1>

        <div v-if="!isConnected" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p class="font-bold">Upozorenje</p>
            <p>Povežite se s MetaMask novčanikom za punu funkcionalnost marketplace-a.</p>
            <button @click="web3Store.connectWallet"
                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Poveži Novčanik
            </button>
        </div>

        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p class="font-bold">Greška</p>
            <p>{{ error }}</p>
        </div>

        <!-- Filteri i sortiranje -->
        <div class="bg-white shadow-md rounded-lg p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Pretraga -->
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="search">
                        Pretraga
                    </label>
                    <input id="search" v-model="filters.search" type="text" placeholder="Traži po naslovu, izvođaču..."
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>

                <!-- Cijena -->
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Cijena (ETH)
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <input v-model="filters.minPrice" type="number" placeholder="Min" min="0" step="0.01"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <input v-model="filters.maxPrice" type="number" placeholder="Max" min="0" step="0.01"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                </div>

                <!-- Sortiranje -->
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="sort">
                        Sortiranje
                    </label>
                    <select id="sort" v-model="sortOption"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="newest">Najnovije prvo</option>
                        <option value="oldest">Najstarije prvo</option>
                        <option value="priceAsc">Cijena: rastuće</option>
                        <option value="priceDesc">Cijena: padajuće</option>
                    </select>
                </div>
            </div>

            <div class="flex items-center mt-4">
                <input id="onlyOwned" v-model="filters.onlyOwned" type="checkbox" class="h-4 w-4 text-blue-600"
                    :disabled="!isConnected">
                <label for="onlyOwned" class="ml-2 text-gray-700">
                    Prikaži samo moje NFT-ove
                </label>

                <button @click="handleResetFilters"
                    class="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm">
                    Resetiraj filtere
                </button>
            </div>
        </div>

        <!-- Prikaz NFT-ova -->
        <div v-if="loadingItems" class="flex justify-center items-center my-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="filteredAndSortedItems.length === 0" class="text-center my-12">
            <p class="text-xl text-gray-600">Nema NFT-ova koji odgovaraju vašim filterima</p>
            <p v-if="!isConnected" class="mt-2 text-gray-500">
                Povežite se s novčanikom da biste vidjeli sve NFT-ove.
            </p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <MusicNFTCard v-for="nft in filteredAndSortedItems" :key="nft.tokenId" :nft="nft" />
        </div>
    </div>
</template>