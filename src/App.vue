<script setup>
import { onMounted } from 'vue'
import { useWeb3Store } from './store/web3Store'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import AudioPlayer from './components/AudioPlayer.vue'

const web3Store = useWeb3Store()

onMounted(() => {
  if (window.ethereum && window.ethereum.isConnected()) {
    web3Store.connectWallet()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header />
    
    <main class="flex-grow pb-20">
      <router-view />
    </main>
    
    <Footer />
    
 
    <AudioPlayer />
  </div>
</template>