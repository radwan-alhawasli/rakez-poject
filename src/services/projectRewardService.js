import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * @param {any} response
 * @param {Record<string, any>} [fallback={}]
 * @returns {any}
 */
function unwrap(response, fallback = {}) {
  return response?.data?.data ?? response?.data ?? fallback;
}

/**
 * @param {any} response
 * @returns {{ items: any[], total: number, meta: Record<string, any> }}
 */
function normalizePaginated(response) {
  const { items, total } = extractPaginatedData(response, []);
  const body = response?.data ?? response;
  const meta = body?.meta ?? body?.data?.meta ?? body?.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    total: Number(total ?? 0) || 0,
    meta,
  };
}

const emptyPaginationResult = { items: [], total: 0, meta: {} };

const projectRewardService = {
  /**
   * @param {Record<string, any>} [params={}]
   */
  async listSettings(params = {}) {
    try {
      const response = await apiClient.get('/accounting/project-reward-settings', { params });
      return normalizePaginated(response);
    } catch (error) {
      return handleServiceError(error, 'List project reward settings', 'get', emptyPaginationResult) || emptyPaginationResult;
    }
  },

  /**
   * @param {Record<string, any>} payload
   */
  async createSetting(payload) {
    try {
      const response = await apiClient.post('/accounting/project-reward-settings', payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Create project reward setting', 'post');
    }
  },

  /**
   * @param {string|number} id
   */
  async showSetting(id) {
    try {
      const response = await apiClient.get(`/accounting/project-reward-settings/${id}`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Show project reward setting', 'get', {});
    }
  },

  /**
   * @param {string|number} id
   * @param {Record<string, any>} payload
   */
  async updateSetting(id, payload) {
    try {
      const response = await apiClient.put(`/accounting/project-reward-settings/${id}`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Update project reward setting', 'put');
    }
  },

  /**
   * @param {string|number} id
   */
  async activateSetting(id) {
    try {
      const response = await apiClient.post(`/accounting/project-reward-settings/${id}/activate`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Activate project reward setting', 'post');
    }
  },

  /**
   * @param {string|number} reservationId
   * @param {Record<string, any>} payload
   */
  async previewReward(reservationId, payload) {
    try {
      const response = await apiClient.post(`/accounting/reservations/${reservationId}/preview-reward`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Preview project reward', 'post');
    }
  },

  /**
   * @param {string|number} reservationId
   * @param {Record<string, any>} payload
   */
  async generateReward(reservationId, payload) {
    try {
      const response = await apiClient.post(`/accounting/reservations/${reservationId}/generate-reward`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Generate project reward', 'post');
    }
  },

  /**
   * @param {Record<string, any>} [params={}]
   */
  async listRewards(params = {}) {
    try {
      const response = await apiClient.get('/accounting/project-rewards', { params });
      return normalizePaginated(response);
    } catch (error) {
      return handleServiceError(error, 'List project rewards', 'get', emptyPaginationResult) || emptyPaginationResult;
    }
  },

  /**
   * @param {string|number} id
   */
  async showReward(id) {
    try {
      const response = await apiClient.get(`/accounting/project-rewards/${id}`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Show project reward', 'get', {});
    }
  },

  /**
   * @param {string|number} id
   */
  async approveReward(id) {
    try {
      const response = await apiClient.post(`/accounting/project-rewards/${id}/approve`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Approve project reward', 'post');
    }
  },

  /**
   * @param {string|number} id
   * @param {string} reason
   */
  async rejectReward(id, reason) {
    try {
      const response = await apiClient.post(`/accounting/project-rewards/${id}/reject`, { reason });
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Reject project reward', 'post');
    }
  },

  /**
   * @param {string|number} id
   */
  async markRewardPaid(id) {
    try {
      const response = await apiClient.post(`/accounting/project-rewards/${id}/mark-paid`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Mark project reward paid', 'post');
    }
  },
};

export default projectRewardService;
