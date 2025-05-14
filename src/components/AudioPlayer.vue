<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { audioPlayer } from '../services/audioPlayerService'

const audioState = audioPlayer.state
const showPlaylist = ref(false)
const progressContainer = ref(null)

// Computed svojstva
const progressPercentage = computed(() => {
  if (audioState.duration === 0) return 0
  return (audioState.currentTime / audioState.duration) * 100
})

const volumePercentage = computed(() => {
  return audioState.volume * 100
})

// Watchers
watch(() => audioState.currentTrack, () => {
  if (audioState.currentTrack) {
    nextTick(() => {
      showPlaylist.value = true
    })
  }
})

// Metode
function handleProgressClick(event) {
  if (!progressContainer.value || audioState.duration === 0) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * audioState.duration
  
  audioPlayer.setCurrentTime(newTime)
}

function handleVolumeChange(event) {
  const volume = event.target.value / 100
  audioPlayer.setVolume(volume)
}

function togglePlaylist() {
  showPlaylist.value = !showPlaylist.value
}
</script>

<template>
  <div v-if="audioState.currentTrack" class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
    <!-- Mini player -->
    <div class="px-4 py-3 flex items-center justify-between">
      <!-- Track info -->
      <div class="flex items-center space-x-4 min-w-0 flex-1">
        <img 
          :src="audioState.currentTrack.imageUrl || '/default-cover.jpg'" 
          alt="Album cover" 
          class="w-12 h-12 rounded-md object-cover"
        >
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold truncate">{{ audioState.currentTrack.title }}</h3>
          <p class="text-xs text-gray-600 truncate">{{ audioState.currentTrack.artist }}</p>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="flex items-center space-x-3">
        <button 
          @click="audioPlayer.playPrevious"
          class="p-2 text-gray-600 hover:text-gray-900"
          :disabled="audioState.playlist.length === 0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>
        
        <button 
          @click="audioPlayer.togglePlay"
          class="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          :disabled="audioState.isLoading"
        >
          <svg v-if="audioState.isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else-if="!audioState.isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button 
          @click="audioPlayer.playNext"
          class="p-2 text-gray-600 hover:text-gray-900"
          :disabled="audioState.playlist.length === 0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
        </button>
        
        <button 
          @click="togglePlaylist"
          class="p-2 text-gray-600 hover:text-gray-900 relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v2a2 2 0 102 2 2 2 0 002-2h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 100 2v3a1 1 0 100 2h4a1 1 0 100-2v-3a1 1 0 100-2H8z" />
          </svg>
          <span v-if="audioState.playlist.length > 0" class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {{ audioState.playlist.length }}
          </span>
        </button>
      </div>
      
      <!-- Progress and Volume -->
      <div class="flex items-center space-x-4 min-w-0 flex-1 justify-end">
        <!-- Progress -->
        <div class="flex items-center space-x-2 flex-1 max-w-xs">
          <span class="text-xs text-gray-500 w-10 text-right">
            {{ audioPlayer.formatTime(audioState.currentTime) }}
          </span>
          <div 
            ref="progressContainer"
            @click="handleProgressClick"
            class="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative"
          >
            <div 
              class="h-full bg-blue-600 rounded-full"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
            <div 
              class="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full cursor-pointer"
              :style="{ left: `${progressPercentage}%` }"
            ></div>
          </div>
          <span class="text-xs text-gray-500 w-10">
            {{ audioPlayer.formatTime(audioState.duration) }}
          </span>
        </div>
        
        <!-- Volume control -->
        <div class="flex items-center space-x-2">
          <button @click="audioPlayer.toggleMute" class="p-1 text-gray-600 hover:text-gray-900">
            <svg v-if="audioState.isMuted" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
            </svg>
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            :value="volumePercentage"
            @input="handleVolumeChange"
            class="w-20 h-1 bg-gray-200 rounded-full outline-none"
          >
        </div>
      </div>
    </div>
    
    <!-- Playlist -->
    <div v-if="showPlaylist" class="border-t border-gray-200 max-h-64 overflow-y-auto">
      <div class="px-4 py-2 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800">Trenutna playlist</h3>
      </div>
      <div v-for="(track, index) in audioState.playlist" :key="track.tokenId" 
           :class="[
             'flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer',
             audioState.currentIndex === index ? 'bg-blue-50 border-l-2 border-blue-600' : ''
           ]"
           @click="audioPlayer.playFromPlaylist(index)">
        <img 
          :src="track.imageUrl || '/default-cover.jpg'" 
          alt="Cover" 
          class="w-10 h-10 rounded object-cover"
        >
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">{{ track.title }}</p>
          <p class="text-xs text-gray-600 truncate">{{ track.artist }}</p>
        </div>
        <div v-if="audioState.currentIndex === index && audioState.isPlaying" class="text-blue-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h2v12H3V4zm4 0h2v12H7V4zm4 0h2v12h-2V4z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>