<script setup>
import { onMounted } from 'vue'
import { useWeb3Store } from './store/web3Store'
import { ThemeService } from './services/themeService'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import ToastNotifications from './components/ui/ToastNotifications.vue'

const web3Store = useWeb3Store()

onMounted(() => {
  ThemeService.init()


  if (window.ethereum && window.ethereum.isConnected()) {
    web3Store.connectWallet()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Header />

    <main class="flex-grow pb-20">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <Footer />
    <AudioPlayer />
    <ToastNotifications />
  </div>
</template>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}


::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}


.dark audio::-webkit-media-controls-panel {
  background-color: #374151;
}
</style>