/**
 * User Store Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../../src/stores/userStore';
import userService from '../../src/services/userService';

vi.mock('../../src/services/userService', () => ({
  default: {
    getEmployees: vi.fn(),
    getEmployee: vi.fn(),
    addEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  },
}));

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({ currentUser: null })),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should have initial state and getters', () => {
    const store = useUserStore();
    expect(store.users).toEqual([]);
    expect(store.allUsers).toEqual([]);
    expect(store.userCount).toBe(0);
    expect(store.isLoading).toBe(false);
  });

  it('fetchUsers should set users on success', async () => {
    const mockUsers = [{ id: 1, name: 'U1' }];
    vi.mocked(userService.getEmployees).mockResolvedValue({ data: mockUsers });

    const store = useUserStore();
    await store.fetchUsers();

    expect(userService.getEmployees).toHaveBeenCalled();
    expect(store.users).toEqual(mockUsers);
    expect(store.userCount).toBe(1);
  });
});
