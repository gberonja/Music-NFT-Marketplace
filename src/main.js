import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css' 
import App from './App.vue'

// Buffer polyfill za ethers.js
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')