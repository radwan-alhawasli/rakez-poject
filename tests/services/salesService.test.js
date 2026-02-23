/**
 * Sales Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import salesService from '../../src/services/salesService';

describe('salesService', () => {
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
    it('should fetch sales dashboard data', async () => {
      const mockDashboard = { total_sales: 1000000, active_projects: 5 };
      mock.onGet('/sales/dashboard').reply(200, { data: mockDashboard });

      const result = await salesService.getDashboard();

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getProjects', () => {
    it('should fetch list of projects', async () => {
      const mockProjects = [{ id: 1, name: 'Project 1' }];
      mock.onGet('/sales/projects').reply(200, { data: mockProjects });

      const result = await salesService.getProjects();

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getProjectDetails', () => {
    it('should fetch project details', async () => {
      const projectId = 1;
      const mockProject = { id: projectId, name: 'Project 1' };
      mock.onGet(`/sales/projects/${projectId}`).reply(200, { data: mockProject });

      const result = await salesService.getProjectDetails(projectId);

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('createReservation', () => {
    it('should create a reservation', async () => {
      const reservationData = { unit_id: 1, customer_name: 'Test Customer' };
      mock.onPost('/sales/reservations').reply(201, { data: { id: 1 } });

      const result = await salesService.createReservation(reservationData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('confirmReservation', () => {
    it('should confirm a reservation', async () => {
      const reservationId = 1;
      mock
        .onPost(`/sales/reservations/${reservationId}/confirm`)
        .reply(200, { data: { confirmed: true } });

      await salesService.confirmReservation(reservationId);

      expect(mock.history.post.length).toBe(1);
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', async () => {
      const reservationId = 1;
      mock
        .onPost(`/sales/reservations/${reservationId}/cancel`)
        .reply(200, { data: { cancelled: true } });

      await salesService.cancelReservation(reservationId);

      expect(mock.history.post.length).toBe(1);
    });
  });

  describe('getMyTargets', () => {
    it('should fetch user targets', async () => {
      const mockTargets = [{ id: 1, target: 1000000 }];
      mock.onGet('/sales/targets/my').reply(200, { data: mockTargets });

      const result = await salesService.getMyTargets();

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  // --- New Endpoints Tests ---

  describe('updateEmergencyContacts', () => {
    it('should update emergency contacts', async () => {
      const projectId = 1;
      const contactsData = { contacts: [{ name: 'John', phone: '123456789' }] };
      mock
        .onPatch(`/sales/projects/${projectId}/emergency-contacts`)
        .reply(200, { data: { updated: true } });

      const result = await salesService.updateEmergencyContacts(projectId, contactsData);

      expect(mock.history.patch.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('updateMyTarget', () => {
    it('should update my target', async () => {
      const targetData = { id: 1, target: 1500000 };
      mock.onPatch('/sales/targets/1').reply(200, { data: { updated: true } });

      const result = await salesService.updateMyTarget(targetData);

      expect(mock.history.patch.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getWaitingList', () => {
    it('should fetch waiting list', async () => {
      const mockWaitingList = [{ id: 1, unit_id: 1 }];
      mock.onGet('/sales/waiting-list').reply(200, { data: mockWaitingList });

      const result = await salesService.getWaitingList();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty waiting list', async () => {
      mock.onGet('/sales/waiting-list').reply(200, { data: [] });

      const result = await salesService.getWaitingList();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getWaitingListByUnit', () => {
    it('should fetch waiting list by unit', async () => {
      const unitId = 1;
      const mockWaitingList = [{ id: 1, unit_id: unitId }];
      mock.onGet(`/sales/waiting-list/unit/${unitId}`).reply(200, { data: mockWaitingList });

      const result = await salesService.getWaitingListByUnit(unitId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('addToWaitingList', () => {
    it('should add to waiting list', async () => {
      const waitingListData = { unit_id: 1, customer_name: 'Test Customer' };
      mock.onPost('/sales/waiting-list').reply(201, { data: { id: 1, ...waitingListData } });

      const result = await salesService.addToWaitingList(waitingListData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('convertToReservation', () => {
    it('should convert waiting list to reservation', async () => {
      const waitingListId = 1;
      const conversionData = {};
      mock
        .onPost(`/sales/waiting-list/${waitingListId}/convert`)
        .reply(200, { data: { reservation_id: 1 } });

      const result = await salesService.convertToReservation(waitingListId, conversionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('cancelWaitingListEntry', () => {
    it('should cancel waiting list entry', async () => {
      const id = 1;
      mock.onDelete(`/sales/waiting-list/${id}`).reply(200, { data: { cancelled: true } });

      const result = await salesService.cancelWaitingListEntry(id);

      expect(mock.history.delete.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getPendingNegotiations', () => {
    it('should fetch pending negotiations', async () => {
      const mockNegotiations = [{ id: 1, status: 'pending' }];
      mock.onGet('/sales/negotiations/pending').reply(200, { data: mockNegotiations });

      const result = await salesService.getPendingNegotiations();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty negotiations list', async () => {
      mock.onGet('/sales/negotiations/pending').reply(200, { data: [] });

      const result = await salesService.getPendingNegotiations();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('approveNegotiation', () => {
    it('should approve negotiation', async () => {
      const negotiationId = 1;
      const approvalData = {};
      mock
        .onPost(`/sales/negotiations/${negotiationId}/approve`)
        .reply(200, { data: { approved: true } });

      const result = await salesService.approveNegotiation(negotiationId, approvalData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('rejectNegotiation', () => {
    it('should reject negotiation', async () => {
      const negotiationId = 1;
      const rejectionData = { reason: 'Invalid terms' };
      mock
        .onPost(`/sales/negotiations/${negotiationId}/reject`)
        .reply(200, { data: { rejected: true } });

      const result = await salesService.rejectNegotiation(negotiationId, rejectionData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('updatePaymentInstallment', () => {
    it('should update payment installment', async () => {
      const installmentId = 1;
      const updateData = { amount: 50000 };
      mock
        .onPut(`/sales/payment-installments/${installmentId}`)
        .reply(200, { data: { id: installmentId, ...updateData } });

      const result = await salesService.updatePaymentInstallment(installmentId, updateData);

      expect(mock.history.put.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('deletePaymentInstallment', () => {
    it('should delete payment installment', async () => {
      const installmentId = 1;
      mock
        .onDelete(`/sales/payment-installments/${installmentId}`)
        .reply(200, { data: { deleted: true } });

      const result = await salesService.deletePaymentInstallment(installmentId);

      expect(mock.history.delete.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('updateMarketingTask', () => {
    it('should update marketing task', async () => {
      const taskId = 1;
      const updateData = { status: 'completed' };
      mock
        .onPatch(`/sales/marketing-tasks/${taskId}`)
        .reply(200, { data: { id: taskId, ...updateData } });

      const result = await salesService.updateMarketingTask(taskId, updateData);

      expect(mock.history.patch.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      mock.onGet('/sales/waiting-list').reply(400, { error: 'Bad request' });

      await expect(salesService.getWaitingList()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized', async () => {
      mock.onPost('/sales/waiting-list').reply(401, { error: 'Unauthorized' });

      await expect(salesService.addToWaitingList({})).rejects.toThrow();
    });

    it('should handle 403 Forbidden', async () => {
      mock.onPost('/sales/negotiations/1/approve').reply(403, { error: 'Forbidden' });

      await expect(salesService.approveNegotiation(1)).rejects.toThrow();
    });

    it('should handle 404 Not Found', async () => {
      mock.onGet('/sales/waiting-list/unit/999').reply(404, { error: 'Not found' });

      await expect(salesService.getWaitingListByUnit(999)).rejects.toThrow();
    });

    it('should handle 422 Validation Error', async () => {
      mock.onPatch('/sales/targets').reply(422, { error: 'Validation failed' });

      await expect(salesService.updateMyTarget({})).rejects.toThrow();
    });

    it('should handle 500 Server Error', async () => {
      mock.onGet('/sales/waiting-list').reply(500, { error: 'Server error' });

      await expect(salesService.getWaitingList()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/sales/waiting-list').networkError();

      await expect(salesService.getWaitingList()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onPost('/sales/waiting-list').timeout();

      await expect(salesService.addToWaitingList({})).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle invalid unit ID', async () => {
      mock.onGet('/sales/waiting-list/unit/invalid').reply(400, { error: 'Invalid ID' });

      await expect(salesService.getWaitingListByUnit('invalid')).rejects.toThrow();
    });

    it('should handle null response data', async () => {
      mock.onGet('/sales/waiting-list').reply(200, { data: null });

      const result = await salesService.getWaitingList();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty array response', async () => {
      mock.onGet('/sales/waiting-list').reply(200, { data: [] });

      const result = await salesService.getWaitingList();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle zero unit ID', async () => {
      mock.onGet('/sales/waiting-list/unit/0').reply(400, { error: 'Invalid ID' });

      await expect(salesService.getWaitingListByUnit(0)).rejects.toThrow();
    });

    it('should handle negative unit ID', async () => {
      mock.onGet('/sales/waiting-list/unit/-1').reply(400, { error: 'Invalid ID' });

      await expect(salesService.getWaitingListByUnit(-1)).rejects.toThrow();
    });

    it('should handle missing required fields in addToWaitingList', async () => {
      mock.onPost('/sales/waiting-list').reply(422, { error: 'Missing required fields' });

      await expect(salesService.addToWaitingList({})).rejects.toThrow();
    });

    it('should handle empty query parameters', async () => {
      mock.onGet('/sales/waiting-list').reply(200, { data: [] });

      const result = await salesService.getWaitingList({});
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
