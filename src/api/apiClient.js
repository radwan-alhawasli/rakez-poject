import axios from 'axios'
import appConfig from '../config/appConfig'
import logger from '../utils/logger'
import secureStorage from '../utils/secureStorage'
import { setupTokenRefreshInterceptor, initTokenRefresh } from '../utils/tokenRefresh'
import { setupCsrfInterceptor, initCsrf } from '../utils/csrf'

const apiBaseUrl = appConfig.apiBaseUrl

// Log API base URL in development
if (appConfig.isDevelopment) {
    logger.debug(`[API Client] Initialized with baseURL: ${apiBaseUrl}`)
}

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000
})

// Initialize utilities with apiClient instance (breaks circular dependency)
initCsrf(apiClient)
initTokenRefresh(apiClient)

// Setup CSRF protection
setupCsrfInterceptor(apiClient)

// Request Interceptor: Attach token if it exists and update activity
apiClient.interceptors.request.use(
    (config) => {
        const token = secureStorage.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            // Update last activity on each request
            secureStorage.updateLastActivity()
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Setup token refresh interceptor
setupTokenRefreshInterceptor(apiClient)

// Response Interceptor: Standardized error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null
        const url = error.config?.url || ''
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred'

        // Suppress logging for expected 404s (CSRF token, refresh token endpoints)
        const isExpected404 = status === 404 && (
            url.includes('/csrf-token') || 
            url.includes('/auth/refresh')
        )

        // Suppress logging for 401 errors that are being handled by token refresh
        // (to avoid noise when refresh endpoint doesn't exist)
        const is401FromRefreshAttempt = status === 401 && error.config?._retry

        // Suppress logging for refresh endpoint unavailable errors
        const isRefreshEndpointUnavailable = error.name === 'RefreshEndpointUnavailable' || 
                                             error.message?.includes('Token refresh endpoint not available')

        if (status === 401) {
            // Unauthorized: Token might be expired
            // Only log if it's not from a refresh attempt (to avoid noise)
            if (!url.includes('/auth/refresh') && !is401FromRefreshAttempt) {
                // Only log once per session to reduce noise
                if (process.env.NODE_ENV !== 'production') {
                    logger.debug('Unauthorized access - potential token expiration')
                }
            }
            
            // Check if session is expired
            if (secureStorage.isSessionExpired()) {
                secureStorage.clearSession()
            }
        }

        // Don't log expected 404s, 401s from refresh attempts, refresh endpoint unavailable, or sensitive data in production
        if (!isExpected404 && !is401FromRefreshAttempt && !isRefreshEndpointUnavailable) {
            // Only log error details in development
            if (process.env.NODE_ENV !== 'production') {
                // For 403 errors, provide more context
                if (status === 403) {
                    const userMessage = error.response?.data?.message || 'ليس لديك صلاحية للوصول إلى هذا المورد'
                    logger.warn(`API Error [${status}]: ${userMessage}`)
                } else {
                    logger.error(`API Error [${status}]:`, message)
                }
            } else {
                // In production, log minimal info
                logger.error(`API Error [${status}]`)
            }
        }

        // Create a proper Error instance instead of rejecting with a plain object
        const apiError = new Error(message)
        apiError.name = 'APIError'
        apiError.status = status
        apiError.data = error.response?.data
        apiError.response = error.response
        apiError.originalError = error
        
        return Promise.reject(apiError)
    }
)

export default apiClient
