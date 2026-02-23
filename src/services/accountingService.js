import apiClient from '../api/apiClient';
import logger from '../utils/logger';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';

/**
 * Accounting Department Service
 * Manages accounting operations including dashboard, notifications, sold units, commissions, deposits, salaries, and confirmations
 */
const accountingService = {
  /**
   * Get accounting dashboard metrics
   * GET /accounting/dashboard?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
   * API returns: units_sold, total_received_deposits, total_refunded_deposits,
   *   total_projects_value, total_sales_value, total_commissions, pending_commissions, approved_commissions
   * @param {Object} params - { from_date, to_date }
   * @returns {Promise<Object>} Normalized dashboard data
   */
  async getDashboard(params = {}) {
    try {
      const apiParams = {};
      if (params.from_date) apiParams.from_date = params.from_date;
      if (params.to_date) apiParams.to_date = params.to_date;
      const response = await apiClient.get('/accounting/dashboard', { params: apiParams });
      const raw = response.data?.data ?? response.data;
      if (raw === null || raw === undefined) return {};
      return {
        total_units_sold: raw.units_sold ?? raw.total_units_sold,
        total_deposits: raw.total_received_deposits ?? raw.total_deposits,
        total_deposits_refunded: raw.total_refunded_deposits ?? raw.total_deposits_refunded,
        total_projects_value: raw.total_projects_value,
        total_sales_value: raw.total_sales_value,
        total_commissions: raw.total_commissions,
        pending_deposits: raw.pending_deposits,
        pending_salaries: raw.pending_salaries,
        pending_commissions: raw.pending_commissions,
        approved_commissions: raw.approved_commissions,
        unread_notifications: raw.unread_notifications,
      };
    } catch (error) {
      return handleServiceError(error, 'Error fetching accounting dashboard', 'get', {}) || {};
    }
  },

  // --- Notifications ---

  /**
   * Get accounting notifications
   * GET /accounting/notifications
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get('/accounting/notifications', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching accounting notifications', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Mark notification as read
   * POST /accounting/notifications/:notification_id/read
   * @param {number|string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.post(`/accounting/notifications/${notificationId}/read`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * POST /accounting/notifications/read-all
   * @returns {Promise<Object>} Result
   */
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.post('/accounting/notifications/read-all');
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // --- Sold Units & Commissions ---

  /**
   * Get all sold units with commission info
   * GET /accounting/sold-units
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of sold units
   */
  async getSoldUnits(params = {}) {
    try {
      const response = await apiClient.get('/accounting/sold-units', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching sold units', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * Get list of marketers for commission distribution dropdown
   * GET /accounting/marketers
   * API returns: data[] with id, name
   * @returns {Promise<Array>} List of { id, name }
   */
  async getMarketers() {
    try {
      const response = await apiClient.get('/accounting/marketers');
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : raw?.data || raw?.items || [];
      return (list || []).map(m => ({ id: m.id, name: m.name || m.email || '' }));
    } catch (error) {
      logger.error('Error fetching marketers:', error);
      return [];
    }
  },

  /**
   * Get detailed sold unit information
   * GET /accounting/sold-units/:reservation_id
   * Response includes available_marketers array (id, name) for dropdown
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Object>} Sold unit details
   */
  async getSoldUnitById(reservationId) {
    try {
      const response = await apiClient.get(`/accounting/sold-units/${reservationId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error fetching sold unit ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * Create manual commission entry
   * POST /accounting/sold-units/:reservation_id/commission
   * API body: contract_unit_id, final_selling_price, commission_percentage, commission_source (owner|buyer),
   *   team_responsible, marketing_expenses, bank_fees
   * @param {number|string} reservationId - Reservation ID
   * @param {Object} data - Commission data
   * @returns {Promise<Object>} Created commission
   */
  async createManualCommission(reservationId, data) {
    try {
      const body = {
        contract_unit_id: data.contract_unit_id || 1,
        final_selling_price: data.final_selling_price ?? data.amount ?? data.total_value,
        commission_percentage: data.commission_percentage,
        commission_source: data.commission_source || 'owner',
        team_responsible: data.team_responsible ?? data.team_name ?? '',
        marketing_expenses: data.marketing_expenses ?? 0,
        bank_fees: data.bank_fees ?? 0,
      };
      const response = await apiClient.post(
        `/accounting/sold-units/${reservationId}/commission`,
        body
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error creating manual commission for reservation ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * Get commissions list
   * GET /accounting/commissions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} { items, total }
   */
  async getCommissions(params = {}) {
    try {
      const response = await apiClient.get('/accounting/commissions', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching commissions', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * Update commission distribution percentages
   * PUT /accounting/commissions/:commission_id/distributions
   * API body: distributions: [{ type, user_id, percentage }]
   * Types: lead_generation, persuasion, closing, team_leader, sales_manager, project_manager, external_marketer, other
   * For external_marketer/other: external_name, bank_account
   * @param {number|string} commissionId - Commission ID
   * @param {Object} data - { distributions: [...] }
   * @returns {Promise<Object>} Updated distributions
   */
  async updateDistributions(commissionId, data) {
    try {
      const apiTypes = {
        jalb: 'lead_generation',
        iqnaa: 'persuasion',
        iqfal: 'closing',
        external: 'external_marketer',
        lead_generation: 'lead_generation',
        persuasion: 'persuasion',
        closing: 'closing',
        team_leader: 'team_leader',
        assistant_pm: 'assistant_pm',
        project_manager: 'project_manager',
        owner: 'owner',
        sales_manager: 'sales_manager',
        projects_department: 'projects_department',
        management: 'management',
        ceo: 'ceo',
        external_marketer: 'external_marketer',
        other: 'other',
      };
      const distributions = (data.distributions || []).map(d => ({
        type: apiTypes[d.commission_type] || d.type || d.commission_type || 'lead_generation',
        user_id: d.user_id,
        percentage: d.percentage,
        external_name: d.external_name || d.employee_name,
        bank_account: d.bank_account,
      }));
      const response = await apiClient.put(
        `/accounting/commissions/${commissionId}/distributions`,
        { distributions }
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error updating distributions for commission ${commissionId}:`, error);
      throw error;
    }
  },

  /**
   * Approve commission distribution
   * POST /accounting/commissions/:commission_id/distributions/:distribution_id/approve
   * @param {number|string} commissionId - Commission ID
   * @param {number|string} distributionId - Distribution ID
   * @returns {Promise<Object>} Approved distribution
   */
  async approveDistribution(commissionId, distributionId) {
    try {
      const response = await apiClient.post(
        `/accounting/commissions/${commissionId}/distributions/${distributionId}/approve`
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error approving distribution ${distributionId}:`, error);
      throw error;
    }
  },

  /**
   * Reject commission distribution
   * POST /accounting/commissions/:commission_id/distributions/:distribution_id/reject
   * @param {number|string} commissionId - Commission ID
   * @param {number|string} distributionId - Distribution ID
   * @param {Object} data - Rejection data (notes, etc.)
   * @returns {Promise<Object>} Rejected distribution
   */
  async rejectDistribution(commissionId, distributionId, data = {}) {
    try {
      const response = await apiClient.post(
        `/accounting/commissions/${commissionId}/distributions/${distributionId}/reject`,
        data
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error rejecting distribution ${distributionId}:`, error);
      throw error;
    }
  },

  /**
   * Get complete commission summary with VAT, expenses, net amount
   * GET /accounting/commissions/:commission_id/summary
   * API returns: total_before_tax, vat, marketing_expenses, bank_fees, net_amount, distributions
   * @param {number|string} commissionId - Commission ID
   * @returns {Promise<Object>} Normalized summary { gross_amount, vat, marketing_expenses, bank_fees, net_amount, distributions }
   */
  async getCommissionSummary(commissionId) {
    try {
      const response = await apiClient.get(`/accounting/commissions/${commissionId}/summary`);
      const raw = response.data?.data || response.data || {};
      return {
        gross_amount: raw.total_before_tax ?? raw.gross_amount,
        vat: raw.vat,
        marketing_expenses: raw.marketing_expenses ?? 0,
        bank_fees: raw.bank_fees ?? 0,
        net_amount: raw.net_amount,
        distributions: raw.distributions || [],
      };
    } catch (error) {
      logger.error(`Error fetching commission summary ${commissionId}:`, error);
      throw error;
    }
  },

  /**
   * Confirm commission payment with notification
   * POST /accounting/commissions/:commission_id/distributions/:distribution_id/confirm
   * API: No body required. Sends notification to employee.
   * @param {number|string} commissionId - Commission ID
   * @param {number|string} distributionId - Distribution ID
   * @param {Object} _data - Optional (ignored per API spec)
   * @returns {Promise<Object>} Confirmed payment
   */
  async confirmPayment(commissionId, distributionId) {
    try {
      const response = await apiClient.post(
        `/accounting/commissions/${commissionId}/distributions/${distributionId}/confirm`,
        {}
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming payment for distribution ${distributionId}:`, error);
      throw error;
    }
  },

  // --- Deposits ---

  /**
   * Get pending deposits awaiting confirmation
   * GET /accounting/deposits/pending
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of pending deposits
   */
  async getPendingDeposits(params = {}) {
    try {
      const response = await apiClient.get('/accounting/deposits/pending', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching pending deposits', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Confirm deposit receipt
   * POST /accounting/deposits/:deposit_id/confirm
   * API: No body required
   * @param {number|string} depositId - Deposit ID
   * @param {Object} data - Optional (ignored per API spec)
   * @returns {Promise<Object>} Confirmed deposit
   */
  async confirmDeposit(depositId) {
    try {
      const response = await apiClient.post(`/accounting/deposits/${depositId}/confirm`, {});
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming deposit ${depositId}:`, error);
      throw error;
    }
  },

  /**
   * Get deposits requiring follow-up
   * GET /accounting/deposits/follow-up
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of deposits requiring follow-up
   */
  async getDepositsFollowUp(params = {}) {
    try {
      const response = await apiClient.get('/accounting/deposits/follow-up', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching deposits follow-up', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Process deposit refund (owner-paid commission only)
   * POST /accounting/deposits/:deposit_id/refund
   * API: No body required
   * @param {number|string} depositId - Deposit ID
   * @param {Object} data - Optional (ignored per API spec)
   * @returns {Promise<Object>} Refunded deposit
   */
  async processRefund(depositId) {
    try {
      const response = await apiClient.post(`/accounting/deposits/${depositId}/refund`, {});
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error processing refund for deposit ${depositId}:`, error);
      throw error;
    }
  },

  /**
   * Generate deposit claim file (owner commission only)
   * POST /accounting/deposits/claim-file/:reservation_id
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Object>} Generated claim file
   */
  async generateClaimFile(reservationId) {
    try {
      const response = await apiClient.post(`/accounting/deposits/claim-file/${reservationId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error generating claim file for reservation ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * Confirm commission received (after claim file)
   * POST /accounting/deposits/:reservation_id/commission-received
   * @param {number|string} reservationId - Reservation ID
   * @param {Object} data - Optional confirmation data
   * @returns {Promise<Object>} Result
   */
  async confirmCommissionReceived(reservationId, data = {}) {
    try {
      const response = await apiClient.post(
        `/accounting/deposits/${reservationId}/commission-received`,
        data
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming commission received for reservation ${reservationId}:`, error);
      throw error;
    }
  },

  // --- Salaries ---

  /**
   * Get employee salaries with commissions for the month
   * GET /accounting/salaries
   * @param {Object} params - Query parameters (month, year)
   * @returns {Promise<Array>} List of employee salaries
   */
  async getSalaries(params = {}) {
    try {
      const response = await apiClient.get('/accounting/salaries', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Error fetching salaries', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get detailed salary breakdown for employee
   * GET /accounting/salaries/:employee_id
   * @param {number|string} employeeId - Employee ID
   * @param {Object} params - Query parameters (month, year)
   * @returns {Promise<Object>} Employee salary details
   */
  async getEmployeeSalary(employeeId, params = {}) {
    try {
      const response = await apiClient.get(`/accounting/salaries/${employeeId}`, { params });
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error fetching salary for employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Alias for getEmployeeSalary (for consistency with naming)
   * GET /accounting/salaries/:employee_id
   * @param {number|string} employeeId - Employee ID
   * @param {Object} params - Query parameters (month, year)
   * @returns {Promise<Object>} Employee salary details
   */
  async getEmployeeSalaryDetail(employeeId, params = {}) {
    return this.getEmployeeSalary(employeeId, params);
  },

  /**
   * Create monthly salary distribution
   * POST /accounting/salaries/:employee_id/distribute
   * @param {number|string} employeeId - Employee ID
   * @param {Object} data - Distribution data (month, year, base_salary, total_commissions, etc.)
   * @returns {Promise<Object>} Created distribution
   */
  async createDistribution(employeeId, data) {
    try {
      const response = await apiClient.post(`/accounting/salaries/${employeeId}/distribute`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error creating distribution for employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Alias for createDistribution (for consistency with naming)
   * POST /accounting/salaries/:employee_id/distribute
   * @param {number|string} employeeId - Employee ID
   * @param {Object} data - Distribution data
   * @returns {Promise<Object>} Created distribution
   */
  async createSalaryDistribution(employeeId, data) {
    return this.createDistribution(employeeId, data);
  },

  /**
   * Approve salary distribution
   * POST /accounting/salaries/distributions/:distribution_id/approve
   * @param {number|string} distributionId - Distribution ID
   * @returns {Promise<Object>} Approved distribution
   */
  async approveSalaryDistribution(distributionId) {
    try {
      const response = await apiClient.post(
        `/accounting/salaries/distributions/${distributionId}/approve`
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error approving salary distribution ${distributionId}:`, error);
      throw error;
    }
  },

  /**
   * Mark salary as paid
   * POST /accounting/salaries/distributions/:distribution_id/paid
   * @param {number|string} distributionId - Distribution ID
   * @param {Object} data - Payment data (payment_reference, paid_at, etc.)
   * @returns {Promise<Object>} Paid distribution
   */
  async markSalaryAsPaid(distributionId, data) {
    try {
      const response = await apiClient.post(
        `/accounting/salaries/distributions/${distributionId}/paid`,
        data
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error marking salary as paid for distribution ${distributionId}:`, error);
      throw error;
    }
  },

  // --- Legacy - Down Payment ---

  /**
   * Get pending down payment confirmations (Legacy)
   * GET /accounting/pending-confirmations
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of pending confirmations
   */
  async getPendingConfirmations(params = {}) {
    try {
      const response = await apiClient.get('/accounting/pending-confirmations', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching pending confirmations', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Confirm down payment (Legacy)
   * POST /accounting/confirm/:reservation_id
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Object>} Confirmed down payment
   */
  async confirmDownPayment(reservationId) {
    try {
      const response = await apiClient.post(`/accounting/confirm/${reservationId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming down payment for reservation ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * View confirmation history (Legacy)
   * GET /accounting/confirmations/history
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Confirmation history
   */
  async getConfirmationHistory(params = {}) {
    try {
      const response = await apiClient.get('/accounting/confirmations/history', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      logger.error('Error fetching confirmation history:', error);
      throw error;
    }
  },
};

export default accountingService;
