/**
 * Pagination Utils Tests
 */

import { describe, it, expect } from 'vitest';
import { extractPaginatedData, buildPaginationParams } from '../../src/utils/paginationUtils';

describe('paginationUtils', () => {
  describe('extractPaginatedData', () => {
    it('should extract from { data: [...], meta: { total } } (axios response)', () => {
      const response = { data: { data: [{ id: 1 }], meta: { total: 10, current_page: 1 } } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ id: 1 }]);
      expect(result.total).toBe(10);
    });

    it('should extract from { data: [...], meta: { pagination: { total } } }', () => {
      const response = { data: { data: [{ id: 1 }], meta: { pagination: { total: 5 } } } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ id: 1 }]);
      expect(result.total).toBe(5);
    });

    it('should extract from { data: [...], total: N } (axios response)', () => {
      const response = { data: { data: [1, 2, 3], total: 100 } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([1, 2, 3]);
      expect(result.total).toBe(100);
    });

    it('should extract from { items: [...], total: N }', () => {
      const response = { items: [{ a: 1 }], total: 1 };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ a: 1 }]);
      expect(result.total).toBe(1);
    });

    it('should extract from nested { data: { data: [...], total: N } }', () => {
      const response = { data: { data: [{ x: 1 }], total: 2 } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ x: 1 }]);
      expect(result.total).toBe(2);
    });

    it('should extract from legacy { employees: [...] }', () => {
      const response = { employees: [{ id: 1, name: 'A' }], meta: { total: 1 } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ id: 1, name: 'A' }]);
      expect(result.total).toBe(1);
    });

    it('should treat plain array as items with total = length', () => {
      const response = [1, 2, 3];
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([1, 2, 3]);
      expect(result.total).toBe(3);
    });

    it('should use fallback when response is null/undefined', () => {
      const resultNull = extractPaginatedData(null, [99]);
      expect(resultNull.items).toEqual([99]);
      expect(resultNull.total).toBe(0);
      const resultUndef = extractPaginatedData(undefined, [99]);
      expect(resultUndef.items).toEqual([99]);
    });

    it('should return fallback for null/undefined response', () => {
      expect(extractPaginatedData(null)).toEqual({ items: [], total: 0 });
      expect(extractPaginatedData(undefined, [0])).toEqual({ items: [0], total: 0 });
    });

    it('should accept response.data (axios-style)', () => {
      const axiosResponse = { data: { data: [1], meta: { total: 1 } } };
      const result = extractPaginatedData(axiosResponse);
      expect(result.items).toEqual([1]);
      expect(result.total).toBe(1);
    });

    it('should coerce total to number', () => {
      const response = { data: { data: [], meta: { total: '42' } } };
      const result = extractPaginatedData(response);
      expect(result.total).toBe(42);
    });

    it('should handle data.data object with nested data array', () => {
      const response = { data: { data: [1, 2], total: 2 } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([1, 2]);
      expect(result.total).toBe(2);
    });

    it('should handle data.data object with nested employees array', () => {
      const response = { data: { employees: [{ id: 1 }], total: 1 } };
      const result = extractPaginatedData(response);
      expect(result.items).toEqual([{ id: 1 }]);
      expect(result.total).toBe(1);
    });
  });

  describe('buildPaginationParams', () => {
    it('should return page and per_page with defaults', () => {
      const result = buildPaginationParams();
      expect(result).toEqual({ page: 1, per_page: 25 });
    });

    it('should accept custom page and perPage', () => {
      const result = buildPaginationParams(3, 50);
      expect(result).toEqual({ page: 3, per_page: 50 });
    });

    it('should merge extra params', () => {
      const result = buildPaginationParams(1, 10, { status: 'active' });
      expect(result).toEqual({ page: 1, per_page: 10, status: 'active' });
    });
  });
});
