/**
 * Application Configuration
 * Uses environment variables with fallback to defaults
 */
import logger from '../utils/logger'

// Determine environment first (needed for API URL logic)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const isProduction = process.env.NODE_ENV === 'production'

// API Base URL — بدون شرطة نهائية (e.g. http://localhost:8000/api)
const apiBaseUrl = (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '')

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
    
    // Pusher / Reverb (WebSocket) Configuration
    pusherKey: process.env.VUE_APP_PUSHER_KEY || '',
    pusherCluster: process.env.VUE_APP_PUSHER_CLUSTER || 'mt1',
    pusherAuthEndpoint: process.env.VUE_APP_PUSHER_AUTH_ENDPOINT || '/api/broadcasting/auth',
    // Reverb: same host/port as Reverb server (e.g. VUE_APP_PUSHER_WS_HOST=localhost, VUE_APP_PUSHER_WS_PORT=8080)
    pusherWsHost: process.env.VUE_APP_PUSHER_WS_HOST || '',
    pusherWsPort: parseInt(process.env.VUE_APP_PUSHER_WS_PORT, 10) || 8080,
    pusherForceTLS: process.env.VUE_APP_PUSHER_FORCE_TLS === 'true',
    
    // Feature Flags
    enableAnalytics: process.env.VUE_APP_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: process.env.VUE_APP_ENABLE_ERROR_REPORTING !== 'false',

    // API timeout (ms) - increase for slow endpoints like accounting/sold-units
    apiTimeout: parseInt(process.env.VUE_APP_API_TIMEOUT, 10) || 30000
}

export default appConfig

