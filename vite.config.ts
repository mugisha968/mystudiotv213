import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    watch: {
      // The API server writes to these directories at runtime (SQLite WAL
      // files, uploaded media). If Vite watches them, every API call is seen
      // as a file change and triggers a `full-reload` to every connected
      // browser, causing an infinite reload loop on any page that queries
      // the API (most visibly the dashboard).
      ignored: ['**/data/**', '**/uploads/**', '**/logs/**'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'i18next-browser-languagedetector',
      'react-i18next',
    ],
  },
})