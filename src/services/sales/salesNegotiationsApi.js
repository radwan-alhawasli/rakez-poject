import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export const salesNegotiationsApi = {
  /**
   * Get pending negotiations
   * GET /sales/negotiations/pending
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of pending negotiations
   */
  async getPendingNegotiations(params = {}) {
    const response = await apiClient.get('/sales/negotiations/pending', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  /**
   * Approve negotiation
   * POST /sales/negotiations/approve
   * @param {number|string} negotiationId - Negotiation ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approved negotiation
   */
  async approveNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/approve`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Reject negotiation
   * POST /sales/negotiations/reject
   * @param {number|string} negotiationId - Negotiation ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejected negotiation
   */
  async rejectNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/reject`, data);
    return response.data?.data || response.data || {};
  },
};
