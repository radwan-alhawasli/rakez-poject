import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

export const creditNotificationsApi = {
  /**
   * List credit notifications
   * GET /credit/notifications?per_page=15
   * Optional proxy: GET /notifications (no /credit/) returns same for credit/admin when frontend uses a single URL.
   */
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get('/credit/notifications', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching credit notifications', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * List notifications via proxy (single URL for all roles)
   * GET /notifications?per_page=15 — for credit/admin returns same as /credit/notifications
   */
  async getNotificationsProxy(params = {}) {
    try {
      const response = await apiClient.get('/notifications', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching notifications (proxy)', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Mark notification as read
   * POST /credit/notifications/:notification_id/read
    * @param {any} notificationId
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await apiClient.post(`/credit/notifications/${notificationId}/read`);
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Error marking notification read', 'post');
    }
  },

  /**
   * Mark all notifications as read
   * POST /credit/notifications/read-all
   */
  async markAllNotificationsRead() {
    try {
      const response = await apiClient.post('/credit/notifications/read-all');
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Error marking all notifications read', 'post');
    }
  },
};
