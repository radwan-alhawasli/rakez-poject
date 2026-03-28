import apiClient from '@/api/apiClient';

export default {
  /**
   * Get list of sales projects
   * @param {Object} params - status, q, city, district, scope, per_page
   * @returns {Promise<Object>} Fetch response
   */
  getProjects(params = {}) {
    return apiClient.get('/sales/projects', { params });
  },

  /**
   * Get project details
   * @param {number|string} projectId - Project ID
   */
  getProjectDetails(projectId) {
    return apiClient.get(`/sales/projects/${projectId}`);
  },

  /**
   * Get project units
   * @param {number|string} projectId - Contract ID
   * @param {Object} params - Query parameters
   */
  async getProjectUnits(projectId, params = {}) {
    const response = await apiClient.get(`/sales/projects/${projectId}/units`, { params });
    const body = response?.data ?? response;
    const raw = body?.data ?? body?.units ?? body;
    const arr = Array.isArray(raw) ? raw : [];
    const normalized = arr.map(u => ({
      ...u,
      id: u.id ?? u.unit_id,
      status: (u.status ?? u.unit_status ?? u.computed_availability ?? '').toString().toLowerCase(),
      area: u.area ?? u.area_m2,
      unit_number: u.unit_number ?? u.unit_id,
    }));
    const meta = body?.meta ?? body?.pagination ?? response?.data?.meta ?? response?.data?.pagination;
    return { ...response, data: normalized, meta };
  },

  /**
   * Get emergency contacts for a project
   * @param {number|string} projectId - Project ID
   */
  getEmergencyContacts(projectId) {
    return apiClient.get(`/sales/projects/${projectId}/emergency-contacts`);
  },

  /**
   * Update emergency contacts for a project
   * @param {number|string} projectId - Project ID
   * @param {Object} data - Emergency contacts data
   */
  async updateEmergencyContacts(projectId, data) {
    const response = await apiClient.patch(`/sales/projects/${projectId}/emergency-contacts`, data);
    return response.data?.data || response.data || {};
  },
};
