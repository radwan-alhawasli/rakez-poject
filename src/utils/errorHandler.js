/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user notifications (toast)
 */

import logger from './logger';
import appConfig from '../config/appConfig';
import { toast } from '../composables/useToast';

/**
 * Error types
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * User-friendly error messages (Arabic)
 */
const errorMessages = {
  [ErrorTypes.NETWORK]: {
    default: 'حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
    timeout: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.',
    offline: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.',
  },
  [ErrorTypes.VALIDATION]: {
    default: 'البيانات المدخلة غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.',
    required: 'هذا الحقل مطلوب.',
    format: 'صيغة البيانات غير صحيحة.',
  },
  [ErrorTypes.AUTHENTICATION]: {
    default: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    expired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  },
  [ErrorTypes.AUTHORIZATION]: {
    default: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
    forbidden:
      'غير مصرح لك بالوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول للحصول على الصلاحيات المناسبة.',
    roles: 'ليس لديك الصلاحيات المطلوبة للوصول إلى هذا المورد.',
  },
  [ErrorTypes.SERVER]: {
    default: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    500: 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.',
    503: 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.',
  },
  [ErrorTypes.CLIENT]: {
    default: 'حدث خطأ في التطبيق. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
    notFound: 'المورد المطلوب غير موجود أو تم حذفه.',
  },
  [ErrorTypes.UNKNOWN]: {
    default: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  },
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @param {string} type - Error type
 * @returns {string} User-friendly message
 */
function getUserMessage(error, type = ErrorTypes.UNKNOWN) {
  // Check if error has a user-friendly message
  if (error?.userMessage) {
    return error.userMessage;
  }

  // Check API error message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Check error message
  if (error?.message) {
    // Map common error messages
    if (error.message.includes('timeout')) {
      return errorMessages[ErrorTypes.NETWORK].timeout;
    }
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return errorMessages[ErrorTypes.NETWORK].offline;
    }
  }

  // Check status code
  const status = error?.response?.status || error?.status;
  if (status) {
    if (status === 401) {
      return errorMessages[ErrorTypes.AUTHENTICATION].expired;
    }
    if (status === 403) {
      // Check if error message mentions roles
      const errorMsg = error?.response?.data?.message || error?.message || '';
      if (errorMsg.includes('role') || errorMsg.includes('صلاحية') || errorMsg.includes('roles')) {
        return errorMessages[ErrorTypes.AUTHORIZATION].roles;
      }
      return errorMessages[ErrorTypes.AUTHORIZATION].forbidden;
    }
    if (status === 404) {
      // Check if it's an expected 404 (CSRF, refresh token) - don't show to user
      const url = error?.config?.url || error?.response?.config?.url || '';
      if (url.includes('/csrf-token') || url.includes('/auth/refresh')) {
        return null; // Don't show error for expected 404s
      }
      return errorMessages[ErrorTypes.CLIENT].notFound;
    }
    if (status === 500) {
      return errorMessages[ErrorTypes.SERVER]['500'];
    }
    if (status === 503) {
      return errorMessages[ErrorTypes.SERVER]['503'];
    }
  }

  // Return default message for type
  return errorMessages[type]?.default || errorMessages[ErrorTypes.UNKNOWN].default;
}

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
function getErrorType(error) {
  if (!error) return ErrorTypes.UNKNOWN;

  // Network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.NETWORK;
  }

  if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
    return ErrorTypes.NETWORK;
  }

  // HTTP status codes
  const status = error?.response?.status || error?.status;
  if (status) {
    if (status === 401) return ErrorTypes.AUTHENTICATION;
    if (status === 403) return ErrorTypes.AUTHORIZATION;
    if (status === 404) return ErrorTypes.CLIENT;
    if (status >= 500) return ErrorTypes.SERVER;
    if (status === 422 || status === 400) return ErrorTypes.VALIDATION;
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return ErrorTypes.VALIDATION;
  }

  return ErrorTypes.UNKNOWN;
}

