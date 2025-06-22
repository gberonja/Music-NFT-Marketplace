import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@contracts': path.resolve(__dirname, './smart-contracts/artifacts/contracts')
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers', 'buffer']
  },
  build: {
    rollupOptions: {
      external: ['buffer']
    }
  }
})