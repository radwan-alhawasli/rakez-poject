import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

/**
 * Critical-path coverage gate (backlog D): shell layout + marketing tab composables only.
 * Does not merge vitest.config.js — avoids inheriting repo-wide coverage thresholds/includes.
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['./tests/setup.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    include: [
      'tests/layouts/useMainLayout.spec.js',
      'tests/composables/marketing/**/*.spec.js',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'src/layouts/composables/useMainLayout.js',
        'src/composables/marketing/**/*.js',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'coverage/',
        '**/*.spec.js',
        '**/*.test.js',
      ],
      thresholds: {
        lines: 48,
        functions: 42,
        branches: 22,
        statements: 48,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    },
  },
});
