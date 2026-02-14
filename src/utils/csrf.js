/**
 * CSRF Protection Utility
 * Handles CSRF token management and validation
 */

import axios from 'axios'
import appConfig from '../config/appConfig'
import logger from './logger'

let csrfToken = null
let tokenFetchPromise = null
let apiClientInstance = null
let csrfEndpointUnavailable = false // Track if CSRF endpoint is unavailable to skip future requests

/**
 * Initialize CSRF utility with apiClient instance
 * @param {Object} client - Axios instance
 */
export function initCsrf(client) {
    apiClientInstance = client
}

/**
 * Get CSRF token from server
 * @returns {Promise<string>} CSRF token
 */
async function fetchCsrfToken() {
    if (!apiClientInstance) {
        throw new Error('CSRF utility not initialized. Call initCsrf() first.')
    }

    // Skip if endpoint is known to be unavailable
    if (csrfEndpointUnavailable) {
        return null
    }

    if (tokenFetchPromise) {
        return tokenFetchPromise
    }

    // Create a custom axios instance with shorter timeout for CSRF requests
    // This prevents waiting the full 10 seconds when endpoint doesn't exist
    const csrfRequestClient = axios.create({
        baseURL: apiClientInstance.defaults.baseURL,
        timeout: 3000, // 3 seconds instead of 10
        headers: {
            ...apiClientInstance.defaults.headers
        }
    })

    // Copy auth token if available
    const token = apiClientInstance.defaults.headers?.Authorization || 
                  apiClientInstance.defaults.headers?.common?.Authorization
    if (token) {
        csrfRequestClient.defaults.headers.Authorization = token
    }

    tokenFetchPromise = csrfRequestClient.get('/csrf-token')
        .then(response => {
            const token = response.data?.token || response.data?.csrf_token || response.data
            if (token) {
                csrfToken = token
                csrfEndpointUnavailable = false // Reset flag on success
                return token
            }
            throw new Error('No CSRF token received')
        })
        .catch(error => {
            // Handle 404 (endpoint doesn't exist) immediately - don't wait for timeout
            // Silently handle 404/timeout errors - don't log or propagate
            if (error.response?.status === 404 || error.code === 'ECONNABORTED') {
                csrfEndpointUnavailable = true // Mark endpoint as unavailable
                // Return null silently - don't log or throw
                return null
            }
            
            // Log other errors (non-404, non-timeout) but don't throw in development
            if (error.response && error.response.status !== 404) {
                // Only log non-404 errors
                logger.error(`Failed to fetch CSRF token: ${error.response.status} ${error.response.statusText}`)
            } else if (error.code && error.code !== 'ECONNABORTED') {
                // Log non-timeout errors
                logger.error('Failed to fetch CSRF token:', error.message || error)
            }
            
            // In development, allow requests without CSRF token
            if (appConfig.isDevelopment) {
                return null
            }
            
            // In production, only throw if it's not a 404 or timeout
            if (error.response?.status !== 404 && error.code !== 'ECONNABORTED') {
                throw error
            }
            
            return null
        })
        .finally(() => {
            tokenFetchPromise = null
        })

    return tokenFetchPromise
}

/**
 * Get CSRF token (cached or fetch new)
 * @returns {Promise<string|null>} CSRF token
 */
export async function getCsrfToken() {
    if (csrfToken) {
        return csrfToken
    }

    if (!appConfig.enableCSRF) {
        return null
    }

    try {
        return await fetchCsrfToken()
    } catch (error) {
        logger.error('CSRF token error:', error)
        return null
    }
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCsrfToken() {
    csrfToken = null
    tokenFetchPromise = null
    // Reset endpoint availability flag to allow retry after logout
    csrfEndpointUnavailable = false
}

/**
 * Setup CSRF token interceptor for API requests
 * @param {Object} client - Axios instance (optional, uses initialized instance if not provided)
 */
export function setupCsrfInterceptor(client = null) {
    const clientInstance = client || apiClientInstance
    
    if (!clientInstance) {
        throw new Error('CSRF utility not initialized. Call initCsrf() or pass apiClient as parameter.')
    }

    if (!appConfig.enableCSRF) {
        return
    }

    clientInstance.interceptors.request.use(
        // eslint-disable-next-line no-undef
        async (config) => {
            // Skip CSRF for GET requests and public endpoints
            if (config.method === 'get' || config.url?.includes('/public/')) {
                return config
            }

            // Get CSRF token
            const token = await getCsrfToken()
            if (token) {
                config.headers[appConfig.csrfTokenHeader] = token
            }
            // eslint-disable-next-line no-undef
            return config
        },
        (error) => Promise.reject(error)
    )

    // Refresh token on 403 (Forbidden) - might be CSRF token expired
    clientInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 403 && error.config && !error.config._csrfRetry) {
                error.config._csrfRetry = true
                clearCsrfToken()
                
                // Retry with new token
                const token = await getCsrfToken()
                if (token) {
                    error.config.headers[appConfig.csrfTokenHeader] = token
                    return clientInstance(error.config)
                }
            }

            return Promise.reject(error)
        }
    )
}

export default {
    getCsrfToken,
    clearCsrfToken,
    setupCsrfInterceptor,
    initCsrf
}
