import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],

  // ໃນ dev mode: base = '/' ເພື່ອໃຫ້ app ເຮັດວຽກທີ່ localhost:5173/
  // ໃນ build: base = full subfolder path ເພື່ອ assets load ຖືກຕ້ອງໃນ XAMPP
  base: command === 'build' ? '/lottery-app/dist/' : '/',

  server: {
    // Dev proxy: forward requests to XAMPP (port 80) so API + uploaded images work at localhost:5173
    proxy: {
      '/laoloterylive/api': { target: 'http://localhost', changeOrigin: true },
      '/laoloterylive/uploads': { target: 'http://localhost', changeOrigin: true },
    },
  },

  build: {
    // ── Chunk splitting for optimal caching ──
    // Vendor libs change rarely → separate chunk = long browser cache
    // Page-level code splitting handled by React.lazy() in App.jsx
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core (~140KB) — cached indefinitely
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          // Recharts (~100KB) — only needed on analytics/dashboard pages
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
        },
      },
    },
    // Generate chunk size warnings above 300KB (default is 500KB)
    chunkSizeWarningLimit: 300,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
}))
