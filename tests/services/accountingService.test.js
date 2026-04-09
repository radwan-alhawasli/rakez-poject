/**
 * Accounting Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import {
  createApiMock,
  resetMocks,
  restoreMocks,
  createSuccessResponse,
  createErrorResponse,
} from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import accountingService from '../../src/services/accountingService';

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const asList = result => (Array.isArray(result) ? result : result?.items || []);

describe('accountingService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getDashboard', () => {
    it('should fetch accounting dashboard metrics', async () => {
      const mockDashboard = { units_sold: 100, total_deposits: 5000000 };
      mock.onGet('/accounting/dashboard').reply(200, createSuccessResponse(mockDashboard));

      const result = await accountingService.getDashboard();

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should pass from_date and to_date query parameters', async () => {
      const params = { from_date: '2026-01-01', to_date: '2026-02-28' };
      mock.onGet('/accounting/dashboard').reply(config => {
        expect(config.params).toEqual(params);
        return [200, createSuccessResponse({})];
      });

      await accountingService.getDashboard(params);

      expect(mock.history.get.length).toBe(1);
    });

    it('should pass query parameters', async () => {
      const params = { from: '2026-01-01', to: '2026-02-28' };
      mock.onGet('/accounting/dashboard', { params }).reply(200, createSuccessResponse({}));

      await accountingService.getDashboard(params);

      expect(mock.history.get.length).toBe(1);
    });
  });

  describe('getNotifications', () => {
    it('should fetch accounting notifications', async () => {
      const mockNotifications = [{ id: 1, message: 'New deposit pending' }];
      mock.onGet('/accounting/notifications').reply(200, createSuccessResponse(mockNotifications));

      const result = await accountingService.getNotifications();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 1;
      mock
        .onPost(`/accounting/notifications/${notificationId}/read`)
        .reply(200, createSuccessResponse({ id: notificationId, read: true }));

      const result = await accountingService.markNotificationAsRead(notificationId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      mock
        .onPost('/accounting/notifications/read-all')
        .reply(200, createSuccessResponse({ success: true }));

      const result = await accountingService.markAllNotificationsAsRead();

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getClaimFileSoldUnits', () => {
    it('should fetch sold units for project and return array', async () => {
      const mockUnits = [
        { reservation_id: 292, unit_number: 'U-001', claim_amount: 34458.86 },
        { reservation_id: 63, unit_number: 'U-003', claim_amount: 29198.36 },
      ];
      mock
        .onGet('/accounting/claim-files/sold-units', { params: { contract_id: '2' } })
        .reply(200, {
          success: true,
          message: 'تم جلب المرشحين بنجاح',
          data: mockUnits,
          meta: { total: 8, per_page: 100, current_page: 1, last_page: 1 },
        });

      const result = await accountingService.getClaimFileSoldUnits('2');

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].params).toEqual({ contract_id: '2' });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].reservation_id).toBe(292);
      expect(result[0].unit_number).toBe('U-001');
    });

    it('should return empty array on 403', async () => {
      mock
        .onGet('/accounting/claim-files/sold-units')
        .reply(403, { success: false, message: 'Forbidden' });

      const result = await accountingService.getClaimFileSoldUnits('2');

      expect(result).toEqual([]);
    });
  });

  describe('getMarketers', () => {
    it('should fetch marketers as id and name', async () => {
      const mockMarketers = [
        { id: 1, name: 'M1' },
        { id: 2, email: 'm2@test.com' },
      ];
      mock.onGet('/accounting/marketers').reply(200, mockMarketers);

      const result = await accountingService.getMarketers();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({ id: 1, name: 'M1' });
      expect(result[1].name).toBe('m2@test.com');
    });

    it('should return empty array on error', async () => {
      mock.onGet('/accounting/marketers').reply(500, {});
      const result = await accountingService.getMarketers();
      expect(result).toEqual([]);
    });
  });

  describe('getSoldUnits', () => {
    it('should fetch sold units', async () => {
      const mockUnits = [{ id: 1, reservation_id: 100 }];
      mock.onGet('/accounting/sold-units').reply(200, createSuccessResponse(mockUnits));

      const result = await accountingService.getSoldUnits();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  describe('getSoldUnitById', () => {
    it('should fetch sold unit details', async () => {
      const reservationId = 100;
      const mockUnit = { id: reservationId, unit_number: 'A-101' };
      mock
        .onGet(`/accounting/sold-units/${reservationId}`)
        .reply(200, createSuccessResponse(mockUnit));

      const result = await accountingService.getSoldUnitById(reservationId);

      expect(result).toBeDefined();
    });
  });

  describe('createManualCommission', () => {
    it('should create manual commission', async () => {
      const reservationId = 100;
      const commissionData = { amount: 45000, commission_percentage: 3.0 };
      mock
        .onPost(`/accounting/sold-units/${reservationId}/commission`)
        .reply(201, createSuccessResponse({ id: 1, ...commissionData }));

      const result = await accountingService.createManualCommission(reservationId, commissionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('updateDistributions', () => {
    it('should update commission distributions', async () => {
      const commissionId = 1;
      const distributionData = { distributions: [{ user_id: 5, percentage: 25.0 }] };
      mock
        .onPut(`/accounting/commissions/${commissionId}/distributions`)
        .reply(200, createSuccessResponse({ id: commissionId, ...distributionData }));

      const result = await accountingService.updateDistributions(commissionId, distributionData);

      expect(mock.history.put.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('approveDistribution', () => {
    it('should approve commission distribution', async () => {
      const commissionId = 1;
      const distributionId = 10;
      mock
        .onPost(`/accounting/commissions/${commissionId}/distributions/${distributionId}/approve`)
        .reply(200, createSuccessResponse({ approved: true }));

      const result = await accountingService.approveDistribution(commissionId, distributionId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('rejectDistribution', () => {
    it('should reject commission distribution', async () => {
      const commissionId = 1;
      const distributionId = 10;
      const rejectionData = { notes: 'Invalid percentage' };
      mock
        .onPost(`/accounting/commissions/${commissionId}/distributions/${distributionId}/reject`)
        .reply(200, createSuccessResponse({ rejected: true }));

      const result = await accountingService.rejectDistribution(
        commissionId,
        distributionId,
        rejectionData
      );

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getCommissionSummary', () => {
    it('should fetch commission summary', async () => {
      const commissionId = 1;
      const mockSummary = { total: 45000, vat: 6750, net: 38250 };
      mock
        .onGet(`/accounting/commissions/${commissionId}/summary`)
        .reply(200, createSuccessResponse(mockSummary));

      const result = await accountingService.getCommissionSummary(commissionId);

      expect(result).toBeDefined();
    });

    it('should normalize total_before_tax to gross_amount', async () => {
      const commissionId = 1;
      const mockSummary = {
        total_before_tax: 45000,
        vat: 6750,
        net_amount: 38250,
        distributions: [],
      };
      mock.onGet(`/accounting/commissions/${commissionId}/summary`).reply(200, mockSummary);

      const result = await accountingService.getCommissionSummary(commissionId);

      expect(result.gross_amount).toBe(45000);
      expect(result.net_amount).toBe(38250);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm commission payment', async () => {
      const commissionId = 1;
      const distributionId = 10;
      mock
        .onPost(`/accounting/commissions/${commissionId}/distributions/${distributionId}/confirm`)
        .reply(200, createSuccessResponse({ confirmed: true }));

      const result = await accountingService.confirmPayment(commissionId, distributionId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should post JSON array body [] per API spec', async () => {
      const commissionId = 1;
      const distributionId = 10;
      mock
        .onPost(`/accounting/commissions/${commissionId}/distributions/${distributionId}/confirm`)
        .reply(200, createSuccessResponse({ confirmed: true }));

      await accountingService.confirmPayment(commissionId, distributionId);

      expect(JSON.parse(mock.history.post[0].data)).toEqual([]);
    });
  });

  describe('getPendingDeposits', () => {
    it('should fetch pending deposits', async () => {
      const mockDeposits = [{ id: 1, amount: 50000, status: 'pending' }];
      mock.onGet('/accounting/deposits/pending').reply(200, createSuccessResponse(mockDeposits));

      const result = await accountingService.getPendingDeposits();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  describe('confirmDeposit', () => {
    it('should confirm deposit receipt', async () => {
      const depositId = 1;
      const confirmationData = { confirmed_amount: 50000, confirmation_date: '2026-02-04' };
      mock
        .onPost(`/accounting/deposits/${depositId}/confirm`)
        .reply(200, createSuccessResponse({ id: depositId, confirmed: true }));

      const result = await accountingService.confirmDeposit(depositId, confirmationData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getDepositsFollowUp', () => {
    it('should fetch deposits requiring follow-up', async () => {
      const mockDeposits = [{ id: 1, requires_followup: true }];
      mock.onGet('/accounting/deposits/follow-up').reply(200, createSuccessResponse(mockDeposits));

      const result = await accountingService.getDepositsFollowUp();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  describe('processRefund', () => {
    it('should process deposit refund', async () => {
      const depositId = 1;
      const refundData = { refund_amount: 50000, reason: 'Unit vacated' };
      mock
        .onPost(`/accounting/deposits/${depositId}/refund`)
        .reply(200, createSuccessResponse({ id: depositId, refunded: true }));

      const result = await accountingService.processRefund(depositId, refundData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('generateClaimFile', () => {
    it('should generate deposit claim file', async () => {
      const reservationId = 100;
      mock
        .onPost(`/accounting/deposits/claim-file/${reservationId}`)
        .reply(200, createSuccessResponse({ file_url: 'https://example.com/claim.pdf' }));

      const result = await accountingService.generateClaimFile(reservationId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('confirmCommissionReceived', () => {
    it('should confirm commission received for reservation', async () => {
      const reservationId = 100;
      mock
        .onPost(`/accounting/deposits/${reservationId}/commission-received`)
        .reply(200, createSuccessResponse({ confirmed: true }));

      const result = await accountingService.confirmCommissionReceived(reservationId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getSalaries', () => {
    it('should fetch employee salaries', async () => {
      const mockSalaries = [{ employee_id: 1, base_salary: 8000, total_commissions: 12500 }];
      mock.onGet('/accounting/salaries').reply(200, createSuccessResponse(mockSalaries));

      const result = await accountingService.getSalaries();

      expect(Array.isArray(asList(result))).toBe(true);
    });

    it('should pass month and year parameters', async () => {
      const params = { month: 2, year: 2026 };
      mock.onGet('/accounting/salaries', { params }).reply(200, createSuccessResponse([]));

      await accountingService.getSalaries(params);

      expect(mock.history.get.length).toBe(1);
    });
  });

  describe('getEmployeeSalary', () => {
    it('should fetch employee salary details', async () => {
      const employeeId = 1;
      const params = { month: 2, year: 2026 };
      const mockSalary = { employee_id: employeeId, base_salary: 8000 };
      mock
        .onGet(`/accounting/salaries/${employeeId}`, { params })
        .reply(200, createSuccessResponse(mockSalary));

      const result = await accountingService.getEmployeeSalary(employeeId, params);

      expect(result).toBeDefined();
    });
  });

  describe('getEmployeeSalaryDetail', () => {
    it('should return same as getEmployeeSalary (alias)', async () => {
      const employeeId = 1;
      const params = { month: 2, year: 2026 };
      const mockSalary = { employee_id: employeeId, base_salary: 8000 };
      mock.onGet(`/accounting/salaries/${employeeId}`).reply(200, { data: mockSalary });

      const result = await accountingService.getEmployeeSalaryDetail(employeeId, params);

      expect(result).toBeDefined();
      expect(result.base_salary).toBe(8000);
    });
  });

  describe('createDistribution', () => {
    it('should create salary distribution', async () => {
      const employeeId = 1;
      const distributionData = {
        month: 2,
        year: 2026,
        base_salary: 8000,
        total_commissions: 12500,
      };
      mock
        .onPost(`/accounting/salaries/${employeeId}/distribute`)
        .reply(201, createSuccessResponse({ id: 1, ...distributionData }));

      const result = await accountingService.createDistribution(employeeId, distributionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('createSalaryDistribution', () => {
    it('should create salary distribution (alias)', async () => {
      const employeeId = 1;
      const distributionData = { month: 2, year: 2026, base_salary: 8000 };
      mock
        .onPost(`/accounting/salaries/${employeeId}/distribute`)
        .reply(201, createSuccessResponse({ id: 1 }));

      const result = await accountingService.createSalaryDistribution(employeeId, distributionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('approveSalaryDistribution', () => {
    it('should approve salary distribution', async () => {
      const distributionId = 1;
      mock
        .onPost(`/accounting/salaries/distributions/${distributionId}/approve`)
        .reply(200, createSuccessResponse({ approved: true }));

      const result = await accountingService.approveSalaryDistribution(distributionId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('markSalaryAsPaid', () => {
    it('should mark salary as paid with JSON array body [] per API spec', async () => {
      const distributionId = 1;
      mock
        .onPost(`/accounting/salaries/distributions/${distributionId}/paid`)
        .reply(200, createSuccessResponse({ paid: true }));

      const result = await accountingService.markSalaryAsPaid(distributionId);

      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual([]);
      expect(result).toBeDefined();
    });
  });

  describe('getPendingConfirmations', () => {
    it('should fetch pending confirmations (Legacy)', async () => {
      const mockConfirmations = [{ id: 1, reservation_id: 100 }];
      mock
        .onGet('/accounting/pending-confirmations')
        .reply(200, createSuccessResponse(mockConfirmations));

      const result = await accountingService.getPendingConfirmations();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  describe('confirmDownPayment', () => {
    it('should confirm down payment (Legacy)', async () => {
      const reservationId = 100;
      mock
        .onPost(`/accounting/confirmations/${reservationId}/confirm`)
        .reply(200, createSuccessResponse({ confirmed: true }));

      const result = await accountingService.confirmDownPayment(reservationId);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getConfirmationHistory', () => {
    it('should fetch confirmation history (Legacy)', async () => {
      const mockHistory = [{ id: 1, confirmed_at: '2026-02-01' }];
      mock
        .onGet('/accounting/confirmations/history')
        .reply(200, createSuccessResponse(mockHistory));

      const result = await accountingService.getConfirmationHistory();

      expect(Array.isArray(asList(result))).toBe(true);
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      mock.onGet('/accounting/dashboard').reply(400, createErrorResponse('Bad request', 400));

      await expect(accountingService.getDashboard()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized', async () => {
      mock.onGet('/accounting/sold-units').reply(401, createErrorResponse('Unauthorized', 401));

      await expect(accountingService.getSoldUnits()).rejects.toThrow();
    });

    it('should handle 403 Forbidden', async () => {
      mock
        .onPost('/accounting/sold-units/100/commission')
        .reply(403, createErrorResponse('Forbidden', 403));

      await expect(accountingService.createManualCommission(100, {})).rejects.toThrow();
    });

    it('should handle 422 Validation Error', async () => {
      mock
        .onPut('/accounting/commissions/1/distributions')
        .reply(422, createErrorResponse('Validation failed', 422));

      await expect(accountingService.updateDistributions(1, {})).rejects.toThrow();
    });

    it('should handle 404 Not Found', async () => {
      mock.onGet('/accounting/sold-units/999').reply(404, createErrorResponse('Not found', 404));

      await expect(accountingService.getSoldUnitById(999)).rejects.toThrow();
    });

    it('should handle 500 Server Error', async () => {
      mock.onGet('/accounting/dashboard').reply(500, createErrorResponse('Server error', 500));

      await expect(accountingService.getDashboard()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/accounting/dashboard').networkError();

      await expect(accountingService.getDashboard()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/accounting/sold-units').timeout();

      await expect(accountingService.getSoldUnits()).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/accounting/dashboard').reply(200, { data: null });

      const result = await accountingService.getDashboard();
      // When data is null, service returns {} (empty object)
      expect(result).toEqual({});
    });

    it('should handle missing data property', async () => {
      mock.onGet('/accounting/dashboard').reply(200, {});

      const result = await accountingService.getDashboard();
      expect(result).toEqual({});
    });

    it('should handle empty array response', async () => {
      mock.onGet('/accounting/sold-units').reply(200, { data: [] });

      const result = await accountingService.getSoldUnits();
      const items = asList(result);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should handle invalid reservation ID', async () => {
      mock
        .onGet('/accounting/sold-units/invalid')
        .reply(400, createErrorResponse('Invalid ID', 400));

      await expect(accountingService.getSoldUnitById('invalid')).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      mock
        .onPost('/accounting/sold-units/100/commission')
        .reply(422, createErrorResponse('Missing required fields', 422));

      await expect(accountingService.createManualCommission(100, {})).rejects.toThrow();
    });

    it('should handle zero reservation ID', async () => {
      mock.onGet('/accounting/sold-units/0').reply(400, createErrorResponse('Invalid ID', 400));

      await expect(accountingService.getSoldUnitById(0)).rejects.toThrow();
    });

    it('should handle negative reservation ID', async () => {
      mock.onGet('/accounting/sold-units/-1').reply(400, createErrorResponse('Invalid ID', 400));

      await expect(accountingService.getSoldUnitById(-1)).rejects.toThrow();
    });

    it('should handle empty query parameters', async () => {
      mock.onGet('/accounting/dashboard').reply(200, { data: {} });

      const result = await accountingService.getDashboard({});
      expect(result).toBeDefined();
    });
  });
});
