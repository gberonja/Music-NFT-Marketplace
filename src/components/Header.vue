<script setup>
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'

const web3Store = useWeb3Store()
const { isConnected, account } = storeToRefs(web3Store)

const shortenAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
}
</script>

<template>
    <header class="bg-gray-800 text-white p-4">
        <div class="container flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <h1 class="text-xl font-bold">MusicNFT</h1>
                <nav class="flex space-x-4">
                    <router-link to="/" class="hover:text-blue-400">Početna</router-link>
                    <router-link to="/marketplace" class="hover:text-blue-400">Marketplace</router-link>
                    <router-link to="/upload" class="hover:text-blue-400">Upload</router-link>
                    <router-link v-if="isConnected" to="/profile" class="hover:text-blue-400">Profil</router-link>
                </nav>
            </div>

            <div>
                <button v-if="!isConnected" @click="web3Store.connectWallet"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Poveži Novčanik
                </button>
                <div v-else class="flex items-center space-x-2">
                    <span class="text-green-400">{{ shortenAddress(account) }}</span>
                    <button @click="web3Store.disconnectWallet"
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                        Odspoji
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>