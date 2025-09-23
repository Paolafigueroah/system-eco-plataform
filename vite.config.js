import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sql.js', 'bcryptjs']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      buffer: 'buffer'
    }
  }
})
