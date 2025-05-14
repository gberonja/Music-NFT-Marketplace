<script setup>
import { ref, computed, watch } from 'vue'
import { useMarketplaceStore } from '../store/marketplaceStore'

const marketplaceStore = useMarketplaceStore()
const { filters } = storeToRefs(marketplaceStore)

// Lokalno stanje
const showAdvanced = ref(false)
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

// Dodaci za naprednu pretragu
const artistFilter = ref('')
const genreFilter = ref('')
const royaltyRange = ref([0, 1000])
const sortDirection = ref('desc')

// Opcije za sortiranje
const sortOptions = [
    { value: 'newest', label: 'Najnovije prvo' },
    { value: 'oldest', label: 'Najstarije prvo' },
    { value: 'priceAsc', label: 'Cijena: rastuće' },
    { value: 'priceDesc', label: 'Cijena: padajuće' },
    { value: 'royaltyAsc', label: 'Royalty: rastuće' },
    { value: 'royaltyDesc', label: 'Royalty: padajuće' }
]

// Popularne pretrage
const popularSearches = [
    'elektronska glazba',
    'instrumental',
    'reper',
    'rock',
    'ambient'
]

// Dodaj pretragu u povijst
function addToSearchHistory(searchTerm) {
    if (!searchTerm.trim()) return

    const history = searchHistory.value.filter(term => term !== searchTerm)
    history.unshift(searchTerm)
    searchHistory.value = history.slice(0, 10) // Čuvaj samo posledjih 10

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// Ukloni iz povijesti
function removeFromHistory(searchTerm) {
    searchHistory.value = searchHistory.value.filter(term => term !== searchTerm)
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// Očisti povijst
function clearHistory() {
    searchHistory.value = []
    localStorage.removeItem('searchHistory')
}

// Primijeni napredne filtere
function applyAdvancedFilters() {
    if (artistFilter.value) {
        filters.value.artist = artistFilter.value
    }
    if (genreFilter.value) {
        filters.value.genre = genreFilter.value
    }
    filters.value.royaltyMin = royaltyRange.value[0]
    filters.value.royaltyMax = royaltyRange.value[1]
}

// Resetiraj sve filtere
function resetAllFilters() {
    marketplaceStore.resetFilters()
    artistFilter.value = ''
    genreFilter.value = ''
    royaltyRange.value = [0, 1000]
}

// Watch za promjene pretrage
watch(() => filters.value.search, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
        addToSearchHistory(newValue)
    }
})
</script>

<template>
    <div class="bg-white shadow-md rounded-lg p-6">
        <!-- Osnovni dio pretrage -->
        <div class="space-y-4">
            <!-- Glavno polje za pretragu -->
            <div class="relative">
                <input v-model="filters.search" type="text" placeholder="Traži NFT-ove..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd" />
                </svg>
            </div>

            <!-- Kratko sučelje s osnovnim filterima -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sortiranje</label>
                    <select v-model="marketplaceStore.sortOption"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="flex items-end">
                    <button @click="showAdvanced = !showAdvanced"
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707l-4.414 4.414A2 2 0 0011 13v2.585l-1.707 1.707A1 1 0 018 18v-5.585L3.293 6.707A1 1 0 013 6V3z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ showAdvanced ? 'Manje' : 'Više' }} opcija
                    </button>
                </div>
            </div>
        </div>

        <!-- Napredni dio pretrage -->
        <div v-if="showAdvanced" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Napredne opcije</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Izvođač</label>
                    <input v-model="artistFilter" type="text" placeholder="Naziv izvođača..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Žanr/Opis</label>
                    <input v-model="genreFilter" type="text" placeholder="elektronska, rock, jazz..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Royalty raspon ({{ royaltyRange[0] / 100 }}% - {{ royaltyRange[1] / 100 }}%)
                    </label>
                    <div class="flex items-center space-x-2">
                        <input v-model="royaltyRange[0]" type="range" min="0" max="1000" class="flex-1">
                        <input v-model="royaltyRange[1]" type="range" min="0" max="1000" class="flex-1">
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <div class="space-x-2">
                    <button @click="applyAdvancedFilters"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        Primijeni filtere
                    </button>
                    <button @click="resetAllFilters"
                        class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md">
                        Resetiraj sve
                    </button>
                </div>

                <div class="flex items-center space-x-2">
                    <input id="onlyWithAudio" v-model="filters.onlyWithAudio" type="checkbox"
                        class="h-4 w-4 text-blue-600">
                    <label for="onlyWithAudio" class="text-sm text-gray-700">
                        Samo s audio preview
                    </label>
                </div>
            </div>
        </div>

        <!-- Popularne pretrage i povijest -->
        <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Popularne pretrage -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Popularne pretrage</h4>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="search in popularSearches" :key="search" @click="filters.search = search"
                            class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200">
                            {{ search }}
                        </button>
                    </div>
                </div>

                <!-- Povjest pretrage -->
                <div v-if="searchHistory.length > 0">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-sm font-semibold text-gray-700">Nedavne pretrage</h4>
                        <button @click="clearHistory" class="text-xs text-gray-500 hover:text-gray-700">
                            Obriši sve
                        </button>
                    </div>
                    <div class="space-y-1">
                        <div v-for="search in searchHistory.slice(0, 5)" :key="search"
                            class="flex items-center justify-between text-sm">
                            <button @click="filters.search = search"
                                class="text-blue-600 hover:text-blue-800 truncate flex-1 text-left">
                                {{ search }}
                            </button>
                            <button @click="removeFromHistory(search)" class="ml-2 text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>