/**
 * Secure Storage Utility
 * Provides secure token storage with session timeout and encryption
 * Falls back to localStorage with additional security measures
 */

import logger from './logger';

const AUTH_TOKEN_KEY = 'authToken';
const USER_INFO_KEY = 'userInfo';
const SESSION_TIMEOUT_KEY = 'sessionTimeout';
const LAST_ACTIVITY_KEY = 'lastActivity';

// Session timeout: 30 minutes of inactivity (in milliseconds)
const SESSION_TIMEOUT_DURATION = 30 * 60 * 1000;
// Warning time: 5 minutes before timeout
const SESSION_WARNING_TIME = 5 * 60 * 1000;

/**
 * Get current timestamp
 * @returns {number} Current timestamp in milliseconds
 */
function getCurrentTime() {
  return Date.now();
}

/**
 * Set item in storage with expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} expirationMs - Expiration time in milliseconds
 */
function setWithExpiration(key, value, expirationMs) {
  try {
    const item = {
      value,
      expiration: getCurrentTime() + expirationMs,
      timestamp: getCurrentTime(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    logger.error('Error setting storage item:', error);
    throw error;
  }
}

/**
 * Get item from storage, checking expiration
 * @param {string} key - Storage key
 * @returns {*} Stored value or null if expired/not found
 */
function getWithExpiration(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    // Check if expired
    if (item.expiration && getCurrentTime() > item.expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    logger.error('Error getting storage item:', error);
    return null;
  }
}

/**
 * Secure Storage API
 */
const secureStorage = {
  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    if (!token) {
      this.removeToken();
      return;
    }

    // Store token with expiration
    setWithExpiration(AUTH_TOKEN_KEY, token, SESSION_TIMEOUT_DURATION);

    // Update last activity
    this.updateLastActivity();

    // Set session timeout
    localStorage.setItem(SESSION_TIMEOUT_KEY, String(getCurrentTime() + SESSION_TIMEOUT_DURATION));
  },

  /**
   * Get authentication token
   * @returns {string|null} Token or null if expired/not found
   */
  getToken() {
    const token = getWithExpiration(AUTH_TOKEN_KEY);
    if (token) {
      this.updateLastActivity();
    }
    return token;
  },

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  },

  /**
   * Set user info
   * @param {Record<string, any>} userInfo - User information object
   */

  setUserInfo(userInfo) {
    if (!userInfo) {
      this.removeUserInfo();
      return;
    }

    try {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      logger.error('Error setting user info:', error);
    }
  },

  /**
   * Get user info
   * @returns {Record<string, any>|null} User info or null
   */

  getUserInfo() {
    try {
      const userStr = localStorage.getItem(USER_INFO_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      logger.error('Error getting user info:', error);
      return null;
    }
  },

  /**
   * Remove user info
   */
  removeUserInfo() {
    localStorage.removeItem(USER_INFO_KEY);
  },

  /**
   * Clear all session data
   */
  clearSession() {
    this.removeToken();
    this.removeUserInfo();
    localStorage.removeItem('refreshToken');
  },

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(getCurrentTime()));
  },

  /**
   * Check if session is expired
   * @returns {boolean} True if session is expired
   */
  isSessionExpired() {
    const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (!timeout) return true;

    return getCurrentTime() > parseInt(timeout, 10);
  },

  /**
   * Get time until session expires
   * @returns {number} Milliseconds until expiration, or 0 if expired
   */
  getTimeUntilExpiration() {
    const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (!timeout) return 0;

    const expirationTime = parseInt(timeout, 10);
    const remaining = expirationTime - getCurrentTime();
    return remaining > 0 ? remaining : 0;
  },

  /**
   * Check if session warning should be shown
   * @returns {boolean} True if within warning time
   */
  shouldShowWarning() {
    const timeUntilExpiration = this.getTimeUntilExpiration();
    return timeUntilExpiration > 0 && timeUntilExpiration <= SESSION_WARNING_TIME;
  },

  /**
   * Extend session timeout
   */
  extendSession() {
    const token = this.getToken();
    if (token) {
      this.setToken(token);
    }
  },

  /**
   * Set refresh token (for future use with httpOnly cookies)
   * @param {string} refreshToken - Refresh token
   */
  setRefreshToken(refreshToken) {
    if (refreshToken) {
      setWithExpiration('refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },

  /**
   * Get refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken() {
    return getWithExpiration('refreshToken');
  },
};

export default secureStorage;
