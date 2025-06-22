<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { ethers } from 'ethers'
import { getIPFSUrl } from '../services/ipfsService'

const web3Store = useWeb3Store()
const marketplaceStore = useMarketplaceStore()

const { isConnected, account, isReady } = storeToRefs(web3Store)

const userNFTs = ref([])
const loading = ref(false)
const error = ref(null)
const listingNFT = ref(null)
const listPrice = ref('') // Keep as string!

const stats = ref({
    totalNFTs: 0,
    totalSales: 0,
    totalPurchases: 0
})

const shortenAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
}

const extractCID = (ipfsUrl) => {
    if (!ipfsUrl) return null
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', '')
    }
    return ipfsUrl
}

async function loadUserNFTs() {
    if (!isReady.value || !account.value) {
        return
    }

    try {
        loading.value = true
        error.value = null

        console.log('Loading user NFTs for:', account.value)

        // Get total supply to iterate through tokens
        const totalSupply = await web3Store.musicNFTContract.totalSupply()
        console.log('Total NFT supply:', totalSupply.toString())

        const ownedNFTs = []

        // Check each token to see if user owns it
        for (let i = 1; i <= totalSupply.toNumber(); i++) {
            try {
                const owner = await web3Store.musicNFTContract.ownerOf(i)

                if (owner.toLowerCase() === account.value.toLowerCase()) {
                    console.log(`User owns token ${i}`)

                    // Get token metadata
                    const tokenURI = await web3Store.musicNFTContract.tokenURI(i)
                    const [creator, royaltyPercentage] = await web3Store.musicNFTContract.getRoyaltyInfo(i)

                    let metadata = {
                        name: 'Unknown',
                        artist: 'Unknown',
                        description: '',
                        image: null,
                        audio: null
                    }

                    if (tokenURI) {
                        try {
                            const cid = extractCID(tokenURI)
                            const metadataURL = getIPFSUrl(cid)

                            const response = await fetch(metadataURL)
                            if (response.ok) {
                                const fetchedMetadata = await response.json()
                                metadata = { ...metadata, ...fetchedMetadata }
                            }
                        } catch (metaError) {
                            console.warn(`Failed to fetch metadata for token ${i}:`, metaError)
                        }
                    }

                    // Check if it's listed on marketplace
                    let isListed = false
                    let listingInfo = null
                    try {
                        const listing = await web3Store.marketplaceContract.getListedItem(i)
                        isListed = listing.isActive
                        listingInfo = listing
                    } catch (e) {
                        // Token not listed
                    }

                    ownedNFTs.push({
                        tokenId: i.toString(),
                        owner,
                        creator,
                        royaltyPercentage: royaltyPercentage.toString(),
                        metadata,
                        isListed,
                        listingInfo
                    })
                }
            } catch (err) {
                console.error(`Error checking token ${i}:`, err)
                // Token might not exist or other error, continue
            }
        }

        userNFTs.value = ownedNFTs
        stats.value.totalNFTs = ownedNFTs.length

        console.log('User NFTs loaded:', ownedNFTs)

    } catch (err) {
        console.error('Error loading user NFTs:', err)
        error.value = `Error loading NFTs: ${err.message}`
    } finally {
        loading.value = false
    }
}

async function listNFT(nft) {
    if (!listPrice.value || parseFloat(listPrice.value) <= 0) {
        alert('Please enter a valid price')
        return
    }

    try {
        console.log('🏪 Listing NFT...', {
            tokenId: nft.tokenId,
            price: listPrice.value,
            priceType: typeof listPrice.value
        })

        // Convert string to wei - this is the fix!
        const priceInWei = ethers.utils.parseEther(listPrice.value.toString())
        console.log('💰 Price in wei:', priceInWei.toString())

        await marketplaceStore.listNFT(nft.tokenId, priceInWei)

        alert(`NFT listed successfully for ${listPrice.value} ETH!`)
        listingNFT.value = null
        listPrice.value = ''

        // Reload NFTs to show updated listing status
        await loadUserNFTs()

        // Also refresh marketplace
        await marketplaceStore.fetchListedItems()

    } catch (err) {
        console.error('Error listing NFT:', err)
        alert(`Error listing NFT: ${err.message}`)
    }
}

function startListing(nft) {
    listingNFT.value = nft
    listPrice.value = '' // Reset to empty string
}

function cancelListing() {
    listingNFT.value = null
    listPrice.value = ''
}

