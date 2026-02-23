/**
 * Service Error Handler Tests
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../src/config/appConfig', () => ({
  default: { isDevelopment: true },
}));

import { handleServiceError, withErrorHandling } from '../../src/utils/serviceErrorHandler';

describe('serviceErrorHandler', () => {
  describe('handleServiceError', () => {
    it('should throw on 401 regardless of method', () => {
      const err = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      expect(() => handleServiceError(err, 'Login', 'get', {})).toThrow(err);
      expect(() => handleServiceError(err, 'Login', 'post', {})).toThrow(err);
    });

    it('should return default for GET + 403', () => {
      const err = new Error('Forbidden');
      err.response = { status: 403 };
      const result = handleServiceError(err, 'Fetch', 'get', { items: [], total: 0 });
      expect(result).toEqual({ items: [], total: 0 });
    });

    it('should return default for GET + 404', () => {
      const err = new Error('Not found');
      err.response = { status: 404 };
      const result = handleServiceError(err, 'Fetch', 'get', null);
      expect(result).toBeNull();
    });

    it('should throw for POST + 404', () => {
      const err = new Error('Not found');
      err.response = { status: 404 };
      expect(() => handleServiceError(err, 'Create', 'post', [])).toThrow(err);
    });

    it('should throw for GET + 500', () => {
      const err = new Error('Server error');
      err.response = { status: 500 };
      expect(() => handleServiceError(err, 'Fetch', 'get', [])).toThrow(err);
    });

    it('should throw when error has no response (network error)', () => {
      const err = new Error('Network Error');
      expect(() => handleServiceError(err, 'Fetch', 'get', [])).toThrow(err);
    });

    it('should use error.status when error.response is missing', () => {
      const err = new Error('Auth');
      err.status = 401;
      expect(() => handleServiceError(err, 'Auth', 'get', [])).toThrow(err);
    });
  });

  describe('withErrorHandling', () => {
    it('should return result when method succeeds', async () => {
      const fn = vi.fn().mockResolvedValue(42);
      const wrapped = withErrorHandling(fn, 'Test', 'get', []);
      const result = await wrapped(1, 2);
      expect(result).toBe(42);
      expect(fn).toHaveBeenCalledWith(1, 2);
    });

    it('should delegate to handleServiceError on throw', async () => {
      const err = new Error('Fail');
      err.response = { status: 404 };
      const fn = vi.fn().mockRejectedValue(err);
      const wrapped = withErrorHandling(fn, 'Test', 'get', { default: true });
      const result = await wrapped();
      expect(result).toEqual({ default: true });
    });

    it('should rethrow for non-GET errors', async () => {
      const err = new Error('Fail');
      err.response = { status: 404 };
      const fn = vi.fn().mockRejectedValue(err);
      const wrapped = withErrorHandling(fn, 'Create', 'post', []);
      await expect(wrapped()).rejects.toThrow(err);
    });
  });
});
