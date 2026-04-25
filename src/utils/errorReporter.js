/**
 * Error Reporting Service
 *
 * Lightweight adapter for error reporting services (e.g., Sentry).
 * Uses a registration pattern so the actual SDK is never imported here —
 * only main.js (or wherever the app boots) imports the SDK and registers it.
 *
 * To enable Sentry:
 *   1. npm install @sentry/vue
 *   2. Set VITE_APP_SENTRY_DSN in your .env file
 *   3. In main.js, call initSentry(app) before app.mount()
 */

import logger from './logger';
import appConfig from '@/config/appConfig';

/** @type {{ captureException: Function, captureMessage: Function, withScope: Function } | null} */
let _reporter = null;

/**
 * Register an external error reporting instance (e.g., a Sentry object).
 * Call this from main.js after initializing Sentry.
 * @param {{ captureException: Function, captureMessage: Function, withScope: Function }} instance
 */
export function registerErrorReporter(instance) {
  if (instance && typeof instance.captureException === 'function') {
    _reporter = instance;
    logger.info('[ErrorReporter] Error reporter registered');
  }
}

/**
 * Report an error to the configured reporting service.
 * @param {any} errorInfo - Structured error information from errorHandler.js
 */
export function reportError(errorInfo) {
  if (!appConfig.isProduction || !appConfig.enableErrorReporting) return;

  if (_reporter) {
    try {
      if (typeof _reporter.withScope === 'function') {
        _reporter.withScope((/** @type {any} */ scope) => {
          scope.setTag?.('error_type', errorInfo.type);
          scope.setTag?.('error_severity', errorInfo.severity);
          scope.setContext?.('error_info', {
            message: errorInfo.message,
            originalMessage: errorInfo.originalMessage,
            statusCode: errorInfo.statusCode,
          });
          if (errorInfo.originalError instanceof Error) {
            /** @type {any} */ (_reporter).captureException(errorInfo.originalError);
          } else {
            /** @type {any} */ (_reporter).captureMessage(errorInfo.message, errorInfo.severity);
          }
        });
      } else if (errorInfo.originalError instanceof Error) {
        /** @type {any} */ (_reporter).captureException(errorInfo.originalError);
      } else {
        /** @type {any} */ (_reporter).captureMessage(errorInfo.message);
      }
    } catch (e) {
      logger.warn('[ErrorReporter] Failed to report error:', e);
    }
  }
}

export default { registerErrorReporter, reportError };
