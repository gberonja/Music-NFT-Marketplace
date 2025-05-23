<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'Nema stavki za prikaz'
  },
  skeletonType: {
    type: String,
    default: 'card'
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Loading skeletons -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
      <SkeletonLoader 
        v-for="i in 12" 
        :key="`skeleton-${i}`" 
        :type="skeletonType" 
      />
    </div>
    
    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <svg class="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ emptyMessage }}</h3>
        <p class="text-gray-500 dark:text-gray-400">{{ $slots.emptyDescription?.() || 'Pokušajte s drugačijim filterima ili se vratite kasnije.' }}</p>
        <div v-if="$slots.emptyAction" class="mt-6">
          <slot name="emptyAction"></slot>
        </div>
      </div>
    </div>
    
    <!-- Items grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
      <div 
        v-for="(item, index) in items" 
        :key="item.id || item.tokenId || index"
        class="animate-fade-in"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}
</style>