/**
 * Commission Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import commissionService from '../../src/services/commissionService';

const asList = result => (Array.isArray(result) ? result : result?.items || []);

describe('commissionService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getCommissions', () => {
    it('should fetch list of commissions', async () => {
      const mockCommissions = [{ id: 1, amount: 5000, status: 'pending' }];
      mock.onGet('/sales/commissions').reply(200, { data: mockCommissions });

      const result = await commissionService.getCommissions();
      const items = asList(result);

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
    });
  });

  describe('createCommission', () => {
    it('should create a new commission', async () => {
      const commissionData = { contract_id: 1, amount: 5000, employee_id: 1 };
      mock.onPost('/sales/commissions').reply(201, { data: { id: 1 } });

      const result = await commissionService.createCommission(commissionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('calculateCommission', () => {
    it('should calculate commission', async () => {
      const calculationData = { contract_id: 1, unit_price: 500000, commission_rate: 2.5 };
      const mockCalculation = { total_commission: 12500 };
      mock.onPost('/sales/commissions/calculate').reply(200, { data: mockCalculation });

      const result = await commissionService.calculateCommission(calculationData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
      expect(result.total_commission).toBe(12500);
    });
  });

  describe('getDeposits', () => {
    it('should fetch list of deposits', async () => {
      const mockDeposits = [{ id: 1, amount: 10000, status: 'pending' }];
      mock.onGet('/sales/deposits').reply(200, { data: mockDeposits });

      const result = await commissionService.getDeposits();
      const items = asList(result);

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(1);
    });
  });

  describe('createDeposit', () => {
    it('should create a new deposit', async () => {
      const depositData = { contract_id: 1, amount: 10000, payment_method: 'bank_transfer' };
      mock.onPost('/sales/deposits').reply(201, { data: { id: 1 } });

      const result = await commissionService.createDeposit(depositData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('processDeposit', () => {
    it('should confirm deposit receipt (remapped from /process to /confirm-receipt)', async () => {
      const depositId = 1;
      const paymentData = { payment_reference: 'REF123', processed_at: '2026-01-01' };
      mock
        .onPost(`/sales/deposits/${depositId}/confirm-receipt`)
        .reply(200, { data: { processed: true } });

      const result = await commissionService.processDeposit(depositId, paymentData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getCommissionAnalytics', () => {
    it('should fetch analytics from remapped monthly-report path', async () => {
      mock
        .onGet('/sales/analytics/commissions/monthly-report')
        .reply(200, { data: { total: 100 } });

      const result = await commissionService.getCommissionAnalytics();

      expect(mock.history.get.length).toBe(1);
      expect(result.total).toBe(100);
    });
  });

  describe('updateCommission', () => {
    it('should update commission expenses via /expenses sub-path', async () => {
      mock.onPut('/sales/commissions/1/expenses').reply(200, { data: { id: 1, updated: true } });

      const result = await commissionService.updateCommission(1, { amount: 6000 });

      expect(mock.history.put.length).toBe(1);
      expect(result.updated).toBe(true);
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request for getCommissions', async () => {
      mock.onGet('/sales/commissions').reply(400, { error: 'Bad request' });

      await expect(commissionService.getCommissions()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized for createCommission', async () => {
      mock.onPost('/sales/commissions').reply(401, { error: 'Unauthorized' });

      await expect(commissionService.createCommission({})).rejects.toThrow();
    });

    it('should handle 403 Forbidden for calculateCommission', async () => {
      mock.onPost('/sales/commissions/calculate').reply(403, { error: 'Forbidden' });

      await expect(commissionService.calculateCommission({})).rejects.toThrow();
    });

    it('should handle 404 Not Found for processDeposit', async () => {
      mock.onPost('/sales/deposits/999/confirm-receipt').reply(404, { error: 'Not found' });

      await expect(commissionService.processDeposit(999, {})).rejects.toThrow();
    });

    it('should handle 422 Validation Error for createCommission', async () => {
      mock
        .onPost('/sales/commissions')
        .reply(422, { error: 'Validation failed', errors: { contract_id: ['Required'] } });

      await expect(commissionService.createCommission({})).rejects.toThrow();
    });

    it('should handle 500 Server Error for getDeposits', async () => {
      mock.onGet('/sales/deposits').reply(500, { error: 'Server error' });

      await expect(commissionService.getDeposits()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/sales/commissions').networkError();

      await expect(commissionService.getCommissions()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onPost('/sales/commissions/calculate').timeout();

      await expect(commissionService.calculateCommission({})).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/sales/commissions').reply(200, { data: null });

      const result = await commissionService.getCommissions();
      expect(Array.isArray(asList(result))).toBe(true);
    });

    it('should handle empty array response for getCommissions', async () => {
      mock.onGet('/sales/commissions').reply(200, { data: [] });

      const result = await commissionService.getCommissions();
      const items = asList(result);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should handle missing data property', async () => {
      mock.onGet('/sales/deposits').reply(200, {});

      const result = await commissionService.getDeposits();
      expect(result).toBeDefined();
    });

    it('should handle invalid deposit ID', async () => {
      mock.onPost('/sales/deposits/invalid/confirm-receipt').reply(400, { error: 'Invalid ID' });

      await expect(commissionService.processDeposit('invalid', {})).rejects.toThrow();
    });

    it('should handle empty commission data object', async () => {
      mock.onPost('/sales/commissions').reply(422, { error: 'Missing required fields' });

      await expect(commissionService.createCommission({})).rejects.toThrow();
    });

    it('should handle zero amount', async () => {
      mock.onPost('/sales/commissions').reply(422, { error: 'Amount must be greater than zero' });

      await expect(commissionService.createCommission({ amount: 0 })).rejects.toThrow();
    });
  });
});
