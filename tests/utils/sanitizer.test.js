/**
 * Sanitizer Utils Tests
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}))

import {
  sanitizeString,
  escapeHtml,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeUrl,
  sanitizeObject,
  sanitizeArray,
  sanitizeValue,
  sanitizeFormData
} from '../../src/utils/sanitizer'

describe('sanitizer', () => {
  describe('sanitizeString', () => {
    it('should return non-string unchanged', () => {
      expect(sanitizeString(123)).toBe(123)
    })

    it('should trim and escape HTML by default', () => {
      expect(sanitizeString('  <script>  ')).not.toContain('<')
      expect(sanitizeString('  a  ')).toBe('a')
    })

    it('should remove null bytes', () => {
      expect(sanitizeString('a\x00b')).not.toContain('\x00')
    })

    it('should enforce maxLength when set', () => {
      expect(sanitizeString('hello world', { maxLength: 5 })).toBe('hello')
    })
  })

  describe('escapeHtml', () => {
    it('should escape < > & " \'', () => {
      expect(escapeHtml('<div>&"\'')).toContain('&lt;')
      expect(escapeHtml('<div>')).toContain('&gt;')
      expect(escapeHtml('&')).toContain('&amp;')
    })

    it('should return non-string unchanged', () => {
      expect(escapeHtml(1)).toBe(1)
    })
  })

  describe('sanitizeEmail', () => {
    it('should return lowercase trimmed email', () => {
      expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com')
    })

    it('should return empty for invalid format', () => {
      expect(sanitizeEmail('no-at-sign')).toBe('')
      expect(sanitizeEmail('')).toBe('')
    })
  })

  describe('sanitizePhone', () => {
    it('should keep digits and optional leading +', () => {
      expect(sanitizePhone('+966 50 123 4567')).toBe('+966501234567')
      expect(sanitizePhone('0501234567')).toBe('0501234567')
    })

    it('should return empty for too short/long', () => {
      expect(sanitizePhone('123')).toBe('')
      expect(sanitizePhone('1'.repeat(20))).toBe('')
    })
  })

  describe('sanitizeNumber', () => {
    it('should return number for valid input', () => {
      expect(sanitizeNumber('42')).toBe(42)
      expect(sanitizeNumber(42)).toBe(42)
    })

    it('should return null for NaN', () => {
      expect(sanitizeNumber('abc')).toBeNull()
    })

    it('should enforce min/max', () => {
      expect(sanitizeNumber(5, { min: 1, max: 10 })).toBe(5)
      expect(sanitizeNumber(0, { min: 1 })).toBeNull()
      expect(sanitizeNumber(11, { max: 10 })).toBeNull()
    })
  })

  describe('sanitizeUrl', () => {
    it('should return valid https URL', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    })

    it('should add https when requireProtocol true', () => {
      const result = sanitizeUrl('example.com')
      expect(result).toMatch(/^https:\/\//)
    })

    it('should return empty for invalid URL', () => {
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl('not a url')).toBe('')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const out = sanitizeObject({ a: '<b>', b: 'ok' })
      expect(out.a).not.toContain('<')
      expect(out.b).toBe('ok')
    })

    it('should return null/undefined unchanged', () => {
      expect(sanitizeObject(null)).toBeNull()
      expect(sanitizeObject(undefined)).toBeUndefined()
    })
  })

  describe('sanitizeArray', () => {
    it('should sanitize each element', () => {
      const out = sanitizeArray(['<x>', 'y'])
      expect(out[0]).not.toContain('<')
      expect(out[1]).toBe('y')
    })

    it('should return [] for non-array', () => {
      expect(sanitizeArray(null)).toEqual([])
    })
  })

  describe('sanitizeValue', () => {
    it('should dispatch by type', () => {
      expect(sanitizeValue('<x>')).not.toContain('<')
      expect(sanitizeValue(42)).toBe(42)
      expect(sanitizeValue([1, 2])).toEqual([1, 2])
    })
  })

  describe('sanitizeFormData', () => {
    it('should apply schema types', () => {
      const form = { email: '  User@X.COM  ', name: '  Bob  ' }
      const schema = { email: { type: 'email' }, name: { type: 'string' } }
      const out = sanitizeFormData(form, schema)
      expect(out.email).toBe('user@x.com')
      expect(out.name).toBe('Bob')
    })
  })
})
