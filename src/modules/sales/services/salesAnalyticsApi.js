import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  async getAnalyticsDashboard(params = {}) {
    const response = await apiClient.get('/sales/analytics/dashboard', { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getAnalyticsSoldUnits(params = {}) {
    const response = await apiClient.get('/sales/analytics/sold-units', { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getAnalyticsDepositStatsByProject(contractId, params = {}) {
    const response = await apiClient.get(`/sales/analytics/deposits/stats/project/${contractId}`, { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getAnalyticsCommissionStatsByEmployee(userId, params = {}) {
    const response = await apiClient.get(`/sales/analytics/commissions/stats/employee/${userId}`, { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getAnalyticsMonthlyCommissionReport(params = {}) {
    const response = await apiClient.get('/sales/analytics/commissions/monthly-report', { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getSoldUnits(params = {}) {
    const response = await apiClient.get('/sales/sold-units', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  },

  async getSoldUnitCommissionSummary(unitId, params = {}) {
    const response = await apiClient.get(`/sales/sold-units/${unitId}/commission-summary`, { params });
    return response.data?.data ?? response.data ?? {};
  },

  async getDepositsManagement(params = {}) {
    const response = await apiClient.get('/sales/deposits/management', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  },

  async getDepositsFollowUp(params = {}) {
    const response = await apiClient.get('/sales/deposits/follow-up', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  },
};
