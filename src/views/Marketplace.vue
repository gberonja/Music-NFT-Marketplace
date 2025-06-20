<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { ethers } from 'ethers'

const web3Store = useWeb3Store()
const { isConnected, marketplaceContract, musicNFTContract } = storeToRefs(web3Store)

const nfts = ref([])
const loading = ref(false)
const searchTerm = ref('')

const demoNFTs = [
    {
        tokenId: '1',
        name: 'Summer Vibes',
        artist: 'DJ Croatia',
        price: '0.1',
        image: 'https://via.placeholder.com/300x300/4F46E5/white?text=Music'
    },
    {
        tokenId: '2',
        name: 'Zagreb Nights',
        artist: 'Urban Poet',
        price: '0.05',
        image: 'https://via.placeholder.com/300x300/7C3AED/white?text=Music'
    },
    {
        tokenId: '3',
        name: 'Adriatic Dreams',
        artist: 'Coastal Sound',
        price: '0.2',
        image: 'https://via.placeholder.com/300x300/059669/white?text=Music'
    }
]

async function loadNFTs() {
    loading.value = true
    try {
        if (marketplaceContract.value) {
            const items = await marketplaceContract.value.getAllListedItems()
            console.log('Loaded NFTs:', items)

            if (items.length === 0) {
                nfts.value = demoNFTs
            }
        } else {
            nfts.value = demoNFTs
        }
    } catch (error) {
        console.error('Error loading NFTs:', error)
        nfts.value = demoNFTs
    } finally {
        loading.value = false
    }
}

async function buyNFT(nft) {
    if (!isConnected.value) {
        alert('Connect MetaMask wallet!')
        return
    }

    try {
        const price = ethers.utils.parseEther(nft.price)
        const transaction = await marketplaceContract.value.buyItem(nft.tokenId, {
            value: price
        })

        await transaction.wait()
        alert(`Successfully purchased: ${nft.name}!`)
        loadNFTs()
    } catch (error) {
        console.error('Purchase error:', error)
        alert('Error purchasing NFT')
    }
}

const filteredNFTs = computed(() => {
    if (!searchTerm.value) return nfts.value

    return nfts.value.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        nft.artist.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
})

onMounted(() => {
    loadNFTs()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold text-center mb-8">Music NFT Marketplace</h1>

            <div class="max-w-md mx-auto mb-8">
                <input v-model="searchTerm" type="text" placeholder="Search music or artist..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>

            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-gray-600">Loading NFTs...</p>
            </div>

            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="nft in filteredNFTs" :key="nft.tokenId"
                    class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <img :src="nft.image" :alt="nft.name" class="w-full h-48 object-cover">

                    <div class="p-4">
                        <h3 class="text-lg font-semibold mb-1">{{ nft.name }}</h3>
                        <p class="text-gray-600 mb-3">{{ nft.artist }}</p>

                        <div class="flex justify-between items-center">
                            <span class="text-xl font-bold text-blue-600">{{ nft.price }} ETH</span>
                            <button @click="buyNFT(nft)" :disabled="!isConnected"
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Buy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!loading && filteredNFTs.length === 0" class="text-center py-12">
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
                <p class="text-gray-500">Try a different search term</p>
            </div>

            <div v-if="!isConnected" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                <div class="flex">
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            <strong>Note:</strong> Connect MetaMask wallet to purchase NFTs.
                        </p>
                    </div>
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