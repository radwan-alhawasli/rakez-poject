import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

function unwrap(response, fallback = {}) {
  return response?.data?.data ?? response?.data ?? fallback;
}

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

const projectRewardService = {
  async listSettings(params = {}) {
    try {
      const response = await apiClient.get('/accounting/project-reward-settings', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'List project reward settings', 'get', {
          items: [],
          total: 0,
          meta: {},
        }) || { items: [], total: 0, meta: {} }
      );
    }
  },

  async createSetting(payload) {
    try {
      const response = await apiClient.post('/accounting/project-reward-settings', payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Create project reward setting', 'post');
    }
  },

  async showSetting(id) {
    try {
      const response = await apiClient.get(`/accounting/project-reward-settings/${id}`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Show project reward setting', 'get', {});
    }
  },

  async updateSetting(id, payload) {
    try {
      const response = await apiClient.put(`/accounting/project-reward-settings/${id}`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Update project reward setting', 'put');
    }
  },

  async activateSetting(id) {
    try {
      const response = await apiClient.post(`/accounting/project-reward-settings/${id}/activate`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Activate project reward setting', 'post');
    }
  },

  async previewReward(reservationId, payload) {
    try {
      const response = await apiClient.post(`/accounting/reservations/${reservationId}/preview-reward`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Preview project reward', 'post');
    }
  },

  async generateReward(reservationId, payload) {
    try {
      const response = await apiClient.post(`/accounting/reservations/${reservationId}/generate-reward`, payload);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Generate project reward', 'post');
    }
  },

  async listRewards(params = {}) {
    try {
      const response = await apiClient.get('/accounting/project-rewards', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'List project rewards', 'get', {
          items: [],
          total: 0,
          meta: {},
        }) || { items: [], total: 0, meta: {} }
      );
    }
  },

  async showReward(id) {
    try {
      const response = await apiClient.get(`/accounting/project-rewards/${id}`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Show project reward', 'get', {});
    }
  },

  async approveReward(id) {
    try {
      const response = await apiClient.post(`/accounting/project-rewards/${id}/approve`);
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Approve project reward', 'post');
    }
  },

  async rejectReward(id, reason) {
    try {
      const response = await apiClient.post(`/accounting/project-rewards/${id}/reject`, { reason });
      return unwrap(response);
    } catch (error) {
      return handleServiceError(error, 'Reject project reward', 'post');
    }
  },

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
