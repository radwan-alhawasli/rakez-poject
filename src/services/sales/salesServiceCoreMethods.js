import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { normalizeReservationPayload } from '@/services/sales/salesReservationPayload.js';
import logger from '@/utils/logger';

/**
 * فك استجابة قوائم الأهداف — أشكال متعددة من Laravel / pagination.
 * @param {import('axios').AxiosResponse|any} response
 * @returns {{ items: unknown[], total: number }}
 */
function unwrapSalesTargetsList(response) {
  const { items, total } = extractPaginatedData(response, []);
  if (Array.isArray(items) && items.length > 0) return { items, total };
  
  const data = response?.data ?? response;
  if (Array.isArray(data)) return { items: data, total: data.length };
  if (data && Array.isArray(data.data)) return { items: data.data, total: data.total ?? data.data.length };
  if (data && Array.isArray(data.targets)) return { items: data.targets, total: data.total ?? data.targets.length };
  
  const nested = data?.data;
  if (nested && typeof nested === 'object') {
    if (Array.isArray(nested.targets)) return { items: nested.targets, total: nested.total ?? nested.targets.length };
    if (Array.isArray(nested.data)) return { items: nested.data, total: nested.total ?? nested.data.length };
  }
  
  return { items: [], total: 0 };
}

/**
 * PATCH {apiClient baseURL}/sales/targets/{id}
 * يطابق طلب المتصفح مثل: https://api.rakez.com.sa/api/sales/targets/4 (طريقة PATCH، حالة 200)
 * يُستخدم لتحديث حالة الهدف للمسوق العادي وقائد المبيعات بنفس المسار.
 * @param {number|string} targetId
 * @param {Record<string, unknown>} data
 */
function patchSalesTargetRecord(targetId, data) {
  return apiClient.patch(`sales/targets/${targetId}`, data);
}

/**
 * Core sales API methods (composed into default export in salesService.js).
 */
