/**
 * Common test setup for all service tests
 * Sets up mocks that are needed across all tests
 */

import { vi } from 'vitest'

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock CSRF utility
vi.mock('../../src/utils/csrf', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    initCsrf: vi.fn(),
    setupCsrfInterceptor: vi.fn(),
    getCsrfToken: vi.fn(() => Promise.resolve(null)),
    clearCsrfToken: vi.fn()
  }
})

// Mock token refresh utility
vi.mock('../../src/utils/tokenRefresh', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    initTokenRefresh: vi.fn(),
    setupTokenRefreshInterceptor: vi.fn()
  }
})

// Mock secureStorage
vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: vi.fn(() => null),
    setToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setUserInfo: vi.fn(),
    getUserInfo: vi.fn(() => null),
    clearSession: vi.fn(),
    isSessionExpired: vi.fn(() => false),
    shouldShowWarning: vi.fn(() => false),
    getTimeUntilExpiration: vi.fn(() => 60000),
    extendSession: vi.fn(),
    updateLastActivity: vi.fn()
  }
}))
