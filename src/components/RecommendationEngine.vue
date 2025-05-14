<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useUserStore } from '../store/userStore'
import { useWeb3Store } from '../store/web3Store'
import MusicNFTCard from './MusicNFTCard.vue'
import { ethers } from 'ethers'

const marketplaceStore = useMarketplaceStore()
const userStore = useUserStore()
const web3Store = useWeb3Store()

const { listedItems } = storeToRefs(marketplaceStore)
const { ownedNFTs, createdNFTs } = storeToRefs(userStore)
const { account } = storeToRefs(web3Store)


function getRecommendations() {
    if (!account.value || listedItems.value.length === 0) {
        return []
    }


    const userPreferences = analyzeUserPreferences()


    const availableNFTs = listedItems.value.filter(nft =>
        nft.seller.toLowerCase() !== account.value.toLowerCase()
    )


    const rankedNFTs = availableNFTs.map(nft => ({
        ...nft,
        score: calculateSimilarityScore(nft, userPreferences)
    })).sort((a, b) => b.score - a.score)

    return rankedNFTs.slice(0, 8)
}


function analyzeUserPreferences() {
    const preferences = {
        artists: {},
        priceRange: { min: 0, max: 0 },
        royaltyPreference: 0,
        genres: {}
    }


    ownedNFTs.value.forEach(nft => {
        if (nft.metadata) {

            const artist = nft.metadata.artist || 'Unknown'
            preferences.artists[artist] = (preferences.artists[artist] || 0) + 1


            if (nft.price) {
                const price = parseFloat(ethers.utils.formatEther(nft.price))
                preferences.priceRange.min = Math.min(preferences.priceRange.min || price, price)
                preferences.priceRange.max = Math.max(preferences.priceRange.max, price)
            }


            const royalty = parseInt(nft.royaltyPercentage || '0')
            preferences.royaltyPreference += royalty


            const description = nft.metadata.description || ''
            extractGenres(description).forEach(genre => {
                preferences.genres[genre] = (preferences.genres[genre] || 0) + 1
            })
        }
    })


    preferences.royaltyPreference = preferences.royaltyPreference / (ownedNFTs.value.length || 1)

    return preferences
}


function calculateSimilarityScore(nft, preferences) {
    let score = 0

    if (nft.metadata) {

        const artist = nft.metadata.artist || 'Unknown'
        if (preferences.artists[artist]) {
            score += preferences.artists[artist] * 30
        }


        if (nft.price) {
            const price = parseFloat(ethers.utils.formatEther(nft.price))
            const { min, max } = preferences.priceRange
            if (price >= min && price <= max) {
                score += 20
            } else {

                const avgPrice = (min + max) / 2
                const priceDiff = Math.abs(price - avgPrice) / avgPrice
                score -= priceDiff * 10
            }
        }


        const royalty = parseInt(nft.royaltyPercentage || '0')
        const royaltyDiff = Math.abs(royalty - preferences.royaltyPreference)
        score -= royaltyDiff / 100 * 5


        const description = nft.metadata.description || ''
        const nftGenres = extractGenres(description)
        nftGenres.forEach(genre => {
            if (preferences.genres[genre]) {
                score += preferences.genres[genre] * 15
            }
        })


        score += Math.random() * 5
    }

    return Math.max(0, score)
}


function extractGenres(text) {
    const genres = []
    const commonGenres = [
        'electronic', 'elektronska', 'hip-hop', 'hip hop', 'jazz', 'rock',
        'pop', 'classical', 'klasična', 'blues', 'reggae', 'funk', 'soul',
        'ambient', 'techno', 'house', 'drum & bass', 'dubstep', 'trance',
        'alternative', 'alternativa', 'indie', 'folk', 'country', 'r&b'
    ]

    const lowerText = text.toLowerCase()
    commonGenres.forEach(genre => {
        if (lowerText.includes(genre)) {
            genres.push(genre)
        }
    })

    return genres
}

const recommendations = computed(() => getRecommendations())
const userHasHistory = computed(() => ownedNFTs.value.length > 0 || createdNFTs.value.length > 0)

onMounted(() => {
    if (web3Store.contractsInitialized) {
        marketplaceStore.fetchListedItems()
        userStore.refreshUserData()
    }
})
</script>

<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Preporučeno za vas</h2>

        <div v-if="!account">
            <p class="text-gray-600 text-center py-8">
                Povežite se s MetaMask novčanikom da biste vidjeli personalizirane preporuke.
            </p>
        </div>

        <div v-else-if="!userHasHistory" class="text-center py-8">
            <p class="text-gray-600 mb-4">
                Počnite kupovati ili stvarati NFT-ove da biste dobili personalizirane preporuke.
            </p>
            <div class="space-x-4">
                <router-link to="/marketplace" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Istraži Marketplace
                </router-link>
                <router-link to="/upload" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                    Kreiraj NFT
                </router-link>
            </div>
        </div>

        <div v-else-if="recommendations.length === 0" class="text-center py-8">
            <p class="text-gray-600">
                Trenutno nema novih preporuka. Provjerite opet kasnije!
            </p>
        </div>

        <div v-else>
            <p class="text-gray-600 text-sm mb-4">
                Na temelju vaše kolekcije i preferencija:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="nft in recommendations" :key="nft.tokenId" class="relative">
                    <MusicNFTCard :nft="nft" />

                    <!-- Preporuka badge -->
                    <div class="absolute -top-2 -right-2">
                        <div
                            class="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{{ Math.round(nft.score) }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Objašnjenje kako funkcioniraju preporuke -->
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-blue-800 mb-2">Kako funkcioniraju preporuke?</h3>
                <p class="text-blue-700 text-sm">
                    Naše preporuke se temelje na analizi vaše kolekcije, uključujući omiljene umjetnike,
                    cjenovni raspon, royalty preferencije i žanrove glazbe koje običavo kupujete.
                    Postotak pokazuje koliko dobro svaki NFT odgovara vašem profilu.
                </p>
            </div>
        </div>
    </div>
</template>