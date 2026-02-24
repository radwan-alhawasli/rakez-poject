import apiClient from '../api/apiClient'

const chatService = {
  async getConversations() {
    const res = await apiClient.get('/chat/conversations')
    return res.data?.data || res.data || []
  },

  async getOrCreateConversation(userId) {
    const res = await apiClient.get(`/chat/conversations/${userId}`)
    return res.data?.data || res.data
  },

  async getMessages(conversationId, page = 1, perPage = 50) {
    const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, per_page: perPage }
    })
    return {
      messages: res.data?.data || [],
      meta: res.data?.meta?.pagination || {}
    }
  },

  async sendMessage(conversationId, message) {
    const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { message })
    return res.data?.data || res.data
  },

  async markAsRead(conversationId) {
    const res = await apiClient.patch(`/chat/conversations/${conversationId}/read`)
    return res.data
  },

  async deleteMessage(messageId) {
    const res = await apiClient.delete(`/chat/messages/${messageId}`)
    return res.data
  },

  async getUnreadCount() {
    const res = await apiClient.get('/chat/unread-count')
    return res.data?.data?.unread_count ?? 0
  }
}

export default chatService
