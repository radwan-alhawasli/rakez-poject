/**
 * Standardized Service Error Handler
 * Provides consistent error handling across all service files
 *
 * @module utils/serviceErrorHandler
 */

import logger from './logger';
import appConfig from '@/config/appConfig';

/**
 * Handle service errors gracefully
 * Returns empty data for expected 403/404 errors on GET requests
 *
 * @param {Error} error - Error object
 * @param {string} operation - Operation description for logging
 * @param {string} method - HTTP method (get, post, put, delete, patch)
 * @param {*} defaultValue - Default value to return for GET requests (default: [])
 * @returns {*} Default return value based on expected return type
 * @throws {Error} Re-throws error for non-GET methods or unexpected errors
 */
export function handleServiceError(error, operation, method = 'get', defaultValue = []) {
  const status = error?.response?.status || error?.status;

  // Always throw for 401 (Unauthorized) errors - these indicate authentication issues
  if (status === 401) {
    logger.warn(`${operation} - Unauthorized:`, error?.response?.data?.message || error?.message);
    throw error;
  }

  // For GET requests, return empty data for expected 403/404 errors
  if (method.toLowerCase() === 'get' && (status === 403 || status === 404)) {
    // Only log in development, and only once per error type
    if (appConfig.isDevelopment) {
      logger.debug(
        `${operation} - ${status === 403 ? 'Forbidden' : 'Not Found'}:`,
        error?.response?.data?.message || error?.message
      );
    }
    // Return appropriate empty value
    return defaultValue;
  }

  // For other errors or non-GET methods, log and throw
  if (status !== 403 && status !== 404) {
    logger.error(`${operation}:`, error);
  } else if (method.toLowerCase() !== 'get') {
    // Log 403/404 for POST/PUT/DELETE/PATCH as they're more critical
    logger.warn(
      `${operation} - ${status === 403 ? 'Forbidden' : 'Not Found'}:`,
      error?.response?.data?.message || error?.message
    );
  }

  throw error;
}

/**
 * Wrap a service method with standardized error handling
 *
 * @param {Function} serviceMethod - The service method to wrap
 * @param {string} operation - Operation description for logging
 * @param {string} method - HTTP method
 * @param {*} defaultValue - Default value for GET requests
 * @returns {Function} Wrapped service method
 */
export function withErrorHandling(serviceMethod, operation, method = 'get', defaultValue = []) {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      return handleServiceError(error, operation, method, defaultValue);
    }
  };
}
