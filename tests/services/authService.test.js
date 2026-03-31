/**
 * Auth Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../utils/testSetup';
import secureStorage from '../../src/utils/secureStorage';
import authService from '../../src/services/authService';

const mockPost = vi.hoisted(() => vi.fn());
vi.mock('../../src/api/apiClient', () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    mockPost.mockReset();
    vi.mocked(secureStorage.getToken).mockReturnValue(null);
    vi.mocked(secureStorage.getUserInfo).mockReturnValue(null);
    vi.mocked(secureStorage.isSessionExpired).mockReturnValue(false);
    vi.mocked(secureStorage.shouldShowWarning).mockReturnValue(false);
  });

  describe('login', () => {
    it('should login and store token and user when API returns data with token', async () => {
      const userData = { id: 1, name: 'Admin', email: 'admin@test.com', type: 1 };
      const token = '1|abc123';
      mockPost.mockResolvedValue({ data: { data: { token, user: userData } } });

      const result = await authService.login('admin@test.com', 'password');

      expect(mockPost).toHaveBeenCalledWith('/login', {
        email: 'admin@test.com',
        password: 'password',
      });
      expect(secureStorage.setToken).toHaveBeenCalledWith(token);
      expect(secureStorage.setUserInfo).toHaveBeenCalledWith(userData);
      expect(result).toEqual(userData);
    });

    it('should support access_token response format', async () => {
      const userData = { name: 'User', email: 'u@test.com', type: 5 };
      mockPost.mockResolvedValue({ data: { access_token: 'bearer_xyz', user: userData } });

      const result = await authService.login('u@test.com', 'pass');

      expect(secureStorage.setToken).toHaveBeenCalledWith('bearer_xyz');
      expect(secureStorage.setUserInfo).toHaveBeenCalledWith(userData);
      expect(result).toEqual(userData);
    });

    it('should store refresh_token when provided', async () => {
      mockPost.mockResolvedValue({
        data: {
          data: { token: 't', refresh_token: 'rt', user: { name: 'U', email: 'u@t.com', type: 1 } },
        },
      });

      await authService.login('u@t.com', 'p');

      expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('rt');
    });

    it('should reject when API returns token but no user', async () => {
      mockPost.mockResolvedValue({ data: { data: { token: 't1' } } });

      await expect(authService.login('nouser@test.com', 'p')).rejects.toThrow(
        'Authentication failed: no user data returned'
      );
    });

    it('should normalize string role type using ROLE_MAP', async () => {
      mockPost.mockResolvedValue({
        data: { data: { token: 't', user: { name: 'U', email: 'u@t.com', type: 'sales' } } },
      });

      const result = await authService.login('u@t.com', 'p');

      expect(result.type).toBe(6);
    });

    it('should preserve permissions from API when provided', async () => {
      const perms = ['contracts.view', 'contracts.edit'];
      mockPost.mockResolvedValue({
        data: {
          data: { token: 't', user: { name: 'U', email: 'u@t.com', type: 1, permissions: perms } },
        },
      });

      const result = await authService.login('u@t.com', 'p');

      expect(secureStorage.setUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({ permissions: perms })
      );
      expect(result.permissions).toEqual(perms);
    });

    it('should throw when no token in response', async () => {
      mockPost.mockResolvedValue({ data: { data: { user: { name: 'U', type: 1 } } } });

      await expect(authService.login('u@t.com', 'p')).rejects.toThrow('No token received');
    });

    it('should call handleServiceError on API error', async () => {
      const err = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      mockPost.mockRejectedValue(err);

      await expect(authService.login('bad@test.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should post to /logout and clear session', async () => {
      mockPost.mockResolvedValue({ data: {} });

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/logout');
      expect(secureStorage.clearSession).toHaveBeenCalled();
    });

    it('should clear session even when logout API fails', async () => {
      mockPost.mockRejectedValue(new Error('Server error'));

      await expect(authService.logout()).rejects.toThrow('Server error');
      expect(secureStorage.clearSession).toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('should call secureStorage.clearSession', () => {
      authService.clearSession();
      expect(secureStorage.clearSession).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from secureStorage', () => {
      const user = { id: 1, name: 'Test' };
      vi.mocked(secureStorage.getUserInfo).mockReturnValue(user);

      expect(authService.getCurrentUser()).toBe(user);
    });

    it('should return null when no user', () => {
      vi.mocked(secureStorage.getUserInfo).mockReturnValue(null);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and session not expired', () => {
      vi.mocked(secureStorage.getToken).mockReturnValue('token');
      vi.mocked(secureStorage.isSessionExpired).mockReturnValue(false);

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      vi.mocked(secureStorage.getToken).mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should clear session and return false when session expired', () => {
      vi.mocked(secureStorage.getToken).mockReturnValue('token');
      vi.mocked(secureStorage.isSessionExpired).mockReturnValue(true);

      expect(authService.isAuthenticated()).toBe(false);
      expect(secureStorage.clearSession).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return token from secureStorage', () => {
      vi.mocked(secureStorage.getToken).mockReturnValue('secret');
      expect(authService.getToken()).toBe('secret');
    });
  });

  describe('isSessionExpiring', () => {
    it('should return secureStorage.shouldShowWarning', () => {
      vi.mocked(secureStorage.shouldShowWarning).mockReturnValue(true);
      expect(authService.isSessionExpiring()).toBe(true);
      vi.mocked(secureStorage.shouldShowWarning).mockReturnValue(false);
      expect(authService.isSessionExpiring()).toBe(false);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return secureStorage.getTimeUntilExpiration', () => {
      vi.mocked(secureStorage.getTimeUntilExpiration).mockReturnValue(120000);
      expect(authService.getTimeUntilExpiration()).toBe(120000);
    });
  });

  describe('extendSession', () => {
    it('should call secureStorage.extendSession', () => {
      authService.extendSession();
      expect(secureStorage.extendSession).toHaveBeenCalled();
    });
  });
});
