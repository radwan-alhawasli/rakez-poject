import apiClient from '../api/apiClient'
import logger from '../utils/logger'

/**
 * خدمة المساعد الذكي - AI Assistant Service
 * API Integration for AI Features
 */
const aiService = {
    /**
     * سؤال سؤال (بدون سجل)
     * POST /api/ai/ask
     */
    async askQuestion(payload) {
        try {
            logger.debug('AI Ask:', payload)
            const response = await apiClient.post('/ai/ask', payload)
            return response.data?.data || response.data || {}
        } catch (error) {
            logger.error('Error in AI ask:', error)
            throw error
        }
    },

    /**
     * دردشة (مع سجل الجلسة)
     * POST /api/ai/chat
     */
    async chat(payload) {
        try {
            logger.debug('AI Chat:', payload)
            const response = await apiClient.post('/ai/chat', payload)
            return response.data?.data || response.data || {}
        } catch (error) {
            logger.error('Error in AI chat:', error)
            throw error
        }
    },

    /**
     * جلب سجل المحادثات
     * GET /api/ai/conversations
     */
    async getConversations(perPage = 10) {
        try {
            logger.debug('Fetching conversations...')
            const response = await apiClient.get(`/ai/conversations?per_page=${perPage}`)
            return response.data?.data || response.data || []
        } catch (error) {
            logger.error('Error fetching conversations:', error)
            throw error
        }
    },

    /**
     * حذف محادثة
     * DELETE /api/ai/conversations/:sessionId
     */
    async deleteConversation(sessionId) {
        try {
            logger.debug('Deleting conversation', sessionId)
            const response = await apiClient.delete(`/ai/conversations/${sessionId}`)
            return response.data?.data || response.data || {}
        } catch (error) {
            logger.error('Error deleting conversation:', error)
            throw error
        }
    },

    /**
     * جلب الأقسام المتاحة
     * GET /api/ai/sections
     */
    async getAvailableSections() {
        try {
            logger.debug('Fetching AI sections...')
            const response = await apiClient.get('/ai/sections')
            return response.data?.data || response.data || []
        } catch (error) {
            logger.error('Error fetching AI sections:', error)
            throw error
        }
    }
}

export default aiService
