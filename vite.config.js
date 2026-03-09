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
    // حد 1200 KB: vendor-pdf (pdf-lib + fontkit ~1.15 MB) يُحمّل ديناميكياً عند استخدام ميزة PDF فقط
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/')) return 'vendor-vue';
          if (id.includes('radix-vue') || id.includes('lucide-vue-next')) return 'vendor-ui';
          if (id.includes('@unovis')) return 'vendor-charts';
          if (id.includes('marked')) return 'vendor-markdown';
          if (id.includes('pdf-lib') || id.includes('@pdf-lib/fontkit')) return 'vendor-pdf';
          if (
            id.includes('axios') ||
            id.includes('/zod/') ||
            id.includes('dompurify') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority')
          ) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
