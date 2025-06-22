<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeb3Store } from '../store/web3Store'
import { useUploadStore } from '../store/uploadStore'

const web3Store = useWeb3Store()
const uploadStore = useUploadStore()

const { isConnected, account, isReady } = storeToRefs(web3Store)
const {
  isUploading,
  uploadProgress,
  error,
  successMessage,
  title,
  artist,
  description,
  genre,
  genres,
  royaltyPercentage,
  price,
  coverImageUrl,
  audioFileUrl
} = storeToRefs(uploadStore)

const coverImageInput = ref(null)
const audioFileInput = ref(null)

const canSubmit = computed(() => {
  return isReady.value &&
    title.value &&
    artist.value &&
    coverImageInput.value?.files[0] &&
    audioFileInput.value?.files[0] &&
    !isUploading.value
})

function handleCoverImageChange(event) {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image file must be smaller than 10MB')
      return
    }
    uploadStore.setCoverImage(file)
  }
}

function handleAudioFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file')
      return
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Audio file must be smaller than 50MB')
      return
    }
    uploadStore.setAudioFile(file)
  }
}

function clearError() {
  uploadStore.error = null
}

function clearSuccess() {
  uploadStore.successMessage = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8">Create Music NFT</h1>

      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">

        <!-- Connection Warning -->
        <div v-if="!isConnected" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p class="text-yellow-800 text-sm">
            <strong>Note:</strong> Please connect your MetaMask wallet to create NFTs
          </p>
        </div>

        <!-- Contract Loading Warning -->
        <div v-else-if="!isReady" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-blue-800 text-sm">
            <strong>Loading contracts...</strong> Please wait for contracts to initialize
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-start">
            <p class="text-red-800 text-sm">
              <strong>Error:</strong> {{ error }}
            </p>
            <button @click="clearError" class="text-red-600 hover:text-red-800 text-sm">×</button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-start">
            <p class="text-green-800 text-sm">
              <strong>Success:</strong> {{ successMessage }}
            </p>
            <button @click="clearSuccess" class="text-green-600 hover:text-green-800 text-sm">×</button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="`width: ${uploadProgress}%`">
            </div>
          </div>
        </div>

        <form @submit.prevent="uploadStore.uploadAndMint" class="space-y-6">

          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Song Title *
              </label>
              <input v-model="title" type="text" placeholder="e.g. Summer Vibes" required :disabled="isUploading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Artist *
              </label>
              <input v-model="artist" type="text" placeholder="Your name or band name" required :disabled="isUploading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea v-model="description" placeholder="Tell us about your music..." rows="3" :disabled="isUploading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
            </textarea>
          </div>

          <!-- Genre & Price -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select v-model="genre" :disabled="isUploading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Price (ETH) - Optional
              </label>
              <input v-model="price" type="number" step="0.001" min="0" placeholder="0.1" :disabled="isUploading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              <p class="text-xs text-gray-500 mt-1">Leave empty to not list immediately</p>
            </div>
          </div>

          <!-- Royalty -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Royalty Percentage: {{ royaltyPercentage }}%
            </label>
            <input v-model="royaltyPercentage" type="range" min="0" max="10" step="0.5" :disabled="isUploading"
              class="w-full disabled:opacity-50">
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
          </div>

          <!-- Cover Image -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cover Image *
            </label>
            <input ref="coverImageInput" type="file" accept="image/*" @change="handleCoverImageChange"
              :disabled="isUploading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">

            <div v-if="coverImageUrl" class="mt-3">
              <img :src="coverImageUrl" alt="Cover preview" class="w-32 h-32 object-cover rounded-lg">
            </div>
          </div>

          <!-- Audio File -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <input ref="audioFileInput" type="file" accept="audio/*" @change="handleAudioFileChange"
              :disabled="isUploading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50">

            <div v-if="audioFileUrl" class="mt-3">
              <audio controls class="w-full">
                <source :src="audioFileUrl" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="!canSubmit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="isUploading">Creating NFT...</span>
            <span v-else>Create Music NFT</span>
          </button>

        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>