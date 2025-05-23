<script setup>
import { storeToRefs } from 'pinia'
import { useUploadStore } from '../store/uploadStore'
import { useWeb3Store } from '../store/web3Store'
import { toast } from '../services/notificationService'
import LoadingButton from '../components/ui/LoadingButton.vue'

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
    toast.success('Audio datoteka uspješno učitana')
  } else {
    toast.error('Molimo odaberite valjanu audio datoteku')
  }
}


function handleCoverImageChange(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadStore.setCoverImage(file)
    toast.success('Cover slika uspješno učitana')
  } else {
    toast.error('Molimo odaberite valjanu sliku')
  }
}


function resetForm() {
  uploadStore.resetForm()

  const fileInputs = document.querySelectorAll('input[type="file"]')
  fileInputs.forEach(input => {
    input.value = ''
  })
  toast.info('Forma je resetirana')
}


async function handleSubmit() {
  if (!title.value || !artist.value || !coverImageUrl.value || !audioFileUrl.value) {
    toast.error('Molimo popunite sva obavezna polja')
    return
  }
  
  try {
    await uploadStore.uploadAndMint()
  } catch (error) {

  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8 animate-fade-in">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kreiraj svoj glazbeni NFT
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">
            Tokenizacija tvoje glazbe u samo nekoliko koraka
          </p>
        </div>
        
        <!-- Connection Warning -->
        <div v-if="!isConnected" class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg animate-slide-up">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-medium text-yellow-800 dark:text-yellow-200">Potrebna konekcija</p>
              <p class="text-yellow-700 dark:text-yellow-300 text-sm">Molimo povežite se s MetaMask novčanikom za kreiranje NFT-a</p>
            </div>
          </div>
          <div class="mt-3">
            <LoadingButton 
              @click="web3Store.connectWallet"
              variant="primary"
              size="sm"
            >
              Poveži novčanik
            </LoadingButton>
          </div>
        </div>
        
        <!-- Main Form -->
        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-slide-up">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Osnovni podaci -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300" for="title">
                  Naslov pjesme *
                </label>
                <input 
                  id="title"
                  v-model="title"
                  type="text" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Unesite naslov..."
                  required
                >
              </div>
              
              <div class="space-y-1">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300" for="artist">
                  Izvođač *
                </label>
                <input 
                  id="artist"
                  v-model="artist"
                  type="text" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Vaše ime ili naziv benda..."
                  required
                >
              </div>
            </div>
            
            <!-- Opis -->
            <div class="space-y-1">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300" for="description">
                Opis
              </label>
              <textarea 
                id="description"
                v-model="description"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                rows="4"
                placeholder="Opišite svoju glazbu, žanr, inspiraciju..."
              ></textarea>
            </div>
            
            <!-- Royalty slider -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Royalty postotak: {{ royaltyPercentage }}%
              </label>
              <input 
                v-model="royaltyPercentage"
                type="range" 
                min="0" 
                max="10" 
                step="0.5"
                class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              >
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                Postotak koji ćete primiti pri svakoj preprodaji vašeg NFT-a
              </p>
            </div>
            
            <!-- File uploads -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Audio upload -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Audio datoteka *
                </label>
                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input 
                    type="file" 
                    accept="audio/*"
                    @change="handleAudioFileChange"
                    class="hidden"
                    id="audio-upload"
                  >
                  <label for="audio-upload" class="cursor-pointer">
                    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="mt-2">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        <span class="font-semibold text-blue-600 dark:text-blue-400">Kliknite za upload</span>
                        audio datoteke
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">MP3, WAV, OGG do 50MB</p>
                    </div>
                  </label>
                </div>
                
                <!-- Audio preview -->
                <div v-if="audioFileUrl" class="mt-3">
                  <audio controls class="w-full" :src="audioFileUrl"></audio>
                </div>
              </div>
              
              <!-- Cover image upload -->
              <div class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cover slika *
                </label>
                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleCoverImageChange"
                    class="hidden"
                    id="image-upload"
                  >
                  <label for="image-upload" class="cursor-pointer">
                    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="mt-2">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        <span class="font-semibold text-blue-600 dark:text-blue-400">Kliknite za upload</span>
                        cover slike
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">JPG, PNG do 10MB</p>
                    </div>
                  </label>
                </div>
                
                <!-- Image preview -->
                <div v-if="coverImageUrl" class="mt-3">
                  <img :src="coverImageUrl" class="w-full h-32 object-cover rounded-lg" alt="Cover preview">
                </div>
              </div>
            </div>
            
            <!-- Progress bar -->
            <div v-if="isUploading" class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Upload progress</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: `${uploadProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                Molimo ne zatvarajte stranicu tijekom uploada...
              </p>
            </div>
            
            <!-- Action buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
              <LoadingButton
                @click="resetForm"
                variant="secondary"
                size="lg"
                class="flex-1"
                :disabled="isUploading"
              >
                Resetiraj formu
              </LoadingButton>
              
              <LoadingButton
                type="submit"
                variant="primary"
                size="lg"
                class="flex-1"
                :loading="isUploading"
                :disabled="!isConnected || !title || !artist || !coverImageUrl || !audioFileUrl"
              >
                {{ isUploading ? 'Kreiranje NFT-a...' : 'Kreiraj NFT' }}
              </LoadingButton>
            </div>
          </form>
        </div>
        
        <!-- Info section -->
        <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 animate-fade-in">
            <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Savjeti za uspješan NFT</h3>
         <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
           <li class="flex items-start">
             <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
             </svg>
             <span>Koristite visokokvalitetan audio (320kbps MP3 ili WAV)</span>
           </li>
           <li class="flex items-start">
             <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
             </svg>
             <span>Cover slika trebala bi biti kvadratna (1:1 omjer), minimalno 500x500px</span>
           </li>
           <li class="flex items-start">
             <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
             </svg>
             <span>Dodajte detaljan opis koji uključuje žanr i inspiraciju</span>
           </li>
           <li class="flex items-start">
             <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
             </svg>
             <span>Royalty između 5-10% je uobičajeno za glazbene NFT-ove</span>
           </li>
         </ul>
       </div>
     </div>
   </div>
 </div>
</template>

<style scoped>
/* Custom slider styles */
.slider::-webkit-slider-thumb {
 appearance: none;
 height: 20px;
 width: 20px;
 border-radius: 50%;
 background: linear-gradient(45deg, #3b82f6, #8b5cf6);
 cursor: pointer;
 box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
 height: 20px;
 width: 20px;
 border-radius: 50%;
 background: linear-gradient(45deg, #3b82f6, #8b5cf6);
 cursor: pointer;
 border: none;
 box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>