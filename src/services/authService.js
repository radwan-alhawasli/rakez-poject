import apiClient from '../api/apiClient'
import { ROLE_MAP } from '../constants/roles'
import secureStorage from '../utils/secureStorage'
import { handleServiceError } from '../utils/serviceErrorHandler'

const authService = {
    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} User data
     */
    async login(email, password) {
        try {
            // Use the base URL from apiClient configuration
            const response = await apiClient.post('/login', { email, password })

            // Support both: { data: { token, user } } (Postman) and { access_token, user }
            const token = response.data?.data?.token ?? response.data?.access_token
            const user = response.data?.data?.user ?? response.data?.user
            const refresh_token = response.data?.data?.refresh_token ?? response.data?.refresh_token

            if (token) {
                // Use secure storage for token
                secureStorage.setToken(token)
                
                // Store refresh token if provided (for future use)
                if (refresh_token) {
                    secureStorage.setRefreshToken(refresh_token)
                }

                // If user object is returned, save it. Otherwise create a mock one based on email
                const userData = user ? { ...user } : {
                    name: 'Admin',
                    email: email,
                    type: 1 // Default to admin if nothing returned
                }

                // Normalize type if it comes as string "admin" from backend
                if (typeof userData.type === 'string' && ROLE_MAP[userData.type] !== undefined) {
                    userData.type = ROLE_MAP[userData.type]
                }

                // Preserve permissions from API when provided (otherwise rbac.getUserPermissions derives from role)
                if (user?.permissions) {
                    userData.permissions = Array.isArray(user.permissions) ? user.permissions : []
                }

                secureStorage.setUserInfo(userData)

                return userData
            }

            throw new Error('No token received')
        } catch (error) {
            return handleServiceError(error, 'Login', 'post', null)
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiClient.post('/logout')
        } catch (error) {
            // Logout errors are handled gracefully - we continue to clear session even if API call fails
            handleServiceError(error, 'Logout', 'post', null)
        } finally {
            this.clearSession()
        }
    },

    /**
     * Clear session data
     */
    clearSession() {
        secureStorage.clearSession()
    },

    /**
     * Get current logged in user info
     * @returns {Object|null}
     */
    getCurrentUser() {
        return secureStorage.getUserInfo()
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = secureStorage.getToken()
        if (!token) return false
        
        // Check if session is expired
        if (secureStorage.isSessionExpired()) {
            this.clearSession()
            return false
        }
        
        return true
    },

    /**
     * Get authentication token
     * @returns {string|null}
     */
    getToken() {
        return secureStorage.getToken()
    },

    /**
     * Check if session is about to expire
     * @returns {boolean}
     */
    isSessionExpiring() {
        return secureStorage.shouldShowWarning()
    },

    /**
     * Get time until session expires
     * @returns {number} Milliseconds until expiration
     */
    getTimeUntilExpiration() {
        return secureStorage.getTimeUntilExpiration()
    },

    /**
     * Extend session
     */
    extendSession() {
        secureStorage.extendSession()
    }
}

export default authService
