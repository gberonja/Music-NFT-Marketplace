<script setup>
import { onMounted } from 'vue'
import { useWeb3Store } from './store/web3Store'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const web3Store = useWeb3Store()

onMounted(() => {
  // Auto-connect ako je MetaMask već povezan
  if (window.ethereum && window.ethereum.isConnected()) {
    web3Store.connectWallet()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>