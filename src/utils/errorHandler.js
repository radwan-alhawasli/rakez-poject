// @ts-nocheck
/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user notifications (toast)
 */

import logger from './logger';
import appConfig from '@/config/appConfig';
import { toast } from '@/composables/useToast';
import { reportError } from './errorReporter';
import { MSG_ERROR_GENERIC } from '@/constants/messages';

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
    default: 'تعذر الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت.',
    timeout: 'استغرق الطلب وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى.',
    offline: 'أنت الآن خارج الاتصال (Offline). يرجى التحقق من الشبكة.',
  },
  [ErrorTypes.VALIDATION]: {
    default: 'البيانات المدخلة غير مكتملة أو غير صحيحة.',
    required: 'هذا الحقل مطلوب ولا يمكن تركه فارغاً.',
    format: 'صيغة البيانات المدخلة غير مدعومة.',
    unique: 'هذه القيمة مسجلة مسبقاً في النظام.',
  },
  [ErrorTypes.AUTHENTICATION]: {
    default: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.',
    invalid: 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.',
    expired: 'جلستك انتهت لدواعي الأمان. يرجى إعادة تسجيل الدخول.',
    unauthorized: 'يرجى تسجيل الدخول للوصول إلى هذه الميزة.',
  },
  [ErrorTypes.AUTHORIZATION]: {
    default: 'عذراً، لا تملك الصلاحيات الكافية لتنفيذ هذا الإجراء.',
    forbidden: 'الوصول لهذا القسم مقيد لمدراء النظام فقط.',
    roles: 'صلاحيات حسابك لا تسمح بعرض هذه البيانات.',
  },
  [ErrorTypes.SERVER]: {
    default: 'حدث خطأ فني في أنظمة الشركة. فريقنا يعمل على إصلاحه حالياً.',
    500: 'نواجه مشكلة في معالجة طلبك (Error 500). يرجى المحاولة بعد قليل.',
    502: 'بوابة السيرفر غير مستجيبة. يرجى تحديث الصفحة.',
    503: 'النظام في وضع الصيانة المؤقتة. سنعود قريباً.',
    504: 'بوابة السيرفر استغرقت وقتاً طويلاً. يرجى المحاولة لاحقاً.',
  },
  [ErrorTypes.CLIENT]: {
    default: 'حدث خطأ غير متوقع في المتصفح. يرجى تحديث الصفحة.',
    notFound: 'الصفحة أو المورد الذي تبحث عنه غير موجود (404).',
    400: 'الطلب المرسل غير صالح. يرجى التأكد من المدخلات.',
    429: 'لقد قمت بإرسال الكثير من الطلبات. يرجى الانتظار قليلاً.',
  },
  [ErrorTypes.UNKNOWN]: {
    default: 'حدث خطأ غير معروف. يرجى التواصل مع الدعم الفني.',
  },
};

/**
 * Friendlier Arabic copy for known backend messages (e.g. tracker before contract completion).
 * @param {string} msg
 * @returns {string}
 */
