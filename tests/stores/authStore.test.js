/**
 * Auth Store Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../src/stores/authStore';
import authService from '../../src/services/authService';
import secureStorage from '../../src/utils/secureStorage';

vi.mock('../../src/services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: vi.fn(() => null),
    getUserInfo: vi.fn(() => null),
    clearSession: vi.fn(),
    isSessionExpired: vi.fn(() => false),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(secureStorage.getToken).mockReturnValue(null);
    vi.mocked(secureStorage.getUserInfo).mockReturnValue(null);
    vi.mocked(secureStorage.isSessionExpired).mockReturnValue(false);
  });

  it('should have initial state', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoggedIn).toBe(false);
  });

  it('login should set user and token on success', async () => {
    const userData = { id: 1, name: 'Test', type: 1 };
    vi.mocked(authService.login).mockResolvedValue(userData);
    vi.mocked(secureStorage.getToken).mockReturnValue('token-123');

    const store = useAuthStore();
    await store.login('test@test.com', 'pass');

    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'pass');
    expect(store.user).toEqual(userData);
    expect(store.token).toBe('token-123');
    expect(store.isAuthenticated).toBe(true);
    expect(store.isLoggedIn).toBe(true);
  });

  it('login should throw on authService failure', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

    const store = useAuthStore();
    await expect(store.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('logout should clear state', async () => {
    vi.mocked(authService.logout).mockResolvedValue();
    const store = useAuthStore();
    store.user = { id: 1 };
    store.token = 'x';
    store.isAuthenticated = true;

    await store.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('initialize should restore from storage when valid', () => {
    const user = { id: 1, name: 'Stored' };
    vi.mocked(secureStorage.getUserInfo).mockReturnValue(user);
    vi.mocked(secureStorage.getToken).mockReturnValue('stored-token');
    vi.mocked(secureStorage.isSessionExpired).mockReturnValue(false);

    const store = useAuthStore();
    store.initialize();

    expect(store.user).toEqual(user);
    expect(store.token).toBe('stored-token');
    expect(store.isAuthenticated).toBe(true);
  });

  it('initialize should clear when session expired', () => {
    vi.mocked(secureStorage.getUserInfo).mockReturnValue({ id: 1 });
    vi.mocked(secureStorage.getToken).mockReturnValue('x');
    vi.mocked(secureStorage.isSessionExpired).mockReturnValue(true);

    const store = useAuthStore();
    store.initialize();

    expect(secureStorage.clearSession).toHaveBeenCalled();
  });

  it('clearSession should reset state and call secureStorage.clearSession', () => {
    const store = useAuthStore();
    store.user = { id: 1 };
    store.token = 'x';
    store.isAuthenticated = true;

    store.clearSession();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(secureStorage.clearSession).toHaveBeenCalled();
  });

  it('currentUser and userRole getters', () => {
    const store = useAuthStore();
    store.user = { id: 1, name: 'U', type: 5 };
    expect(store.currentUser).toEqual({ id: 1, name: 'U', type: 5 });
    expect(store.userRole).toBe(5);
  });

  it('isAdmin getter', () => {
    const store = useAuthStore();
    store.user = { type: 1 };
    expect(store.isAdmin).toBe(true);
    store.user = { type: 5 };
    expect(store.isAdmin).toBe(false);
  });
});
