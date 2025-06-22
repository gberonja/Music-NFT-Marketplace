<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'

const web3Store = useWeb3Store()
const route = useRoute()
const { isConnected, account, error } = storeToRefs(web3Store)

const shortenAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
}

const isActivePage = (path) => {
    return route.path === path
}

async function handleConnect() {
    try {
        await web3Store.connectWallet()
    } catch (err) {
        console.error('Connection failed:', err)
        alert(`Connection failed: ${err.message}`)
    }
}
</script>

<template>
    <header class="bg-gray-800 text-white shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <!-- Logo and Navigation -->
                <div class="flex items-center space-x-8">
                    <router-link to="/" class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-lg">♪</span>
                        </div>
                        <h1 class="text-xl font-bold">MusicNFT</h1>
                    </router-link>

                    <nav class="hidden md:flex space-x-6">
                        <router-link to="/" :class="[
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            isActivePage('/')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        ]">
                            Home
                        </router-link>
                        <router-link to="/marketplace" :class="[
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            isActivePage('/marketplace')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        ]">
                            Marketplace
                        </router-link>
                        <router-link to="/upload" :class="[
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            isActivePage('/upload')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        ]">
                            Create
                        </router-link>
                        <router-link v-if="isConnected" to="/profile" :class="[
                            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            isActivePage('/profile')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        ]">
                            Profile
                        </router-link>
                    </nav>
                </div>

                <!-- Wallet Connection -->
                <div class="flex items-center space-x-4">
                    <!-- Connection Status -->
                    <div v-if="error" class="hidden md:block">
                        <span class="text-red-400 text-xs">Connection Error</span>
                    </div>

                    <!-- Wallet Button -->
                    <div v-if="!isConnected">
                        <button @click="handleConnect"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Connect Wallet
                        </button>
                    </div>

                    <div v-else class="flex items-center space-x-3">
                        <!-- Account Info -->
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span class="text-green-400 font-mono text-sm">
                                {{ shortenAddress(account) }}
                            </span>
                        </div>

                        <!-- Disconnect Button -->
                        <button @click="web3Store.disconnectWallet"
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile Navigation -->
            <nav class="md:hidden border-t border-gray-700 pt-4 pb-2">
                <div class="flex flex-wrap gap-2">
                    <router-link to="/" :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActivePage('/')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    ]">
                        Home
                    </router-link>
                    <router-link to="/marketplace" :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActivePage('/marketplace')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    ]">
                        Marketplace
                    </router-link>
                    <router-link to="/upload" :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActivePage('/upload')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    ]">
                        Create
                    </router-link>
                    <router-link v-if="isConnected" to="/profile" :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActivePage('/profile')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    ]">
                        Profile
                    </router-link>
                </div>
            </nav>
        </div>
    </header>
</template>

<style scoped>
.container {
    max-width: 1200px;
}
</style>