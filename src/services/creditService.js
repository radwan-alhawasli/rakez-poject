import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getCaughtMessage, getCaughtStatus } from '@/utils/caughtError';
import { creditNotificationsApi } from '@/services/credit/creditNotificationsApi.js';

/**
 * Credit Department Service
 * Manages credit operations including bookings, financing, title transfers, and claim files
 */

/** Throw if bookingId is missing/invalid so we never call the API with undefined. */
/**
 * @param {any} bookingId
 */
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
   * @param {any} params - Query parameters
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

  ...creditNotificationsApi,

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
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
    * @param {any} bookingId
   */
  async getConfirmedBookingById(bookingId) {
    return this.getBookingById(bookingId);
  },

  /**
   * Show booking details (project, unit, client, financial, marketing, financing_tracker, title_transfer, claim_file)
   * GET /credit/bookings/:id or GET /credit/bookings/show/:id – backend includes data.id in response
    * @param {any} bookingId
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
   * @param {any} data - { cancellation_reason }
    * @param {any} bookingId
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
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
   * @param {any} data - Update data (optional body per Postman)
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
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
   * @param {any} data - Process data (action, notes, etc.)
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
    * @param {any} bookingId
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
    * @param {any} bookingId
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
    * @param {any} bookingId
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
    * @param {any} bookingId
    * @param {any} stageNumber
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
    * @param {any} bookingId
   */
  async rejectFinancing(bookingId, data = {}) {
    requireBookingId(bookingId);
    try {
      const dataAny = /** @type {any} */ (data);
      const body =
        typeof data === 'string' ? { reason: data } : { reason: dataAny?.reason ?? 'رفض التمويل' };
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

  /**
   * @param {any} financingId
   */
  async getFinancingById(financingId) {
    try {
      const response = await apiClient.get(`/credit/financing/${financingId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error fetching financing ${financingId}:`, error);
      throw error;
    }
  },

  /**
   * @param {any} financingId
   * @param {any} data
   */
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
    * @param {any} bookingId
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
   * @param {any} data - { scheduled_date (YYYY-MM-DD), notes }
    * @param {any} transferId
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
    * @param {any} transferId
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
    * @param {any} transferId
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
   * @param {any} [_optionalData] - Optional; kept for backward compatibility, not used
   */
  async createTitleTransfer(bookingIdOrData, _optionalData = {}) {
    const asObj = /** @type {any} */ (bookingIdOrData);
    const bookingId =
      typeof bookingIdOrData === 'object' && bookingIdOrData !== null
        ? asObj.booking_id ?? asObj.bookingId
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
    * @param {any} bookingId
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
    * @param {any} bookingId
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
    * @param {any} installmentId
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
    * @param {any} installmentId
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

  // --- Marketing Requests ---
  async getMarketingRequests(params = {}) {
    try {
      const response = await apiClient.get('/credit/order-marketing-developers', { params });
      const data = response.data?.data || response.data || [];
      const items = Array.isArray(data) ? data : (data.data || []);
      const total = data.total || items.length;
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Error fetching marketing requests', 'get') || { items: [], total: 0 };
    }
  },
  async getMarketingRequestById(id) {
    try {
      const response = await apiClient.get(`/credit/order-marketing-developers/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error fetching marketing request ${id}:`, error);
      throw error;
    }
  },
  async createMarketingRequest(data) {
    try {
      const response = await apiClient.post('/credit/order-marketing-developers', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error creating marketing request:', error);
      throw error;
    }
  },
  async updateMarketingRequest(id, data) {
    try {
      const response = await apiClient.put(`/credit/order-marketing-developers/${id}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error updating marketing request ${id}:`, error);
      throw error;
    }
  },
  async deleteMarketingRequest(id) {
    try {
      const response = await apiClient.delete(`/credit/order-marketing-developers/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error deleting marketing request ${id}:`, error);
      throw error;
    }
  },

  // --- Sold Projects ---

  /**
   * Get sold projects requiring credit processing
   * GET /credit/sold-projects
   * @param {any} params - Query parameters
   * @returns {Promise<{ items: unknown[]; total: number }>}
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
        items.find(p => {
          const row = /** @type {Record<string, unknown>} */ (p);
          return (
            String(row.id) === String(projectId) || String(row.contract_id) === String(projectId)
          );
        });
      return found || {};
    } catch (error) {
      logger.error(`Error fetching sold project ${projectId}:`, error);
      throw error;
    }
  },

  // --- Claim Files (Tab 5) ---

  /**
   * List claim files (individual + combined). Each item has is_combined flag.
   * GET /credit/claim-files?per_page=15&page=1
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
   * Get claim file candidates: sold bookings without an existing claim file.
   * GET /credit/claim-files/candidates?per_page=15&page=1
   */
  async getClaimFileCandidates(params = {}) {
    try {
      const response = await apiClient.get('/credit/claim-files/candidates', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      const status = getCaughtStatus(error);
      if (status === 403) {
        logger.debug(
          'Claim file candidates - Forbidden (accounting/credit permission):',
          getCaughtMessage(error)
        );
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
   * Generate individual claim file for a sold booking (no body required).
   * POST /credit/bookings/:id/claim-file
    * @param {any} bookingId
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
   * Generate individual claim files for multiple bookings at once.
   * POST /credit/claim-files/generate-bulk
   * @param {any} data - { reservation_ids: number[] }
   * @returns {Promise<Object>} { created: { "123": 1, ... }, errors: { "125": "..." } }
   */
  async generateBulkClaimFiles(data) {
    try {
      const response = await apiClient.post('/credit/claim-files/generate-bulk', data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error generating bulk claim files:', error);
      throw error;
    }
  },

  /**
   * Create a combined claim file merging multiple sold bookings into one record.
   * POST /credit/claim-files/combined
   * @param {any} data - { booking_ids: number[] (min 2), claim_type: 'commission', notes?: string }
   * @returns {Promise<Object>} Combined claim file with items array
   */
  async createCombinedClaimFile(data) {
    try {
      const response = await apiClient.post('/credit/claim-files/combined', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error creating combined claim file:', error);
      throw error;
    }
  },

  /**
   * Get claim file details by ID (combined or individual).
   * GET /credit/claim-files/:id
    * @param {any} claimFileId
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
   * Generate PDF for a claim file.
   * POST /credit/claim-files/:id/pdf
    * @param {any} claimFileId
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
   * Get claim file PDF download URL.
   * GET /credit/claim-files/:id/pdf (returns file stream)
    * @param {any} claimFileId
   */
  getClaimFilePdfDownloadUrl(claimFileId) {
    const baseURL = apiClient.defaults?.baseURL ?? '';
    return `${baseURL}/credit/claim-files/${claimFileId}/pdf`;
  },

  /**
   * @param {any} data
   */
  async createClaimFile(data) {
    try {
      const response = await apiClient.post('/credit/claim-files', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error('Error creating claim file:', error);
      throw error;
    }
  },

  /**
   * @param {any} claimId
   */
  async submitClaim(claimId) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimId}/submit`);
      return response.data?.data || response.data || {};
    } catch (error) {
      logger.error(`Error submitting claim ${claimId}:`, error);
      throw error;
    }
  },

  /**
   * @param {any} claimId
   * @param {any} data
   */
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
