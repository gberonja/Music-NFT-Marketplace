import { ref, onMounted, onUnmounted } from 'vue'

export function useAccessibility() {
  const isKeyboardUser = ref(false)
  
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      isKeyboardUser.value = true
      document.body.classList.add('keyboard-user')
    }
  }
  
  const handleMouseDown = () => {
    isKeyboardUser.value = false
    document.body.classList.remove('keyboard-user')
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseDown)
  })
  
  return {
    isKeyboardUser
  }
}


export function useFocusTrap(containerRef) {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')
  
  const trapFocus = (e) => {
    if (!containerRef.value) return
    
    const focusableElements = containerRef.value.querySelectorAll(focusableSelectors)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    if (e.key === 'Escape') {

      containerRef.value.dispatchEvent(new CustomEvent('escape'))
    }
  }
  
  const activate = () => {
    document.addEventListener('keydown', trapFocus)
    

    const focusableElements = containerRef.value?.querySelectorAll(focusableSelectors)
    if (focusableElements?.length) {
      focusableElements[0].focus()
    }
  }
  
  const deactivate = () => {
    document.removeEventListener('keydown', trapFocus)
  }
  
  return {
    activate,
    deactivate
  }
}