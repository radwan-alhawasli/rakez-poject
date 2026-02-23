/**
 * API Client Tests
 * Test request/response interceptors (token attachment, error handling)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../src/api/apiClient';

const mockGetToken = vi.hoisted(() => vi.fn(() => null));
const mockUpdateLastActivity = vi.hoisted(() => vi.fn());
const mockClearSession = vi.hoisted(() => vi.fn());

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../src/config/appConfig', () => ({
  default: {
    apiBaseUrl: 'http://test.api',
    apiTimeout: 5000,
    isDevelopment: false,
  },
}));

vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: () => mockGetToken(),
    updateLastActivity: mockUpdateLastActivity,
    clearSession: mockClearSession,
    getUserInfo: vi.fn(() => null),
    isSessionExpired: vi.fn(() => false),
  },
}));

vi.mock('../../src/utils/tokenRefresh', () => ({
  setupTokenRefreshInterceptor: vi.fn(),
  initTokenRefresh: vi.fn(),
}));

vi.mock('../../src/utils/csrf', () => ({
  setupCsrfInterceptor: vi.fn(),
  initCsrf: vi.fn(),
}));

describe('apiClient', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mockGetToken.mockReturnValue(null);
    mockUpdateLastActivity.mockClear();
    mockClearSession.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should attach Bearer token when getToken returns token', async () => {
    mockGetToken.mockReturnValue('secret-token-123');
    let capturedConfig;
    mock.onGet('/test-auth').reply(config => {
      capturedConfig = config;
      return [200, { data: 'ok' }];
    });

    await apiClient.get('/test-auth');

    expect(capturedConfig.headers.Authorization).toBe('Bearer secret-token-123');
    expect(mockUpdateLastActivity).toHaveBeenCalled();
  });

  it('should not attach Authorization when getToken returns null', async () => {
    mockGetToken.mockReturnValue(null);
    let capturedConfig;
    mock.onGet('/test-no-auth').reply(config => {
      capturedConfig = config;
      return [200, {}];
    });

    await apiClient.get('/test-no-auth');

    expect(capturedConfig.headers.Authorization).toBeUndefined();
  });

  it('should have baseURL and default headers', () => {
    expect(apiClient.defaults.baseURL).toBe('http://test.api');
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.headers['Accept']).toBe('application/json');
  });

  it('should reject with APIError on 4xx response', async () => {
    mock.onGet('/error').reply(400, { message: 'Bad request' });

    await expect(apiClient.get('/error')).rejects.toMatchObject({
      name: 'APIError',
      status: 400,
      message: 'Bad request',
    });
  });
});
