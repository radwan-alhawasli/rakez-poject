/**
 * Standardized Service Error Handler
 * Provides consistent error handling across all service files
 *
 * @module utils/serviceErrorHandler
 */

import logger from './logger';
import appConfig from '@/config/appConfig';
import {
  HTTP_UNAUTHORIZED,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
} from '@/constants/httpStatus';
import { getCaughtMessage, getCaughtStatus, toLoggableCaught, toThrowable } from '@/utils/caughtError';

/**
 * Handle service errors gracefully
 * Returns empty data for expected 403/404 errors on GET requests
 *
 * @param {unknown} error - Caught value (Axios/API errors, Error, etc.)
 * @param {string} operation - Operation description for logging
 * @param {string} method - HTTP method (get, post, put, delete, patch)
 * @param {*} defaultValue - Default value to return for GET requests (default: [])
 * @returns {*} Default return value based on expected return type
 * @throws {Error} Re-throws error for non-GET methods or unexpected errors
 */
export function handleServiceError(error, operation, method = 'get', defaultValue = []) {
  const status = getCaughtStatus(error);

  if (status === HTTP_UNAUTHORIZED) {
    logger.warn(`${operation} - Unauthorized:`, getCaughtMessage(error));
    throw toThrowable(error);
  }

  const isGet = method.toLowerCase() === 'get';
  const isExpectedEmptyResponse =
    status === HTTP_FORBIDDEN || status === HTTP_NOT_FOUND;

  if (isGet && isExpectedEmptyResponse) {
    if (appConfig.isDevelopment) {
      logger.debug(
        `${operation} - ${status === HTTP_FORBIDDEN ? 'Forbidden' : 'Not Found'}:`,
        getCaughtMessage(error)
      );
    }
    return defaultValue;
  }

  if (!isExpectedEmptyResponse) {
    logger.error(`${operation}:`, toLoggableCaught(error));
  } else if (!isGet) {
    logger.warn(
      `${operation} - ${status === HTTP_FORBIDDEN ? 'Forbidden' : 'Not Found'}:`,
      getCaughtMessage(error)
    );
  }

  throw toThrowable(error);
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
  /**
   * @param {...any} args
   */
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      return handleServiceError(error, operation, method, defaultValue);
    }
  };
}
