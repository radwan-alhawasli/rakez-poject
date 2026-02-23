/**
 * Contract Repository Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import contractRepository from '../../src/repositories/contractRepository';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('contractRepository', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  it('findAll should return array from response', async () => {
    const contracts = [{ id: 1, project_name: 'P1' }];
    mock.onGet('/contracts/index').reply(200, { data: contracts });

    const result = await contractRepository.findAll();

    expect(mock.history.get.length).toBe(1);
    expect(result).toEqual(contracts);
  });

  it('findById should return contract', async () => {
    const contract = { id: 1, project_name: 'P1' };
    mock.onGet('/contracts/show/1').reply(200, { data: contract });

    const result = await contractRepository.findById(1);

    expect(result).toEqual(contract);
  });

  it('create should post and return created contract', async () => {
    const payload = { project_name: 'New' };
    mock.onPost('/contracts/store').reply(201, { data: { id: 1, ...payload } });

    const result = await contractRepository.create(payload);

    expect(mock.history.post.length).toBe(1);
    expect(result).toHaveProperty('id', 1);
  });

  it('update should put and return updated contract', async () => {
    mock.onPut('/contracts/update/1').reply(200, { data: { id: 1, project_name: 'Updated' } });

    const result = await contractRepository.update(1, { project_name: 'Updated' });

    expect(mock.history.put.length).toBe(1);
    expect(result.project_name).toBe('Updated');
  });
});
