import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  // --- Unit Search ---
  async searchUnits(params = {}) {
    const response = await apiClient.get('/sales/units/search', { params });
    const body = response?.data ?? response;
    const items = body?.data ?? [];
    const meta = body?.meta ?? {};
    return { items: Array.isArray(items) ? items : [], total: meta.total ?? 0, meta, filters_available: body?.filters_available ?? null };
  },

  async getUnitSearchFilters() {
    const response = await apiClient.get('/sales/units/filters');
    return response?.data?.data ?? response?.data ?? {};
  },

  // --- Waiting List ---
  async getWaitingList(params = {}) {
    const response = await apiClient.get('/sales/waiting-list', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  async getWaitingListByUnit(unitId, params = {}) {
    const response = await apiClient.get(`/sales/waiting-list/unit/${unitId}`, { params });
    const waitingList = response.data?.data || response.data || [];
    return Array.isArray(waitingList) ? waitingList : [];
  },

  async getWaitingListEntry(id) {
    const response = await apiClient.get(`/sales/waiting-list/${id}`);
    return response.data?.data ?? response.data ?? {};
  },

  async addToWaitingList(data) {
    const response = await apiClient.post('/sales/waiting-list', data);
    return response.data?.data || response.data || {};
  },

  async convertToReservation(waitingListId, data = {}) {
    const response = await apiClient.post(`/sales/waiting-list/${waitingListId}/convert`, data);
    return response.data?.data || response.data || {};
  },

  async cancelWaitingListEntry(id) {
    const response = await apiClient.delete(`/sales/waiting-list/${id}`);
    return response.data?.data || response.data || {};
  },

  async deleteWaitingList(id) {
    return this.cancelWaitingListEntry(id);
  },
};
