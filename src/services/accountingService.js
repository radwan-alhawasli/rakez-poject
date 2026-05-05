// @ts-check
import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getCaughtMessage, getCaughtStatus } from '@/utils/caughtError';

/**
 * توحيد معرّف توزيعة العمولة — الباك إند قد يرسل `id` أو `distribution_id` أو `commission_distribution_id`.
 * @param {Record<string, any>} d
 * @returns {Record<string, any>}
 */
function normalizeCommissionDistribution(d) {
  if (!d || typeof d !== 'object') return d;
  const id = d.id ?? d.distribution_id ?? d.commission_distribution_id;
  return id != null && id !== '' ? { ...d, id } : { ...d };
}


/**
 * @typedef {Object} AccountingSoldUnitListItem
 * @property {number|string} [id]
 * @property {number|string} [reservation_id]
 * @property {string} [unit_number]
 * @property {string} [project_name]
 * @property {string} [customer_name]
 * @property {string} [client_name]
 * @property {string} [commission_status]
 * @property {Object} [contract]
 * @property {Object} [reservation]
 */

/**
 * @typedef {Object} AccountingSoldUnitDetail
 * @property {number|string} [id]
 * @property {number|string} [reservation_id]
 * @property {Array<{ id: number|string, name: string }>} [available_marketers]
 * @property {unknown[]} [distributions]
 * @property {Object} [commission_summary]
 * @property {Object} [contract_unit]
 */

