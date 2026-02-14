/**
 * Safe HTML Rendering Utility
 * Provides safe HTML rendering to prevent XSS attacks using DOMPurify
 */

import DOMPurify from 'dompurify'
import { escapeHtml } from './sanitizer'

/**
 * Sanitize HTML content using DOMPurify
 * @param {string} html - HTML string to sanitize
 * @param {Object} options - Sanitization options
 * @param {Array<string>} options.allowTags - Allowed HTML tags (default: common safe tags)
 * @param {Array<string>} options.allowAttributes - Allowed HTML attributes (default: safe attributes)
 * @param {boolean} options.allowLinks - Allow anchor tags with href (default: true)
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html, options = {}) {
    if (typeof html !== 'string') {
        return ''
    }

    const {
        allowTags = [],
        allowAttributes = [],
        allowLinks = true
    } = options

    // Default allowed tags (common safe tags)
    const defaultTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']
    if (allowLinks) {
        defaultTags.push('a')
    }

    // Default allowed attributes
    const defaultAttributes = ['class', 'id']
    if (allowLinks) {
        defaultAttributes.push('href', 'target', 'rel')
    }

    // Configure DOMPurify
    const config = {
        ALLOWED_TAGS: allowTags.length > 0 ? allowTags : defaultTags,
        ALLOWED_ATTR: allowAttributes.length > 0 ? allowAttributes : defaultAttributes,
        ALLOW_DATA_ATTR: false,
        KEEP_CONTENT: true
    }

    // Sanitize using DOMPurify
    return DOMPurify.sanitize(html, config)
}

/**
 * Create safe HTML renderer component data
 * @param {string} html - HTML string
 * @param {Object} options - Sanitization options
 * @returns {Object} Vue component data for safe rendering
 */
export function createSafeHtml(html, options = {}) {
    return {
        __html: sanitizeHtml(html, options)
    }
}

/**
 * Check if content is safe to render
 * @param {string} content - Content to check
 * @returns {boolean} True if content appears safe
 */
export function isSafeContent(content) {
    if (typeof content !== 'string') {
        return true
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // Event handlers like onclick=
        /<iframe/i,
        /<object/i,
        /<embed/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(content))
}

/**
 * Safe text renderer - always escapes HTML
 * Use this instead of v-html when possible
 * @param {string} text - Text to render
 * @returns {string} Escaped text
 */
export function safeText(text) {
    if (typeof text !== 'string') {
        return String(text || '')
    }
    return escapeHtml(text)
}

/**
 * Get DOMPurify configuration for custom use cases
 * @returns {Object} DOMPurify configuration object
 */
export function getDOMPurifyConfig() {
    return {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
        KEEP_CONTENT: true
    }
}

export default {
    sanitizeHtml,
    createSafeHtml,
    isSafeContent,
    safeText,
    getDOMPurifyConfig
}
