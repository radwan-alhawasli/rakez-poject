import { defineConfig, devices } from '@playwright/test';

const ciE2ePreview = process.env.CI_E2E_PREVIEW === '1' || process.env.CI_E2E_PREVIEW === 'true';
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  (ciE2ePreview ? 'http://127.0.0.1:4173' : 'http://localhost:8080');
const skipWebServer =
  process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1' ||
  process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true';

const githubActions = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: githubActions
    ? [
        ['github'],
        ['html', { open: 'never' }],
      ]
    : 'html',
  timeout: process.env.CI ? 60_000 : 30_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(skipWebServer
    ? {}
    : ciE2ePreview
      ? {
          webServer: {
            command:
              'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
            url: 'http://127.0.0.1:4173',
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
          },
        }
      : {
          webServer: {
            command: 'npm run dev',
            url: 'http://localhost:8080',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        }),
});
