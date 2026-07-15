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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React ecosystem — smallest critical chunk, loads first
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')) {
            return 'react-core';
          }
          // Redux state management
          if (id.includes('node_modules/@reduxjs/') || 
              id.includes('node_modules/redux') ||
              id.includes('node_modules/react-redux')) {
            return 'redux';
          }
          // Axios + API utilities
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          // Charts — heavy, only load on pages that need it
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'charts';
          }
          // Icons — large but reused everywhere
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/react-icons')) {
            return 'icons';
          }
          // PDF generation — very heavy, load lazily
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas') ||
              id.includes('node_modules/html2pdf') ||
              id.includes('node_modules/pdfmake')) {
            return 'pdf';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/moment')) {
            return 'date-utils';
          }
          // Other heavy vendor libraries
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
})