/**
 * Determine error severity
 * @param {Error} error - Error object
 * @param {string} type - Error type
 * @returns {string} Error severity
 */
function getErrorSeverity(error, type) {
  const status = error?.response?.status || error?.status;

  // 404 errors for expected endpoints (CSRF, refresh) are low severity
  if (status === 404) {
    const url = error?.config?.url || error?.response?.config?.url || '';
    if (url.includes('/csrf-token') || url.includes('/auth/refresh')) {
      return ErrorSeverity.LOW;
    }
  }

  if (type === ErrorTypes.AUTHENTICATION || type === ErrorTypes.AUTHORIZATION) {
    return ErrorSeverity.HIGH;
  }

  if (type === ErrorTypes.SERVER) {
    return ErrorSeverity.CRITICAL;
  }

  if (type === ErrorTypes.NETWORK) {
    return ErrorSeverity.MEDIUM;
  }

  return ErrorSeverity.LOW;
}

/**
 * Log error based on severity and environment
 * @param {Error} error - Error object
 * @param {string} type - Error type
 * @param {string} severity - Error severity
 * @param {Object} context - Additional context
 */
function logError(error, type, severity, context = {}) {
  const errorInfo = {
    type,
    severity,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    ...context,
  };

  // Always log errors
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    logger.error('Error:', errorInfo);
  } else if (severity === ErrorSeverity.MEDIUM) {
    logger.warn('Error:', errorInfo);
  } else {
    logger.error('Error:', errorInfo);
  }

  // In production, send to error reporting service
  if (appConfig.isProduction && appConfig.enableErrorReporting) {
    // TODO: Integrate with error reporting service (e.g., Sentry)
    // reportErrorToService(errorInfo)
  }
}

/**
 * Handle error with full processing
 * @param {Error} error - Error object
 * @param {Object} options - Handling options
 * @returns {Object} Error information
 */
export function handleError(error, options = {}) {
  const { context = {}, showNotification = true, log = true, throwError = false } = options;

  const type = getErrorType(error);
  const severity = getErrorSeverity(error, type);
  const userMessage = getUserMessage(error, type);

  // If userMessage is null, it means this is an expected error (e.g., CSRF 404) that shouldn't be shown
  if (userMessage === null && !log) {
    // Return minimal error info for expected errors
    return {
      type,
      severity,
      message: null,
      originalError: error,
      status: error?.response?.status || error?.status,
      data: error?.response?.data || error?.data,
      isExpected: true,
    };
  }

  // Log error
  if (log) {
    logError(error, type, severity, context);
  }

  // Show toast notification
  if (showNotification && userMessage) {
    toast.error(userMessage);
  }

  const errorInfo = {
    type,
    severity,
    message: userMessage,
    originalError: error,
    status: error?.response?.status || error?.status,
    data: error?.response?.data || error?.data,
  };

  // Throw error if requested
  if (throwError) {
    // Create a proper Error instance instead of throwing a plain object
    const errorToThrow = new Error(userMessage || 'An error occurred');
    errorToThrow.name = type;
    errorToThrow.info = errorInfo;
    errorToThrow.originalError = error;
    throw errorToThrow;
  }

  return errorInfo;
}

/**
 * Create error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} data - Additional error data
 * @returns {Error} Error object
 */
export function createError(message, type = ErrorTypes.UNKNOWN, data = {}) {
  const error = new Error(message);
  error.type = type;
  error.data = data;
  return error;
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Function result
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryable = error => {
      const type = getErrorType(error);
      return type === ErrorTypes.NETWORK || type === ErrorTypes.SERVER;
    },
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!retryable(error) || attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next retry
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

export default {
  ErrorTypes,
  ErrorSeverity,
  handleError,
  createError,
  retryWithBackoff,
  getUserMessage,
  getErrorType,
};