function mapKnownApiUserMessage(msg) {
  if (!msg || typeof msg !== 'string') return msg;
  const t = msg.trim();
  
  // قاموس ترجمة رسائل الـ Backend الشائعة
  const dictionary = {
    'The email has already been taken': 'البريد الإلكتروني مسجل مسبقاً.',
    'The phone has already been taken': 'رقم الجوال مسجل مسبقاً.',
    'Unauthenticated': 'يرجى تسجيل الدخول للمتابعة.',
    'Unauthorized': 'غير مصرح لك بالقيام بهذا الإجراء.',
    'Page Not Found': 'الصفحة غير موجودة.',
    'Server Error': 'خطأ في السيرفر الداخلي.',
    'The given data was invalid': 'البيانات المدخلة غير صالحة.',
    'بيانات الطرف الثاني غير موجودة': 'بيانات العقد (الطرف الثاني) غير مكتملة.',
    'يمكن فقط تحديث العقود الموافق عليها': 'يجب اعتماد العقد من الإدارة أولاً قبل التعديل.',
    'User does not have the right roles': 'لا تملك الصلاحية الوظيفية المطلوبة.',
    'Token has expired': 'انتهت صلاحية رمز الدخول. يرجى إعادة الدخول.',
    'CSRF token mismatch': 'انتهت صلاحية الصفحة. يرجى تحديث الصفحة (Refresh).',
  };

  // البحث عن مطابقة في القاموس
  for (const [key, value] of Object.entries(dictionary)) {
    if (t.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return t;
}

/**
 * Extract first validation error from Laravel-style errors object
 * @param {any} errors - { field: ["msg"] } or { field: "msg" }
 * @returns {string|null}
 */
function getFirstValidationMessage(errors) {
  if (!errors || typeof errors !== 'object') return null;
  const e = /** @type {Record<string, any>} */ (errors);
  const key = Object.keys(e)[0];
  if (!key) return null;
  const val = e[key];
  if (Array.isArray(val) && val.length) return val[0];
  if (typeof val === 'string') return val;
  return null;
}

/**
 * Get user-facing message from any API/service error (used across the app in catch blocks).
 * Prefers: API message, then validation errors, then status-based defaults.
 * @param {any} error
 * @param {string} [fallback] - Optional fallback when no specific message is found
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback) {
  if (!error) return fallback || errorMessages[ErrorTypes.UNKNOWN].default;
  /** @type {any} */
  const e = error;
  const data = e?.response?.data ?? e?.data ?? {};
  const msg =
    error?.userMessage ||
    e?.userMessage ||
    data?.message ||
    getFirstValidationMessage(data?.errors) ||
    error?.message;
  if (msg && typeof msg === 'string' && msg.trim()) return mapKnownApiUserMessage(msg.trim());
  const status = e?.response?.status ?? e?.status;
  if (status === 401) return errorMessages[ErrorTypes.AUTHENTICATION].expired || '';
  if (status === 403) return errorMessages[ErrorTypes.AUTHORIZATION].default || '';
  if (status === 404) return errorMessages[ErrorTypes.CLIENT].notFound || '';
  if (status === 422) return errorMessages[ErrorTypes.VALIDATION].default || '';
  if (status >= 500) return errorMessages[ErrorTypes.SERVER].default || '';
  return fallback || errorMessages[ErrorTypes.UNKNOWN].default;
}

/**
 * Show API error to user via toast. Use in catch blocks.
 * @param {any} err - Caught error
 * @param {string} [fallback] - Fallback message when no specific message is found (default: MSG_ERROR_GENERIC)
 */
export function showApiError(err, fallback = MSG_ERROR_GENERIC) {
  const msg = getApiErrorMessage(err, fallback);
  if (msg) toast.error(msg);
}

/**
 * Get user-friendly error message
 * @param {any} error - Error object
 * @param {string} type - Error type
 * @returns {string|null} User-friendly message
 */
function getUserMessage(error, type = ErrorTypes.UNKNOWN) {
  /** @type {any} */
  const e = error;
  // Prefer explicit user message
  if (e?.userMessage) return e.userMessage;

  // API message (apiClient sets error.message and error.data)
  const apiMsg =
    e?.message ||
    e?.response?.data?.message ||
    e?.data?.message ||
    getFirstValidationMessage(e?.response?.data?.errors) ||
    getFirstValidationMessage(e?.data?.errors);
  if (apiMsg && typeof apiMsg === 'string' && apiMsg.trim()) {
    // Map known network patterns
    if (apiMsg.includes('timeout')) return errorMessages[ErrorTypes.NETWORK].timeout || null;
    if (apiMsg.includes('Network Error') || apiMsg.includes('Failed to fetch')) {
      return errorMessages[ErrorTypes.NETWORK].offline || null;
    }
    return mapKnownApiUserMessage(apiMsg.trim());
  }

  // Check status code
  const status = e?.response?.status || e?.status;
  if (status) {
    if (status === 401) {
      return errorMessages[ErrorTypes.AUTHENTICATION].expired || null;
    }
    if (status === 403) {
      // Check if error message mentions roles
      const errorMsg = e?.response?.data?.message || e?.message || '';
      if (errorMsg.includes('role') || errorMsg.includes('صلاحية') || errorMsg.includes('roles')) {
        /** @type {any} */
        const authMsgs = errorMessages[ErrorTypes.AUTHORIZATION];
        return authMsgs.roles || null;
      }
      return errorMessages[ErrorTypes.AUTHORIZATION].forbidden || null;
    }
    if (status === 404) {
      // Check if it's an expected 404 (CSRF, refresh token) - don't show to user
      const url = e?.config?.url || e?.response?.config?.url || '';
      if (url.includes('/csrf-token') || url.includes('/auth/refresh')) {
        return null; // Don't show error for expected 404s
      }
      return errorMessages[ErrorTypes.CLIENT].notFound || null;
    }
    if (status === 500) {
      return errorMessages[ErrorTypes.SERVER]['500'] || null;
    }
    if (status === 503) {
      return errorMessages[ErrorTypes.SERVER]['503'] || null;
    }
    if (status === 504) {
      return errorMessages[ErrorTypes.SERVER]['504'] || null;
    }
  }

  // Return default message for type
  const typeMsgs = /** @type {any} */ (errorMessages)[type];
  return typeMsgs?.default || errorMessages[ErrorTypes.UNKNOWN].default;
}

/**
 * Determine error type from error object
 * @param {any} error - Error object
 * @returns {string} Error type
 */
function getErrorType(error) {
  if (!error) return ErrorTypes.UNKNOWN;
  /** @type {any} */
  const e = error;
  if (e.isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) return ErrorTypes.NETWORK;

  // Network errors
  if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
    return ErrorTypes.NETWORK;
  }

  if (e.message?.includes('Network Error') || e.message?.includes('Failed to fetch')) {
    return ErrorTypes.NETWORK;
  }

  // HTTP status codes
  const status = e?.response?.status || e?.status;
  if (status) {
    if (status === 401) return ErrorTypes.AUTHENTICATION;
    if (status === 403) return ErrorTypes.AUTHORIZATION;
    if (status === 404) return ErrorTypes.CLIENT;
    if (status >= 500) return ErrorTypes.SERVER;
    if (status === 422 || status === 400) return ErrorTypes.VALIDATION;
  }

  // Validation errors
  if (e.name === 'ValidationError' || e.type === 'validation') {
    return ErrorTypes.VALIDATION;
  }

  return ErrorTypes.UNKNOWN;
}

