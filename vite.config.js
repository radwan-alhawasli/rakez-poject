import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
  build: {
    // Raise the warning threshold slightly (500 KB default is very conservative for a large SPA)
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core Vue ecosystem
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // UI component libraries
          'vendor-ui': ['radix-vue', 'lucide-vue-next'],
          // Utility libraries
          'vendor-utils': ['axios', 'zod', 'dompurify', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          // Chart/visualization library
          'vendor-charts': ['@unovis/ts', '@unovis/vue'],
          // Markdown renderer
          'vendor-markdown': ['marked'],
        },
      },
    },
  },
});
