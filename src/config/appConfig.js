/**
 * Application configuration (env-based).
 * Single source for API URL, session, CSRF, Pusher/Reverb, and feature flags.
 *
 * @module config/appConfig
 * @typedef {Object} AppConfig
 * @property {string} apiBaseUrl - Base URL for API (no trailing slash)
 * @property {string} env - 'development' | 'production'
 * @property {boolean} isProduction
 * @property {boolean} isDevelopment
 * @property {boolean} enableCSRF
 * @property {string} csrfTokenHeader
 * @property {number} sessionTimeout - ms
 * @property {number} sessionWarningTime - ms
 * @property {string} pusherKey
 * @property {string} pusherCluster
 * @property {string} pusherAuthEndpoint
 * @property {string} pusherWsHost
 * @property {number} pusherWsPort
 * @property {boolean} pusherForceTLS
 * @property {boolean} enableAnalytics
 * @property {boolean} enableErrorReporting
 * @property {number} apiTimeout - ms
 */
import logger from '../utils/logger';

// Vite exposes env via import.meta.env (process.env is not available in browser).
// Use VITE_APP_* in .env for client-side config.
const getEnv = (key) => (typeof import.meta.env !== 'undefined' && import.meta.env[key]) || '';

// Determine environment first (needed for API URL logic)
const env = String(import.meta.env?.MODE || 'development').toLowerCase();
const isDevelopment = env === 'development';
const isProduction = env === 'production';

// API Base URL — بدون شرطة نهائية (e.g. http://localhost:8000/api)
// In development, default to local backend; otherwise use env or production URL.
const defaultApiUrl = isDevelopment ? 'http://localhost:8000/api' : 'https://api.rakez.com.sa/api';
const apiBaseUrl = (getEnv('VITE_APP_API_BASE_URL') || defaultApiUrl).replace(
  /\/+$/,
  ''
);

// Log API URL in development for debugging
if (isDevelopment) {
  logger.debug(`[API Config] Using API Base URL: ${apiBaseUrl}`);
  logger.debug(`[API Config] Environment: ${env}`);
}

const appConfig = {
  // API Configuration
  apiBaseUrl,

  // Environment
  env,
  isProduction,
  isDevelopment,

  // Security
  enableCSRF: getEnv('VITE_APP_ENABLE_CSRF') !== 'false',
  csrfTokenHeader: 'X-CSRF-TOKEN',

  // Session
  sessionTimeout: parseInt(getEnv('VITE_APP_SESSION_TIMEOUT'), 10) || 30 * 60 * 1000, // 30 minutes
  sessionWarningTime: parseInt(getEnv('VITE_APP_SESSION_WARNING_TIME'), 10) || 5 * 60 * 1000, // 5 minutes

  // Pusher / Reverb (WebSocket) Configuration
  pusherKey: getEnv('VITE_APP_PUSHER_KEY') || '',
  pusherCluster: getEnv('VITE_APP_PUSHER_CLUSTER') || 'mt1',
  pusherAuthEndpoint: getEnv('VITE_APP_PUSHER_AUTH_ENDPOINT') || '/api/broadcasting/auth',
  // Reverb: same host/port as Reverb server (e.g. VITE_APP_PUSHER_WS_HOST=localhost, VITE_APP_PUSHER_WS_PORT=8080)
  pusherWsHost: getEnv('VITE_APP_PUSHER_WS_HOST') || '',
  pusherWsPort: parseInt(getEnv('VITE_APP_PUSHER_WS_PORT'), 10) || 8080,
  pusherForceTLS: getEnv('VITE_APP_PUSHER_FORCE_TLS') === 'true',

  // Feature Flags
  enableAnalytics: getEnv('VITE_APP_ENABLE_ANALYTICS') === 'true',
  enableErrorReporting: getEnv('VITE_APP_ENABLE_ERROR_REPORTING') !== 'false',

  // API timeout (ms) - increase for slow endpoints like accounting/sold-units
  apiTimeout: parseInt(getEnv('VITE_APP_API_TIMEOUT'), 10) || 30000,
};

/** @type {AppConfig} */
export default appConfig;
