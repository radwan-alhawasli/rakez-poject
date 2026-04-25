/**
 * Safe HTML Rendering Utility
 * Provides safe HTML rendering to prevent XSS attacks using DOMPurify
 */

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { escapeHtml } from './sanitizer';

/**
 * Sanitize HTML content using DOMPurify
 * @param {string} html - HTML string to sanitize
 * @param {Object} options - Sanitization options
 * @param {string[]} [options.allowTags] - Allowed HTML tags (default: common safe tags)
 * @param {string[]} [options.allowAttributes] - Allowed HTML attributes (default: safe attributes)
 * @param {boolean} [options.allowLinks] - Allow anchor tags with href (default: true)
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html, options = {}) {
  if (typeof html !== 'string') {
    return '';
  }

  const { allowTags = [], allowAttributes = [], allowLinks = true } = options;

  // Default allowed tags (common safe tags)
  const defaultTags = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
  ];
  if (allowLinks) {
    defaultTags.push('a');
  }

  // Default allowed attributes
  const defaultAttributes = ['class', 'id'];
  if (allowLinks) {
    defaultAttributes.push('href', 'target', 'rel');
  }

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: allowTags.length > 0 ? allowTags : defaultTags,
    ALLOWED_ATTR: allowAttributes.length > 0 ? allowAttributes : defaultAttributes,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };

  // Sanitize using DOMPurify
  return DOMPurify.sanitize(html, config);
}

/**
 * Create safe HTML renderer component data
 * @param {string} html - HTML string
 * @param {Object} [options] - Sanitization options
 * @returns {{__html: string}} Vue component data for safe rendering
 */
export function createSafeHtml(html, options = {}) {
  return {
    __html: sanitizeHtml(html, options),
  };
}

/**
 * Check if content is safe to render
 * @param {string} content - Content to check
 * @returns {boolean} True if content appears safe
 */
export function isSafeContent(content) {
  if (typeof content !== 'string') {
    return true;
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Safe text renderer - always escapes HTML
 * Use this instead of v-html when possible
 * @param {string} text - Text to render
 * @returns {string} Escaped text
 */
export function safeText(text) {
  if (typeof text !== 'string') {
    return String(text || '');
  }
  return escapeHtml(text);
}

/**
 * Get DOMPurify configuration for custom use cases
 * @returns {Object} DOMPurify configuration object
 */
export function getDOMPurifyConfig() {
  return {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };
}

/** Options for sanitizing markdown-derived HTML (AI assistant answers). */
/** @type {{ allowTags: string[], allowAttributes: string[], allowLinks: boolean }} */
export const RICH_CHAT_HTML_OPTIONS = {
  allowTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
  ],
  allowAttributes: ['href', 'target', 'rel', 'class', 'id'],
  allowLinks: true,
};

/**
 * Parse markdown to HTML and sanitize for safe rendering (e.g. AI answer_markdown).
 * Uses marked + sanitizeHtml. Never render API HTML without sanitization.
 * @param {string} markdown - Markdown string
 * @returns {string} Sanitized HTML
 */
export function sanitizeMarkdown(markdown) {
  if (typeof markdown !== 'string') return '';
  try {
    const html = marked.parse(markdown);
    if (typeof html !== 'string') return '';
    return sanitizeHtml(html, RICH_CHAT_HTML_OPTIONS);
  } catch {
    return sanitizeHtml(markdown, RICH_CHAT_HTML_OPTIONS);
  }
}

/**
 * Sanitize trusted inline SVG fragments (nav icons, toast icons) for injection inside a host SVG element.
 * DOMPurify strips bare path/rect fragments in HTML context (empty result). Wrapping in an SVG
 * namespace and USE_PROFILES.svg keeps geometry while blocking scripts/event handlers.
 * @param {string} svgHtml - The SVG string to sanitize
 * @returns {string} Sanitized SVG fragment
 */
export function sanitizeNavIconSvg(svgHtml) {
  const raw = typeof svgHtml === 'string' ? svgHtml.trim() : '';
  if (!raw) return '';
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg">${raw}</svg>`;
  const clean = DOMPurify.sanitize(wrapped, { USE_PROFILES: { svg: true } });
  const openEnd = clean.indexOf('>');
  const closeStart = clean.toLowerCase().lastIndexOf('</svg>');
  if (openEnd === -1 || closeStart === -1 || closeStart <= openEnd) {
    return '';
  }
  return clean.slice(openEnd + 1, closeStart);
}

export default {
  sanitizeHtml,
  sanitizeMarkdown,
  createSafeHtml,
  isSafeContent,
  safeText,
  getDOMPurifyConfig,
  sanitizeNavIconSvg,
  RICH_CHAT_HTML_OPTIONS,
};
