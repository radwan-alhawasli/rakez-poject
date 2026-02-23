import apiClient from '../api/apiClient';
import logger from '../utils/logger';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';

/**
 * Credit Department Service
 * Manages credit operations including bookings, financing, title transfers, and claim files
 */

/** Throw if bookingId is missing/invalid so we never call the API with undefined. */
function requireBookingId(bookingId) {
  if (bookingId === undefined || bookingId === null || String(bookingId).trim() === '') {
    const err = new Error('معرف الحجز غير صالح');
    err.code = 'INVALID_BOOKING_ID';
    throw err;
  }
  return bookingId;
}

const creditService = {
  /**
   * Get credit department dashboard
   * GET /credit/dashboard
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(params = {}) {
    try {
      const response = await apiClient.get('/credit/dashboard', { params });
      if (response.data?.data === null) return {};
      const data = response.data?.data ?? response.data;
      return data === null || data === undefined ? {} : data;
    } catch (error) {
      return handleServiceError(error, 'Error fetching credit dashboard', 'get', {}) || {};
    }
  },

  /**
   * Refresh dashboard cache
   * POST /credit/dashboard/refresh
   */
  async refreshDashboard() {
    try {
      const response = await apiClient.post('/credit/dashboard/refresh');
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Error refreshing credit dashboard', 'post');
    }
  },

  // --- Notifications (Tab 2) ---

  /**
   * List credit notifications
   * GET /credit/notifications?per_page=15
   * Optional proxy: GET /notifications (no /credit/) returns same for credit/admin when frontend uses a single URL.
   */
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get('/credit/notifications', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching credit notifications', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * List notifications via proxy (single URL for all roles)
   * GET /notifications?per_page=15 — for credit/admin returns same as /credit/notifications
   */
  async getNotificationsProxy(params = {}) {
    try {
      const response = await apiClient.get('/notifications', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching notifications (proxy)', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Mark notification as read
   * POST /credit/notifications/:notification_id/read
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await apiClient.post(`/credit/notifications/${notificationId}/read`);
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Error marking notification read', 'post');
    }
  },

  /**
   * Mark all notifications as read
   * POST /credit/notifications/read-all
   */
  async markAllNotificationsRead() {
    try {
      const response = await apiClient.post('/credit/notifications/read-all');
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Error marking all notifications read', 'post');
    }
  },

  // --- Bookings - All (الكل tab) ---

  /**
   * Get all credit bookings (confirmed + negotiation + cancelled) – single paginated list
   * GET /credit/bookings?per_page=15&page=1
   * Same list shape: id, client_name, project_name, booking_date, credit_status_label_ar
   */
  async getAllBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching all credit bookings', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  // --- Bookings - Confirmed ---

  /**
   * Get confirmed bookings
   * GET /credit/bookings/confirmed
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of confirmed bookings
   */
  async getConfirmedBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/confirmed', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching confirmed bookings', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Get confirmed booking details (uses same endpoint as getBookingById; backend has no separate confirmed/:id)
   * GET /credit/bookings/:id
   */
  async getConfirmedBookingById(bookingId) {
    return this.getBookingById(bookingId);
  },

  /**
   * Show booking details (project, unit, client, financial, marketing, financing_tracker, title_transfer, claim_file)
   * GET /credit/bookings/:id or GET /credit/bookings/show/:id – backend includes data.id in response
   */
  async getBookingById(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.get(`/credit/bookings/${bookingId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel booking (e.g. bank rejected or client withdrew)
   * POST /credit/bookings/:booking_id/cancel
   * @param {Object} data - { cancellation_reason }
   */
  async cancelBooking(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/${bookingId}/cancel`, data);
      return response.data?.data ?? response.data;
    } catch (error) {
      logger.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  },

  // --- Bookings - Negotiation ---

  /**
   * Get bookings under negotiation
   * GET /credit/bookings/negotiation
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of bookings under negotiation
   */
  async getNegotiationBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/negotiation', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching negotiation bookings', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Update negotiation status
   * PATCH /credit/bookings/negotiation/:booking_id
   * @param {number|string} bookingId - Booking ID (from List Negotiation Bookings)
   * @param {Object} data - Update data (optional body per Postman)
   * @returns {Promise<Object>} Updated booking
   */
  async updateNegotiation(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.patch(`/credit/bookings/negotiation/${bookingId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error updating negotiation ${bookingId}:`, error);
      throw error;
    }
  },

  // --- Bookings - Waiting ---

  /**
   * Get waiting bookings
   * GET /credit/bookings/waiting
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of waiting bookings
   */
  async getWaitingBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/waiting', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching waiting bookings', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * List sold bookings (credit_status = sold)
   * GET /credit/bookings/sold?per_page=15
   * Query: per_page, from_date, to_date, contract_id. Tab: مباعة
   */
  async getSoldBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/sold', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching sold bookings', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * List cancelled bookings (cancelled_at set)
   * GET /credit/bookings/cancelled?per_page=15
   * Query: per_page, from_date, to_date, contract_id. Tab: مرفوضة / ملغاة
   */
  async getCancelledBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/cancelled', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching cancelled bookings', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Process waiting booking
   * POST /credit/bookings/waiting/:booking_id/process
   * Note: Not in official Postman collection (04 - Bookings - Negotiation & Waiting). Backend may implement separately.
   * @param {number|string} bookingId - Booking ID
   * @param {Object} data - Process data (action, notes, etc.)
   * @returns {Promise<Object>} Processed booking
   */
  async processWaitingBooking(bookingId, data) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/waiting/${bookingId}/process`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error processing waiting booking ${bookingId}:`, error);
      throw error;
    }
  },

  // --- Financing Tracker (Tab 3.2.2) ---

  /**
   * Advance financing: one action for "نقل للمرحلة التالية".
   * POST /credit/bookings/:booking_id/financing/advance
   * If no tracker: initializes (201). If tracker exists: completes current stage (200).
   * Body optional (stage 1: bank_name, client_salary, employment_type; stage 4: appraiser_name).
   */
  async advanceFinancing(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(
        `/credit/bookings/${bookingId}/financing/advance`,
        data
      );
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error advancing financing for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Initialize financing tracker for a confirmed bank-financing booking
   * POST /credit/bookings/:booking_id/financing
   */
  async initializeFinancingTracker(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/${bookingId}/financing`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error initializing financing tracker for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get financing status for a booking (Tab 3.2.2). Booking-centric: no tracker IDs in URL or response.
   * GET /credit/bookings/:booking_id/financing
   * Response: data with financing, progress_summary, current_stage, booking_id when started; data = null when not started.
   */
  async getFinancingTracker(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.get(`/credit/bookings/${bookingId}/financing`);
      return response.data?.data ?? response.data ?? null;
    } catch (error) {
      return handleServiceError(error, 'Error fetching financing tracker', 'get', null);
    }
  },

  /**
   * Complete a financing stage (1–5). Booking-centric: no tracker_id.
   * PATCH /credit/bookings/:booking_id/financing/stage/:stage_number
   * للمرحلة 1: bank_name مطلوب؛ وإلا يرجع الـ API 422 مع errors.bank_name.
   */
  async completeFinancingStage(bookingId, stageNumber, data = {}) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.patch(
        `/credit/bookings/${bookingId}/financing/stage/${stageNumber}`,
        data
      );
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error completing financing stage ${stageNumber}:`, error);
      throw error;
    }
  },

  /**
   * Reject financing (sets reservation credit_status to rejected). Booking-centric: no tracker_id.
   * POST /credit/bookings/:booking_id/financing/reject
   * Body: reason (مطلوب).
   */
  async rejectFinancing(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const body =
        typeof data === 'string' ? { reason: data } : { reason: data?.reason ?? 'رفض التمويل' };
      const response = await apiClient.post(`/credit/bookings/${bookingId}/financing/reject`, body);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error rejecting financing for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get financing applications list (legacy / optional)
   * GET /credit/financing
   */
  async getFinancing(params = {}) {
    try {
      const response = await apiClient.get('/credit/financing', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching financing', 'get') || { items: [], total: 0 }
      );
    }
  },

  async getFinancingById(financingId) {
    try {
      const response = await apiClient.get(`/credit/financing/${financingId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error fetching financing ${financingId}:`, error);
      throw error;
    }
  },

  async updateFinancing(financingId, data) {
    try {
      const response = await apiClient.put(`/credit/financing/${financingId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error updating financing ${financingId}:`, error);
      throw error;
    }
  },

  // --- Title Transfer (Tab 3.4) ---

  /**
   * Initialize title transfer for a booking (after financing completed or cash)
   * POST /credit/bookings/:booking_id/title-transfer
   */
  async initializeTitleTransfer(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/${bookingId}/title-transfer`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error initializing title transfer for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Schedule title transfer (موعد الإفراغ)
   * PATCH /credit/title-transfer/:transfer_id/schedule
   * @param {Object} data - { scheduled_date (YYYY-MM-DD), notes }
   */
  async scheduleTitleTransfer(transferId, data = {}) {
    try {
      const response = await apiClient.patch(`/credit/title-transfer/${transferId}/schedule`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error scheduling title transfer ${transferId}:`, error);
      throw error;
    }
  },

  /**
   * Unschedule title transfer (إلغاء موعد الافراغ)
   * PATCH /credit/title-transfer/:transfer_id/unschedule
   * Clears scheduled evacuation date. Only when transfer status is scheduled.
   */
  async unscheduleTitleTransfer(transferId) {
    try {
      const response = await apiClient.patch(`/credit/title-transfer/${transferId}/unschedule`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error unscheduling title transfer ${transferId}:`, error);
      throw error;
    }
  },

  /**
   * Complete title transfer (تم الإفراغ) – moves to sold
   * POST /credit/title-transfer/:transfer_id/complete
   */
  async completeTitleTransfer(transferId, data = {}) {
    try {
      const response = await apiClient.post(`/credit/title-transfer/${transferId}/complete`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error completing title transfer ${transferId}:`, error);
      throw error;
    }
  },

  /**
   * List pending title transfers
   * GET /credit/title-transfers/pending
   */
  async getPendingTitleTransfers() {
    try {
      const response = await apiClient.get('/credit/title-transfers/pending');
      const data = response.data?.data ?? response.data;
      const items = Array.isArray(data) ? data : data?.data ?? [];
      const total = data?.total ?? items.length;
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching pending title transfers', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Get title transfer requests (delegates to pending; backend has no generic GET /credit/title-transfer)
   * GET /credit/title-transfers/pending
   */
  async getTitleTransfers() {
    return this.getPendingTitleTransfers();
  },

  /**
   * Initialize title transfer for a booking (backend has no generic POST /credit/title-transfer).
   * Accepts (bookingId) or (data) where data.booking_id is the booking ID (for backward compatibility).
   * @param {number|string|Object} bookingIdOrData - Booking ID, or object with booking_id
   * @param {Object} [_optionalData] - Optional; kept for backward compatibility, not used
   */
  // eslint-disable-next-line no-unused-vars -- second arg kept for backward-compat call signature
  async createTitleTransfer(bookingIdOrData, _optionalData = {}) {
    const bookingId =
      typeof bookingIdOrData === 'object' && bookingIdOrData !== null
        ? bookingIdOrData.booking_id ?? bookingIdOrData.bookingId
        : bookingIdOrData;
    if (bookingId === undefined || bookingId === null) {
      const err = new Error('معرف الحجز مطلوب لإنشاء طلب نقل الملكية');
      err.code = 'INVALID_BOOKING_ID';
      throw err;
    }
    return this.initializeTitleTransfer(bookingId);
  },

  // --- Payment Plan (Tab 3.3) ---

  /**
   * Get payment plan for a booking (on-map projects)
   * GET /credit/bookings/:booking_id/payment-plan
   * Permission: credit.payment_plan.manage
   */
  async getPaymentPlan(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.get(`/credit/bookings/${bookingId}/payment-plan`);
      return response.data?.data ?? response.data ?? null;
    } catch (error) {
      return handleServiceError(error, 'Error fetching payment plan', 'get', null);
    }
  },

  /**
   * Create payment plan for a booking
   * POST /credit/bookings/:booking_id/payment-plan
   * Body: installments[] with due_date (>= today), amount (required), description (optional)
   */
  async createPaymentPlan(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/${bookingId}/payment-plan`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error creating payment plan for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Update a payment installment
   * PUT /credit/payment-installments/:installment_id
   * Body: due_date, amount, description, status (pending|paid|overdue)
   */
  async updateInstallment(installmentId, data = {}) {
    try {
      const response = await apiClient.put(`/credit/payment-installments/${installmentId}`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error updating installment ${installmentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a payment installment
   * DELETE /credit/payment-installments/:installment_id
   */
  async deleteInstallment(installmentId) {
    try {
      const response = await apiClient.delete(`/credit/payment-installments/${installmentId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error deleting installment ${installmentId}:`, error);
      throw error;
    }
  },

  // --- Sold Projects ---

  /**
   * Get sold projects requiring credit processing
   * GET /credit/sold-projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of sold projects
   */
  async getSoldProjects(params = {}) {
    try {
      const response = await apiClient.get('/credit/sold-projects', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching sold projects', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * Get sold project details (backend has only list; filter client-side)
   * GET /credit/sold-projects then find by project_id
   * @param {number|string} projectId - Project ID (or contract_id)
   * @returns {Promise<Object>} Project details or {} if not found
   */
  async getSoldProjectById(projectId) {
    try {
      const { items } = await this.getSoldProjects({ per_page: 500 });
      const found =
        Array.isArray(items) &&
        items.find(
          p => String(p.id) === String(projectId) || String(p.contract_id) === String(projectId)
        );
      return found || {};
    } catch (error) {
      logger.error(`Error fetching sold project ${projectId}:`, error);
      throw error;
    }
  },

  // --- Claim Files (Tab 5) ---

  /**
   * List claim files
   * GET /credit/claim-files?per_page=15
   */
  async getClaimFiles(params = {}) {
    try {
      const response = await apiClient.get('/credit/claim-files', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Error fetching claim files', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * Generate claim file for a sold booking
   * POST /credit/bookings/:booking_id/claim-file
   */
  async generateClaimFileForBooking(bookingId) {
    requireBookingId(bookingId);
    try {
      const response = await apiClient.post(`/credit/bookings/${bookingId}/claim-file`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error generating claim file for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get claim file by ID
   * GET /credit/claim-files/:claim_file_id
   */
  async getClaimFileById(claimFileId) {
    try {
      const response = await apiClient.get(`/credit/claim-files/${claimFileId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching claim file ${claimFileId}:`, error);
      throw error;
    }
  },

  /**
   * Generate claim file PDF
   * POST /credit/claim-files/:claim_file_id/pdf
   * Returns pdf_path, download_url
   */
  async generateClaimFilePdf(claimFileId) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimFileId}/pdf`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error generating claim file PDF ${claimFileId}:`, error);
      throw error;
    }
  },

  /**
   * Get claim file PDF download URL (same path, GET returns file stream)
   */
  getClaimFilePdfDownloadUrl(claimFileId) {
    const baseURL = apiClient.defaults?.baseURL ?? '';
    return `${baseURL}/credit/claim-files/${claimFileId}/pdf`;
  },

  async createClaimFile(data) {
    try {
      const response = await apiClient.post('/credit/claim-files', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error creating claim file:', error);
      throw error;
    }
  },

  async submitClaim(claimId) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimId}/submit`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error submitting claim ${claimId}:`, error);
      throw error;
    }
  },

  async approveClaim(claimId, data) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimId}/approve`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error approving claim ${claimId}:`, error);
      throw error;
    }
  },
};

export default creditService;
