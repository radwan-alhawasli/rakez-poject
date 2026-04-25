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
 *   userMessage?: string;
 *   originalMessage?: string;
 *   isOffline?: boolean;
 * }} NormalizedApiError
 */

import axios from 'axios';
import appConfig from '@/config/appConfig';
import logger from '@/utils/logger';
import secureStorage from '@/utils/secureStorage';
import { setupTokenRefreshInterceptor, initTokenRefresh } from '@/utils/tokenRefresh';
import { setupCsrfInterceptor, initCsrf } from '@/utils/csrf';
import { getApiErrorMessage } from '@/utils/errorHandler';

const apiBaseUrl = appConfig.apiBaseUrl;
const apiTimeout = appConfig.apiTimeout ?? 30000;

// Simple Cache for GET requests
/** @type {Map<string, {data: any, timestamp: number}>} */
const apiCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (Memory Cache)
const PERSISTENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (Local Storage)

/**
 * Load persistent cache from localStorage
 * @param {string} key
 * @returns {any}
 */
const loadPersistentCache = key => {
  try {
    const cached = localStorage.getItem(`api_cache_${key}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < PERSISTENT_CACHE_TTL) {
      return data;
    }
    localStorage.removeItem(`api_cache_${key}`);
  } catch (_) {
    return null;
  }
  return null;
};

/**
 * Save persistent cache to localStorage
 * @param {string} key
 * @param {any} data
 */
const savePersistentCache = (key, data) => {
  try {
    localStorage.setItem(
      `api_cache_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (_) {
    // Storage full or restricted
  }
};

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

/**
 * @param {string|null} pattern
 */
export const clearApiCache = (pattern = null) => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

// Initialize utilities with apiClient instance (breaks circular dependency)
initCsrf(apiClient);
initTokenRefresh(apiClient);

// Setup CSRF protection
setupCsrfInterceptor(apiClient);

// Request Interceptor: Attach token if it exists and update activity
apiClient.interceptors.request.use(
  config => {
    // Proactive offline check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const error = /** @type {NormalizedApiError} */ (new Error('No internet connection'));
      error.isOffline = true;
      return Promise.reject(error);
    }

    // Cache logic for GET requests
    const cfg = /** @type {any} */ (config);
    if (config.method === 'get' && cfg.useCache) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;

      // 1. Try Memory Cache
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (cfg.cacheTTL || CACHE_TTL)) {
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });
        return config;
      }

      // 2. Try Persistent Cache for specific resources (e.g., lookups, settings)
      if (cfg.usePersistentCache) {
        const pData = loadPersistentCache(cacheKey);
        if (pData) {
          config.adapter = () => Promise.resolve({
            data: pData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
          });
          return config;
        }
      }
    }

    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Update last activity on each requestimage.png
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
  response => {
    const cfg = /** @type {any} */ (response.config);
    // Cache the response if it was a GET request and useCache was enabled
    if (response.config.method === 'get' && cfg.useCache) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;

      // Save to memory cache
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      // Save to persistent cache if requested
      if (cfg.usePersistentCache) {
        savePersistentCache(cacheKey, response.data);
      }
    }

    // Invalidate cache on mutations
    const method = (response.config.method || '').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      // If we know the resource, we can be more specific, but for now clear all
      // Or clear based on URL pattern
      const url = response.config.url || '';
      const baseResource = url.split('/')[0] || url.split('/')[1];
      if (baseResource) {
        clearApiCache(baseResource);
      }
    }

    return response;
  },
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
    const friendlyMessage = getApiErrorMessage(error);
    const apiError = /** @type {NormalizedApiError} */ (new Error(friendlyMessage));
    apiError.name = 'APIError';
    apiError.status = status;
    apiError.userMessage = friendlyMessage;
    apiError.originalMessage = message;
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
