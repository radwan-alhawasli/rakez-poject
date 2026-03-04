/**
 * User Store (Pinia)
 * Manages user-related state and operations
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import userService from '@/services/userService';
import { useAuthStore } from './authStore';
import logger from '@/utils/logger';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([]);
  const currentUserProfile = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const allUsers = computed(() => users.value);
  const userCount = computed(() => users.value.length);
  const activeUsers = computed(() => users.value.filter(u => !u.disabled));
  const profile = computed(() => currentUserProfile.value);

  // Actions
  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await userService.getEmployees();
      const list = data?.items ?? (Array.isArray(data) ? data : data?.data || []);
      users.value = list;
      return users.value;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch users:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserById(userId) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await userService.getEmployee(userId);
      return data;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch user:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(userData) {
    isLoading.value = true;
    error.value = null;
    try {
      const newUser = await userService.addEmployee(userData);
      users.value.push(newUser);
      return newUser;
    } catch (err) {
      error.value = err;
      logger.error('Failed to create user:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(userId, userData) {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedUser = await userService.updateEmployee(userId, userData);
      const index = users.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (err) {
      error.value = err;
      logger.error('Failed to update user:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(userId) {
    isLoading.value = true;
    error.value = null;
    try {
      await userService.deleteEmployee(userId);
      users.value = users.value.filter(u => u.id !== userId);
    } catch (err) {
      error.value = err;
      logger.error('Failed to delete user:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUserProfile() {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;

    if (!currentUserId) {
      return null;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const profile = await userService.getEmployee(currentUserId);
      currentUserProfile.value = profile;
      return profile;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch user profile:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    users,
    currentUserProfile,
    isLoading,
    error,
    // Getters
    allUsers,
    userCount,
    activeUsers,
    profile,
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    fetchCurrentUserProfile,
    clearError,
  };
});
