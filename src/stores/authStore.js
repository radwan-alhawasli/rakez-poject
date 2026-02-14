/**
 * Authentication Store (Pinia)
 * Manages authentication state and user session
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'
import secureStorage from '../utils/secureStorage'
import logger from '../utils/logger'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const token = ref(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)

    // Getters
    const currentUser = computed(() => user.value)
    const authToken = computed(() => token.value)
    const isLoggedIn = computed(() => isAuthenticated.value && !!token.value)
    const userRole = computed(() => user.value?.type || null)
    const isAdmin = computed(() => userRole.value === 1 || userRole.value === 'admin')
    const isManager = computed(() => {
        if (!user.value) return false
        return isAdmin.value || (userRole.value === 3 && user.value.is_manager === true)
    })

    // Actions
    async function login(email, password) {
        isLoading.value = true
        try {
            const userData = await authService.login(email, password)
            user.value = userData
            token.value = secureStorage.getToken()
            isAuthenticated.value = true
            return userData
        } catch (error) {
            logger.error('Login failed:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function logout() {
        try {
            await authService.logout()
        } catch (error) {
            logger.error('Logout error:', error)
        } finally {
            user.value = null
            token.value = null
            isAuthenticated.value = false
        }
    }

    function initialize() {
        // Initialize from storage
        const storedUser = secureStorage.getUserInfo()
        const storedToken = secureStorage.getToken()

        if (storedUser && storedToken && !secureStorage.isSessionExpired()) {
            user.value = storedUser
            token.value = storedToken
            isAuthenticated.value = true
        } else {
            // Clear expired session
            if (secureStorage.isSessionExpired()) {
                clearSession()
            }
        }
    }

    function clearSession() {
        user.value = null
        token.value = null
        isAuthenticated.value = false
        secureStorage.clearSession()
    }

    function updateUser(userData) {
        user.value = { ...user.value, ...userData }
        secureStorage.setUserInfo(user.value)
    }

    function extendSession() {
        secureStorage.extendSession()
        token.value = secureStorage.getToken()
    }

    function checkSessionExpiry() {
        if (secureStorage.isSessionExpired()) {
            clearSession()
            return true
        }
        return false
    }

    function getTimeUntilExpiration() {
        return secureStorage.getTimeUntilExpiration()
    }

    function isSessionExpiring() {
        return secureStorage.shouldShowWarning()
    }

    // Initialize on store creation
    initialize()

    return {
        // State
        user,
        token,
        isAuthenticated,
        isLoading,
        // Getters
        currentUser,
        authToken,
        isLoggedIn,
        userRole,
        isAdmin,
        isManager,
        // Actions
        login,
        logout,
        initialize,
        clearSession,
        updateUser,
        extendSession,
        checkSessionExpiry,
        getTimeUntilExpiration,
        isSessionExpiring
    }
})