/**
 * @typedef {Object} AccountingDashboardApi
 * @property {number} [total_units_sold]
 * @property {number} [total_deposits]
 * @property {number} [total_deposits_refunded]
 * @property {number} [total_projects_value]
 * @property {number} [total_sales_value]
 * @property {number} [total_commissions]
 * @property {number} [pending_deposits]
 * @property {number} [pending_salaries]
 * @property {number} [unread_notifications]
 */

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
   * @param {Record<string, any>} params - { from_date, to_date }
   * @returns {Promise<Record<string, any>>} Normalized dashboard data
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
      return handleServiceError(error, 'Error , fetching accounting dashboard', 'get', {}) || {};
    }
  },

  // --- Notifications ---

  /**
   * Get accounting notifications
   * GET /accounting/notifications
   * @param {Record<string, any>} params - Query parameters
   * @returns {Promise<{ items: any[]; total: number }>}
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

  /**
   * Get claim file candidates: reservations/units eligible for claim files (optional).
   * GET /accounting/claim-files/candidates?per_page=500
   * @param {Record<string, any>} params - { per_page, page }
   * @returns {Promise<{ items: any[], total: number, forbidden?: boolean }>}
   */
  async getClaimFileCandidates(params = {}) {

    try {
      const response = await apiClient.get('/accounting/claim-files/candidates', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      const status = getCaughtStatus(error);
      if (status === 403) {
        logger.debug('Claim file candidates - Forbidden:', getCaughtMessage(error));
        return { items: [], total: 0, forbidden: true };
      }
      return (
        handleServiceError(error, 'Error fetching claim file candidates', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * الوحدات المباعة للمشروع مع فلترة ملف المطالبة.
   * GET /accounting/claim-files/sold-units?contract_id={id}&has_claim_file={0|1}
   * API ref 2.1 — كل عنصر: reservation_id, unit_number, claim_amount, has_claim_file, has_pdf, download_path
   * @param {Record<string, any>} params - { contract_id, has_claim_file }
   * @returns {Promise<any[]>} data array
   */
  async getClaimFileSoldUnits(params = {}) {
    const queryParams = typeof params === 'object' && params !== null 
      ? params 
      : { contract_id: params };

    try {
      const response = await apiClient.get('/accounting/claim-files/sold-units', { params: queryParams });
      const { items } = extractPaginatedData(response, []);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      const status = getCaughtStatus(error);
      if (status === 403) {
        logger.debug('Claim file sold-units - Forbidden:', getCaughtMessage(error));
        return [];
      }
      handleServiceError(error, 'Error fetching claim file sold-units', 'get');
      return [];
    }
  },

  /**
   * Get list of claim files
   * GET /accounting/claim-files
   * @param {Record<string, any>} params
   * @returns {Promise<{ items: any[], total: number }>}
   */
  async getClaimFiles(params = {}) {
    try {
      const response = await apiClient.get('/accounting/claim-files', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching claim files', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * @param {Record<string, unknown>} payload
   */
  async createCombinedClaimFile(payload) {
    const requestedType = payload?.claim_type;
    const claimTypesToTry = [];
    if (requestedType) claimTypesToTry.push(String(requestedType));
    if (!claimTypesToTry.includes('commission')) claimTypesToTry.push('commission');
    if (!claimTypesToTry.includes('commissions')) claimTypesToTry.push('commissions');

    /** @type {any} */
    let lastError = null;
    for (const claimType of claimTypesToTry) {
      try {
        const body = { ...(payload || {}), claim_type: claimType };
        const response = await apiClient.post('/accounting/claim-files/combined', body);
        return response.data?.data || response.data || {};
      } catch (error) {
        lastError = error;
        const err = /** @type {any} */ (error);
        const claimTypeErrors = err?.response?.data?.errors?.claim_type;
        const message = String(getCaughtMessage(error) || '');
        const isClaimTypeInvalid =
          (Array.isArray(claimTypeErrors) && claimTypeErrors.length > 0) ||
          message.includes('claim_type') ||
          message.includes('نوع المطالبة');
        if (!isClaimTypeInvalid) break;
      }
    }

    logger.error('Error creating combined claim file:', lastError);
    throw lastError;
  },


  /**
   * Update claim file status
   * PATCH /accounting/claim-files/:id
   * @param {number|string} id
   * @param {string} status - 'pending' or 'completed'
   * @returns {Promise<Object>}
   */
  async updateClaimFileStatus(id, status) {
    try {
      const response = await apiClient.patch(`/accounting/claim-files/${id}`, { status });
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error updating claim file ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Generate PDF for claim file
   * POST /accounting/claim-files/:id/pdf
   * @param {number|string} id
   * @returns {Promise<Object>} { pdf_path, download_url, status, status_label_ar }
   */
  async generateClaimFilePdf(id) {
    try {
      const response = await apiClient.post(`/accounting/claim-files/${id}/pdf`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error generating PDF for claim file ${id}:`, error);
      throw error;
    }
  },


  /**
   * تحميل PDF لملف مطالبة حجز — يُنشأ الملف عند الطلب إن لم يكن موجوداً.
   * GET /accounting/claim-files/download-for-reservation/{reservationId}
   * يفتح التحميل في نافذة جديدة مع إرسال الـ Bearer.
   * @param {string|number} reservationId
   */
  async openClaimFileDownload(reservationId) {
    try {
      const response = await apiClient.get(
        `/accounting/claim-files/download-for-reservation/${reservationId}`,
        { responseType: 'blob' }
      );
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      logger.error('Error downloading claim file:', error);
      throw error;
    }
  },

  // --- Sold Units & Commissions ---

  /**
   * Get all sold units with commission info
   * GET /accounting/sold-units
   * @param {Record<string, any>} params - Query parameters
   * @returns {Promise<{ items: AccountingSoldUnitListItem[], total: number }>}
   */
  async getSoldUnits(params = {}) {

    try {
      const response = await apiClient.get('/accounting/sold-units', { params });
      const { items, total } = extractPaginatedData(response, []);
      return {
        items: /** @type {AccountingSoldUnitListItem[]} */ (items),
        total,
      };
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
   * @returns {Promise<any[]>} List of { id, name }
   */
  async getMarketers() {

    try {
      const response = await apiClient.get('/accounting/marketers');
      const raw = response.data?.data ?? response.data;
      const list = Array.isArray(raw) ? raw : raw?.data || raw?.items || [];
      return (list || []).map((/** @type {any} */ m) => ({ id: m.id, name: m.name || m.email || '' }));

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
   * @returns {Promise<AccountingSoldUnitDetail>}
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
   * @param {number|string} reservationId - Reservation ID
   * @param {Record<string, any>} data - Commission data
   * @returns {Promise<Record<string, any>>} Created commission
   */
  async createManualCommission(reservationId, data) {

    try {
      const body = {
        contract_unit_id: data.contract_unit_id,
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
   * Get released/paid commissions list (عرض للمحاسبة)
   * GET /accounting/commissions/released
   * @param {Record<string, any>} params - from_date (Y-m-d), to_date (Y-m-d), per_page (1-100), page
   * @returns {Promise<{ items: any[]; total: number }>} { items, total } — each item: id, commission_id, employee_id, employee_name, project_name, unit_number, type, type_label, amount, percentage, status, approved_at, paid_at, notification_sent
   */
  async getReleasedCommissions(params = {}) {

    try {
      const response = await apiClient.get('/accounting/commissions/released', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching released commissions', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Get commission distribution types (for dropdowns)
   * GET /accounting/commission-distribution-types
   * @returns {Promise<{ types: string[], type_labels: Record<string, string> }>}
   */
  async getCommissionDistributionTypes() {

    try {
      const response = await apiClient.get('/accounting/commission-distribution-types');
      const raw = response.data?.data ?? response.data ?? {};
      return {
        types: raw.types ?? [],
        type_labels: raw.type_labels ?? {},
      };
    } catch (error) {
      logger.error('Error fetching commission distribution types:', error);
      return { types: [], type_labels: {} };
    }
  },

  /**
   * Get commissions list
   * GET /accounting/commissions
   * @param {Record<string, any>} params - Query parameters
   * @returns {Promise<{ items: any[]; total: number }>} { items, total }
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
   * @param {number|string} commissionId - Commission ID
   * @param {Record<string, any>} data - { distributions: [...], bank_fees?, commission_source? } — الحقول الاختيارية تُرسل إن وُجدت (دعم الباك اختياري).
   * @returns {Promise<Record<string, any>>} Updated distributions
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
      const apiTypesRec = /** @type {Record<string, string>} */ (apiTypes);
      const distributions = (data.distributions || []).map((/** @type {any} */ d) => ({
        type:

          apiTypesRec[String(d.commission_type)] || d.type || d.commission_type || 'lead_generation',
        user_id: d.user_id,
        percentage: d.percentage,
        external_name: d.external_name || d.employee_name,
        bank_account: d.bank_account,
      }));
      /** @type {Record<string, any>} */
      const body = { distributions };
      if (data.bank_fees !== undefined && data.bank_fees !== null) {
        body.bank_fees = Number(data.bank_fees) || 0;
      }
      if (data.commission_source === 'owner' || data.commission_source === 'buyer') {
        body.commission_source = data.commission_source;
      }
      const response = await apiClient.put(
        `/accounting/commissions/${commissionId}/distributions`,
        body
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
   * @param {number|string} commissionId - Commission ID
   * @param {number|string} distributionId - Distribution ID
   * @param {Record<string, any>} data - Rejection data (notes, etc.)
   * @returns {Promise<Record<string, any>>} Rejected distribution
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
   * @returns {Promise<Record<string, any>>} Normalized summary { gross_amount, vat, marketing_expenses, bank_fees, net_amount, distributions }
   */
  async getCommissionSummary(commissionId) {

    try {
      const response = await apiClient.get(`/accounting/commissions/${commissionId}/summary`);
      const raw = response.data?.data || response.data || {};
      const distList = raw.distributions || [];
      return {
        gross_amount: raw.total_before_tax ?? raw.gross_amount,
        vat: raw.vat,
        marketing_expenses: raw.marketing_expenses ?? 0,
        bank_fees: raw.bank_fees ?? 0,
        net_amount: raw.net_amount,
        distributions: distList.map(normalizeCommissionDistribution),
      };
    } catch (error) {
      logger.error(`Error fetching commission summary ${commissionId}:`, error);
      throw error;
    }
  },

  /**
   * Confirm commission payment with notification
   * POST /accounting/commissions/:commission_id/distributions/:distribution_id/confirm
   * API: body is JSON array `[]` (matches Postman / backend contract).
   * @param {number|string} commissionId - Commission ID
   * @param {number|string} distributionId - Distribution ID
   * @returns {Promise<Object>} Confirmed payment
   */
  async confirmPayment(commissionId, distributionId) {
    try {
      const response = await apiClient.post(
        `/accounting/commissions/${commissionId}/distributions/${distributionId}/confirm`,
        []
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming payment for distribution ${distributionId}:`, error);
      throw error;
    }
  },

  // --- Deposits ---
  // RAKEZ_LAST_SYSTEM (docs/RAKEZ_LAST_SYSTEM_API_REFERENCE.md, Accounting): /api/accounting/deposits, …/follow-up, …/pending — here as /accounting/deposits/* (no extra /api; see apiClient baseURL).

  /**
   * Get pending deposits awaiting confirmation
   * GET /accounting/deposits/pending
   * @param {Record<string, any>} params - Query parameters
   * @returns {Promise<{ items: any[]; total: number }>}
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
   * API body: { received_date?, bank_reference? }
   * @param {number|string} depositId - Deposit ID
   * @param {number|string} depositId - Deposit ID
   * @param {Record<string, any>} data - { received_date, bank_reference } (optional but recommended)
   * @returns {Promise<Record<string, any>>} Confirmed deposit
   */
  async confirmDeposit(depositId, data = {}) {

    try {
      const response = await apiClient.post(`/accounting/deposits/${depositId}/confirm`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming deposit ${depositId}:`, error);
      throw error;
    }
  },

  /**
   * Get deposits requiring follow-up
   * GET /accounting/deposits/follow-up
   * @param {Record<string, any>} params - Query parameters
   * @returns {Promise<{ items: any[]; total: number }>}
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
   * API body: { reason?, refund_amount? }
   * @param {number|string} depositId - Deposit ID
   * @param {number|string} depositId - Deposit ID
   * @param {Record<string, any>} data - { reason, refund_amount } (optional but recommended)
   * @returns {Promise<Record<string, any>>} Refunded deposit
   */
  async processRefund(depositId, data = {}) {

    try {
      const response = await apiClient.post(`/accounting/deposits/${depositId}/refund`, data);
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
   * @param {number|string} reservationId - Reservation ID
   * @param {Record<string, any>} data - Optional confirmation data
   * @returns {Promise<Record<string, any>>} Result
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
   * @param {Record<string, any>} params - Query parameters (month, year)
   * @returns {Promise<{ items: any[]; total: number }>}
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
   * @param {number|string} employeeId - Employee ID
   * @param {Record<string, any>} params - Query parameters (month, year)
   * @returns {Promise<Record<string, any>>} Employee salary details
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
   * @param {any} params - Query parameters (month, year)
   * @returns {Promise<Object>} Employee salary details
   */
  async getEmployeeSalaryDetail(employeeId, params = {}) {
    return this.getEmployeeSalary(employeeId, params);
  },

  /**
   * Create monthly salary distribution
   * POST /accounting/salaries/:employee_id/distribute
   * @param {number|string} employeeId - Employee ID
   * @param {number|string} employeeId - Employee ID
   * @param {Record<string, any>} data - Distribution data (month, year, base_salary, total_commissions, etc.)
   * @returns {Promise<Record<string, any>>} Created distribution
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
   * @param {any} data - Distribution data
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
   * API: body is JSON array `[]` (matches Postman / backend contract).
   * @param {number|string} distributionId - Distribution ID
   * @returns {Promise<Object>} Paid distribution
   */
  async markSalaryAsPaid(distributionId) {
    try {
      const response = await apiClient.post(
        `/accounting/salaries/distributions/${distributionId}/paid`,
        []
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
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
   * Confirm confirmation (align with API collection)
   * POST /accounting/confirmations/:id/confirm
   * API body: { confirmed_date? }
   * @param {number|string} confirmationId - Confirmation ID (or reservation id if backend accepts)
   * @param {number|string} confirmationId - Confirmation ID (or reservation id if backend accepts)
   * @param {Record<string, any>} data - { confirmed_date } (optional, e.g. "2026-03-01")
   * @returns {Promise<Record<string, any>>} Confirmed result
   */
  async confirmDownPayment(confirmationId, data = {}) {

    try {
      const response = await apiClient.post(
        `/accounting/confirmations/${confirmationId}/confirm`,
        data
      );
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error confirming for confirmation ${confirmationId}:`, error);
      throw error;
    }
  },

  /**
   * View confirmation history (Legacy)
   * GET /accounting/confirmations/history
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
