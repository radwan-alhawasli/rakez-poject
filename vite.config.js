import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  optimizeDeps: {
    include: ['arabic-reshaper'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    chunkSizeWarningLimit: 1200,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/')) return 'vendor-vue';
          if (
            id.includes('radix-vue') ||
            id.includes('lucide-vue-next') ||
            id.includes('embla-carousel') ||
            id.includes('vaul-vue')
          )
            return 'vendor-ui';
          if (id.includes('@unovis')) return 'vendor-charts';
          if (id.includes('marked')) return 'vendor-markdown';
          if (id.includes('pdf-lib') || id.includes('@pdf-lib/fontkit')) return 'vendor-pdf';
          if (id.includes('html2canvas')) return 'vendor-canvas';
          if (
            id.includes('axios') ||
            id.includes('/zod/') ||
            id.includes('dompurify') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority') ||
            id.includes('@vueuse/core')
          ) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
