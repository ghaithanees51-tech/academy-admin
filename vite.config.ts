import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Performance optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Rollup optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['@headlessui/react'],
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next'],
        },
      },
    },
    
    // Source maps for production debugging (disable for smaller builds)
    sourcemap: false,
  },
  
  // Server optimizations
  server: {
    // Enable CORS
    cors: true,
    
    // Warm up commonly used files
    warmup: {
      clientFiles: ['./src/main.tsx'],
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [],
  },
})
