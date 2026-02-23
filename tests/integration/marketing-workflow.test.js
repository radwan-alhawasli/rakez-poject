import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import marketingService from '../../src/services/marketingService';

describe('marketing workflow integration', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  it('refreshes dashboard after expected sale create', async () => {
    mock.onPost('/marketing/expected-sales').reply(200, { data: { id: 1, project_id: 1 } });
    mock.onGet('/marketing/dashboard').reply(200, {
      data: { total_expected_bookings: 22, total_expected_booking_value: 1000000 },
    });

    await marketingService.createExpectedSale({ project_id: 1 });
    const dashboard = await marketingService.getDashboard();

    expect(dashboard.total_expected_bookings).toBe(22);
    expect(dashboard.total_expected_booking_value).toBe(1000000);
  });
});
