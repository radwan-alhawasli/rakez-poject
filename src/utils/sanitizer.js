/**
 * Input Sanitization Utility
 * Sanitizes user input to prevent XSS and injection attacks
 */

import logger from './logger';

/**
 * Sanitize string input - removes potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }

  const { allowHTML = false, maxLength = null, trim = true, removeSpecialChars = false } = options;

  let sanitized = input;

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // If HTML is not allowed, escape HTML entities
  if (!allowHTML) {
    sanitized = escapeHtml(sanitized);
  }

  // Remove special characters if requested
  if (removeSpecialChars) {
    // eslint-disable-next-line no-useless-escape
    sanitized = sanitized.replace(/[<>\"'&]/g, '');
  }

  // Enforce max length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    logger.warn('Input truncated to max length:', maxLength);
  }

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return text;
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = email.trim().toLowerCase();

  if (!emailRegex.test(sanitized)) {
    logger.warn('Invalid email format:', email);
    return '';
  }

  // Additional length check
  if (sanitized.length > 254) {
    logger.warn('Email too long:', email);
    return '';
  }

  return sanitized;
}

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }

  // Basic length validation (adjust based on requirements)
  if (sanitized.length < 7 || sanitized.length > 15) {
    logger.warn('Invalid phone number length:', phone);
    return '';
  }

  return sanitized;
}

/**
 * Sanitize numeric input
 * @param {*} input - Input to sanitize
 * @param {Object} options - Options { min, max, integer, allowNegative }
 * @returns {number|null} Sanitized number or null if invalid
 */
export function sanitizeNumber(input, options = {}) {
  const { min = null, max = null, integer = false, allowNegative = true } = options;

  // Convert to number
  let num = typeof input === 'string' ? parseFloat(input) : Number(input);

  // Check if valid number
  if (isNaN(num)) {
    logger.warn('Invalid number input:', input);
    return null;
  }

  // Check if integer required
  if (integer && !Number.isInteger(num)) {
    num = Math.round(num);
  }

  // Check negative
  if (!allowNegative && num < 0) {
    logger.warn('Negative number not allowed:', input);
    return null;
  }

  // Check min/max
  if (min !== null && num < min) {
    logger.warn('Number below minimum:', input, 'min:', min);
    return null;
  }

  if (max !== null && num > max) {
    logger.warn('Number above maximum:', input, 'max:', max);
    return null;
  }

  return num;
}

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @param {Object} options - Options { allowedProtocols, requireProtocol }
 * @returns {string} Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url, options = {}) {
  if (typeof url !== 'string') {
    return '';
  }

  const { allowedProtocols = ['http:', 'https:'], requireProtocol = true } = options;

  let sanitized = url.trim();

  // Add protocol if required and missing
  if (requireProtocol && !sanitized.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
    sanitized = 'https://' + sanitized;
  }

  try {
    const urlObj = new URL(sanitized);

    // Check protocol
    if (!allowedProtocols.includes(urlObj.protocol)) {
      logger.warn('URL protocol not allowed:', urlObj.protocol);
      return '';
    }

    // Remove javascript: and data: protocols (security)
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      logger.warn('Dangerous URL protocol detected:', url);
      return '';
    }

    return urlObj.toString();
  } catch (error) {
    logger.warn('Invalid URL format:', url, error);
    return '';
  }
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return sanitizeValue(obj, options);
  }

  const sanitized = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key, { allowHTML: false });

      // Sanitize value
      sanitized[sanitizedKey] = sanitizeValue(obj[key], options);
    }
  }

  return sanitized;
}

/**
 * Sanitize array
 * @param {Array} arr - Array to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(arr, options = {}) {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map(item => sanitizeValue(item, options));
}

/**
 * Sanitize value based on type
 * @param {*} value - Value to sanitize
 * @param {Object} options - Sanitization options
 * @returns {*} Sanitized value
 */
export function sanitizeValue(value, options = {}) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value, options);
  }

  if (typeof value === 'number') {
    return sanitizeNumber(value, options);
  }

  if (Array.isArray(value)) {
    return sanitizeArray(value, options);
  }

  if (typeof value === 'object') {
    return sanitizeObject(value, options);
  }

  return value;
}

/**
 * Sanitize form data
 * @param {Object} formData - Form data object
 * @param {Object} schema - Schema defining sanitization rules per field
 * @returns {Object} Sanitized form data
 */
export function sanitizeFormData(formData, schema = {}) {
  const sanitized = {};

  for (const field in formData) {
    if (Object.prototype.hasOwnProperty.call(formData, field)) {
      const fieldSchema = schema[field] || {};
      const value = formData[field];

      // Apply field-specific sanitization
      if (fieldSchema.type === 'email') {
        sanitized[field] = sanitizeEmail(value);
      } else if (fieldSchema.type === 'phone') {
        sanitized[field] = sanitizePhone(value);
      } else if (fieldSchema.type === 'number') {
        sanitized[field] = sanitizeNumber(value, fieldSchema.options || {});
      } else if (fieldSchema.type === 'url') {
        sanitized[field] = sanitizeUrl(value, fieldSchema.options || {});
      } else {
        sanitized[field] = sanitizeString(value, fieldSchema.options || {});
      }
    }
  }

  return sanitized;
}

export default {
  sanitizeString,
  escapeHtml,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeUrl,
  sanitizeObject,
  sanitizeArray,
  sanitizeValue,
  sanitizeFormData,
};
