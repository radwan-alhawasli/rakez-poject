import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Extended sales API: waiting list, payment plans, schedules, search, analytics.
 * Composed into default export in salesService.js (merged with core so `this` resolves).
 */
export const salesServiceExtendedMethods = {
  /**
   * Add to waiting list
   * POST /sales/waiting-list
   * @param {any} data - { contract_id, contract_unit_id, client_name, client_mobile, client_email?, priority, notes? }
   * @returns {Promise<Object>} Created waiting list entry
   */
  async addToWaitingList(data) {
    const raw = data && typeof data === 'object' ? { ...data } : {};
    const mobile =
      raw.client_mobile != null && String(raw.client_mobile).trim() !== ''
        ? String(raw.client_mobile).trim()
        : raw.phone != null && String(raw.phone).trim() !== ''
          ? String(raw.phone).trim()
          : raw.mobile != null && String(raw.mobile).trim() !== ''
            ? String(raw.mobile).trim()
            : '';
    delete raw.phone;
    delete raw.mobile;
    raw.client_mobile = mobile;
    const response = await apiClient.post('/sales/waiting-list', raw);
    return response.data?.data || response.data || {};
  },

  /**
   * Convert waiting list entry to reservation (leader only)
   * POST /sales/waiting-list/{id}/convert
   * @param {number|string} waitingListId - Waiting list entry ID
   * @param {any} data - contract_date, reservation_type, client_nationality, client_iban, payment_method, down_payment_amount, down_payment_status, purchase_mechanism; for negotiation add negotiation_notes
   * @returns {Promise<Object>} Created reservation
   */
  async convertToReservation(waitingListId, data = {}) {
    const response = await apiClient.post(`/sales/waiting-list/${waitingListId}/convert`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Cancel / delete waiting list entry
   * DELETE /sales/waiting-list/{id}
   * @param {number|string} id - Waiting list entry ID
   * @returns {Promise<Object>} Response
   */
  async cancelWaitingListEntry(id) {
    const response = await apiClient.delete(`/sales/waiting-list/${id}`);
    return response.data?.data || response.data || {};
  },

  /** Alias for cancelWaitingListEntry. DELETE /sales/waiting-list/{id} */
  /**
   * @param {any} id
   */
  async deleteWaitingList(id) {
    return this.cancelWaitingListEntry(id);
  },
  // Payment Plans (Off-plan Projects)
  /**
   * Get payment plan for a reservation
   * GET /sales/reservations/{reservation_id}/payment-plan
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Object>} Payment plan data
   */
  async getPaymentPlan(reservationId) {
    const response = await apiClient.get(`/sales/reservations/${reservationId}/payment-plan`);
    return response.data?.data || response.data || {};
  },

  /**
   * Create payment plan for off-plan project
   * POST /sales/reservations/{reservation_id}/payment-plan
   * @param {number|string} reservationId - Reservation ID
   * @param {any} data - Payment plan data (installments array)
   * @returns {Promise<Object>} Created payment plan
   */
  async createPaymentPlan(reservationId, data) {
    const response = await apiClient.post(
      `/sales/reservations/${reservationId}/payment-plan`,
      data
    );
    return response.data?.data || response.data || {};
  },

  /**
   * Update payment installment
   * PUT /sales/payment-installments/{installment_id}
   * @param {number|string} installmentId - Installment ID
   * @param {any} data - Update data
   * @returns {Promise<Object>} Updated installment
   */
  async updatePaymentInstallment(installmentId, data) {
    const response = await apiClient.put(`/sales/payment-installments/${installmentId}`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Delete payment installment
   * DELETE /sales/payment-installments/{installment_id}
   * @param {number|string} installmentId - Installment ID
   * @returns {Promise<Object>} Response
   */
  async deletePaymentInstallment(installmentId) {
    const response = await apiClient.delete(`/sales/payment-installments/${installmentId}`);
    return response.data?.data || response.data || {};
  },

  /**
   * Update marketing task
   * PATCH /sales/marketing-tasks
   * @param {number|string} taskId - Task ID
   * @param {any} data - Update data
   * @returns {Promise<Object>} Updated task
   */
  async updateMarketingTask(taskId, data) {
    const response = await apiClient.patch(`/sales/marketing-tasks/${taskId}`, data);
    return response.data?.data || response.data || {};
  },

  // Project Schedule Management (Leader)

  /**
   * Get project attendance overview — team members with presence status for the given date.
   * GET /sales/attendance/project/{contractId}?date=YYYY-MM-DD
   * API returns server_date, server_time, day_name_ar for 100% match with backend (app timezone).
   * @param {number|string} projectId - Project/Contract ID
   * @param {string} [date] - Optional date (YYYY-MM-DD), defaults to today
   * @returns {Promise<{ members: unknown[], server_date?: string, server_time?: string, day_name_ar?: string }>}
   */
  async getProjectScheduleMembers(projectId, date) {
    const params = {};
    if (date) params.date = date;
    try {
      const response = await apiClient.get(`/sales/attendance/project/${projectId}`, { params });
      const payload = response?.data?.data ?? response?.data ?? {};
      const raw = payload?.members ?? (Array.isArray(payload) ? payload : []);
      const members = Array.isArray(raw) ? raw : [];
      return {
        members,
        server_date: payload.server_date ?? payload.date ?? date ?? null,
        server_time: payload.server_time ?? null,
        day_name_ar: payload.day_name_ar ?? null,
      };
    } catch {
      const self = /** @type {any} */ (this);
      const [teamMembers, attendance] = await Promise.all([
        self.getTeamMembers(),
        self.getTeamAttendance({ contract_id: projectId }).catch(() => []),
      ]);
      const today = (date || new Date().toISOString().slice(0, 10)).toString().slice(0, 10);
      const todayRecords = attendance.filter(
        /**
         * @param {any} r
         */
        r => (r.date || r.schedule_date || '').slice(0, 10) === today
      );
      const members = teamMembers.map(/** @param {any} m */ m => {
        const record = todayRecords.find(/** @param {any} r */ r => (r.user_id ?? r.employee_id) === m.id);
        return {
          ...m,
          is_present: !!record,
          check_in_time: record?.check_in_time || null,
          check_out_time: record?.check_out_time || null,
          status: record?.status || 'absent',
        };
      });
      return { members, server_date: today, server_time: undefined, day_name_ar: undefined };
    }
  },

  // ── Unit Search ─────────────────────────────────────────────────────────

  /**
   * Search units across all projects
   * GET /sales/units/search
   * @param {any} params - city, district, min_area, max_area, min_bedrooms, max_bedrooms, status, min_price, max_price, unit_type, floor, project_id, q, sort_by, sort_dir, page, per_page
   * @returns {Promise<{ items: unknown[], total: number, meta: Object, filters_available?: Object }>}
   */
  async searchUnits(params = {}) {
    try {
      const { useCache, cacheTTL, ...queryParams } = params;
      const response = await apiClient.get('/sales/units/search', /** @type {any} */ ({ 
        params: queryParams,
        useCache,
        cacheTTL
      }));
      const body = response?.data ?? response;
      const items = body?.data ?? [];
      const meta = body?.meta ?? {};
      const filters_available = body?.filters_available ?? null;
      return { items: Array.isArray(items) ? items : [], total: meta.total ?? 0, meta, filters_available };
    } catch (error) {
      return handleServiceError(error, 'Search units', 'get') || { items: [], total: 0, meta: {}, filters_available: null };
    }
  },

  /**
   * Get available filter values for unit search
   * GET /sales/units/filters
   * @returns {Promise<Object>} { cities, districts, unit_types, bedrooms_range, area_range, price_range, statuses }
   */
  async getUnitSearchFilters() {
    try {
      const response = await apiClient.get('/sales/units/filters');
      return response?.data?.data ?? response?.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Unit search filters', 'get') || {};
    }
  },

  // ── SalesInsightsController ─────────────────────────────────────────────

  /**
   * Get sold units
   * GET /sales/sold-units
   * @param {any} params - Optional filters (page, per_page, project_id, date range)
   * @returns {Promise<{ items: unknown[], total: number }>} Paginated sold units
   */
  async getSoldUnits(params = {}) {
    try {
      const response = await apiClient.get('/sales/sold-units', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch sold units', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get commission summary for a sold unit
   * GET /sales/sold-units/{unitId}/commission-summary
   * @param {number|string} unitId - Unit ID
   * @param {any} params - Optional query parameters
   * @returns {Promise<Object>} Commission summary for the unit
   */
  async getSoldUnitCommissionSummary(unitId, params = {}) {
    try {
      const response = await apiClient.get(`/sales/sold-units/${unitId}/commission-summary`, {
        params,
      });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch commission summary', 'get') || {};
    }
  },

  /**
   * Get deposits management data
   * GET /sales/deposits/management
   * @param {any} params - Optional filters (page, per_page, status, project_id)
   * @returns {Promise<{ items: unknown[], total: number }>} Deposits management data
   */
  async getDepositsManagement(params = {}) {
    try {
      const response = await apiClient.get('/sales/deposits/management', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch deposits management', 'get') || { items: [], total: 0 }
      );
    }
  },

  /**
   * Get deposits follow-up data
   * GET /sales/deposits/follow-up
   * @param {any} params - Optional filters (page, per_page, status, overdue_only)
   * @returns {Promise<{ items: unknown[], total: number }>} Deposits requiring follow-up
   */
  async getDepositsFollowUp(params = {}) {
    try {
      const response = await apiClient.get('/sales/deposits/follow-up', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch deposits follow-up', 'get') || { items: [], total: 0 }
      );
    }
  },

  // ── SalesAnalyticsController ─────────────────────────────────────────────

  /**
   * Get analytics dashboard data
   * GET /sales/analytics/dashboard
   * @param {any} params - Optional filters (from, to, scope)
   * @returns {Promise<Object>} Analytics dashboard metrics
   */
  async getAnalyticsDashboard(params = {}) {
    try {
      const response = await apiClient.get('/sales/analytics/dashboard', { params });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch analytics dashboard', 'get') || {};
    }
  },

  /**
   * Get analytics for sold units
   * GET /sales/analytics/sold-units
   * @param {any} params - Optional filters (from, to, project_id)
   * @returns {Promise<Object>} Sold units analytics
   */
  async getAnalyticsSoldUnits(params = {}) {
    try {
      const response = await apiClient.get('/sales/analytics/sold-units', { params });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch analytics sold units', 'get') || {};
    }
  },

  /**
   * Get deposit statistics by project
   * GET /sales/analytics/deposits/stats/project/{contractId}
   * @param {number|string} contractId - Contract/Project ID
   * @param {any} params - Optional query parameters
   * @returns {Promise<Object>} Deposit statistics for the project
   */
  async getAnalyticsDepositStatsByProject(contractId, params = {}) {
    try {
      const response = await apiClient.get(
        `/sales/analytics/deposits/stats/project/${contractId}`,
        { params }
      );
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch deposit stats by project', 'get') || {};
    }
  },

  /**
   * Get commission statistics by employee
   * GET /sales/analytics/commissions/stats/employee/{userId}
   * @param {number|string} userId - User/Employee ID
   * @param {any} params - Optional query parameters (from, to)
   * @returns {Promise<Object>} Commission statistics for the employee
   */
  async getAnalyticsCommissionStatsByEmployee(userId, params = {}) {
    try {
      const response = await apiClient.get(
        `/sales/analytics/commissions/stats/employee/${userId}`,
        { params }
      );
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch commission stats by employee', 'get') || {};
    }
  },

  /**
   * Get monthly commission report
   * GET /sales/analytics/commissions/monthly-report
   * @param {any} params - Required: year (2020-2100), month (1-12)
   * @returns {Promise<Object>} Monthly commission report data
   */
  async getAnalyticsMonthlyCommissionReport(params = {}) {
    try {
      const response = await apiClient.get('/sales/analytics/commissions/monthly-report', {
        params,
      });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, 'Fetch monthly commission report', 'get') || {};
    }
  },

  /**
   * Bulk save project attendance (and triggers backend notifications)
   * POST /sales/attendance/project/{contractId}/bulk
   * BulkAttendanceRequest: date (Y-m-d), schedules[].user_id, present, start_time?, end_time?.
   * الساعات: يمكن إرسال "08:00" أو "08:00:00"؛ يتم تحويلها داخلياً إلى H:i:s.
   * Falls back to individual createSchedule calls on error.
   * @param {number|string} projectId - Project/Contract ID
   * @param {any[]} schedules - Array of { user_id, is_present|present, start_time?, end_time? }
   * @param {string} [date] - schedule_date (YYYY-MM-DD), defaults to today
   * @returns {Promise<Object>} Result with created/updated/removed counts; may include items[] (SalesAttendanceResource with schedule_date, day_name_ar, start_time, end_time, ...)
   */
  async saveProjectSchedules(projectId, schedules, date) {
    const schedule_date = (date || new Date().toISOString().slice(0, 10)).replace(/\//g, '-');
    /**
     * @param {any} v
     */
    const toTime = v => {
      if (!v) return '08:00';
      const s = String(v).trim();
      return s.length > 5 ? s.slice(0, 8) : s; // "08:00" or "08:00:00"
    };
    try {
      const payload = {
        date: schedule_date,
        schedules: schedules.map(s => ({
          user_id: s.user_id,
          present: s.is_present ?? s.present ?? false,
          start_time: toTime(s.start_time) || '08:00',
          end_time: toTime(s.end_time) || '17:00',
        })),
      };
      const response = await apiClient.post(`/sales/attendance/project/${projectId}/bulk`, payload);
      return response.data?.data ?? response.data ?? {};
    } catch {
      const self = /** @type {any} */ (this);
      const presentMembers = schedules.filter(s => s.is_present ?? s.present);
      const results = await Promise.allSettled(
        presentMembers.map(s =>
          self.createSchedule({
            contract_id: projectId,
            user_id: s.user_id,
            schedule_date,
            start_time: toTime(s.start_time) || '08:00',
            end_time: toTime(s.end_time) || '17:00',
          })
        )
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      return { saved: fulfilled.length, items: fulfilled.map(r => r.value?.data?.data ?? r.value?.data ?? r.value) };
    }
  },
};
