<script setup>
defineProps({
  type: {
    type: String,
    default: 'card', // 'card', 'text', 'avatar', 'custom'
    validator: (value) => ['card', 'text', 'avatar', 'custom'].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  },
  width: {
    type: String,
    default: 'w-full'
  },
  height: {
    type: String,
    default: 'h-4'
  }
})
</script>

<template>
  <!-- NFT Card Skeleton -->
  <div v-if="type === 'card'" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div class="aspect-square bg-gray-300"></div>
    <div class="p-4">
      <div class="h-6 bg-gray-300 rounded mb-2"></div>
      <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div class="h-10 bg-gray-300 rounded"></div>
    </div>
  </div>
  
  <!-- Text Skeleton -->
  <div v-else-if="type === 'text'" class="animate-pulse space-y-2">
    <div 
      v-for="row in rows" 
      :key="row"
      :class="[
        'bg-gray-300 rounded',
        height,
        row === rows ? 'w-2/3' : width
      ]"
    ></div>
  </div>
  
  <!-- Avatar Skeleton -->
  <div v-else-if="type === 'avatar'" class="flex items-center space-x-3 animate-pulse">
    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
    <div class="flex-1">
      <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div class="h-3 bg-gray-300 rounded w-1/3"></div>
    </div>
  </div>
  
  <!-- Custom Skeleton -->
  <div v-else class="animate-pulse">
    <div :class="[width, height, 'bg-gray-300 rounded']"></div>
  </div>
</template>