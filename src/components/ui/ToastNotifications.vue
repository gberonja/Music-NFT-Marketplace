<script setup>
import { computed } from 'vue'
import { NotificationService } from '../../services/notificationService'

const notifications = computed(() => NotificationService.notifications)

const getToastIcon = (type) => {
  const icons = {
    success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`,
    error: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />`,
    warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />`,
    info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`
  }
  return icons[type] || icons.info
}

const getToastClasses = (type) => {
  const classes = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800'
  }
  return classes[type] || classes.info
}

const getIconColor = (type) => {
  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return colors[type] || colors.info
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup name="toast" tag="div">
        <div 
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'flex items-start p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm',
            getToastClasses(notification.type),
            notification.visible ? 'opacity-100' : 'opacity-0'
          ]"
          class="transform transition-all duration-300 ease-in-out"
        >
          <div class="flex-shrink-0">
            <svg 
              class="w-5 h-5" 
              :class="getIconColor(notification.type)"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              v-html="getToastIcon(notification.type)"
            >
            </svg>
          </div>
          
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium">{{ notification.message }}</p>
          </div>
          
          <div class="ml-4 flex-shrink-0 flex">
            <button 
              @click="NotificationService.remove(notification.id)"
              class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="getIconColor(notification.type)"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>