<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useWeb3Store } from '../store/web3Store'
import MusicNFTCard from '../components/MusicNFTCard.vue'
import { audioPlayer } from '../services/audioPlayerService'
import { getIPFSUrl } from '../services/ipfsService'
import { ethers } from 'ethers'

const marketplaceStore = useMarketplaceStore()
const web3Store = useWeb3Store()

const { listedItems } = storeToRefs(marketplaceStore)


const popularNFTs = computed(() => {
    return listedItems.value
        .filter(nft => nft.metadata?.audio)
        .slice(0, 6)
})


const featuredPlaylist = computed(() => {
    return popularNFTs.value.map(nft => ({
        tokenId: nft.tokenId,
        title: nft.metadata?.name || 'Untitled',
        artist: nft.metadata?.artist || 'Unknown Artist',
        audioUrl: getIPFSUrl(nft.metadata?.audio?.replace('ipfs://', '')),
        imageUrl: getIPFSUrl(nft.metadata?.image?.replace('ipfs://', ''))
    }))
})

onMounted(async () => {
    if (web3Store.contractsInitialized) {
        await marketplaceStore.fetchListedItems()
    }
})


function playFeaturedPlaylist() {
    if (featuredPlaylist.value.length > 0) {
        audioPlayer.setPlaylist(featuredPlaylist.value)
        audioPlayer.playFromPlaylist(0)
    }
}


const marketStats = computed(() => {
    const totalNFTs = listedItems.value.length
    const totalValue = listedItems.value.reduce((sum, nft) => {
        if (nft.price && ethers.BigNumber.from(nft.price).gt(0)) {
            return sum + parseFloat(ethers.utils.formatEther(nft.price))
        }
        return sum
    }, 0)

    return {
        totalNFTs,
        totalValue: totalValue.toFixed(2),
        averagePrice: totalNFTs > 0 ? (totalValue / totalNFTs).toFixed(3) : 0
    }
})
</script>

<template>
    <div>
        <!-- Hero sekcija -->
        <div class="relative bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            <div class="absolute inset-0 bg-black opacity-50"></div>
            <div class="relative container mx-auto px-4 py-24 text-white">
                <div class="max-w-3xl mx-auto text-center">
                    <h1 class="text-5xl md:text-6xl font-bold mb-6">
                        Glazba kao NFT
                    </h1>
                    <p class="text-xl mb-8 text-blue-100">
                        Otkrijte, kupite i prodajte jedinstvene glazbene NFT-ove.
                        Podrži svoje omiljene umjetnike direktno na blockchainu.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <router-link to="/marketplace"
                            class="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                            Istraži Marketplace
                        </router-link>
                        <router-link to="/upload"
                            class="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                            Kreiraj NFT
                        </router-link>
                        <button v-if="featuredPlaylist.length > 0" @click="playFeaturedPlaylist"
                            class="bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Slušaj Featured Playlist</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistike tržišta -->
        <div class="bg-white py-16">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <h3 class="text-3xl font-bold text-gray-800">{{ marketStats.totalNFTs }}</h3>
                        <p class="text-gray-600">NFT-ova na prodaju</p>
                    </div>
                    <div>
                        <h3 class="text-3xl font-bold text-gray-800">{{ marketStats.totalValue }} ETH</h3>
                        <p class="text-gray-600">Ukupna vrijednost tržišta</p>
                    </div>
                    <div>
                        <h3 class="text-3xl font-bold text-gray-800">{{ marketStats.averagePrice }} ETH</h3>
                        <p class="text-gray-600">Prosječna cijena</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Popularni NFT-ovi -->
        <div class="bg-gray-50 py-16">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Popularni glazbeni NFT-ovi</h2>

                <div v-if="popularNFTs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <MusicNFTCard v-for="nft in popularNFTs" :key="nft.tokenId" :nft="nft" />
                </div>

                <div v-else-if="!web3Store.contractsInitialized" class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Učitavanje popularnih NFT-ova...</p>
                </div>

                <div v-else class="text-center py-12">
                    <p class="text-gray-600 mb-4">Trenutno nema dostupnih NFT-ova.</p>
                    <router-link to="/upload" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
                        Budi prvi koji će kreirati glazbeni NFT!
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Kako funkcionira -->
        <div class="bg-white py-16">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Kako funkcionira</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">1. Kreiraj NFT</h3>
                        <p class="text-gray-600">Upload svoju glazbu, dodaj metapodatke i postavi royalty postotak</p>
                    </div>

                    <div class="text-center">
                        <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">2. Listaj na Marketplace</h3>
                        <p class="text-gray-600">Postavi cijenu i stavi svoj NFT na marketplace za prodaju</p>
                    </div>

                    <div class="text-center">
                        <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">3. Zaradi s Royalty</h3>
                        <p class="text-gray-600">Primaj automatski royalty pri svakoj preprodaji svog NFT-a</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>