import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'


import { ThemeService } from './services/themeService'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)


ThemeService.init()

app.mount('#app')