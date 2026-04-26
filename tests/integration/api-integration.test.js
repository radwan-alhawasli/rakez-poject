/**
 * API integration tests — real HTTP against a configured backend.
 *
 * When to run (see also docs/VIEW_PLACEMENT.md for frontend layout; env vars here):
 *
 * - Default `npm run test:run`: does not run live HTTP tests without an integration base URL.
 * - Staging / non-local URL: set `INTEGRATION_API_BASE_URL` (recommended) **or** set
 *   `VITE_APP_API_BASE_URL` / `VITE_API_BASE_URL` to a non-localhost URL. Vitest must see
 *   the same `VITE_APP_API_BASE_URL` as `apiClient` / `authService` (set in the shell or CI env).
 * - Local API (localhost / 127.0.0.1): set `RUN_API_INTEGRATION=1` plus `VITE_APP_API_BASE_URL`
 *   (or `INTEGRATION_API_BASE_URL`) so the suite is explicitly opted in.
 *
 * Optional auth scenarios require `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import axios from 'axios';

vi.mock('../../src/utils/csrf', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    setupCsrfInterceptor: vi.fn(),
    initCsrf: vi.fn(),
  };
});

vi.mock('../../src/utils/tokenRefresh', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    setupTokenRefreshInterceptor: vi.fn(),
    initTokenRefresh: vi.fn(),
  };
});

const storageState = { token: null, refreshToken: null, user: null };

vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: vi.fn(() => storageState.token),
    setToken: vi.fn(t => {
      storageState.token = t;
    }),
    setRefreshToken: vi.fn(t => {
      storageState.refreshToken = t;
    }),
    setUserInfo: vi.fn(u => {
      storageState.user = u;
    }),
    getUserInfo: vi.fn(() => storageState.user),
    getRefreshToken: vi.fn(() => storageState.refreshToken),
    updateLastActivity: vi.fn(),
    isSessionExpired: vi.fn(() => false),
    clearSession: vi.fn(() => {
      storageState.token = null;
      storageState.refreshToken = null;
      storageState.user = null;
    }),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import authService from '../../src/services/authService';

function trimBase(u) {
  return (u || '').trim().replace(/\/+$/, '');
}

const explicitIntegration = trimBase(process.env.INTEGRATION_API_BASE_URL);
const viteBase = trimBase(process.env.VITE_APP_API_BASE_URL || process.env.VITE_API_BASE_URL);
const isLocal = u => u && /localhost|127\.0\.0\.1/i.test(u);
const runLocal = process.env.RUN_API_INTEGRATION === '1';

const effectiveBase =
  explicitIntegration ||
  (!isLocal(viteBase) ? viteBase : '') ||
  (runLocal ? viteBase : '');

const SKIP_INTEGRATION = !effectiveBase;

const hasAuthCreds = !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

if (SKIP_INTEGRATION) {
  describe('API Integration Tests configuration', () => {
    it('does not run live HTTP tests without an integration base URL', () => {
      expect(effectiveBase).toBe('');
      expect(SKIP_INTEGRATION).toBe(true);
    });
  });
} else {
describe('API Integration Tests', () => {
  beforeAll(() => {
    storageState.token = null;
    storageState.refreshToken = null;
    storageState.user = null;
  });

  afterAll(async () => {
    if (storageState.token) {
      try {
        await authService.logout();
      } catch {
        // ignore
      }
    }
    storageState.token = null;
    storageState.refreshToken = null;
    storageState.user = null;
  });

  describe('API reachability', () => {
    it('responds on /health (HTTP status from API host)', async () => {
      const url = `${effectiveBase}/health`;
      const res = await axios.get(url, {
        timeout: 25000,
        validateStatus: () => true,
      });
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(600);
    });
  });

  describe('Authentication flow', () => {
    if (!hasAuthCreds) {
      it('does not run credentialed auth scenarios without test credentials', () => {
        expect(hasAuthCreds).toBe(false);
      });
      return;
    }

    it('fails login with invalid credentials', async () => {
      await expect(
        authService.login('invalid-integration@example.test', 'wrong-password-xyz')
      ).rejects.toThrow();
    });

    it('logs in with valid credentials', async () => {
      const email = process.env.TEST_USER_EMAIL;
      const password = process.env.TEST_USER_PASSWORD;
      const user = await authService.login(email, password);
      expect(user).toBeTruthy();
      expect(user.email || email).toBeTruthy();
      expect(storageState.token).toBeTruthy();
    });
  });
});
}

export const integrationTestConfig = {
  apiBaseUrl: effectiveBase,
  skipTests: SKIP_INTEGRATION,
  testCredentials: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  },
};
