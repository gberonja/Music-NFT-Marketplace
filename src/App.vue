<script setup>
import { onMounted } from 'vue'
import { useWeb3Store } from './store/web3Store'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ToastNotifications from './components/ui/ToastNotifications.vue'

const web3Store = useWeb3Store()

onMounted(() => {
  if (window.ethereum && window.ethereum.isConnected()) {
    web3Store.connectWallet()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <Footer />
    <ToastNotifications />
  </div>
</template>


<style>
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


html {
  scroll-behavior: smooth;
}
</style>