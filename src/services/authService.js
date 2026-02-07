import apiClient from '../api/apiClient'
import { ROLE_MAP } from '../constants/roles'
import logger from '../utils/logger'

const AUTH_TOKEN_KEY = 'authToken'
const USER_INFO_KEY = 'userInfo'

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

            const { access_token, user } = response.data

            if (access_token) {
                localStorage.setItem(AUTH_TOKEN_KEY, access_token)

                // If user object is returned, save it. Otherwise create a mock one based on email
                const userData = user || {
                    name: 'Admin',
                    email: email,
                    type: 1 // Default to admin if nothing returned
                }

                // Normalize type if it comes as string "admin" from backend
                if (typeof userData.type === 'string' && ROLE_MAP[userData.type] !== undefined) {
                    userData.type = ROLE_MAP[userData.type]
                }

                localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData))

                return userData
            }

            throw new Error('No token received')
        } catch (error) {
            logger.error('Login error:', error)
            throw error
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiClient.post('/logout')
        } catch (error) {
            logger.error('Logout error:', error)
            // We continue to clear local storage even if API call fails
        } finally {
            this.clearSession()
        }
    },

    /**
     * Clear local storage session data
     */
    clearSession() {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_INFO_KEY)
    },

    /**
     * Get current logged in user info
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(USER_INFO_KEY)
        return userStr ? JSON.parse(userStr) : null
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem(AUTH_TOKEN_KEY)
    },

    /**
     * Get authentication token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY)
    }
}

export default authService
