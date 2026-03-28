/**
 * Authentication service: login, logout, session and current user.
 *
 * @module services/authService
 */

import apiClient from '@/api/apiClient';
import { ROLE_MAP } from '@/constants/roles';
import secureStorage from '@/utils/secureStorage';
import { handleServiceError } from '@/utils/serviceErrorHandler';
// Import User type from our new TS file
import { type User as AuthUser } from '@/utils/rbac';

export type { AuthUser };

const authService = {
  /**
   * Login user with email and password
   * @param email - User email
   * @param password - User password
   * @returns User data
   */
  async login(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Use the base URL from apiClient configuration
      const response = await apiClient.post('/login', { email, password });

      // Support both: { data: { token, user } } (Postman) and { access_token, user }
      const token = response.data?.data?.token ?? response.data?.access_token;
      const user = response.data?.data?.user ?? response.data?.user;
      const refresh_token = response.data?.data?.refresh_token ?? response.data?.refresh_token;

      if (token) {
        // Use secure storage for token
        secureStorage.setToken(token);

        // Store refresh token if provided (for future use)
        if (refresh_token) {
          secureStorage.setRefreshToken(refresh_token);
        }

        if (!user) {
          throw new Error('Authentication failed: no user data returned');
        }

        const userData: AuthUser = { ...user };

        // Normalize type if it comes as string "admin" from backend
        if (typeof userData.type === 'string' && ROLE_MAP[userData.type] !== undefined) {
          userData.type = ROLE_MAP[userData.type];
        }

        // Preserve permissions from API when provided (otherwise rbac.getUserPermissions derives from role)
        if (user?.permissions) {
          userData.permissions = Array.isArray(user.permissions) ? user.permissions : [];
        }
        // Preserve is_leader and is_manager from API (Sales Leader = type 5 + is_manager true or is_leader true)
        if (user) {
          if ('is_leader' in user || 'isLeader' in user)
            userData.is_leader = user.is_leader ?? user.isLeader;
          if ('is_manager' in user || 'isManager' in user)
            userData.is_manager = user.is_manager ?? user.isManager;
        }

        secureStorage.setUserInfo(userData);

        return userData;
      }

      throw new Error('No token received');
    } catch (error) {
      return handleServiceError(error, 'Login', 'post', null);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      // Logout errors are handled gracefully - we continue to clear session even if API call fails
      handleServiceError(error, 'Logout', 'post', null);
    } finally {
      this.clearSession();
    }
  },

  /**
   * Clear session data
   */
  clearSession(): void {
    secureStorage.clearSession();
  },

  /**
   * Get current logged in user info (from storage)
   * @returns AuthUser | null
   */
  getCurrentUser(): AuthUser | null {
    return secureStorage.getUserInfo();
  },

  /**
   * Fetch current user from API (GET /user) and update storage.
   * Use after login or on app load to sync permissions and profile.
   * @returns Updated user or null on failure
   */
  async fetchCurrentUser(): Promise<AuthUser | null> {
    if (!secureStorage.getToken()) return null;
    try {
      const response = await apiClient.get('/user');
      const user = response.data?.data ?? response.data?.user ?? response.data;
      if (!user) return this.getCurrentUser();

      const userData: AuthUser = { ...user };
      if (typeof userData.type === 'string' && ROLE_MAP[userData.type] !== undefined) {
        userData.type = ROLE_MAP[userData.type];
      }
      if (user?.permissions && Array.isArray(user.permissions)) {
        userData.permissions = user.permissions;
      }
      if ('is_leader' in user || 'isLeader' in user)
        userData.is_leader = user.is_leader ?? user.isLeader;
      if ('is_manager' in user || 'isManager' in user)
        userData.is_manager = user.is_manager ?? user.isManager;

      secureStorage.setUserInfo(userData);
      return userData;
    } catch (error: any) {
      if (error?.status === 401) {
        this.clearSession();
      }
      handleServiceError(error, 'Fetch current user', 'get', null);
      return this.getCurrentUser();
    }
  },

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const token = secureStorage.getToken();
    if (!token) return false;

    // Check if session is expired
    if (secureStorage.isSessionExpired()) {
      this.clearSession();
      return false;
    }

    return true;
  },

  /**
   * Get authentication token
   * @returns string | null
   */
  getToken(): string | null {
    return secureStorage.getToken();
  },

  /**
   * Check if session is about to expire
   * @returns boolean
   */
  isSessionExpiring(): boolean {
    return secureStorage.shouldShowWarning();
  },

  /**
   * Get time until session expires
   * @returns Milliseconds until expiration (number)
   */
  getTimeUntilExpiration(): number {
    return secureStorage.getTimeUntilExpiration();
  },

  /**
   * Extend session
   */
  extendSession(): void {
    secureStorage.extendSession();
  },
};

export default authService;
