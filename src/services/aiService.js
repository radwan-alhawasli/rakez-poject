import apiClient from '../api/apiClient'
import logger from '../utils/logger'
import { handleServiceError } from '../utils/serviceErrorHandler'
import { extractPaginatedData } from '../utils/paginationUtils'

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
            return handleServiceError(error, 'AI ask', 'post')
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
            return handleServiceError(error, 'AI chat', 'post')
        }
    },

    /**
     * جلب سجل المحادثات
     * GET /api/ai/conversations
     */
    async getConversations(perPage = 10) {
        logger.debug('Fetching conversations...')
        const response = await apiClient.get(`/ai/conversations?per_page=${perPage}`)
        return response.data?.data || response.data || []
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
            return handleServiceError(error, 'Delete AI conversation', 'delete')
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
            const data = response.data?.data ?? response.data
            // Return empty array if data is null or undefined, or if not an array
            return (data === null || data === undefined) ? [] : (Array.isArray(data) ? data : [])
        } catch (error) {
            return handleServiceError(error, 'Fetch AI sections', 'get', [])
        }
    },

    // --- Knowledge Management ---

    /**
     * Get knowledge entries (paginated)
     * GET /ai/knowledge?per_page=&page=&module=&page_key=&language=&search=
     * @param {Object} params - page, per_page (1-100), module, page_key, language, search
     * @returns {Promise<{ items: Array, total: number }>}
     */
    async getKnowledge(params = {}) {
        try {
            logger.debug('Fetching knowledge entries...')
            const response = await apiClient.get('/ai/knowledge', { params })
            const { items, total } = extractPaginatedData(response, [])
            return { items, total }
        } catch (error) {
            return handleServiceError(error, 'Fetch knowledge entries', 'get') || { items: [], total: 0 }
        }
    },

    /**
     * Create knowledge entry
     * POST /ai/knowledge
     * @param {Object} data - Knowledge data
     * @returns {Promise<Object>} Created knowledge entry
     */
    async createKnowledge(data) {
        try {
            logger.debug('Creating knowledge entry:', data)
            const response = await apiClient.post('/ai/knowledge', data)
            return response.data?.data || response.data || {}
        } catch (error) {
            return handleServiceError(error, 'Create knowledge entry', 'post')
        }
    },

    /**
     * Update knowledge entry
     * PUT /ai/knowledge/:id
     * @param {number|string} id - Knowledge ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated knowledge entry
     */
    async updateKnowledge(id, data) {
        try {
            logger.debug(`Updating knowledge ${id}:`, data)
            const response = await apiClient.put(`/ai/knowledge/${id}`, data)
            return response.data?.data || response.data || {}
        } catch (error) {
            return handleServiceError(error, `Update knowledge ${id}`, 'put')
        }
    },

    /**
     * Delete knowledge entry
     * DELETE /ai/knowledge/:id
     * @param {number|string} id - Knowledge ID
     * @returns {Promise<Object>} Response
     */
    async deleteKnowledge(id) {
        try {
            logger.debug(`Deleting knowledge ${id}`)
            const response = await apiClient.delete(`/ai/knowledge/${id}`)
            return response.data?.data || response.data || {}
        } catch (error) {
            return handleServiceError(error, `Delete knowledge ${id}`, 'delete')
        }
    }
}

export default aiService
