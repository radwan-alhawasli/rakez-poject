import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  /**
   * Get targets for team goals page (cards list).
   * @param {Object} params - Optional: from, to, status, per_page
   */
  async getMyTargets(params = {}) {
    const response = await apiClient.get('/sales/targets/my', { params });
    const { items } = extractPaginatedData(response, []);
    if (Array.isArray(items) && items.length > 0) return items;
    const data = response?.data ?? response;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.targets)) return data.targets;
    return Array.isArray(items) ? items : [];
  },

  /**
   * Get targets by project.
   * @param {number|string} contractId - Contract/Project ID
   */
  async getTargetsByProject(contractId) {
    const response = await apiClient.get(`/sales/targets/by-project/${contractId}`);
    const data = response?.data ?? response;
    if (data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  },

  /**
   * Update a sales target status
   */
  updateTarget(targetId, data) {
    return apiClient.patch(`/sales/targets/${targetId}`, data);
  },

  /**
   * Create target (leader only).
   */
  createTarget(data) {
    return apiClient.post('/sales/targets', data);
  },

  /**
   * Update target (generic update)
   */
  async updateMyTarget(targetIdOrData, data) {
    const isDataOnly = typeof targetIdOrData === 'object' && data === undefined;
    const targetId = isDataOnly ? targetIdOrData?.id : targetIdOrData;
    const payload = isDataOnly ? targetIdOrData : data ?? {};
    if (targetId == null) return Promise.reject(new Error('Target ID is required'));
    const response = await apiClient.patch(`/sales/targets/${targetId}`, payload);
    return response.data?.data || response.data || {};
  },
};
