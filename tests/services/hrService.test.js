import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import * as hrService from '../../src/services/hrService';

describe('hrService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  it('getDashboardMetrics returns dashboard payload', async () => {
    mock.onGet('/hr/dashboard').reply(200, { data: { total_employees: 10 } });
    const result = await hrService.getDashboardMetrics();
    expect(result).toBeDefined();
  });

  it('getEmployees returns paginated shape', async () => {
    mock.onGet('/hr/users').reply(200, { data: [{ id: 1 }], meta: { total: 1 } });
    const result = await hrService.getEmployees();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.total).toBe(1);
  });

  it('getEmployeeById returns employee details', async () => {
    mock.onGet('/hr/users/1').reply(200, { data: { id: 1, name: 'User 1' } });
    const result = await hrService.getEmployeeById(1);
    expect(result).toBeDefined();
  });

  it('getTeams returns paginated teams', async () => {
    mock.onGet('/hr/teams').reply(200, { data: [{ id: 1, name: 'A' }], meta: { total: 1 } });
    const result = await hrService.getTeams();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.total).toBe(1);
  });
});
