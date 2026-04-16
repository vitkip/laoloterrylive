import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],

  // ໃນ dev mode: base = '/' ເພື່ອໃຫ້ app ເຮັດວຽກທີ່ localhost:5173/
  // ໃນ build: base = full subfolder path ເພື່ອ assets load ຖືກຕ້ອງໃນ XAMPP
  base: command === 'build' ? '/laoloterylive/lottery-app/dist/' : '/',

  server: {
    // Dev proxy: forward requests to XAMPP (port 80) so API + uploaded images work at localhost:5173
    proxy: {
      '/laoloterylive/api': { target: 'http://localhost', changeOrigin: true },
      '/laoloterylive/uploads': { target: 'http://localhost', changeOrigin: true },
    },
  },
}))
