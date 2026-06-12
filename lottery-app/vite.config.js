import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), tailwindcss()],

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
          // React core + router (~140KB) — cached indefinitely
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/react-hot-toast')
          ) {
            return 'vendor-react';
          }
          // Recharts + D3 (~400KB) — analytics pages only
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'vendor-charts';
          }
          // Lucide icons (~200KB) — large but shared, separate for caching
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Form validation libs — only on register/login pages
          if (
            id.includes('node_modules/zod') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform')
          ) {
            return 'vendor-forms';
          }
          // Image capture — only on share result feature
          if (id.includes('node_modules/html-to-image')) {
            return 'vendor-image';
          }
          // shadcn/ui utilities + Radix UI primitives — shared UI layer
          if (
            id.includes('node_modules/@radix-ui') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority') ||
            id.includes('node_modules/tw-animate-css')
          ) {
            return 'vendor-ui';
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
