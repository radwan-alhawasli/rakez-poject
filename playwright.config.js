import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';
const skipWebServer =
  process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1' ||
  process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:8080',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
