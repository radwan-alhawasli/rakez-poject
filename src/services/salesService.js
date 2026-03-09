import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Sales Module API — Base URL: /api/sales (Auth: Bearer token, Content-Type: application/json)
 * Aligned with: "Sales Module - Complete API Collection"
 * - Part 1: Sales Staff (dashboard, projects, units, reservation-context, reservations CRUD, targets, attendance, waiting-list, sold-units, deposits, analytics, notifications)
 * - Part 2: Sales Leader (team/projects, team/members, rating, remove, recommendations, emergency-contacts, targets, attendance/schedules, attendance/project, marketing-tasks, waiting-list/convert)
 * - Admin: project-assignments
 * Create reservation (1.6): reservation_type aliases (عقد→confirmed_reservation, تفاوض→negotiation), required fields and defaults applied in _normalizeReservationPayload. Cancel (1.9): body { cancellation_reason }.
 *
 * Sales API registry (Union of both Postman collections, priority: 249 collection)
 * - preferred_249: endpoint exists in "RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json"
 * - merge_only: endpoint taken from "RAKEZ_ERP_COMPLETE_API_COLLECTION.postman_collection.json" when missing in 249
 */
const SALES_API_ENDPOINT_REGISTRY = {
  getDashboard: { method: 'GET', endpoint: '/sales/dashboard', source: 'preferred_249' },
  getSoldUnits: { method: 'GET', endpoint: '/sales/sold-units', source: 'preferred_249' },
  getSoldUnitCommissionSummary: {
    method: 'GET',
    endpoint: '/sales/sold-units/{unit_id}/commission-summary',
    source: 'preferred_249',
  },
  getDepositsManagement: {
    method: 'GET',
    endpoint: '/sales/deposits/management',
    source: 'preferred_249',
  },
  getDepositsFollowUp: {
    method: 'GET',
    endpoint: '/sales/deposits/follow-up',
    source: 'preferred_249',
  },
  getAnalyticsDashboard: {
    method: 'GET',
    endpoint: '/sales/analytics/dashboard',
    source: 'preferred_249',
  },
  getAnalyticsSoldUnits: {
    method: 'GET',
    endpoint: '/sales/analytics/sold-units',
    source: 'preferred_249',
  },
  getAnalyticsDepositStatsByProject: {
    method: 'GET',
    endpoint: '/sales/analytics/deposits/stats/project/{contract_id}',
    source: 'preferred_249',
  },
  getAnalyticsCommissionStatsByEmployee: {
    method: 'GET',
    endpoint: '/sales/analytics/commissions/stats/employee/{user_id}',
    source: 'preferred_249',
  },
  getAnalyticsMonthlyCommissionReport: {
    method: 'GET',
    endpoint: '/sales/analytics/commissions/monthly-report',
    source: 'preferred_249',
  },
  getProjects: { method: 'GET', endpoint: '/sales/projects', source: 'preferred_249' },
  getProjectDetails: {
    method: 'GET',
    endpoint: '/sales/projects/{contract_id}',
    source: 'preferred_249',
  },
  getProjectUnits: {
    method: 'GET',
    endpoint: '/sales/projects/{contract_id}/units',
    source: 'preferred_249',
  },
  getReservationContext: {
    method: 'GET',
    endpoint: '/sales/units/{unit_id}/reservation-context',
    source: 'preferred_249',
  },
  getReservations: { method: 'GET', endpoint: '/sales/reservations', source: 'preferred_249' },
  createReservation: { method: 'POST', endpoint: '/sales/reservations', source: 'preferred_249' },
  confirmReservation: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/confirm',
    source: 'preferred_249',
  },
  cancelReservation: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/cancel',
    source: 'preferred_249',
  },
  getMyTargets: { method: 'GET', endpoint: '/sales/targets/my', source: 'preferred_249' },
  createTarget: { method: 'POST', endpoint: '/sales/targets', source: 'preferred_249' },
  updateTarget: {
    method: 'PATCH',
    endpoint: '/sales/targets/{target_id}',
    source: 'preferred_249',
  },
  getMyAttendance: { method: 'GET', endpoint: '/sales/attendance/my', source: 'preferred_249' },
  getTeamAttendance: { method: 'GET', endpoint: '/sales/attendance/team', source: 'preferred_249' },
  createSchedule: {
    method: 'POST',
    endpoint: '/sales/attendance/schedules',
    source: 'preferred_249',
  },
  getWaitingList: { method: 'GET', endpoint: '/sales/waiting-list', source: 'preferred_249' },
  convertToReservation: {
    method: 'POST',
    endpoint: '/sales/waiting-list/{waiting_list_id}/convert',
    source: 'preferred_249',
  },
  getPendingNegotiations: {
    method: 'GET',
    endpoint: '/sales/negotiations/pending',
    source: 'preferred_249',
  },
  approveNegotiation: {
    method: 'POST',
    endpoint: '/sales/negotiations/{negotiation_id}/approve',
    source: 'preferred_249',
  },
  rejectNegotiation: {
    method: 'POST',
    endpoint: '/sales/negotiations/{negotiation_id}/reject',
    source: 'preferred_249',
  },
  getPaymentPlan: {
    method: 'GET',
    endpoint: '/sales/reservations/{reservation_id}/payment-plan',
    source: 'preferred_249',
  },
  createPaymentPlan: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/payment-plan',
    source: 'preferred_249',
  },
  getTaskProjects: { method: 'GET', endpoint: '/sales/tasks/projects', source: 'preferred_249' },
  getProjectTasks: {
    method: 'GET',
    endpoint: '/sales/tasks/projects/{contract_id}',
    source: 'preferred_249',
  },
  createMarketingTask: {
    method: 'POST',
    endpoint: '/sales/marketing-tasks',
    source: 'preferred_249',
  },
  updateTaskStatus: {
    method: 'PATCH',
    endpoint: '/sales/marketing-tasks/{task_id}',
    source: 'preferred_249',
  },
  logReservationAction: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/actions',
    source: 'preferred_249',
  },
  downloadVoucher: {
    method: 'GET',
    endpoint: '/sales/reservations/{reservation_id}/voucher',
    source: 'preferred_249',
  },
  createWaitingList: { method: 'POST', endpoint: '/sales/waiting-list', source: 'preferred_249' },
  getWaitingListByUnit: {
    method: 'GET',
    endpoint: '/sales/waiting-list/unit/{unit_id}',
    source: 'preferred_249',
  },
  deleteWaitingList: {
    method: 'DELETE',
    endpoint: '/sales/waiting-list/{waiting_list_id}',
    source: 'preferred_249',
  },
  updateEmergencyContacts: {
    method: 'PATCH',
    endpoint: '/sales/projects/{contract_id}/emergency-contacts',
    source: 'preferred_249',
  },
  assignProjectToLeader: {
    method: 'POST',
    endpoint: '/admin/sales/project-assignments',
    source: 'preferred_249',
  },
  getProjectAssignments: {
    method: 'GET',
    endpoint: '/admin/sales/project-assignments',
    source: 'preferred_249',
  },
  getMyAssignments: { method: 'GET', endpoint: '/sales/assignments/my', source: 'preferred_249' },
  getProjectAttendanceOverview: {
    method: 'GET',
    endpoint: '/sales/attendance/project/{contract_id}',
    source: 'preferred_249',
  },
  bulkSaveProjectAttendance: {
    method: 'POST',
    endpoint: '/sales/attendance/project/{contract_id}/bulk',
    source: 'preferred_249',
  },
};

