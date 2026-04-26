/**
 * Authentication service: login, logout, session and current user.
 *
 * @module services/authService
 * @typedef {Object} AuthUser
 * @property {number|string} [id]
 * @property {string} [name]
 * @property {string} email
 * @property {number|string} type - Role type (see constants/roles)
 * @property {string} [role] - Text role (e.g. accounting) when present
 * @property {string[]} [permissions]
 * @property {boolean} [is_leader]
 * @property {boolean} [is_manager]
 */

import apiClient from '@/api/apiClient';
import { ROLE_MAP } from '@/constants/roles';
import secureStorage from '@/utils/secureStorage';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { getCaughtStatus } from '@/utils/caughtError';

const authService = {
  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<AuthUser>} User data
   */
  async login(email, password) {
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

        const userData = /** @type {AuthUser} */ ({ ...user });


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
  async logout() {
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
  clearSession() {
    secureStorage.clearSession();
  },

  /**
   * Get current logged in user info
   * @returns {Record<string, any>|null} User info or null
   */
  getCurrentUser() {
    return /** @type {AuthUser|null} */ (secureStorage.getUserInfo());
  },

  /**
   * Fetch current user from API (GET /user) and update storage.
   * Use after login or on app load to sync permissions and profile.
   * @returns {Promise<AuthUser|null>} Updated user or null on failure
   */
  async fetchCurrentUser() {
    if (!secureStorage.getToken()) return null;
    try {
      const response = await apiClient.get('/user');
      const user = response.data?.data ?? response.data?.user ?? response.data;
      if (!user) return /** @type {AuthUser|null} */ (this.getCurrentUser());

      const userData = /** @type {AuthUser} */ ({ ...user });
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
    } catch (error) {
      if (getCaughtStatus(error) === 401) {
        this.clearSession();
      }
      handleServiceError(error, 'Fetch current user', 'get', null);
      return /** @type {AuthUser|null} */ (this.getCurrentUser());
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
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
   * @returns {string|null}
   */
  getToken() {
    return secureStorage.getToken();
  },

  /**
   * Check if session is about to expire
   * @returns {boolean}
   */
  isSessionExpiring() {
    return secureStorage.shouldShowWarning();
  },

  /**
   * Get time until session expires
   * @returns {number} Milliseconds until expiration
   */
  getTimeUntilExpiration() {
    return secureStorage.getTimeUntilExpiration();
  },

  /**
   * Extend session
   */
  extendSession() {
    secureStorage.extendSession();
  },
};

export default authService;
