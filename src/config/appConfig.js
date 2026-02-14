/**
 * Application Configuration
 * Uses environment variables with fallback to defaults
 */
import logger from '../utils/logger'

// Determine environment first (needed for API URL logic)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const isProduction = process.env.NODE_ENV === 'production'

// Determine API Base URL
// Priority: 1. Environment variable (VUE_APP_API_BASE_URL), 2. localhost:8000 if development, 3. Production URL
// Current: Uses http://localhost:8000 from .env file (VUE_APP_API_BASE_URL)
let apiBaseUrl
if (process.env.VUE_APP_API_BASE_URL) {
    apiBaseUrl = process.env.VUE_APP_API_BASE_URL
} else if (isDevelopment) {
    apiBaseUrl = 'http://localhost:8000'
} else {
    apiBaseUrl = 'https://api.rakez.com.sa/api'
}

// Log API URL in development for debugging
if (isDevelopment) {
    logger.debug(`[API Config] Using API Base URL: ${apiBaseUrl}`)
    logger.debug(`[API Config] Environment: ${process.env.NODE_ENV || 'development (default)'}`)
}

const appConfig = {
    // API Configuration
    apiBaseUrl,
    
    // Environment
    env: process.env.NODE_ENV || 'development',
    isProduction,
    isDevelopment,
    
    // Security
    enableCSRF: process.env.VUE_APP_ENABLE_CSRF !== 'false',
    csrfTokenHeader: 'X-CSRF-TOKEN',
    
    // Session
    sessionTimeout: parseInt(process.env.VUE_APP_SESSION_TIMEOUT, 10) || 30 * 60 * 1000, // 30 minutes
    sessionWarningTime: parseInt(process.env.VUE_APP_SESSION_WARNING_TIME, 10) || 5 * 60 * 1000, // 5 minutes
    
    // Pusher Configuration
    pusherKey: process.env.VUE_APP_PUSHER_KEY || '',
    pusherCluster: process.env.VUE_APP_PUSHER_CLUSTER || 'mt1',
    pusherAuthEndpoint: process.env.VUE_APP_PUSHER_AUTH_ENDPOINT || '/api/broadcasting/auth',
    
    // Feature Flags
    enableAnalytics: process.env.VUE_APP_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: process.env.VUE_APP_ENABLE_ERROR_REPORTING !== 'false'
}

export default appConfig