onMounted(() => {
    if (isConnected.value && isReady.value) {
        loadUserNFTs()
    }
})

// Watch for connection changes
computed(() => {
    if (isConnected.value && isReady.value && userNFTs.value.length === 0 && !loading.value) {
        loadUserNFTs()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold text-center mb-8">My Profile</h1>

            <!-- Not Connected -->
            <div v-if="!isConnected" class="text-center py-12">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                    <h2 class="text-xl font-semibold mb-4">Connect Your Wallet</h2>
                    <p class="text-gray-600 mb-6">Please connect your MetaMask wallet to view your profile and NFTs</p>
                    <button @click="web3Store.connectWallet"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                        Connect MetaMask
                    </button>
                </div>
            </div>

            <!-- Connected -->
            <div v-else>
                <!-- Account Info -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 class="text-xl font-semibold mb-4">Wallet Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p class="text-gray-600 text-sm">Address</p>
                            <p class="font-mono text-sm">{{ shortenAddress(account) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Owned NFTs</p>
                            <p class="text-xl font-bold text-blue-600">{{ stats.totalNFTs }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Status</p>
                            <p class="text-green-600 font-semibold">Connected</p>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p class="text-red-800 text-sm">{{ error }}</p>
                    <button @click="loadUserNFTs"
                        class="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                        Retry
                    </button>
                </div>

                <!-- My NFTs Section -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">My NFTs</h2>
                        <button @click="loadUserNFTs" :disabled="loading"
                            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
                            {{ loading ? 'Loading...' : 'Refresh' }}
                        </button>
                    </div>

                    <!-- Loading -->
                    <div v-if="loading" class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="mt-2 text-gray-600">Loading your NFTs...</p>
                    </div>

                    <!-- No NFTs -->
                    <div v-else-if="userNFTs.length === 0" class="text-center py-8">
                        <h3 class="text-lg font-semibold text-gray-600 mb-2">No NFTs Found</h3>
                        <p class="text-gray-500 mb-4">You don't own any music NFTs yet</p>
                        <router-link to="/upload"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block">
                            Create Your First NFT
                        </router-link>
                    </div>

                    <!-- NFTs Grid -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="nft in userNFTs" :key="nft.tokenId" class="border border-gray-200 rounded-lg p-4">
                            <!-- Image -->
                            <div class="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                                <img v-if="nft.metadata.image" :src="getIPFSUrl(extractCID(nft.metadata.image))"
                                    :alt="nft.metadata.name" class="w-full h-full object-cover"
                                    @error="$event.target.src = 'https://via.placeholder.com/400x400/6366f1/white?text=Music+NFT'">
                                <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            </div>

                            <!-- Info -->
                            <h3 class="font-semibold text-lg mb-1">{{ nft.metadata.name }}</h3>
                            <p class="text-gray-600 text-sm mb-2">{{ nft.metadata.artist }}</p>
                            <p class="text-xs text-gray-500 mb-3">Token ID: {{ nft.tokenId }}</p>

                            <!-- Audio Preview -->
                            <div v-if="nft.metadata.audio" class="mb-4">
                                <audio controls class="w-full">
                                    <source :src="getIPFSUrl(extractCID(nft.metadata.audio))" type="audio/mpeg">
                                </audio>
                            </div>

                            <!-- Status -->
                            <div class="mb-4">
                                <span v-if="nft.isListed" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    Listed for {{ ethers.utils.formatEther(nft.listingInfo.price) }} ETH
                                </span>
                                <span v-else class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                    Not Listed
                                </span>
                            </div>

                            <!-- Actions -->
                            <div v-if="!nft.isListed">
                                <button @click="startListing(nft)"
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">
                                    List for Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Listing Modal -->
                <div v-if="listingNFT"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 class="text-lg font-semibold mb-4">List NFT for Sale</h3>

                        <div class="mb-4">
                            <p class="text-sm text-gray-600 mb-2">NFT: {{ listingNFT.metadata.name }}</p>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Price (ETH)
                            </label>
                            <input v-model="listPrice" type="text" step="0.001" placeholder="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <p class="text-xs text-gray-500 mt-1">Enter price as decimal (e.g., 0.1)</p>
                        </div>

                        <div class="flex space-x-3">
                            <button @click="listNFT(listingNFT)" :disabled="!listPrice"
                                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50">
                                List NFT
                            </button>
                            <button @click="cancelListing"
                                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                                Cancel
                            </button>
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