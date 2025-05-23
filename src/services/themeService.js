import { ref, watch } from 'vue'

const isDark = ref(false)

export class ThemeService {
  static init() {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = JSON.parse(saved)
    } else {

      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    this.apply()
    

    watch(isDark, (newValue) => {
      localStorage.setItem('darkMode', JSON.stringify(newValue))
      this.apply()
    })
  }
  
  static apply() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  static toggle() {
    isDark.value = !isDark.value
  }
  
  static get isDark() {
    return isDark.value
  }
  
  static set isDark(value) {
    isDark.value = value
  }
}

export const useTheme = () => {
  return {
    isDark,
    toggle: ThemeService.toggle,
    setDark: (value) => ThemeService.isDark = value
  }
}