/**
 * Determine error severity
 * @param {any} error - Error object
 * @param {string} type - Error type
 * @returns {string} Error severity
 */
function getErrorSeverity(error, type) {
  /** @type {any} */
  const e = error;
  const status = e?.response?.status || e?.status;

  // 404 errors for expected endpoints (CSRF, refresh) are low severity
  if (status === 404) {
    const url = e?.config?.url || e?.response?.config?.url || '';
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
 * @param {any} error - Error object
 * @param {string} type - Error type
 * @param {string} severity - Error severity
 * @param {any} context - Additional context
 */
function logError(error, type, severity, context = {}) {
  /** @type {any} */
  const e = error;
  /** @type {any} */
  const errorInfo = {
    type,
    severity,
    message: e?.message || 'Unknown error',
    originalMessage: e?.message,
    originalError: e,
    statusCode: e?.response?.status || e?.status,
    url: e?.config?.url || e?.url,
    method: e?.config?.method || e?.method,
    params: e?.config?.params,
    data: e?.response?.data || e?.data,
    stack: e?.stack,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // تنسيق رسالة السجل للمطورين في الـ Console
  if (appConfig.isDevelopment) {
    const logLabel = `[API Error ${errorInfo.statusCode || ''}] ${errorInfo.method?.toUpperCase() || ''} ${errorInfo.url || ''}`;
    console.groupCollapsed(`%c${logLabel}`, 'color: #ff4d4f; font-weight: bold;');
    console.log('Type:', type);
    console.log('Severity:', severity);
    console.log('Context:', context);
    console.log('Error Object:', error);
    console.log('Response Data:', errorInfo.data);
    console.log('Stack Trace:', errorInfo.stack);
    console.groupEnd();
  }

  // Always log errors via logger utility
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    logger.error('Critical Error:', errorInfo);
  } else if (severity === ErrorSeverity.MEDIUM) {
    logger.warn('Warning:', errorInfo);
  } else {
    logger.error('Error:', errorInfo);
  }

  // In production, send to error reporting service
  if (appConfig.isProduction && appConfig.enableErrorReporting) {
    try {
      reportError(errorInfo);
    } catch (reportErr) {
      console.error('[ErrorHandler] Failed to report error:', reportErr);
    }
  }
}

/**
 * Handle caught error: categorize, log, and show to user
 * @param {any} error - Caught error
 * @param {any} options - { type, severity, context, showNotification/showToast, log, throwError, fallbackMessage }
 */
export function handleError(error, options = {}) {
  /** @type {any} */
  const opts = options || {};
  const type = opts.type || getErrorType(error);
  const severity = opts.severity || getErrorSeverity(error, type);
  const userMessage = getUserMessage(error, type) || opts.fallbackMessage;

  const shouldLog = opts.log !== false;
  if (shouldLog) {
    logError(error, type, severity, opts.context);
  }

  // Backward compatible: allow either `showNotification` (preferred) or `showToast`.
  const showNotification =
    opts.showNotification !== undefined ? opts.showNotification : opts.showToast;
  if (showNotification !== false && userMessage) {
    toast.error(userMessage);
  }

  if (opts.throwError) {
    throw error instanceof Error ? error : new Error(userMessage || MSG_ERROR_GENERIC);
  }

  return {
    type,
    severity,
    // Test/backward compatibility: callers historically expect either `message` or `userMessage`.
    message: userMessage,
    userMessage,
    originalError: error,
  };
}

/**
 * Create error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {any} data - Additional error data
 * @returns {any} Error object
 */
export function createError(message, type = ErrorTypes.UNKNOWN, data = {}) {
  /** @type {any} */
  const error = new Error(message);
  error.type = type;
  error.data = data;
  return error;
}

/**
 * Retry function with exponential backoff
 * @param {any} fn - Function to retry
 * @param {any} options - Retry options
 * @returns {Promise<any>} Function result
 */
export async function retryWithBackoff(fn, options = {}) {
  /** @type {any} */
  const opts = options;
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryable = (/** @type {any} */ error) => {
      const type = getErrorType(error);
      return type === ErrorTypes.NETWORK || type === ErrorTypes.SERVER;
    },
  } = opts;

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
  getApiErrorMessage,
};
