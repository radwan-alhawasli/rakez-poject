import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Commission & Deposits Service
 * Manages commission calculations and deposit tracking
 */
const commissionService = {
  /**
   * Get list of commissions
   * GET /commissions
   * @param {any} params - page, per_page
   * @returns {Promise<{ items: unknown[], total: number }>}
   */
  async getCommissions(params = {}) {
    try {
      const response = await apiClient.get('/sales/commissions', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch commissions', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get commission details
   * GET /commissions/:id
    * @param {any} id
   */
  async getCommissionById(id) {
    try {
      const response = await apiClient.get(`/sales/commissions/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Fetch commission ${id}`, 'get', {});
    }
  },

  /**
   * Create commission
   * POST /commissions
    * @param {any} commissionData
   */
  async createCommission(commissionData) {
    try {
      const response = await apiClient.post('/sales/commissions', commissionData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create commission', 'post');
    }
  },

  /**
   * Update commission expenses
   * PUT /sales/commissions/:id/expenses
   * @param {number|string} id - Commission ID
   * @param {any} commissionData - Expense update data
   * @returns {Promise<Object>} Updated commission
   */
  async updateCommission(id, commissionData) {
    try {
      const response = await apiClient.put(`/sales/commissions/${id}/expenses`, commissionData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update commission ${id}`, 'put');
    }
  },

  /**
   * Delete commission
   * DELETE /commissions/:id
    * @param {any} id
   */
  async deleteCommission(id) {
    try {
      const response = await apiClient.delete(`/sales/commissions/${id}`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, `Delete commission ${id}`, 'delete');
    }
  },

  /**
   * Calculate commission
   * POST /commissions/calculate
    * @param {any} calculationData
   */
  async calculateCommission(calculationData) {
    try {
      const response = await apiClient.post('/sales/commissions/calculate', calculationData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Calculate commission', 'post');
    }
  },

  /**
   * Get list of deposits
   * GET /deposits
   * @param {any} params - page, per_page
   * @returns {Promise<{ items: unknown[], total: number }>}
   */
  async getDeposits(params = {}) {
    try {
      const response = await apiClient.get('/sales/deposits', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch deposits', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get deposit details
   * GET /deposits/:id
    * @param {any} id
   */
  async getDepositById(id) {
    try {
      const response = await apiClient.get(`/sales/deposits/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Fetch deposit ${id}`, 'get', {});
    }
  },

  /**
   * Create deposit
   * POST /deposits
    * @param {any} depositData
   */
  async createDeposit(depositData) {
    try {
      const response = await apiClient.post('/sales/deposits', depositData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create deposit', 'post');
    }
  },

  /**
   * Update deposit
   * PUT /deposits/:id
    * @param {any} id
    * @param {any} depositData
   */
  async updateDeposit(id, depositData) {
    try {
      const response = await apiClient.put(`/sales/deposits/${id}`, depositData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update deposit ${id}`, 'put');
    }
  },

  /**
   * Delete deposit
   * DELETE /deposits/:id
    * @param {any} id
   */
  async deleteDeposit(id) {
    try {
      const response = await apiClient.delete(`/sales/deposits/${id}`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, `Delete deposit ${id}`, 'delete');
    }
  },

  /**
   * Confirm deposit receipt (previously processDeposit)
   * POST /sales/deposits/:id/confirm-receipt
   * @param {number|string} id - Deposit ID
   * @param {any} paymentData - Payment data
   * @returns {Promise<Object>} Confirmed deposit
   */
  async processDeposit(id, paymentData) {
    try {
      const response = await apiClient.post(`/sales/deposits/${id}/confirm-receipt`, paymentData);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Process deposit ${id}`, 'post');
    }
  },

  /**
   * @deprecated Not in Postman collection — endpoint may no longer exist on the backend.
   * GET /sales/commissions/report
   */
  async getCommissionReport(params = {}) {
    try {
      const response = await apiClient.get('/sales/commissions/report', { params });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch commission report', 'get', {});
    }
  },

  /**
   * @deprecated Not in Postman collection — endpoint may no longer exist on the backend.
   * GET /sales/deposits/report
   */
  async getDepositReport(params = {}) {
    try {
      const response = await apiClient.get('/sales/deposits/report', { params });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch deposit report', 'get', {});
    }
  },

  /**
   * Get commission distributions
   * GET /commissions/:commission_id/distributions
   * @param {number|string} commissionId - Commission ID
   * @param {any} params - Query parameters
   * @returns {Promise<unknown[]>} List of distributions
   */
  async getDistributions(commissionId, params = {}) {
    try {
      const response = await apiClient.get(`/sales/commissions/${commissionId}/distributions`, {
        params,
      });
      const distributions = response.data?.data || response.data || [];
      return Array.isArray(distributions) ? distributions : [];
    } catch (error) {
      return handleServiceError(
        error,
        `Fetch distributions for commission ${commissionId}`,
        'get',
        []
      );
    }
  },

  /**
   * Create commission distribution
   * POST /commissions/:commission_id/distributions
   * @param {number|string} commissionId - Commission ID
   * @param {any} data - Distribution data
   * @returns {Promise<Object>} Created distribution
   */
  async createDistribution(commissionId, data) {
    try {
      const response = await apiClient.post(
        `/sales/commissions/${commissionId}/distributions`,
        data
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(
        error,
        `Create distribution for commission ${commissionId}`,
        'post'
      );
    }
  },

  /**
   * Update commission distribution
   * PUT /commissions/distributions/:id
   * @param {number|string} id - Distribution ID
   * @param {any} data - Distribution update data
   * @returns {Promise<Object>} Updated distribution
   */
  async updateDistribution(id, data) {
    try {
      const response = await apiClient.put(`/sales/commissions/distributions/${id}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update distribution ${id}`, 'put');
    }
  },

  /**
   * Approve commission distribution
   * POST /commissions/distributions/:id/approve
   * @param {number|string} id - Distribution ID
   * @returns {Promise<Object>} Approved distribution
   */
  async approveDistribution(id) {
    try {
      const response = await apiClient.post(`/sales/commissions/distributions/${id}/approve`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Approve distribution ${id}`, 'post');
    }
  },

  /**
   * Reject commission distribution
   * POST /commissions/distributions/:id/reject
   * @param {number|string} id - Distribution ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Rejected distribution
   */
  async rejectDistribution(id, reason = '') {
    try {
      const response = await apiClient.post(`/sales/commissions/distributions/${id}/reject`, {
        reason,
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Reject distribution ${id}`, 'post');
    }
  },

  /**
   * Delete commission distribution
   * DELETE /commissions/distributions/:id
   * @param {number|string} id - Distribution ID
   * @returns {Promise<Object>} Response
   */
  async deleteDistribution(id) {
    try {
      const response = await apiClient.delete(`/sales/commissions/distributions/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Delete distribution ${id}`, 'delete');
    }
  },

  /**
   * Confirm deposit receipt (backend: confirm-receipt)
   * POST /sales/deposits/:id/confirm-receipt
   * @param {number|string} id - Deposit ID
   * @returns {Promise<Object>} Confirmed deposit
   */
  async confirmDeposit(id) {
    try {
      const response = await apiClient.post(`/sales/deposits/${id}/confirm-receipt`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Confirm deposit ${id}`, 'post');
    }
  },

  /**
   * Refund deposit
   * POST /deposits/:id/refund
   * @param {number|string} id - Deposit ID
   * @param {any} data - Refund data (refund_amount, refund_reason, refund_date)
   * @returns {Promise<Object>} Refunded deposit
   */
  async refundDeposit(id, data) {
    try {
      const response = await apiClient.post(`/sales/deposits/${id}/refund`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Refund deposit ${id}`, 'post');
    }
  },

  /**
   * Bulk approve commissions
   * POST /commissions/bulk-approve
   * @param {Array<number|string>} commissionIds - Array of commission IDs
   * @returns {Promise<Object>} Bulk approval result
   */
  async bulkApproveCommissions(commissionIds) {
    try {
      const response = await apiClient.post('/sales/commissions/bulk-approve', {
        commission_ids: commissionIds,
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Bulk approve commissions', 'post');
    }
  },

  /**
   * Bulk confirm deposits
   * POST /deposits/bulk-confirm
   * @param {Array<number|string>} depositIds - Array of deposit IDs
   * @returns {Promise<Object>} Bulk confirmation result
   */
  async bulkConfirmDeposits(depositIds) {
    try {
      const response = await apiClient.post('/sales/deposits/bulk-confirm', {
        deposit_ids: depositIds,
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Bulk confirm deposits', 'post');
    }
  },

  /**
   * Get commission statistics
   * GET /commissions/stats
   * @param {any} params - Query parameters
   * @returns {Promise<Object>} Commission statistics
   */
  async getCommissionStats(params = {}) {
    try {
      const response = await apiClient.get('/sales/commissions/stats', { params });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch commission statistics', 'get', {});
    }
  },

  /**
   * Get deposit statistics
   * GET /deposits/stats
   * @param {any} params - Query parameters
   * @returns {Promise<Object>} Deposit statistics
   */
  async getDepositStats(params = {}) {
    try {
      const response = await apiClient.get('/sales/deposits/stats', { params });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch deposit statistics', 'get', {});
    }
  },

  /**
   * Get commission analytics (monthly report)
   * GET /sales/analytics/commissions/monthly-report
   * @param {any} params - Query parameters
   * @returns {Promise<Object>} Analytics dashboard data
   */
  async getCommissionAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/sales/analytics/commissions/monthly-report', {
        params,
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch commission analytics', 'get', {});
    }
  },
};

export default commissionService;
