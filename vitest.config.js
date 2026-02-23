import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/*.spec.js',
        '**/*.test.js',
        'src/main.js',
        'src/router/**',
        'src/plugins/**',
        'src/strategies/**',
        'src/views/**/*.vue',
        'src/components/**/*.vue',
        'src/layouts/**/*.vue',
        'src/App.vue',
      ],
      include: ['src/**/*.js', 'src/**/*.vue'],
      thresholds: {
        lines: 70,
        functions: 50,
        branches: 55,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
