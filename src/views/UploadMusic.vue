<script setup>
import { storeToRefs } from 'pinia'
import { useUploadStore } from '../store/uploadStore'
import { useWeb3Store } from '../store/web3Store'

const uploadStore = useUploadStore()
const web3Store = useWeb3Store()

const {
  isUploading,
  uploadProgress,
  error,
  successMessage,
  title,
  artist,
  description,
  royaltyPercentage,
  coverImageUrl,
  audioFileUrl
} = storeToRefs(uploadStore)

const { isConnected } = storeToRefs(web3Store)

function handleAudioFileChange(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('audio/')) {
    uploadStore.setAudioFile(file)
  } else {
    alert('Molimo odaberite valjanu audio datoteku')
  }
}

function handleCoverImageChange(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadStore.setCoverImage(file)
  } else {
    alert('Molimo odaberite valjanu sliku')
  }
}

async function handleSubmit() {
  if (!title.value || !artist.value || !coverImageUrl.value || !audioFileUrl.value) {
    alert('Molimo popunite sva obavezna polja')
    return
  }

  try {
    await uploadStore.uploadAndMint()
    if (successMessage.value) {
      alert('NFT uspješno kreiran!')
    }
  } catch (error) {
    alert('Greška pri kreiranju NFT-a')
  }
}
</script>

<template>
  <div class="container py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Kreiraj Glazbeni NFT</h1>

    <!-- Connection Warning -->
    <div v-if="!isConnected" class="bg-yellow-50 border border-yellow-400 p-4 mb-6 rounded">
      <p class="text-yellow-800">Molimo povežite se s MetaMask novčanikom za kreiranje NFT-a</p>
      <button @click="web3Store.connectWallet" class="bg-blue-600 hover:bg-blue-700 text-white mt-2">
        Poveži novčanik
      </button>
    </div>

    <!-- Main Form -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Osnovni podaci -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1">Naslov pjesme *</label>
            <input v-model="title" type="text" placeholder="Unesite naslov..." required>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Izvođač *</label>
            <input v-model="artist" type="text" placeholder="Vaše ime ili naziv benda..." required>
          </div>
        </div>

        <!-- Opis -->
        <div>
          <label class="block text-sm font-semibold mb-1">Opis</label>
          <textarea v-model="description" rows="4" placeholder="Opišite svoju glazbu..."></textarea>
        </div>

        <!-- Royalty slider -->
        <div>
          <label class="block text-sm font-semibold mb-1">
            Royalty postotak: {{ royaltyPercentage }}%
          </label>
          <input v-model="royaltyPercentage" type="range" min="0" max="10" step="0.5" class="w-full">
          <p class="text-xs text-gray-600 mt-1">
            Postotak koji ćete primiti pri svakoj preprodaji vašeg NFT-a
          </p>
        </div>

        <!-- File uploads -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Audio upload -->
          <div>
            <label class="block text-sm font-semibold mb-1">Audio datoteka *</label>
            <input type="file" accept="audio/*" @change="handleAudioFileChange" required>
            <div v-if="audioFileUrl" class="mt-3">
              <audio controls class="w-full" :src="audioFileUrl"></audio>
            </div>
          </div>

          <!-- Cover image upload -->
          <div>
            <label class="block text-sm font-semibold mb-1">Cover slika *</label>
            <input type="file" accept="image/*" @change="handleCoverImageChange" required>
            <div v-if="coverImageUrl" class="mt-3">
              <img :src="coverImageUrl" class="w-full h-32 object-cover rounded" alt="Cover preview">
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="isUploading" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Upload progress</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>

        <!-- Error/Success messages -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {{ error }}
        </div>

        <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
          {{ successMessage }}
        </div>

        <!-- Action buttons -->
        <div class="flex gap-4">
          <button type="button" @click="uploadStore.resetForm"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded" :disabled="isUploading">
            Resetiraj
          </button>

          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            :disabled="!isConnected || !title || !artist || !coverImageUrl || !audioFileUrl || isUploading">
            {{ isUploading ? 'Kreiranje...' : 'Kreiraj NFT' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>