export const salesServiceCoreMethods = {
  getDashboard(params = {}) {
    return apiClient.get('/sales/dashboard', { params });
  },

  // Projects
  /**
   * Get list of sales projects
   * GET /api/sales/projects — Permission: sales.projects.view
   * @param {any} params - status (available|pending), q (search by project name), city, district, scope (me|team|all; default me for sales, all for sales_leader), per_page (default 15)
   * @returns {Promise<Object>} { success, data: unknown[], meta: { current_page, last_page, per_page, total } }
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
   * @param {any} params - Query parameters
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
   * @returns {Promise<unknown|unknown[]>} Contact object, list, or nested payload (unwrapped from axios)
   */
  async getEmergencyContacts(projectId) {
    const response = await apiClient.get(`/sales/projects/${projectId}/emergency-contacts`);
    return response.data?.data ?? response.data;
  },

  // Reservations
  /**
   * Get reservation context for a unit
   * GET /sales/units/:unitId/reservation-context
   * @param {number|string} unitId - Unit ID
   * @param {any} [params] - اختياري: query مثل include أو with إن دعمها الباكند (مثال: { include: 'teams' })
   * @returns {Promise<Object>} Reservation context data
   */
  getReservationContext(unitId, params = {}) {
    const config = params && typeof params === 'object' && Object.keys(params).length > 0 ? { params } : {};
    return apiClient.get(`/sales/units/${unitId}/reservation-context`, config);
  },

  /**
   * Create a new reservation (payload normalized per API spec 1.6: reservation_type aliases, required fields, defaults).
   * Aliases: عقد|contract|confirmed → confirmed_reservation; تفاوض|negotiation → negotiation.
   * POST /sales/reservations — Spec 1.6
   * @param {any} data - contract_id, contract_unit_id, contract_date, reservation_type (confirmed_reservation|negotiation or aliases عقد/تفاوض), client_name, client_mobile, client_nationality, client_iban, payment_method, down_payment_amount, down_payment_status, purchase_mechanism; for negotiation: negotiation_notes, negotiation_reason, proposed_price
   * @returns {Promise<Object>} Created reservation (reservation_id, status, voucher_url, etc.)
   */
  createReservation(data) {
    return apiClient.post('/sales/reservations', normalizeReservationPayload(data));
  },

  /**
   * Get list of reservations
   * GET /sales/reservations
   * @param {any} params - mine (bool), include_cancelled (bool), contract_id, status (under_negotiation|confirmed|cancelled), from, to, per_page
   * @returns {Promise<{ items: unknown[], total: number }>} Paginated list of reservations
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
   * @param {any} data - { cancellation_reason } or { reason } (reason mapped to cancellation_reason)
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
   * @param {any} data - { action_type: 'lead_acquisition'|'persuasion'|'closing', notes }
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
    const data = response?.data;
    if (data instanceof Blob) return data;
    throw new Error('Expected blob response for voucher download');
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
    const raw = response?.data;
    if (!(raw instanceof Blob)) {
      throw new Error('Expected PDF blob for unit download');
    }
    const blob = raw;
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
   * Get targets for team goals page (cards list).
   * GET /sales/targets/my — Permission: sales.targets.view
   * Role behavior: Sales Leader → all team goals (targets assigned to any team member);
   * Sales staff (non-leader) → only targets where marketer_id = current user.
   * Each item: marketer_id / marketer_name = assignee (user type `sales` in the system — sales team member).
   * @param {any} params - Optional: from, to, status (new|in_progress|completed), per_page
   * @returns {Promise<unknown[]>} List of targets (SalesTargetItem: units[], marketer_id, marketer_name, contract_id, etc.)
   */
  async getMyTargets(params = {}) {
    try {
      const response = await apiClient.get('sales/targets/my', { params });
      return unwrapSalesTargetsList(response);
    } catch (error) {
      return handleServiceError(error, 'Fetch my targets', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Get targets by project (units assigned to team + assignee per target).
   * GET /sales/targets/by-project/{contractId}
   * Permission: sales.targets.view. Used when opening the "assigned units" modal from team goals.
   * Each item: marketer_id / marketer_name = assignee (user type `sales` — sales team member).
   * @param {number|string} contractId - Contract/Project ID
   * @returns {Promise<unknown[]>} List of targets for this project (SalesTargetItem: units[], marketer_id, marketer_name, etc.)
   */
  async getTargetsByProject(contractId) {
    const response = await apiClient.get(`sales/targets/by-project/${contractId}`);
    return unwrapSalesTargetsList(response);
  },

  /**
   * Update a sales target — نفس طلب الشبكة PATCH …/api/sales/targets/{id} للجميع (عبر patchSalesTargetRecord)
   * المرجع: docs/SALES_TARGETS_API_SUMMARY.md
   * @param {number|string} targetId - Target ID
   * @param {any} data - { status: 'new'|'in_progress'|'completed' }
   * @returns {Promise<import('axios').AxiosResponse>} Axios response
   */
  updateTarget(targetId, data) {
    return apiClient.patch(`sales/targets/${targetId}`, data);
  },

  /**
   * Create target (leader only). Assignee must be a user of type `sales` (from team/members).
   * POST /sales/targets — Permission: sales.team.manage
   * المرجع: docs/SALES_TARGETS_API_SUMMARY.md
   * @param {any} data - assignee_marketer_id (user type sales, from GET /sales/team/members), contract_id, contract_unit_id (or contract_unit_ids array), must_sell_units_count, target_type (reservation|negotiation|closing), start_date, end_date, leader_notes, assigned_target_value
   * @returns {Promise<Object>} Created target
   */
  createTarget(data) {
    return apiClient.post('sales/targets', data);
  },

  // Attendance
  /**
   * Get my attendance records
   * GET /sales/attendance/my
   * @param {any} params - Optional query (from, to)
   * @returns {Promise<unknown[]>} List of attendance records
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
   * @param {any} params - Optional query (from, to, contract_id, user_id)
   * @returns {Promise<unknown[]>} List of team attendance records
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
   * @param {any} data - { contract_id, user_id, schedule_date (Y-m-d), start_time, end_time }
   * @returns {Promise<Object>} SalesAttendanceResource: schedule_date, day_name_ar, day_of_week, start_time, end_time, user_id, user_name, project_id, project_name, project_location
   */
  createSchedule(data) {
    return apiClient.post('/sales/attendance/schedules', data);
  },

  // Team Management
  /**
   * Get team projects
   * GET /sales/team/projects
   * @param {any} params - page, per_page, query params
   * @returns {Promise<{ items: unknown[], total: number }>} List of projects assigned to team
   */
  async getTeamProjects(params = {}) {
    try {
      const response = await apiClient.get('sales/team/projects', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch team projects', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Get my project assignments (sales leader)
   * GET /sales/assignments/my
   * @param {any} params - page, per_page (1-100, default 15)
   * @returns {Promise<{ items: unknown[], total: number }>} List of project assignments
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
   * @param {any} params - Query parameters
   * @returns {Promise<unknown[]>} List of project assignments
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
   * Get sales team members (leader only).
   * GET /api/sales/team/members — Permission: sales.team.manage (403 for non-leaders).
   * Used on Team Goals page and in "Add new goal" form for assignee dropdown (marketer_id / name).
   * @param {any} params - with_ratings (default: true); use false for lighter response in create-goal dropdown
   * @returns {Promise<unknown[]>} List of team members with id, name, email, team, rating (leader_rating), confirmed_bookings, etc.
   */
  async getTeamMembers(params = {}) {
    const { with_ratings = true } = params;
    const response = await apiClient.get('sales/team/members', {
      params: { with_ratings },
    });
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      email: m.email ?? null,
      avatar: m.image_url ?? m.avatar_url ?? m.profile_image ?? null,
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
   * @returns {Promise<unknown[]>} Same shape as getTeamMembers with recommendation_score, confirmed_percent, unit_type_avg_score, etc.
   */
  async getTeamRecommendations() {
    const response = await apiClient.get('sales/team/recommendations');
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      email: m.email ?? null,
      avatar: m.image_url ?? m.avatar_url ?? m.profile_image ?? null,
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
    if (rating != null) body.rating = Number(rating);
    if (comment != null && String(comment).trim() !== '') body.comment = String(comment).trim();
    if (Object.keys(body).length === 0) return Promise.reject(new Error('يجب إرسال التقييم و/أو التعليق'));
    return apiClient.patch(`sales/team/members/${memberId}/rating`, body);
  },

  /**
   * Remove (fire) a team member from the leader's team. Leader only.
   * POST /api/sales/team/members/{memberId}/remove
   * @param {number|string} memberId - Team member user id
   * @returns {Promise<Object>}
   */
  removeTeamMember(memberId) {
    return apiClient.post(`sales/team/members/${memberId}/remove`);
  },

  /**
   * Assign project to leader (admin only)
   * POST /admin/sales/project-assignments
   * @param {any} data - { leader_id, contract_id, start_date, end_date }
   * @returns {Promise<Object>} Assignment result
   */
  assignProject(data) {
    return apiClient.post('/admin/sales/project-assignments', data);
  },

  // Marketing Tasks (Leader)
  /**
   * Get projects with marketing tasks
   * GET /sales/tasks/projects
   * @returns {Promise<unknown[]>} List of projects with tasks
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
   * @returns {Promise<unknown[]>} List of tasks for the project
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
   * @param {any} data - contract_id, task_name, marketer_id, participating_marketers_count, design_link, design_number, design_description
   * @returns {Promise<Object>} Created task
   */
  createMarketingTask(data) {
    return apiClient.post('/sales/marketing-tasks', data);
  },

  /**
   * Update marketing task status
   * PATCH /sales/marketing-tasks/{id}
   * @param {number|string} taskId - Task ID
   * @param {any} data - { status: 'new'|'in_progress'|'completed' }
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
   * @param {any} data - Emergency contacts data
   * @returns {Promise<Object>} Updated emergency contacts
   */
  async updateEmergencyContacts(projectId, data) {
    const response = await apiClient.patch(`/sales/projects/${projectId}/emergency-contacts`, data);
    return response.data?.data || response.data || {};
  },

  /**
   * Update my target — نفس مسار updateTarget (PATCH …/sales/targets/{id}) مع إرجاع جسم الاستجابة فقط
   * @param {number|string|Object} targetIdOrData - Target ID or payload object with `id` when `data` omitted
   * @param {any} [data] - Target update data (amount, period, etc.)
   * @returns {Promise<Object>} Updated target
   */
  async updateMyTarget(targetIdOrData, data) {
    const isDataOnly = typeof targetIdOrData === 'object' && data === undefined;
    const targetId = isDataOnly ? /** @type {any} */ (targetIdOrData).id : targetIdOrData;
    const payload = isDataOnly ? targetIdOrData : data ?? {};
    if (targetId == null) return Promise.reject(new Error('Target ID is required'));
    const response = await patchSalesTargetRecord(targetId, payload);
    return response.data?.data || response.data || {};
  },

  /**
   * Get waiting list
   * GET /sales/waiting-list
   * @param {any} params - status, sales_staff_id, contract_id, contract_unit_id, active_only, per_page
   * @returns {Promise<unknown[]>} List of waiting list entries
   */
  async getWaitingList(params = {}) {
    const response = await apiClient.get('/sales/waiting-list', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  /**
   * إجمالي عناصر قائمة انتظار الحجز (يعتمد على meta.total عند توفره).
   * GET /sales/waiting-list?per_page=1
   * @param {Record<string, unknown>} [params] - مثل active_only
   * @returns {Promise<number>}
   */
  async getWaitingListCount(params = {}) {
    try {
      const response = await apiClient.get('/sales/waiting-list', {
        params: { per_page: 1, page: 1, ...params },
      });
      const { items, total } = extractPaginatedData(response, []);
      const n = Number(total);
      if (!Number.isNaN(n) && n >= 0) return n;
      return Array.isArray(items) ? items.length : 0;
    } catch (error) {
      logger.warn('[sales] getWaitingListCount:', error);
      return 0;
    }
  },

  /**
   * Get waiting list by unit
   * GET /sales/waiting-list/unit
   * @param {number|string} unitId - Unit ID
   * @param {any} params - Query parameters
   * @returns {Promise<unknown[]>} Waiting list entries for unit
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
};
