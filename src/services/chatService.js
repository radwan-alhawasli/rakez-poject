import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';

const chatService = {
  async getConversations() {
    try {
      const res = await apiClient.get('/chat/conversations');
      return res.data?.data || res.data || [];
    } catch (error) {
      return handleServiceError(error, 'Fetch chat conversations', 'get', []);
    }
  },

  async getOrCreateConversation(userId) {
    try {
      const res = await apiClient.get(`/chat/conversations/${userId}`);
      return res.data?.data || res.data;
    } catch (error) {
      return handleServiceError(error, 'Get or create conversation', 'get', null);
    }
  },

  async getMessages(conversationId, page = 1, perPage = 50) {
    try {
      const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, per_page: perPage },
      });
      return {
        messages: res.data?.data || [],
        meta: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      return handleServiceError(error, 'Fetch chat messages', 'get', { messages: [], meta: {} });
    }
  },

  async sendMessage(conversationId, message) {
    try {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
        message,
      });
      return res.data?.data || res.data;
    } catch (error) {
      return handleServiceError(error, 'Send chat message', 'post');
    }
  },

  async markAsRead(conversationId) {
    try {
      const res = await apiClient.patch(`/chat/conversations/${conversationId}/read`);
      return res.data;
    } catch (error) {
      return handleServiceError(error, 'Mark conversation as read', 'patch');
    }
  },

  async deleteMessage(messageId) {
    try {
      const res = await apiClient.delete(`/chat/messages/${messageId}`);
      return res.data;
    } catch (error) {
      return handleServiceError(error, 'Delete chat message', 'delete');
    }
  },

  async getUnreadCount() {
    try {
      const res = await apiClient.get('/chat/unread-count');
      return res.data?.data?.unread_count ?? 0;
    } catch (error) {
      return handleServiceError(error, 'Fetch chat unread count', 'get', 0);
    }
  },
};

export default chatService
