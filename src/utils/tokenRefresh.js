/**
 * Token Refresh Utility
 * Handles automatic token refresh and retry logic
 */

import axios from 'axios';
import secureStorage from './secureStorage';
import logger from './logger';
import { getCaughtMessage, getCaughtStatus } from '@/utils/caughtError';

let isRefreshing = false;
/** @type {any[]} */
let failedQueue = [];
/** @type {import('axios').AxiosInstance | null} */
let apiClientInstance = null;
let hasLoggedRefresh404 = false; // Track if we've already logged the 404 warning
let refreshEndpointAvailable = true; // Assume available until we get a 404

/**
 * Initialize token refresh utility with apiClient instance
 * @param {import('axios').AxiosInstance} client - Axios instance
 */
export function initTokenRefresh(client) {
  apiClientInstance = client;
  // Skip refresh for localhost - backend may not implement /api/auth/refresh
  const baseUrl = client?.defaults?.baseURL || '';
  if (baseUrl.includes('localhost')) {
    refreshEndpointAvailable = false;
  }
}

/**
 * Process queued requests after token refresh
 * @param {*} error
 * @param {string|null|undefined} [token]
 */
function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

/**
 * Refresh authentication token
 * @returns {Promise<string>} New token
 */
async function refreshToken() {
  if (!apiClientInstance) {
    throw new Error('Token refresh utility not initialized. Call initTokenRefresh() first.');
  }

  // If we know the endpoint doesn't exist, don't try
  if (!refreshEndpointAvailable) {
    const error = new Error('Token refresh endpoint not available');
    error.name = 'RefreshEndpointUnavailable';
    error.status = null;
    throw error;
  }

  try {
    // Call refresh endpoint (adjust endpoint as needed)
    const response = await apiClientInstance.post('/auth/refresh', {
      refresh_token: secureStorage.getRefreshToken(),
    });

    const { access_token } = response.data;

    if (access_token) {
      secureStorage.setToken(access_token);
      return access_token;
    }

    throw new Error('No token in refresh response');
  } catch (error) {
    // Handle 404 (endpoint doesn't exist) gracefully
    if (getCaughtStatus(error) === 404) {
      refreshEndpointAvailable = false;
      // Only log once to reduce console noise
      if (!hasLoggedRefresh404) {
        hasLoggedRefresh404 = true;
        logger.debug('Token refresh endpoint not found (404). Token refresh is disabled.');
      }
      // Create a specific error that won't be logged repeatedly
      const endpointError = new Error('Token refresh endpoint not available');
      endpointError.name = 'RefreshEndpointUnavailable';
      endpointError.status = 404;
      endpointError.originalError = error;
      // Don't clear session on 404 - endpoint just doesn't exist
      throw endpointError;
    }

    // For other errors, log and clear session
    logger.error('Token refresh failed:', error);
    secureStorage.clearSession();
    throw error;
  }
}

/**
 * Add request to retry queue
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 */
function addToQueue(resolve, reject) {
  failedQueue.push({ resolve, reject });
}

/**
 * Token refresh interceptor
 * Automatically refreshes token on 401 and retries failed requests
 * @param {import('axios').AxiosInstance | null} [client] - Axios instance (optional, uses initialized instance if not provided)
 */
export function setupTokenRefreshInterceptor(client = null) {
  const clientInstance = client || apiClientInstance;

  if (!clientInstance) {
    throw new Error(
      'Token refresh utility not initialized. Call initTokenRefresh() or pass apiClient as parameter.'
    );
  }

  clientInstance.interceptors.response.use(
    response => response,
    /**
     * @param {unknown} err
     */
    async err => {
      if (!axios.isAxiosError(err)) {
        return Promise.reject(err);
      }
      const error = err;
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // If error is 401 and we haven't tried to refresh yet
      const reqAny = /** @type {any} */ (originalRequest);
      if (error.response?.status === 401 && !reqAny._retry) {
        // Don't attempt refresh if endpoint is not available
        if (!refreshEndpointAvailable) {
          // Endpoint not available, just reject the error
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            addToQueue(resolve, reject);
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return clientInstance(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        reqAny._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          processQueue(null, newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return clientInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // If refresh failed with 404, mark endpoint as unavailable
          if (
            getCaughtStatus(refreshError) === 404 ||
            getCaughtMessage(refreshError).includes('not available')
          ) {
            refreshEndpointAvailable = false;
          }
          return Promise.reject(error); // Reject original error, not refresh error
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

