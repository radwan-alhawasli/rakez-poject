import { ref } from 'vue';
import apiClient from '@/api/apiClient';
import authService from './authService';
import { createPusher } from '@/plugins/pusher';
import logger from '@/utils/logger';
import { ROLE_ADMIN, ROLE_ACCOUNTING } from '@/constants/roles';

const notifications = ref([]);
const unreadCount = ref(0);
let pusher = null;
let channels = [];

const isNotFoundError = error => {
  const status = error?.status || error?.response?.status;
  const message = String(error?.message || '').toLowerCase();
  return status === 404 || message.includes('could not be found');
};

const normalizeNotifications = response => {
  const data = response?.data?.data ?? response?.data?.notifications ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const notificationService = {
  state: notifications,
  unreadCount,

  getAll() {
    return this.state;
  },

  /**
   * Initialize notifications and WebSocket listeners
   */
  async init() {
    if (!authService.isAuthenticated()) return;

    const user = authService.getCurrentUser();
    const token = authService.getToken();

    // 1. Fetch existing notifications
    await this.fetchAll();

    // 2. Setup Pusher only when key is configured (avoids ws://... failed when Reverb not running or wrong port)
    if (!pusher) {
      pusher = createPusher(token);
    }
    if (!pusher) return;

    // Subscribe to Public
    const publicChannel = pusher.subscribe('public-notifications');
    publicChannel.bind('public.notification', data => {
      this.addReceivedNotification(data, 'public');
    });
    channels.push(publicChannel);

    // Subscribe to User Private
    if (user && user.id) {
      const userChannel = pusher.subscribe(`private-user-notifications.${user.id}`);
      userChannel.bind('user.notification', data => {
        this.addReceivedNotification(data, 'private');
      });
      channels.push(userChannel);
    }

    // Subscribe to Admin Private
    if (user && user.type === ROLE_ADMIN) {
      const adminChannel = pusher.subscribe('private-admin-notifications');
      adminChannel.bind('admin.notification', data => {
        this.addReceivedNotification(data, 'admin');
      });
      channels.push(adminChannel);
    }
  },

  /**
   * Fetch all notifications from API (collection-first)
   * GET /notifications, /notifications/public, /admin/notifications (if admin)
   * @returns {Promise<void>} Updates internal notifications state
   */
  async fetchAll() {
    const user = authService.getCurrentUser();
    const isAdmin = user && user.type === ROLE_ADMIN;
    const isAccounting =
      user &&
      (user.type === ROLE_ACCOUNTING ||
        String(user.type) === String(ROLE_ACCOUNTING) ||
        String(user.role || '').toLowerCase() === 'accounting');

    const fetchSafe = async path => {
      try {
        const response = await apiClient.get(path);
        return normalizeNotifications(response);
      } catch (error) {
        if (!isNotFoundError(error)) {
          logger.warn(`Notifications endpoint failed: ${path}`, error?.message || error);
        }
        return [];
      }
    };

    try {
      const privatePath = isAccounting ? '/accounting/notifications' : '/notifications';
      const [privateNotifs, adminNotifs] = await Promise.all([
        fetchSafe(privatePath),
        isAdmin ? fetchSafe('/admin/notifications') : Promise.resolve([]),
      ]);

      const all = [...privateNotifs, ...adminNotifs].map(n => ({
        id: n.id,
        title: n.message || n.title,
        time: n.created_at,
        read: !!n.read_at || n.status === 'read',
        type: n.type || n.event_type || 'info',
        eventType: n.event_type || null,
        status: n.status || (n.read_at ? 'read' : 'pending'),
        actionRequired: !n.read_at && n.status !== 'read',
      }));

      // Sort by date newest first
      notifications.value = all.sort((a, b) => new Date(b.time) - new Date(a.time));
      this.updateUnreadCount();
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      notifications.value = [];
      this.updateUnreadCount();
    }
  },

  /**
   * Send public notification (Admin only)
   * POST /admin/notifications/send-public
   * @param {string|{title: string, body: string}} messageOrObj - Message string (mapped to body with default title) or {title, body}
   * @returns {Promise<Object>} Sent notification data
   */
  async sendPublicNotification(messageOrObj) {
    try {
      const payload =
        typeof messageOrObj === 'string'
          ? { title: 'إشعار', body: messageOrObj }
          : { title: messageOrObj.title, body: messageOrObj.body };
      const response = await apiClient.post('/admin/notifications/send-public', payload);
      return response.data;
    } catch (error) {
      logger.error('Error sending public notification:', error);
      throw error;
    }
  },

  /**
   * Send notification to specific user (Admin only)
   * POST /admin/notifications/send-to-user
   * @param {number|string} userId - User ID
   * @param {string|{title: string, body: string}} messageOrObj - Message string (mapped to body with default title) or {title, body}
   * @returns {Promise<Object>} Sent notification data
   */
  async sendUserNotification(userId, messageOrObj) {
    try {
      const content =
        typeof messageOrObj === 'string'
          ? { title: 'إشعار', body: messageOrObj }
          : { title: messageOrObj.title, body: messageOrObj.body };
      const response = await apiClient.post('/admin/notifications/send-to-user', {
        user_id: userId,
        ...content,
      });
      return response.data;
    } catch (error) {
      logger.error(`Error sending notification to user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get notifications for a specific user (Admin only)
   * GET /admin/notifications/user/:userId
   * @param {number|string} userId - User ID
   * @returns {Promise<Array>} List of user notifications
   */
  async getUserNotifications(userId) {
    try {
      const response = await apiClient.get(`/admin/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching notifications for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get all public notifications (Admin only)
   * GET /admin/notifications/public
   * @returns {Promise<Array>} List of public notifications
   */
  async getAdminPublicNotifications() {
    try {
      const response = await apiClient.get('/admin/notifications/public');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin public notifications:', error);
      throw error;
    }
  },

  /**
   * Add a local notification (for success/error toasts from UI actions)
   * @param {string} message - Notification message
   * @param {string} [type='info'] - Type: 'success', 'info', 'warning', 'error'
   * @param {Object} [options={}] - Optional extra options (reserved for future use)
   */
  addNotification(message, type = 'info', options = {}) {
    const newNotif = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: message,
      time: new Date().toISOString(),
      read: false,
      type: type || 'info',
      actionRequired: false,
      ...options,
    };
    notifications.value.unshift(newNotif);
    this.updateUnreadCount();
  },

  /**
   * Handle incoming WebSocket notification
   * @param {Object} data - Notification data from Pusher
   * @param {string} source - Notification source ('public', 'private', 'admin')
   */
  addReceivedNotification(data, source) {
    const newNotif = {
      id: data.id || Date.now(),
      title: data.message,
      time: new Date().toISOString(),
      read: false,
      type: source === 'admin' ? 'warning' : 'info',
      actionRequired: true,
    };
    notifications.value.unshift(newNotif);
    this.updateUnreadCount();

    // Optional: Trigger a browser notification or toast here
    logger.debug(`New ${source} notification received:`, data.message);
  },

  /**
   * Mark notification as read
   * API collection: PATCH /notifications/:id/read (user); accounting may use POST
   * @param {number|string} id - Notification ID
   * @returns {Promise<void>}
   */
  async markAsRead(id) {
    const user = authService.getCurrentUser();
    const isAccounting =
      user &&
      (user.type === ROLE_ACCOUNTING ||
        String(user.type) === String(ROLE_ACCOUNTING) ||
        String(user.role || '').toLowerCase() === 'accounting');
    const endpoint = isAccounting
      ? `/accounting/notifications/${id}/read`
      : `/notifications/${id}/read`;
    try {
      if (isAccounting) {
        await apiClient.post(endpoint);
      } else {
        await apiClient.patch(endpoint);
      }
      const n = notifications.value.find(x => x.id === id);
      if (n) {
        n.read = true;
        n.actionRequired = false;
        this.updateUnreadCount();
      }
    } catch (error) {
      logger.error('Error marking as read:', error);
      const n = notifications.value.find(x => x.id === id);
      if (n) {
        n.read = true;
        n.actionRequired = false;
        this.updateUnreadCount();
      }
    }
  },

  /**
   * Mark all notifications as read
   * API collection: PATCH /notifications/mark-all-read (user); accounting uses POST read-all
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    const user = authService.getCurrentUser();
    const isAccounting =
      user &&
      (user.type === ROLE_ACCOUNTING ||
        String(user.type) === String(ROLE_ACCOUNTING) ||
        String(user.role || '').toLowerCase() === 'accounting');
    try {
      if (isAccounting) {
        await apiClient.post('/accounting/notifications/read-all');
      } else {
        await apiClient.patch('/notifications/mark-all-read');
      }
      notifications.value.forEach(n => {
        n.read = true;
        n.actionRequired = false;
      });
      this.updateUnreadCount();
    } catch (error) {
      logger.error('Error marking all as read:', error);
      notifications.value.forEach(n => {
        n.read = true;
        n.actionRequired = false;
      });
      this.updateUnreadCount();
    }
  },

  /**
   * Update unread notification count
   * @returns {void}
   */
  updateUnreadCount() {
    unreadCount.value = notifications.value.filter(n => !n.read).length;
  },

  /**
   * Disconnect from Pusher WebSocket
   * @returns {void}
   */
  disconnect() {
    if (pusher) {
      channels.forEach(c => c.unbind_all());
      pusher.disconnect();
      pusher = null;
      channels = [];
    }
  },

  // --- Missing Endpoints ---

  /**
   * Get my notifications
   * GET /notifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of notifications
   */
  async getMyNotifications(params = {}) {
    try {
      const response = await apiClient.get('/notifications', { params });
      const notifs = response.data?.data || response.data || [];
      return Array.isArray(notifs) ? notifs : [];
    } catch (error) {
      logger.error('Error fetching my notifications:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read (alternative endpoint)
   * POST /notifications/read
   * @param {number|string} id - Notification ID
   * @returns {Promise<Object>} Response
   */
  async markNotificationAsRead(id) {
    try {
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read (alternative endpoint)
   * POST /notifications/read-all
   * @returns {Promise<Object>} Response
   */
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.post('/notifications/read-all');
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification (backend may not expose DELETE /notifications/:id; 404 treated as success)
   * DELETE /notifications/:id
   * @param {number|string} id - Notification ID
   * @returns {Promise<Object>} Response or {} if endpoint not available (404)
   */
  async deleteNotification(id) {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      if (isNotFoundError(error)) {
        logger.debug('Delete notification endpoint not available (404); treating as success');
        return {};
      }
      logger.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get public notifications
   * GET /notifications/public
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of public notifications
   */
  async getPublicNotifications(params = {}) {
    try {
      const response = await apiClient.get('/notifications/public', { params });
      const notifs = response.data?.data || response.data || [];
      return Array.isArray(notifs) ? notifs : [];
    } catch (error) {
      logger.error('Error fetching public notifications:', error);
      throw error;
    }
  },

  /**
   * Send notification to role (Admin only).
   * Backend may not implement POST /admin/notifications/send-to-role; 404 throws with code NOT_AVAILABLE.
   * @param {Object} data - Notification data (role, message, etc.)
   * @returns {Promise<Object>} Response
   */
  async sendToRole(data) {
    try {
      const response = await apiClient.post('/admin/notifications/send-to-role', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      if (isNotFoundError(error)) {
        const notAvailable = new Error('إرسال الإشعار حسب الدور غير متاح في الخادم');
        notAvailable.code = 'NOT_AVAILABLE';
        notAvailable.status = 404;
        throw notAvailable;
      }
      logger.error('Error sending notification to role:', error);
      throw error;
    }
  },
};

export default notificationService;
