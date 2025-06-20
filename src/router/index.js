import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Marketplace from '../views/Marketplace.vue'
import UploadMusic from '../views/UploadMusic.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: Marketplace
  },
  {
    path: '/upload',
    name: 'UploadMusic',
    component: UploadMusic
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router