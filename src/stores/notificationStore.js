/**
 * Notification Store (Pinia)
 * Manages notification state and operations
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const allNotifications = computed(() => notifications.value);
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read));
  const readNotifications = computed(() => notifications.value.filter(n => n.read));

  // Actions
  async function initialize() {
    try {
      await notificationService.init();
      // Sync with service state
      notifications.value = notificationService.state.value || [];
      unreadCount.value = notificationService.unreadCount.value || 0;
    } catch (err) {
      error.value = err;
      logger.error('Failed to initialize notifications:', err);
    }
  }

  async function fetchAll() {
    isLoading.value = true;
    error.value = null;
    try {
      await notificationService.fetchAll();
      notifications.value = notificationService.state.value || [];
      unreadCount.value = notificationService.unreadCount.value || 0;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch notifications:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function addNotification(title, type = 'info', options = {}) {
    notificationService.addNotification(title, type, options);
    // Sync state
    notifications.value = notificationService.state.value || [];
    unreadCount.value = notificationService.unreadCount.value || 0;
  }

  async function markAsRead(notificationId) {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (err) {
      error.value = err;
      logger.error('Failed to mark notification as read:', err);
      throw err;
    }
  }

  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      notifications.value.forEach(n => {
        n.read = true;
      });
      unreadCount.value = 0;
    } catch (err) {
      error.value = err;
      logger.error('Failed to mark all as read:', err);
      throw err;
    }
  }

  function clearError() {
    error.value = null;
  }

  // Watch service state changes
  function syncWithService() {
    notifications.value = notificationService.state.value || [];
    unreadCount.value = notificationService.unreadCount.value || 0;
  }

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    // Getters
    allNotifications,
    unreadNotifications,
    readNotifications,
    // Actions
    initialize,
    fetchAll,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearError,
    syncWithService,
  };
});
