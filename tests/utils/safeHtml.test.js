/**
 * Safe HTML Utils Tests
 */

import { describe, it, expect, vi } from 'vitest'

const mockSanitize = vi.fn((html) => (typeof html === 'string' ? html.replace(/<script>/gi, '') : ''))
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html, config) => mockSanitize(html)
  }
}))

vi.mock('../../src/utils/sanitizer', () => ({
  escapeHtml: (text) => {
    if (typeof text !== 'string') return text
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}))

import { sanitizeHtml, createSafeHtml, isSafeContent, safeText, getDOMPurifyConfig } from '../../src/utils/safeHtml'

describe('safeHtml', () => {
  describe('sanitizeHtml', () => {
    it('should return empty string for non-string', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(123)).toBe('')
    })

    it('should call DOMPurify sanitize', () => {
      mockSanitize.mockReturnValueOnce('safe')
      expect(sanitizeHtml('<p>hello</p>')).toBe('safe')
      expect(mockSanitize).toHaveBeenCalledWith('<p>hello</p>')
    })
  })

  describe('createSafeHtml', () => {
    it('should return object with __html', () => {
      mockSanitize.mockReturnValueOnce('x')
      const result = createSafeHtml('input')
      expect(result).toEqual({ __html: 'x' })
    })
  })

  describe('isSafeContent', () => {
    it('should return true for non-string', () => {
      expect(isSafeContent(null)).toBe(true)
      expect(isSafeContent(1)).toBe(true)
    })

    it('should return false for script tag', () => {
      expect(isSafeContent('<script>alert(1)</script>')).toBe(false)
    })

    it('should return false for javascript: URL', () => {
      expect(isSafeContent('javascript:void(0)')).toBe(false)
    })

    it('should return false for event handler', () => {
      expect(isSafeContent('<div onclick="x">')).toBe(false)
    })

    it('should return true for plain text', () => {
      expect(isSafeContent('Hello world')).toBe(true)
    })
  })

  describe('safeText', () => {
    it('should escape HTML', () => {
      const out = safeText('<script>')
      expect(out).toContain('&lt;')
      expect(out).not.toContain('<')
    })

    it('should return string for non-string', () => {
      expect(safeText(null)).toBe('')
      expect(safeText(1)).toBe('1')
    })
  })

  describe('getDOMPurifyConfig', () => {
    it('should return config with ALLOWED_TAGS and ALLOWED_ATTR', () => {
      const config = getDOMPurifyConfig()
      expect(config.ALLOWED_TAGS).toBeDefined()
      expect(Array.isArray(config.ALLOWED_TAGS)).toBe(true)
      expect(config.ALLOWED_ATTR).toBeDefined()
      expect(config.KEEP_CONTENT).toBe(true)
    })
  })
})
