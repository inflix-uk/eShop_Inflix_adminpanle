// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001, // You can keep your existing port setting
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Redux state management
          'redux-vendor': ['@reduxjs/toolkit', 'redux', 'react-redux', 'redux-persist'],
          // Rich text editors (very large)
          'editor-vendor': [
            // '@tinymce/tinymce-react',
            'jodit-react',
            'react-quill',
            // 'suneditor-react',
            '@uiw/react-md-editor',
          ],
          // Chart libraries
          'chart-vendor': ['apexcharts', 'chart.js', 'react-apexcharts', 'react-chartjs-2'],
          // PDF and image processing
          'pdf-vendor': ['jspdf', 'html2canvas', 'browser-image-compression'],
          // UI component libraries
          'ui-vendor': [
            'lucide-react',
            'flowbite-react',
            '@headlessui/react',
            '@heroicons/react',
            'react-icons',
          ],
          // Stripe payment
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          // Other utilities
          'utils-vendor': ['axios', 'react-toastify'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
  },
})
