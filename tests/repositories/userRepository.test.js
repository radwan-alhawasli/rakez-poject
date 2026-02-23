/**
 * User Repository Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import userRepository from '../../src/repositories/userRepository';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('userRepository', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  it('findAll should return array from response.data', async () => {
    const users = [{ id: 1, name: 'U1' }];
    mock.onGet('/users').reply(200, { data: users });

    const result = await userRepository.findAll();

    expect(mock.history.get.length).toBe(1);
    expect(result).toEqual(users);
  });

  it('findById should return user', async () => {
    const user = { id: 1, name: 'U1' };
    mock.onGet('/users/1').reply(200, { data: user });

    const result = await userRepository.findById(1);

    expect(result).toEqual(user);
  });

  it('create should post and return created user', async () => {
    const payload = { name: 'New', email: 'n@t.com' };
    mock.onPost('/users').reply(201, { data: { id: 1, ...payload } });

    const result = await userRepository.create(payload);

    expect(mock.history.post.length).toBe(1);
    expect(result).toHaveProperty('id', 1);
  });

  it('update should put and return updated user', async () => {
    mock.onPut('/users/1').reply(200, { data: { id: 1, name: 'Updated' } });

    const result = await userRepository.update(1, { name: 'Updated' });

    expect(mock.history.put.length).toBe(1);
    expect(result.name).toBe('Updated');
  });

  it('delete should call DELETE', async () => {
    mock.onDelete('/users/1').reply(200);

    await userRepository.delete(1);

    expect(mock.history.delete.length).toBe(1);
  });
});
