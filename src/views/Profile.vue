<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'

const web3Store = useWeb3Store()
const { isConnected, account } = storeToRefs(web3Store)

const userNFTs = ref([])
const loading = ref(false)

const demoUserNFTs = [
    {
        tokenId: '1',
        name: 'My First Song',
        artist: 'Me',
        image: 'https://via.placeholder.com/300x300/4F46E5/white?text=My+NFT'
    }
]

async function loadUserNFTs() {
    loading.value = true
    try {
        userNFTs.value = demoUserNFTs
    } catch (error) {
        console.error('Error loading user NFTs:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (isConnected.value) {
        loadUserNFTs()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold text-center mb-8">My Profile</h1>

            <div v-if="!isConnected" class="text-center py-12">
                <p class="text-gray-600">Please connect your wallet to view your profile</p>
            </div>

            <div v-else>
                <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 class="text-xl font-semibold mb-4">Wallet Information</h2>
                    <p class="text-gray-600">Address: {{ account }}</p>
                </div>

                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-4">My NFTs</h2>

                    <div v-if="loading" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Loading NFTs...</p>
                    </div>

                    <div v-else-if="userNFTs.length === 0" class="text-center py-8">
                        <p class="text-gray-600">No NFTs found</p>
                    </div>

                    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="nft in userNFTs" :key="nft.tokenId" class="bg-gray-50 rounded-lg p-4">
                            <img :src="nft.image" :alt="nft.name" class="w-full h-32 object-cover rounded mb-2">
                            <h3 class="font-semibold">{{ nft.name }}</h3>
                            <p class="text-gray-600 text-sm">{{ nft.artist }}</p>
                        </div>
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