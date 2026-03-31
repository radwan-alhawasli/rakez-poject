/**
 * Axios-based API client for the backend.
 * - Attaches Bearer token and CSRF header to requests.
 * - Normalizes errors to a consistent Error shape (status, data, url, method).
 * - On 401 (except login/refresh), clears session and redirects to /login.
 *
 * @module api/apiClient
 * @typedef {import('axios').AxiosInstance} ApiClient
 * @typedef {{ status?: number; data?: unknown }} ApiErrorResponse
 * @typedef {Error & {
 *   status: number | null;
 *   data?: unknown;
 *   response?: { status: number | null; data?: unknown };
 *   url: string;
 *   method?: string;
 *   code?: string | undefined;
 *   isAuthRedirect?: boolean;
 * }} NormalizedApiError
 */

import axios from 'axios';
import appConfig from '@/config/appConfig';
import logger from '@/utils/logger';
import secureStorage from '@/utils/secureStorage';
import { setupTokenRefreshInterceptor, initTokenRefresh } from '@/utils/tokenRefresh';
import { setupCsrfInterceptor, initCsrf } from '@/utils/csrf';

const apiBaseUrl = appConfig.apiBaseUrl;
const apiTimeout = appConfig.apiTimeout ?? 30000;

// Log API base URL in development
if (appConfig.isDevelopment) {
  logger.debug(`[API Client] Initialized with baseURL: ${apiBaseUrl}, timeout: ${apiTimeout}ms`);
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: apiTimeout,
});

// Initialize utilities with apiClient instance (breaks circular dependency)
initCsrf(apiClient);
initTokenRefresh(apiClient);

// Setup CSRF protection
setupCsrfInterceptor(apiClient);

// Request Interceptor: Attach token if it exists and update activity
apiClient.interceptors.request.use(
  config => {
    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Update last activity on each request
      secureStorage.updateLastActivity();
    }
    // When sending FormData, do not set Content-Type so the browser sends multipart/form-data with boundary
    if (config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => Promise.reject(error)
);

// Setup token refresh interceptor
setupTokenRefreshInterceptor(apiClient);

// Response Interceptor: Standardized error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null;
    const url = error.config?.url || '';
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Suppress logging for expected 404s (CSRF token, refresh token, optional notification endpoints)
    const isExpected404 =
      status === 404 &&
      (url.includes('/csrf-token') ||
        url.includes('/auth/refresh') ||
        url.includes('/notifications/public'));

    // Suppress logging for 401 errors that are being handled by token refresh
    // (to avoid noise when refresh endpoint doesn't exist)
    const is401FromRefreshAttempt = status === 401 && error.config?._retry;

    // Suppress logging for refresh endpoint unavailable errors
    const isRefreshEndpointUnavailable =
      error.name === 'RefreshEndpointUnavailable' ||
      error.message?.includes('Token refresh endpoint not available');

    if (status === 401) {
      // Unauthorized: Token might be expired or invalid
      // Only log if it's not from a refresh attempt (to avoid noise)
      if (!url.includes('/auth/refresh') && !is401FromRefreshAttempt) {
        // Only log once per session to reduce noise
        if (!import.meta.env.PROD) {
          logger.debug('Unauthorized access - potential token expiration');
        }
      }

      // Redirect to login when 401 on protected endpoints (avoid loop for /login)
      const isLoginRequest = url.includes('/login');
      const willRedirect =
        !isLoginRequest && typeof window !== 'undefined' && window.location.pathname !== '/login';
      if (!isLoginRequest) {
        secureStorage.clearSession();
        if (willRedirect) {
          window.location.href = '/login';
        }
      }
    }

    // Don't log expected 404s, 401s from refresh attempts, refresh endpoint unavailable, or sensitive data in production
    if (!isExpected404 && !is401FromRefreshAttempt && !isRefreshEndpointUnavailable) {
      // 403 on GET is often handled by services (they return empty data); log at debug to reduce console noise
      const isGet403 = status === 403 && (error.config?.method || '').toLowerCase() === 'get';
      if (isGet403 && !import.meta.env.PROD) {
        const userMessage =
          error.response?.data?.message || 'ليس لديك صلاحية للوصول إلى هذا المورد';
        logger.debug(`API [403] ${error.config?.url}: ${userMessage}`);
      } else {
        // Only log error details in development
        if (!import.meta.env.PROD) {
          if (status === 403) {
            const userMessage =
              error.response?.data?.message || 'ليس لديك صلاحية للوصول إلى هذا المورد';
            logger.warn(`API Error [${status}]: ${userMessage}`);
          } else {
            logger.error(`API Error [${status}]:`, message);
          }
        } else {
          // In production, log minimal info
          logger.error(`API Error [${status}]`);
        }
      }
    }

    // Create a proper Error instance instead of rejecting with a plain object
    /** @type {NormalizedApiError} */
    const apiError = /** @type {NormalizedApiError} */ (new Error(message));
    apiError.name = 'APIError';
    apiError.status = status;
    apiError.data = error.response?.data;
    // Keep a minimal, serializable `response` shape for callers that expect Axios-like errors.
    // Do NOT attach the full Axios error/response/config, as they contain non-cloneable values
    // (e.g., `transformRequest` functions) and can break test runners and logging.
    apiError.response = {
      status,
      data: error.response?.data,
    };
    apiError.url = url;
    apiError.method = error.config?.method;
    apiError.code = error.code;
    // Mark 401 errors that trigger redirect so global unhandledrejection can suppress overlay
    if (status === 401 && !url.includes('/login')) {
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      if (!isLoginPage) {
        apiError.isAuthRedirect = true;
      }
    }

    return Promise.reject(apiError);
  }
);

/** @type {ApiClient} */
export default apiClient;
