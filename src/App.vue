<script setup>
import { onMounted } from 'vue'
import { useWeb3Store } from './store/web3Store'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'

const web3Store = useWeb3Store()

onMounted(() => {
  // Provjeri je li korisnik već povezan s MetaMask-om
  if (window.ethereum && window.ethereum.isConnected()) {
    web3Store.connectWallet()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header />

    <main class="flex-grow">
      <router-view />
    </main>

    <Footer />
  </div>
</template>