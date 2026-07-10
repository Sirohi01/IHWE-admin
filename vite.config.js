import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression';
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    visualizer({ open: false, filename: 'stats.html', gzipSize: true, brotliSize: true })
  ],
  server: {
    proxy: {
      '^/.*\\.(xml|txt|html)$': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
  }
})
