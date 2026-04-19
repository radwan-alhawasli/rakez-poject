/**
 * Rakez ERP — Chat System API
 * Base path: /api/chat/* (via apiClient baseURL ending with /api)
 *
 * @see docs/API_INTEGRATION_AUDIT.md §15
 * @module services/chatService
 */

import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/** @param {import('axios').AxiosResponse} res */
function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data;
  }
  return body;
}

/**
 * Normalize conversation payload from API (handles minor field name differences).
 * @param {any} raw
 */
export function normalizeConversation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const other =
    raw.other_user ||
    raw.otherUser ||
    raw.participant ||
    raw.user ||
    {};
  const lastAt = raw.last_message_at || raw.lastMessageAt || raw.updated_at;
  let preview = raw._lastPreview;
  if (preview == null && raw.last_message) {
    const lm = raw.last_message;
    const text = typeof lm === 'string' ? lm : lm.message || lm.body || lm.text || '';
    preview = text ? (text.length > 48 ? `${text.slice(0, 48)}…` : text) : '';
  }
  return {
    ...raw,
    id: raw.id,
    other_user: {
      id: other.id,
      name: other.name || other.full_name || 'مستخدم',
      email: other.email || '',
    },
    last_message_at: lastAt,
    unread_count: Number(raw.unread_count ?? raw.unreadCount ?? 0) || 0,
    _lastPreview: preview || String(raw._lastPreview || ''),
  };
}

/**
 * @param {any} raw
 */
export function normalizeMessage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const attachment = raw.attachment || raw.file || raw.file_url || raw.media_url || null;
  const type = raw.attachment_type || raw.type || raw.file_type || (attachment ? 'file' : 'text');
  
  return {
    ...raw,
    id: raw.id,
    conversation_id: raw.conversation_id,
    sender_id: raw.sender_id != null ? Number(raw.sender_id) : Number(raw.senderId || 0),
    message: raw.message ?? raw.body ?? raw.text ?? '',
    is_read: !!(raw.is_read ?? raw.isRead),
    created_at: raw.created_at || raw.createdAt,
    attachment,
    attachment_type: type,
  };
}

/**
 * @param {any} meta
 */
function normalizePagination(meta) {
  const m = meta || {};
  const p = m.pagination || m;
  const hasMore =
    p.has_more_pages ??
    p.has_more ??
    (p.current_page != null && p.last_page != null ? p.current_page < p.last_page : false);
  return {
    current_page: p.current_page ?? 1,
    last_page: p.last_page ?? 1,
    per_page: p.per_page ?? 50,
    total: p.total,
    has_more_pages: !!hasMore,
  };
}

const chatService = {
  /**
   * GET /chat/conversations
   * @returns {Promise<Array<object>>}
   */
  async getConversations() {
    try {
      const res = await apiClient.get('/chat/conversations');
      const raw = unwrap(res);
      const list = Array.isArray(raw) ? raw : (raw?.items ?? raw?.conversations ?? []);
      return list.map(normalizeConversation).filter(Boolean);
    } catch (error) {
      return handleServiceError(error, 'Fetch chat conversations', 'get', []);
    }
  },

  /**
   * GET /chat/conversations/:userId — get or create conversation with user
   * @param {number|string} userId
   */
  async getOrCreateConversation(userId) {
    try {
      const res = await apiClient.get(`/chat/conversations/${userId}`);
      const raw = unwrap(res);
      return normalizeConversation(raw);
    } catch (error) {
      return handleServiceError(error, 'Get or create conversation', 'get', null);
    }
  },

  /**
   * GET /chat/conversations/:conversationId/messages
   * @param {number|string} conversationId
   * @param {number} page
   * @param {number} perPage
   */
  async getMessages(conversationId, page = 1, perPage = 50) {
    try {
      const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, per_page: perPage },
      });
      const body = res.data;
      const rawList = body?.data ?? body?.messages ?? [];
      const messages = (Array.isArray(rawList) ? rawList : []).map(normalizeMessage).filter(Boolean);
      const meta = normalizePagination(body?.meta ?? {});
      return { messages, meta };
    } catch (error) {
      return handleServiceError(error, 'Fetch chat messages', 'get', { messages: [], meta: {} });
    }
  },

  /**
   * @param {number|string} conversationId
   * @param {string} message
   */
  async sendMessage(conversationId, message) {
    try {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
        message,
      });
      const raw = unwrap(res);
      return normalizeMessage(raw);
    } catch (error) {
      return handleServiceError(error, 'Send chat message', 'post');
    }
  },

  /**
   * POST /chat/conversations/:conversationId/messages
   * Support for file/voice attachments via FormData
   * @param {string} conversationId
   * @param {FormData} formData
   */
  async sendAttachment(conversationId, formData) {
    try {
      const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const raw = unwrap(res);
      return normalizeMessage(raw);
    } catch (error) {
      return handleServiceError(error, 'Send chat attachment', 'post');
    }
  },

  /**
   * PATCH /chat/conversations/:conversationId/read
    * @param {any} conversationId
   */
  async markAsRead(conversationId) {
    try {
      const res = await apiClient.patch(`/chat/conversations/${conversationId}/read`);
      return unwrap(res);
    } catch (error) {
      return handleServiceError(error, 'Mark conversation as read', 'patch');
    }
  },

  /**
   * DELETE /chat/messages/:messageId
    * @param {any} messageId
   */
  async deleteMessage(messageId) {
    try {
      const res = await apiClient.delete(`/chat/messages/${messageId}`);
      return unwrap(res);
    } catch (error) {
      return handleServiceError(error, 'Delete chat message', 'delete');
    }
  },

  /**
   * GET /chat/unread-count
   */
  async getUnreadCount() {
    try {
      const res = await apiClient.get('/chat/unread-count');
      const d = unwrap(res);
      const n = d?.unread_count ?? d?.unreadCount ?? d;
      return typeof n === 'number' ? n : Number(n) || 0;
    } catch (error) {
      return handleServiceError(error, 'Fetch chat unread count', 'get', 0);
    }
  },

  /**
   * GET /chat/list_user
   * @param {any} params
   */
  async listUsers(params = {}) {
    try {
      const res = await apiClient.get('/chat/list_user', { params });
      const { items } = extractPaginatedData(res);
      const list = /** @type {any[]} */ (items);
      return list.map(u => ({
        id: u.id,
        name: u.name || u.full_name || u.username || u.display_name || 'مستخدم',
        email: u.email || '',
      }));
    } catch (error) {
      return handleServiceError(error, 'Fetch chat user list', 'get', []);
    }
  },
};

export default chatService;
