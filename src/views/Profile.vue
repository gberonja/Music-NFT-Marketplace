<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'

const web3Store = useWeb3Store()
const { isConnected, account } = storeToRefs(web3Store)

const userNFTs = ref([])
const loading = ref(false)


async function fetchUserNFTs() {
    if (!isConnected.value || !web3Store.musicNFTContract) return

    loading.value = true
    try {
        userNFTs.value = []
    } catch (error) {
        console.error('Greška pri dohvaćanju NFT-ova:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchUserNFTs()
})
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Moj Profil</h1>

        <div v-if="!isConnected" class="text-center py-12">
            <p class="text-gray-600 mb-4">Povežite se s novčanikom da biste vidjeli svoj profil.</p>
            <button @click="web3Store.connectWallet"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
                Poveži Novčanik
            </button>
        </div>

        <div v-else>
            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 class="text-xl font-semibold mb-4">Informacije o računu</h2>
                <p><strong>Adresa:</strong> {{ account }}</p>
                <p><strong>Mreža:</strong> Localhost (Test)</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Moji NFT-ovi</h2>

                <div v-if="loading" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Učitavanje...</p>
                </div>

                <div v-else-if="userNFTs.length === 0" class="text-center py-8">
                    <p class="text-gray-600 mb-4">Nemate kreiran nijedan NFT.</p>
                    <router-link to="/upload" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        Kreiraj prvi NFT
                    </router-link>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                </div>
            </div>
        </div>
    </div>
</template>