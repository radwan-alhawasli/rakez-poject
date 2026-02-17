/**
 * Error Handler Utils Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockToast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}))

vi.mock('../../src/config/appConfig', () => ({
  default: { isProduction: false, enableErrorReporting: false }
}))

vi.mock('../../src/composables/useToast', () => ({
  toast: mockToast
}))

import { ErrorTypes, ErrorSeverity, handleError, createError, retryWithBackoff } from '../../src/utils/errorHandler'

describe('errorHandler', () => {
  beforeEach(() => {
    mockToast.error.mockClear()
  })

  describe('ErrorTypes and ErrorSeverity', () => {
    it('should export ErrorTypes', () => {
      expect(ErrorTypes.NETWORK).toBe('NETWORK')
      expect(ErrorTypes.AUTHENTICATION).toBe('AUTHENTICATION')
    })

    it('should export ErrorSeverity', () => {
      expect(ErrorSeverity.HIGH).toBe('high')
      expect(ErrorSeverity.CRITICAL).toBe('critical')
    })
  })

  describe('createError', () => {
    it('should create Error with type and data', () => {
      const err = createError('msg', ErrorTypes.VALIDATION, { field: 'x' })
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('msg')
      expect(err.type).toBe(ErrorTypes.VALIDATION)
      expect(err.data).toEqual({ field: 'x' })
    })
  })

  describe('handleError', () => {
    it('should return error info and call toast when showNotification true', () => {
      const err = new Error('Test')
      err.response = { status: 500 }
      const result = handleError(err, { showNotification: true, log: false })
      expect(result.type).toBe(ErrorTypes.SERVER)
      expect(result.message).toBeDefined()
      expect(mockToast.error).toHaveBeenCalled()
    })

    it('should not call toast when showNotification false', () => {
      const err = new Error('Test')
      err.response = { status: 500 }
      handleError(err, { showNotification: false, log: false })
      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('should throw when throwError true', () => {
      const err = new Error('Test')
      err.response = { status: 403 }
      expect(() => handleError(err, { throwError: true, log: false, showNotification: false })).toThrow()
    })
  })

  describe('retryWithBackoff', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue(42)
      const result = await retryWithBackoff(fn, { maxRetries: 2 })
      expect(result).toBe(42)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable error then succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error('Network Error'), { code: 'ECONNABORTED' }))
        .mockResolvedValueOnce(1)
      const result = await retryWithBackoff(fn, { maxRetries: 2, initialDelay: 1 })
      expect(result).toBe(1)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should throw after maxRetries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network Error'))
      await expect(retryWithBackoff(fn, { maxRetries: 1, initialDelay: 1 })).rejects.toThrow('Network Error')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
