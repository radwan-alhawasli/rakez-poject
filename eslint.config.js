import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  prettierConfig,
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        // Node globals (for config files)
        process: 'readonly',
      },
    },
    rules: {
      'max-lines': [
        'error',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      // shadcn/radix-vue uses HTML-like component names (Dialog, Button, etc.) — this is intentional
      'vue/no-reserved-component-names': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      // shadcn/radix generated UI components use TypeScript generics; excluded since we don't author them
      'src/components/ui/**',
    ],
  },
];
