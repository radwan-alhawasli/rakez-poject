/**
 * Token Refresh Utility
 * Handles automatic token refresh and retry logic
 */

import secureStorage from './secureStorage'
import logger from './logger'

let isRefreshing = false
let failedQueue = []
let apiClientInstance = null
let hasLoggedRefresh404 = false // Track if we've already logged the 404 warning
let refreshEndpointAvailable = true // Assume available until we get a 404

/**
 * Check if refresh endpoint is available
 * @returns {boolean} True if endpoint is available
 */
export function isRefreshEndpointAvailable() {
    return refreshEndpointAvailable
}

/**
 * Initialize token refresh utility with apiClient instance
 * @param {Object} client - Axios instance
 */
export function initTokenRefresh(client) {
    apiClientInstance = client
    // Skip refresh for localhost - backend may not implement /api/auth/refresh
    const baseUrl = client?.defaults?.baseURL || ''
    if (baseUrl.includes('localhost')) {
        refreshEndpointAvailable = false
    }
}

/**
 * Process queued requests after token refresh
 */
function processQueue(error, token = null) {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    
    failedQueue = []
}

/**
 * Refresh authentication token
 * @returns {Promise<string>} New token
 */
async function refreshToken() {
    if (!apiClientInstance) {
        throw new Error('Token refresh utility not initialized. Call initTokenRefresh() first.')
    }

    // If we know the endpoint doesn't exist, don't try
    if (!refreshEndpointAvailable) {
        const error = new Error('Token refresh endpoint not available')
        error.name = 'RefreshEndpointUnavailable'
        error.status = null
        throw error
    }

    try {
        // Call refresh endpoint (adjust endpoint as needed)
        const response = await apiClientInstance.post('/auth/refresh', {
            refresh_token: secureStorage.getToken() // This might need to be a separate refresh token
        })

        const { access_token } = response.data
        
        if (access_token) {
            secureStorage.setToken(access_token)
            return access_token
        }

        throw new Error('No token in refresh response')
    } catch (error) {
        // Handle 404 (endpoint doesn't exist) gracefully
        if (error.response?.status === 404) {
            refreshEndpointAvailable = false
            // Only log once to reduce console noise
            if (!hasLoggedRefresh404) {
                hasLoggedRefresh404 = true
                logger.debug('Token refresh endpoint not found (404). Token refresh is disabled.')
            }
            // Create a specific error that won't be logged repeatedly
            const endpointError = new Error('Token refresh endpoint not available')
            endpointError.name = 'RefreshEndpointUnavailable'
            endpointError.status = 404
            endpointError.originalError = error
            // Don't clear session on 404 - endpoint just doesn't exist
            throw endpointError
        }
        
        // For other errors, log and clear session
        logger.error('Token refresh failed:', error)
        secureStorage.clearSession()
        throw error
    }
}

/**
 * Add request to retry queue
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 */
function addToQueue(resolve, reject) {
    failedQueue.push({ resolve, reject })
}

/**
 * Token refresh interceptor
 * Automatically refreshes token on 401 and retries failed requests
 * @param {Object} client - Axios instance (optional, uses initialized instance if not provided)
 */
export function setupTokenRefreshInterceptor(client = null) {
    const clientInstance = client || apiClientInstance
    
    if (!clientInstance) {
        throw new Error('Token refresh utility not initialized. Call initTokenRefresh() or pass apiClient as parameter.')
    }

    clientInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config

            // If error is 401 and we haven't tried to refresh yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                // Don't attempt refresh if endpoint is not available
                if (!refreshEndpointAvailable) {
                    // Endpoint not available, just reject the error
                    return Promise.reject(error)
                }

                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        addToQueue(resolve, reject)
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return clientInstance(originalRequest)
                    }).catch(err => {
                        return Promise.reject(err)
                    })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    const newToken = await refreshToken()
                    processQueue(null, newToken)
                    
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return clientInstance(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    // If refresh failed with 404, mark endpoint as unavailable
                    if (refreshError.response?.status === 404 || refreshError.message?.includes('not available')) {
                        refreshEndpointAvailable = false
                    }
                    return Promise.reject(error) // Reject original error, not refresh error
                } finally {
                    isRefreshing = false
                }
            }

            return Promise.reject(error)
        }
    )
}

/**
 * Check if token needs refresh (within 5 minutes of expiration)
 * @returns {boolean} True if token should be refreshed
 */
export function shouldRefreshToken() {
    const timeUntilExpiration = secureStorage.getTimeUntilExpiration()
    const fiveMinutes = 5 * 60 * 1000
    return timeUntilExpiration > 0 && timeUntilExpiration < fiveMinutes
}

/**
 * Proactively refresh token if needed
 * @returns {Promise<string|null>} New token or null if not needed
 */
export async function refreshTokenIfNeeded() {
    // Don't attempt if endpoint is not available
    if (!refreshEndpointAvailable) {
        return null
    }
    
    if (shouldRefreshToken() && !isRefreshing) {
        try {
            return await refreshToken()
        } catch (error) {
            // Don't log 404 errors - already handled in refreshToken()
            if (error.response?.status !== 404) {
                logger.error('Proactive token refresh failed:', error)
            }
            return null
        }
    }
    return null
}

export default {
    setupTokenRefreshInterceptor,
    shouldRefreshToken,
    refreshTokenIfNeeded,
    refreshToken,
    initTokenRefresh
}
