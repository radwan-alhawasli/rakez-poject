/**
 * Validator Utils Tests
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import {
  ValidationResult,
  validateEmail,
  validatePhone,
  validateRequired,
  validateLength,
  validateNumber,
  validateUrl,
  validateDate,
  validatePassword,
  validateForm,
} from '../../src/utils/validator';

describe('validator', () => {
  describe('ValidationResult', () => {
    it('should create valid result with no errors', () => {
      const r = new ValidationResult(true);
      expect(r.isValid).toBe(true);
      expect(r.errors).toEqual([]);
    });

    it('should addError set isValid to false', () => {
      const r = new ValidationResult(true);
      r.addError('err1');
      expect(r.isValid).toBe(false);
      expect(r.errors).toContain('err1');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const r = validateEmail('user@example.com');
      expect(r.isValid).toBe(true);
    });

    it('should reject empty or non-string', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail(null).isValid).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('@nodomain.com').isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone number', () => {
      expect(validatePhone('0501234567').isValid).toBe(true);
    });

    it('should reject invalid phone number', () => {
      expect(validatePhone('abc').isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty value', () => {
      expect(validateRequired('x').isValid).toBe(true);
      expect(validateRequired(0).isValid).toBe(true);
    });

    it('should reject null, undefined, empty string', () => {
      expect(validateRequired(null).isValid).toBe(false);
      expect(validateRequired(undefined).isValid).toBe(false);
      expect(validateRequired('').isValid).toBe(false);
      expect(validateRequired('  ').isValid).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('should accept string within min/max', () => {
      expect(validateLength('hello', { min: 1, max: 10 }).isValid).toBe(true);
    });

    it('should reject when below min', () => {
      expect(validateLength('hi', { min: 5 }).isValid).toBe(false);
    });

    it('should reject when above max', () => {
      expect(validateLength('hello world', { max: 5 }).isValid).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should accept valid number', () => {
      expect(validateNumber(42).isValid).toBe(true);
      expect(validateNumber('42').isValid).toBe(true);
    });

    it('should reject non-numeric when required', () => {
      expect(validateNumber('abc', { required: true }).isValid).toBe(false);
    });

    it('should enforce min/max', () => {
      expect(validateNumber(5, { min: 1, max: 10 }).isValid).toBe(true);
      expect(validateNumber(0, { min: 1 }).isValid).toBe(false);
      expect(validateNumber(11, { max: 10 }).isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid https URL', () => {
      const r = validateUrl('https://example.com');
      expect(r.isValid).toBe(true);
    });

    it('should accept valid http URL', () => {
      expect(validateUrl('http://example.com').isValid).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
    });

    it('should reject empty URL when required', () => {
      expect(validateUrl('', { required: true }).isValid).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should accept valid date string', () => {
      expect(validateDate('2026-01-15').isValid).toBe(true);
    });

    it('should accept Date object', () => {
      expect(validateDate(new Date()).isValid).toBe(true);
    });

    it('should reject invalid date', () => {
      expect(validateDate('not-a-date').isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept password meeting min length', () => {
      expect(validatePassword('password1').isValid).toBe(true);
    });

    it('should reject short password', () => {
      expect(validatePassword('short').isValid).toBe(false);
    });

    it('should enforce requireLowercase by default', () => {
      expect(validatePassword('ALLUPPERCASE').isValid).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('should return isValid true when all rules pass', () => {
      const schema = {
        name: [{ type: 'required', message: 'Name' }],
        email: [{ type: 'email' }],
      };
      const formData = { name: 'Test', email: 'test@example.com' };
      const result = validateForm(formData, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid fields', () => {
      const schema = {
        name: [{ type: 'required' }],
        email: [{ type: 'email' }],
      };
      const formData = { name: '', email: 'bad' };
      const result = validateForm(formData, schema);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});
