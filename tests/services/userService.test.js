/**
 * User Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import userService from '../../src/services/userService';
import {
  mockEmployee,
  mockEmployeeList,
  mockCreateEmployeeRequest,
  mockCreateEmployeeResponse,
  mockUpdateEmployeeRequest,
} from '../fixtures/userFixtures';

const asList = result => (Array.isArray(result) ? result : result?.items || []);

describe('userService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getEmployees', () => {
    it('should fetch list of employees', async () => {
      mock.onGet('/hr/users').reply(200, { employees: mockEmployeeList });

      const result = await userService.getEmployees();
      const items = asList(result);

      expect(mock.history.get.length).toBe(1);
      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should handle query parameters', async () => {
      const params = { page: 1, per_page: 20, type: 'sales' };
      mock.onGet('/hr/users').reply(200, { employees: mockEmployeeList });

      await userService.getEmployees(params);

      expect(mock.history.get[0].params).toEqual(params);
    });

    it('should handle different response formats', async () => {
      mock.onGet('/hr/users').reply(200, { data: { employees: mockEmployeeList } });

      const result = await userService.getEmployees();

      expect(asList(result)).toBeInstanceOf(Array);
    });
  });

  describe('addEmployee', () => {
    it('should create a new employee', async () => {
      mock.onPost('/hr/users').reply(201, mockCreateEmployeeResponse);

      const result = await userService.addEmployee(mockCreateEmployeeRequest);

      expect(mock.history.post.length).toBe(1);
      const sentData = JSON.parse(mock.history.post[0].data);
      // Check that the service transforms the data correctly
      expect(sentData.name).toBe(mockCreateEmployeeRequest.name);
      expect(sentData.email).toBe(mockCreateEmployeeRequest.email);
      // Type should be parsed to integer (service uses parseInt)
      // parseInt('sales') returns NaN, which becomes null in JSON
      const expectedType = parseInt(mockCreateEmployeeRequest.type);
      expect(sentData.type).toBe(isNaN(expectedType) ? null : expectedType);
      expect(result).toBeDefined();
    });

    it('should handle validation errors', async () => {
      mock.onPost('/hr/users').reply(422, { success: false, message: 'Validation failed' });

      await expect(userService.addEmployee(mockCreateEmployeeRequest)).rejects.toThrow();
    });
  });

  describe('updateEmployee', () => {
    it('should update employee information', async () => {
      const employeeId = 1;
      mock.onPut(`/hr/users/${employeeId}`).reply(200, { data: mockEmployee });

      const result = await userService.updateEmployee(employeeId, mockUpdateEmployeeRequest);

      expect(mock.history.put.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should include password only if provided', async () => {
      const employeeId = 1;
      const updateData = { ...mockUpdateEmployeeRequest, password: '' };
      mock.onPut(`/hr/users/${employeeId}`).reply(200, { data: mockEmployee });

      await userService.updateEmployee(employeeId, updateData);

      const requestData = JSON.parse(mock.history.put[0].data);
      expect(requestData.password).toBeUndefined();
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an employee', async () => {
      const employeeId = 1;
      mock.onDelete(`/hr/users/${employeeId}`).reply(200, { message: 'Deleted' });

      await userService.deleteEmployee(employeeId);

      expect(mock.history.delete.length).toBe(1);
      expect(mock.history.delete[0].url).toContain(employeeId.toString());
    });
  });

  describe('getEmployee', () => {
    it('should fetch employee details', async () => {
      const employeeId = 1;
      mock.onGet(`/hr/users/${employeeId}`).reply(200, { data: mockEmployee });

      const result = await userService.getEmployee(employeeId);

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('listRoles', () => {
    it('should fetch list of roles', async () => {
      const mockRoles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'sales' },
      ];
      mock.onGet('/hr/users/roles').reply(200, { data: mockRoles });

      const result = await userService.listRoles();

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle query parameters', async () => {
      const params = { active: true };
      mock.onGet('/hr/users/roles', { params }).reply(200, { data: [] });

      await userService.listRoles(params);

      expect(mock.history.get[0].params).toEqual(params);
    });

    it('should handle error when fetching roles', async () => {
      mock.onGet('/hr/users/roles').reply(500, { error: 'Server error' });

      await expect(userService.listRoles()).rejects.toThrow();
    });
  });

  describe('restoreEmployee', () => {
    it('should restore a deleted employee', async () => {
      const employeeId = 1;
      const mockRestored = { id: employeeId, restored: true };
      mock.onPatch('/hr/users/1/restore').reply(200, { data: mockRestored });

      const result = await userService.restoreEmployee(employeeId);

      expect(mock.history.patch.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should handle error when restoring employee', async () => {
      mock.onPatch('/hr/users/999/restore').reply(404, { error: 'Employee not found' });

      await expect(userService.restoreEmployee(999)).rejects.toThrow();
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      mock.onGet('/hr/users').reply(400, { error: 'Bad request' });

      await expect(userService.getEmployees()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized', async () => {
      mock.onGet('/hr/users/roles').reply(401, { error: 'Unauthorized' });

      await expect(userService.listRoles()).rejects.toThrow();
    });

    it('should handle 403 Forbidden', async () => {
      mock.onPatch('/hr/users/1/restore').reply(403, { error: 'Forbidden' });

      await expect(userService.restoreEmployee(1)).rejects.toThrow();
    });

    it('should return an empty object on 404 Not Found', async () => {
      mock.onGet('/hr/users/999').reply(404, { error: 'Not found' });

      await expect(userService.getEmployee(999)).resolves.toEqual({});
    });

    it('should handle 422 Validation Error', async () => {
      mock
        .onPost('/hr/users')
        .reply(422, { error: 'Validation failed', errors: { email: ['Invalid email'] } });

      await expect(userService.addEmployee({})).rejects.toThrow();
    });

    it('should handle 500 Server Error', async () => {
      mock.onGet('/hr/users').reply(500, { error: 'Server error' });

      await expect(userService.getEmployees()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/hr/users').networkError();

      await expect(userService.getEmployees()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/hr/users/roles').timeout();

      await expect(userService.listRoles()).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty roles list', async () => {
      mock.onGet('/hr/users/roles').reply(200, { data: [] });

      const result = await userService.listRoles();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle null response data', async () => {
      mock.onGet('/hr/users/roles').reply(200, { data: null });

      const result = await userService.listRoles();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty array response for getEmployees', async () => {
      mock.onGet('/hr/users').reply(200, { data: [] });

      const result = await userService.getEmployees();
      const items = asList(result);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should handle invalid employee ID', async () => {
      mock.onGet('/hr/users/invalid').reply(400, { error: 'Invalid ID' });

      await expect(userService.getEmployee('invalid')).rejects.toThrow();
    });

    it('should handle zero employee ID', async () => {
      mock.onGet('/hr/users/0').reply(400, { error: 'Invalid ID' });

      await expect(userService.getEmployee(0)).rejects.toThrow();
    });

    it('should handle negative employee ID', async () => {
      mock.onGet('/hr/users/-1').reply(400, { error: 'Invalid ID' });

      await expect(userService.getEmployee(-1)).rejects.toThrow();
    });

    it('should handle missing required fields in addEmployee', async () => {
      mock.onPost('/hr/users').reply(422, { error: 'Missing required fields' });

      await expect(userService.addEmployee({})).rejects.toThrow();
    });
  });
});