/**
 * Sales Department Service
 * Manages sales operations including dashboard, projects, reservations, targets, attendance, and team management
 */
const salesService = {
  __endpointRegistry: SALES_API_ENDPOINT_REGISTRY,

  /**
   * Get sales dashboard data
   * GET /sales/dashboard
   * @param {Object} params - scope (me|team|all), from, to (dates)
   * @returns {Promise<Object>} Dashboard data (kpi_version, definitions, reserved_units, confirmed_count, etc.)
   */
  getDashboard(params = {}) {
    return apiClient.get('/sales/dashboard', { params });
  },

  // Projects
  /**
   * Get list of sales projects
   * GET /api/sales/projects — Permission: sales.projects.view
   * @param {Object} params - status (available|pending), q (search by project name), city, district, scope (me|team|all; default me for sales, all for sales_leader), per_page (default 15)
   * @returns {Promise<Object>} { success, data: Array, meta: { current_page, last_page, per_page, total } }
   */
  getProjects(params = {}) {
    return apiClient.get('/sales/projects', { params });
  },

  /**
   * Get project details
   * GET /sales/projects/:projectId
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Object>} Project details
   */
  getProjectDetails(projectId) {
    return apiClient.get(`/sales/projects/${projectId}`);
  },

  /**
   * Get project units
   * GET /sales/projects/{contractId}/units
   * Query: status (available|reserved|sold|pending), floor, min_price, max_price, per_page
   * @param {number|string} projectId - Contract ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Axios response; data array normalized with id, status, area for compatibility
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
   * GET /sales/projects/:projectId/emergency-contacts
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Array>} List of emergency contacts
   */
  getEmergencyContacts(projectId) {
    return apiClient.get(`/sales/projects/${projectId}/emergency-contacts`);
  },

  // Reservations
  /**
   * Get reservation context for a unit
   * GET /sales/units/:unitId/reservation-context
   * @param {number|string} unitId - Unit ID
   * @returns {Promise<Object>} Reservation context data
   */
  getReservationContext(unitId) {
    return apiClient.get(`/sales/units/${unitId}/reservation-context`);
  },

  /**
   * Normalize reservation payload per API spec 1.6: reservation_type aliases, required fields, defaults.
   * Aliases: عقد|contract|confirmed → confirmed_reservation; تفاوض|negotiation → negotiation.
   */
  _normalizeReservationPayload(data) {
    const typeRaw = data?.reservation_type ?? data?.reservationType ?? 'negotiation';
    const typeMap = {
      عقد: 'confirmed_reservation',
      contract: 'confirmed_reservation',
      confirmed: 'confirmed_reservation',
      تفاوض: 'negotiation',
      negotiation: 'negotiation',
    };
    const reservation_type =
      typeMap[typeRaw] ?? (typeRaw === 'confirmed_reservation' || typeRaw === 'negotiation' ? typeRaw : 'negotiation');

    const payload = {
      contract_id: data?.contract_id,
      contract_unit_id: data?.contract_unit_id,
      contract_date: data?.contract_date || new Date().toISOString().split('T')[0],
      reservation_type,
      client_name: data?.client_name ?? '',
      client_mobile: data?.client_mobile ?? data?.phone ?? data?.mobile ?? '',
      client_nationality: data?.client_nationality ?? 'غير محدد',
      client_iban: data?.client_iban ?? data?.clientIban ?? '',
      payment_method: data?.payment_method ?? data?.paymentMethod ?? 'cash',
      down_payment_amount: Number(data?.down_payment_amount ?? data?.downPaymentAmount ?? 0),
      down_payment_status: data?.down_payment_status ?? data?.downPaymentStatus ?? 'refundable',
      purchase_mechanism: data?.purchase_mechanism ?? data?.purchaseMechanism ?? 'cash',
    };
    if (data?.evacuation_date) payload.evacuation_date = data.evacuation_date;
    if (reservation_type === 'negotiation') {
      payload.negotiation_notes = data?.negotiation_notes ?? '';
      payload.negotiation_reason = data?.negotiation_reason ?? 'other';
      payload.proposed_price =
        data?.proposed_price != null && data?.proposed_price !== ''
          ? Number(data.proposed_price)
          : 0;
    }
    return payload;
  },

  /**
   * Create a new reservation
   * POST /sales/reservations — Spec 1.6
   * @param {Object} data - contract_id, contract_unit_id, contract_date, reservation_type (confirmed_reservation|negotiation or aliases عقد/تفاوض), client_name, client_mobile, client_nationality, client_iban, payment_method, down_payment_amount, down_payment_status, purchase_mechanism; for negotiation: negotiation_notes, negotiation_reason, proposed_price
   * @returns {Promise<Object>} Created reservation (reservation_id, status, voucher_url, etc.)
   */
  createReservation(data) {
    const payload = this._normalizeReservationPayload(data);
    return apiClient.post('/sales/reservations', payload);
  },

  /**
   * Get list of reservations
   * GET /sales/reservations
   * @param {Object} params - mine (bool), include_cancelled (bool), contract_id, status (under_negotiation|confirmed|cancelled), from, to, per_page
   * @returns {Promise<{ items: Array, total: number }>} Paginated list of reservations
   */
  async getReservations(params = {}) {
    try {
      const response = await apiClient.get('/sales/reservations', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch reservations', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get single reservation (api.php: GET sales/reservations/{id})
   * @param {number|string} id - Reservation ID
   * @returns {Promise<Object>} Reservation
   */
  async getReservation(id) {
    const response = await apiClient.get(`/sales/reservations/${id}`);
    return response.data?.data ?? response.data ?? {};
  },

  /**
   * Confirm a reservation
   * POST /sales/reservations/:reservationId/confirm
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Object>} Confirmed reservation
   */
  confirmReservation(reservationId) {
    return apiClient.post(`/sales/reservations/${reservationId}/confirm`);
  },

  /**
   * Cancel a reservation
   * POST /sales/reservations/{id}/cancel
   * API body: { cancellation_reason } (optional). Spec 1.9.
   * @param {number|string} reservationId - Reservation ID
   * @param {Object} data - { cancellation_reason } or { reason } (reason mapped to cancellation_reason)
   * @returns {Promise<Object>} Cancelled reservation
   */
  cancelReservation(reservationId, data = {}) {
    const cancellation_reason = data?.cancellation_reason ?? data?.reason ?? '';
    return apiClient.post(`/sales/reservations/${reservationId}/cancel`, {
      cancellation_reason: String(cancellation_reason),
    });
  },

  /**
   * Log an action for a reservation
   * POST /sales/reservations/{id}/actions
   * @param {number|string} reservationId - Reservation ID
   * @param {Object} data - { action_type: 'lead_acquisition'|'persuasion'|'closing', notes }
   * @returns {Promise<Object>} Action log entry
   */
  logAction(reservationId, data) {
    return apiClient.post(`/sales/reservations/${reservationId}/actions`, data);
  },

  /**
   * Download reservation voucher
   * GET /sales/reservations/:reservationId/voucher
   * @param {number|string} reservationId - Reservation ID
   * @returns {Promise<Blob>} Voucher file (PDF/image)
   */
  async downloadVoucher(reservationId) {
    const response = await apiClient.get(`/sales/reservations/${reservationId}/voucher`, {
      responseType: 'blob',
    });
    return response?.data instanceof Blob ? response.data : response;
  },

  /**
   * Download unit details PDF
   * GET /sales/units/:unitId/pdf
   * @param {number|string} unitId - Unit ID (contract_unit_id / id from contract_units)
   * @returns {Promise<{ blob: Blob, filename?: string }>} PDF blob and optional filename from Content-Disposition
   * @throws On 404/403/503 with API message in error response
   */
  async downloadUnitPdf(unitId) {
    const response = await apiClient.get(`/sales/units/${unitId}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    const blob = response?.data instanceof Blob ? response.data : response;
    let filename;
    const contentDisposition = response?.headers?.['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match) filename = match[1].trim();
    }
    return { blob, filename };
  },

  // Targets
  /**
   * Get my sales targets
   * GET /sales/targets/my (api.php: Route::get('targets/my', [SalesTargetController::class, 'my']))
   * @returns {Promise<Array>} List of user's sales targets
   */
  async getMyTargets(params = {}) {
    const response = await apiClient.get('/sales/targets/my', { params });
    const { items } = extractPaginatedData(response, []);
    if (Array.isArray(items) && items.length > 0) return items;
    const data = response?.data ?? response;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.targets)) return data.targets;
    return Array.isArray(items) ? items : [];
  },

  /**
   * Update a sales target
   * PATCH /sales/targets/{id}
   * @param {number|string} targetId - Target ID
   * @param {Object} data - { status: 'new'|'in_progress'|'completed' }
   * @returns {Promise<Object>} Updated target
   */
  updateTarget(targetId, data) {
    return apiClient.patch(`/sales/targets/${targetId}`, data);
  },

  /**
   * Create target for team member (leader only)
   * POST /sales/targets
   * @param {Object} data - marketer_id, contract_id, contract_unit_id, target_type (reservation|negotiation|closing), start_date, end_date, leader_notes
   * @returns {Promise<Object>} Created target
   */
  createTarget(data) {
    return apiClient.post('/sales/targets', data);
  },

  // Attendance
  /**
   * Get my attendance records
   * GET /sales/attendance/my
   * @param {Object} params - Optional query (from, to)
   * @returns {Promise<Array>} List of attendance records
   */
  async getMyAttendance(params = {}) {
    const response = await apiClient.get('/sales/attendance/my', { params });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : response?.data?.data ?? response?.data ?? [];
    return Array.isArray(list) ? list : [];
  },

  /**
   * Get team attendance records
   * GET /sales/attendance/team
   * @param {Object} params - Optional query (from, to, contract_id, user_id)
   * @returns {Promise<Array>} List of team attendance records
   */
  async getTeamAttendance(params = {}) {
    const response = await apiClient.get('/sales/attendance/team', { params });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : response?.data?.data ?? response?.data ?? [];
    return Array.isArray(list) ? list : [];
  },

  /**
   * تعيين دوام فردي (مدير المبيعات فقط)
   * POST /sales/attendance/schedules
   * المدير يرسل: schedule_date (Y-m-d), start_time, end_time. اليوم (day_name_ar) يُستنتج من التاريخ ويُرجع في الاستجابة.
   * الساعات: يمكن إرسال "08:00" أو "08:00:00"؛ يتم تحويلها داخلياً إلى H:i:s.
   * @param {Object} data - { contract_id, user_id, schedule_date (Y-m-d), start_time, end_time }
   * @returns {Promise<Object>} SalesAttendanceResource: schedule_date, day_name_ar, day_of_week, start_time, end_time, user_id, user_name, project_id, project_name, project_location
   */
  createSchedule(data) {
    return apiClient.post('/sales/attendance/schedules', data);
  },

  // Team Management
  /**
   * Get team projects
   * GET /sales/team/projects
   * @param {Object} params - page, per_page, query params
   * @returns {Promise<{ items: Array, total: number }>} List of projects assigned to team
   */
  async getTeamProjects(params = {}) {
    try {
      const response = await apiClient.get('/sales/team/projects', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch team projects', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get my project assignments (sales leader)
   * GET /sales/assignments/my
   * @param {Object} params - page, per_page (1-100, default 15)
   * @returns {Promise<{ items: Array, total: number }>} List of project assignments
   */
  async getMyAssignments(params = {}) {
    try {
      const response = await apiClient.get('/sales/assignments/my', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch my assignments', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get all project assignments (admin)
   * GET /admin/sales/project-assignments
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of project assignments
   */
  async getProjectAssignments(params = {}) {
    try {
      const response = await apiClient.get('/admin/sales/project-assignments', { params });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch project assignments', 'get', []);
    }
  },

  /**
   * Get team members
   * GET /api/sales/team/members
   * @param {Object} params - with_ratings (default: true) — when true, includes leader_rating and confirmed_reservations_count
   * @returns {Promise<Array>} List of team members with id, name, email, team, rating (leader_rating), confirmed_bookings, etc.
   */
  async getTeamMembers(params = {}) {
    const { with_ratings = true } = params;
    const response = await apiClient.get('/sales/team/members', {
      params: { with_ratings },
    });
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      email: m.email ?? null,
      team: m.team ?? m.team_name ?? null,
      total_sales: m.total_sales ?? m.sales_count ?? 0,
      total_value: m.total_value ?? m.sales_value ?? m.total_sales_value ?? 0,
      rating: m.leader_rating != null ? Number(m.leader_rating) : (m.rating != null ? Number(m.rating) : null),
      comment: m.leader_rating_comment ?? m.comment ?? null,
      confirmed_bookings: m.confirmed_reservations_count ?? m.confirmed_bookings ?? m.confirmed_count ?? 0,
      total_reservations: m.total_reservations ?? m.reservations_count ?? 0,
      villa_count: m.villa_count ?? m.villas_sold ?? 0,
    }));
  },

  /**
   * Team recommendations (ترشيح بالذكاء الاصطناعي) — members sorted by recommendation score.
   * GET /api/sales/team/recommendations
   * @returns {Promise<Array>} Same shape as getTeamMembers with recommendation_score, confirmed_percent, unit_type_avg_score, etc.
   */
  async getTeamRecommendations() {
    const response = await apiClient.get('/sales/team/recommendations');
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      email: m.email ?? null,
      team: m.team ?? m.team_name ?? null,
      total_sales: m.total_sales ?? m.sales_count ?? 0,
      total_value: m.total_value ?? m.sales_value ?? m.total_sales_value ?? 0,
      rating: m.leader_rating != null ? Number(m.leader_rating) : (m.rating != null ? Number(m.rating) : null),
      comment: m.leader_rating_comment ?? m.comment ?? null,
      confirmed_bookings: m.confirmed_count ?? m.confirmed_reservations_count ?? m.confirmed_bookings ?? 0,
      total_reservations: m.total_reservations ?? m.reservations_count ?? 0,
      recommendation_score: m.recommendation_score != null ? Number(m.recommendation_score) : null,
      confirmed_percent: m.confirmed_percent != null ? Number(m.confirmed_percent) : null,
      unit_type_avg_score: m.unit_type_avg_score != null ? Number(m.unit_type_avg_score) : null,
      recommendation_highlights: Array.isArray(m.recommendation_highlights)
        ? m.recommendation_highlights
        : [],
      confirmed_recent_90: m.confirmed_recent_90 != null ? Number(m.confirmed_recent_90) : null,
    }));
  },

  /**
   * Rate and/or comment on a team member. Leader only.
   * PATCH /api/sales/team/members/{memberId}/rating
   * - تعليق فقط: { "comment": "..." }
   * - تقييم فقط: { "rating": 1..5 }
   * - تقييم + تعليق: { "rating": 4, "comment": "..." }
   * يحدّث فقط الحقول المرسلة (التعليق لا يمس التقييم والعكس).
   * @param {number|string} memberId - Team member user id
   * @param {number|null|undefined} [rating] - 1 to 5 (optional; null/undefined = لا تغيير)
   * @param {string|null|undefined} [comment] - تعليق مدير المبيعات حتى 2000 حرف (optional)
   * @returns {Promise<Object>} data.rating, data.comment
   */
  rateTeamMember(memberId, rating, comment = null) {
    const body = {};
    if (rating != null && rating !== '') body.rating = Number(rating);
    if (comment != null && String(comment).trim() !== '') body.comment = String(comment).trim();
    if (Object.keys(body).length === 0) return Promise.reject(new Error('يجب إرسال التقييم و/أو التعليق'));
    return apiClient.patch(`/sales/team/members/${memberId}/rating`, body);
  },

  /**
   * Remove (fire) a team member from the leader's team. Leader only.
   * POST /api/sales/team/members/{memberId}/remove
   * @param {number|string} memberId - Team member user id
   * @returns {Promise<Object>}
   */
  removeTeamMember(memberId) {
    return apiClient.post(`/sales/team/members/${memberId}/remove`);
  },

  /**
   * Assign project to leader (admin only)
   * POST /admin/sales/project-assignments
   * @param {Object} data - { leader_id, contract_id, start_date, end_date }
   * @returns {Promise<Object>} Assignment result
   */
  assignProject(data) {
    return apiClient.post('/admin/sales/project-assignments', data);
  },

  // Marketing Tasks (Leader)
  /**
   * Get projects with marketing tasks
   * GET /sales/tasks/projects
   * @returns {Promise<Array>} List of projects with tasks
   */
  async getTaskProjects() {
    const response = await apiClient.get('/sales/tasks/projects');
    const body = response?.data ?? response;
    const list = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.projects)
      ? body.projects
      : Array.isArray(body)
      ? body
      : [];
    return list;
  },

  /**
   * Get tasks for a specific project
   * GET /sales/tasks/projects/:projectId
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Array>} List of tasks for the project
   */
  async getProjectTasks(projectId) {
    const response = await apiClient.get(`/sales/tasks/projects/${projectId}`);
    const body = response?.data ?? response;
    const list = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.tasks)
      ? body.tasks
      : Array.isArray(body)
      ? body
      : [];
    return list;
  },

  /**
   * Create marketing task (leader only)
   * POST /sales/marketing-tasks
   * @param {Object} data - contract_id, task_name, marketer_id, participating_marketers_count, design_link, design_number, design_description
   * @returns {Promise<Object>} Created task
   */
  createMarketingTask(data) {
    return apiClient.post('/sales/marketing-tasks', data);
  },

  /**
   * Update marketing task status
   * PATCH /sales/marketing-tasks/{id}
   * @param {number|string} taskId - Task ID
   * @param {Object} data - { status: 'new'|'in_progress'|'completed' }
   * @returns {Promise<Object>} Updated task
   */
  updateTaskStatus(taskId, data) {
    return apiClient.patch(`/sales/marketing-tasks/${taskId}`, data);
  },

  // --- Missing Endpoints ---

  /**
   * Update emergency contacts for a project
   * PATCH /sales/projects/emergency-contacts
   * @param {number|string} projectId - Project ID
   * @param {Object} data - Emergency contacts data
   * @returns {Promise<Object>} Updated emergency contacts
   */
  async updateEmergencyContacts(projectId, data) {
    const response = await apiClient.patch(`/sales/projects/${projectId}/emergency-contacts`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Update my target (api.php: PATCH sales/targets/{id})
   * @param {number|string} [targetId] - Target ID (or pass single arg as data with data.id)
   * @param {Object} [data] - Target update data (amount, period, etc.)
   * @returns {Promise<Object>} Updated target
   */
  async updateMyTarget(targetIdOrData, data) {
    const isDataOnly = typeof targetIdOrData === 'object' && data === undefined;
    const targetId = isDataOnly ? targetIdOrData?.id : targetIdOrData;
    const payload = isDataOnly ? targetIdOrData : data ?? {};
    if (targetId == null) return Promise.reject(new Error('Target ID is required'));
    const response = await apiClient.patch(`/sales/targets/${targetId}`, payload);
    return response.data?.data || response.data || {};
  },

  /**
   * Get waiting list
   * GET /sales/waiting-list
   * @param {Object} params - status, sales_staff_id, contract_id, contract_unit_id, active_only, per_page
   * @returns {Promise<Array>} List of waiting list entries
   */
  async getWaitingList(params = {}) {
    const response = await apiClient.get('/sales/waiting-list', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  /**
   * Get waiting list by unit
   * GET /sales/waiting-list/unit
   * @param {number|string} unitId - Unit ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Waiting list entries for unit
   */
  async getWaitingListByUnit(unitId, params = {}) {
    const response = await apiClient.get(`/sales/waiting-list/unit/${unitId}`, { params });
    const waitingList = response.data?.data || response.data || [];
    return Array.isArray(waitingList) ? waitingList : [];
  },

  /**
   * Get single waiting list entry (api.php: GET sales/waiting-list/{id})
   * @param {number|string} id - Waiting list entry ID
   * @returns {Promise<Object>} Waiting list entry
   */
  async getWaitingListEntry(id) {
    const response = await apiClient.get(`/sales/waiting-list/${id}`);
    return response.data?.data ?? response.data ?? {};
  },

  /**
   * Add to waiting list
   * POST /sales/waiting-list
   * @param {Object} data - { contract_id, contract_unit_id, client_name, client_mobile, client_email?, priority, notes? }
   * @returns {Promise<Object>} Created waiting list entry
   */
  async addToWaitingList(data) {
    const response = await apiClient.post('/sales/waiting-list', data);
    return response.data?.data || response.data || {};
  },

  /**
   * Convert waiting list entry to reservation (leader only)
   * POST /sales/waiting-list/{id}/convert
   * @param {number|string} waitingListId - Waiting list entry ID
   * @param {Object} data - contract_date, reservation_type, client_nationality, client_iban, payment_method, down_payment_amount, down_payment_status, purchase_mechanism; for negotiation add negotiation_notes
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
  async deleteWaitingList(id) {
    return this.cancelWaitingListEntry(id);
  },

  /**
   * Get pending negotiations
   * GET /sales/negotiations/pending
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of pending negotiations
   */
  async getPendingNegotiations(params = {}) {
    const response = await apiClient.get('/sales/negotiations/pending', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  /**
   * Approve negotiation
   * POST /sales/negotiations/approve
   * @param {number|string} negotiationId - Negotiation ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approved negotiation
   */
  async approveNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/approve`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Reject negotiation
   * POST /sales/negotiations/reject
   * @param {number|string} negotiationId - Negotiation ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejected negotiation
   */
  async rejectNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/reject`, data);
    return response.data?.data || response.data || {};
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
   * @param {Object} data - Payment plan data (installments array)
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
   * @param {Object} data - Update data
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
   * @param {Object} data - Update data
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
   * @returns {Promise<{ members: Array, server_date?: string, server_time?: string, day_name_ar?: string }>}
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
      const [teamMembers, attendance] = await Promise.all([
        this.getTeamMembers(),
        this.getTeamAttendance({ contract_id: projectId }).catch(() => []),
      ]);
      const today = (date || new Date().toISOString().slice(0, 10)).toString().slice(0, 10);
      const todayRecords = attendance.filter(
        r => (r.date || r.schedule_date || '').slice(0, 10) === today
      );
      const members = teamMembers.map(m => {
        const record = todayRecords.find(r => (r.user_id ?? r.employee_id) === m.id);
        return {
          ...m,
          is_present: !!record,
          check_in_time: record?.check_in_time || null,
          check_out_time: record?.check_out_time || null,
          status: record?.status || 'absent',
        };
      });
      return { members, server_date: today, server_time: null, day_name_ar: null };
    }
  },

  // ── Unit Search ─────────────────────────────────────────────────────────

  /**
   * Search units across all projects
   * GET /sales/units/search
   * @param {Object} params - city, district, min_area, max_area, min_bedrooms, max_bedrooms, status, min_price, max_price, unit_type, floor, project_id, q, sort_by, sort_dir, page, per_page
   * @returns {Promise<{ items: Array, total: number, meta: Object, filters_available?: Object }>}
   */
  async searchUnits(params = {}) {
    try {
      const response = await apiClient.get('/sales/units/search', { params });
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
   * @param {Object} params - Optional filters (page, per_page, project_id, date range)
   * @returns {Promise<{ items: Array, total: number }>} Paginated sold units
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
   * @param {Object} params - Optional query parameters
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
   * @param {Object} params - Optional filters (page, per_page, status, project_id)
   * @returns {Promise<{ items: Array, total: number }>} Deposits management data
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
   * @param {Object} params - Optional filters (page, per_page, status, overdue_only)
   * @returns {Promise<{ items: Array, total: number }>} Deposits requiring follow-up
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
   * @param {Object} params - Optional filters (from, to, scope)
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
   * @param {Object} params - Optional filters (from, to, project_id)
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
   * @param {Object} params - Optional query parameters
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
   * @param {Object} params - Optional query parameters (from, to)
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
   * @param {Object} params - Required: year (2020-2100), month (1-12)
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
   * @param {Array} schedules - Array of { user_id, is_present|present, start_time?, end_time? }
   * @param {string} [date] - schedule_date (YYYY-MM-DD), defaults to today
   * @returns {Promise<Object>} Result with created/updated/removed counts; may include items[] (SalesAttendanceResource with schedule_date, day_name_ar, start_time, end_time, ...)
   */
  async saveProjectSchedules(projectId, schedules, date) {
    const schedule_date = (date || new Date().toISOString().slice(0, 10)).replace(/\//g, '-');
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
      const presentMembers = schedules.filter(s => s.is_present ?? s.present);
      const results = await Promise.allSettled(
        presentMembers.map(s =>
          this.createSchedule({
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

export default salesService;
