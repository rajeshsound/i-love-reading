import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          xlsx: ['xlsx'],
          react: ['react', 'react-dom'],
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
