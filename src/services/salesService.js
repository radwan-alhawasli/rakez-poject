import apiClient from '../api/apiClient'
import { handleServiceError } from '../utils/serviceErrorHandler'
import { extractPaginatedData } from '../utils/paginationUtils'

/**
 * Sales API registry (Union of both Postman collections, priority: 249 collection)
 * - preferred_249: endpoint exists in "RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json"
 * - merge_only: endpoint taken from "RAKEZ_ERP_COMPLETE_API_COLLECTION.postman_collection.json" when missing in 249
 */
const SALES_API_ENDPOINT_REGISTRY = {
    getDashboard: { method: 'GET', endpoint: '/sales/dashboard', source: 'preferred_249' },
    getProjects: { method: 'GET', endpoint: '/sales/projects', source: 'preferred_249' },
    getProjectDetails: { method: 'GET', endpoint: '/sales/projects/{contract_id}', source: 'preferred_249' },
    getProjectUnits: { method: 'GET', endpoint: '/sales/projects/{contract_id}/units', source: 'preferred_249' },
    getReservationContext: { method: 'GET', endpoint: '/sales/units/{unit_id}/reservation-context', source: 'preferred_249' },
    getReservations: { method: 'GET', endpoint: '/sales/reservations', source: 'preferred_249' },
    createReservation: { method: 'POST', endpoint: '/sales/reservations', source: 'preferred_249' },
    confirmReservation: { method: 'POST', endpoint: '/sales/reservations/{reservation_id}/confirm', source: 'preferred_249' },
    cancelReservation: { method: 'POST', endpoint: '/sales/reservations/{reservation_id}/cancel', source: 'preferred_249' },
    getMyTargets: { method: 'GET', endpoint: '/sales/targets/my', source: 'preferred_249' },
    createTarget: { method: 'POST', endpoint: '/sales/targets', source: 'preferred_249' },
    updateTarget: { method: 'PUT', endpoint: '/sales/targets/{target_id}', source: 'preferred_249' },
    getMyAttendance: { method: 'GET', endpoint: '/sales/attendance/my', source: 'preferred_249' },
    getTeamAttendance: { method: 'GET', endpoint: '/sales/attendance/team', source: 'preferred_249' },
    createSchedule: { method: 'POST', endpoint: '/sales/attendance/schedules', source: 'preferred_249' },
    getWaitingList: { method: 'GET', endpoint: '/sales/waiting-list', source: 'preferred_249' },
    convertToReservation: { method: 'POST', endpoint: '/sales/waiting-list/{waiting_list_id}/convert', source: 'preferred_249' },
    getPendingNegotiations: { method: 'GET', endpoint: '/sales/negotiations/pending', source: 'preferred_249' },
    approveNegotiation: { method: 'POST', endpoint: '/sales/negotiations/{negotiation_id}/approve', source: 'preferred_249' },
    rejectNegotiation: { method: 'POST', endpoint: '/sales/negotiations/{negotiation_id}/reject', source: 'preferred_249' },
    getPaymentPlan: { method: 'GET', endpoint: '/sales/reservations/{reservation_id}/payment-plan', source: 'preferred_249' },
    createPaymentPlan: { method: 'POST', endpoint: '/sales/reservations/{reservation_id}/payment-plan', source: 'preferred_249' },
    getTaskProjects: { method: 'GET', endpoint: '/sales/tasks/projects', source: 'preferred_249' },
    getProjectTasks: { method: 'GET', endpoint: '/sales/tasks/projects/{contract_id}', source: 'preferred_249' },
    createMarketingTask: { method: 'POST', endpoint: '/sales/marketing-tasks', source: 'preferred_249' },
    updateTaskStatus: { method: 'PUT', endpoint: '/sales/marketing-tasks/{task_id}', source: 'preferred_249' },
    getProjectAssignments: { method: 'GET', endpoint: '/admin/sales/project-assignments', source: 'preferred_249' },
    getMyAssignments: { method: 'GET', endpoint: '/sales/assignments/my', source: 'preferred_249' }
}

/**
 * Sales Department Service
 * Manages sales operations including dashboard, projects, reservations, targets, attendance, and team management
 */
const salesService = {
    __endpointRegistry: SALES_API_ENDPOINT_REGISTRY,

    /**
     * Get sales dashboard data
     * GET /sales/dashboard
     * @param {Object} params - Query parameters (optional filters, date ranges)
     * @returns {Promise<Object>} Dashboard data with KPIs and statistics
     */
    getDashboard(params = {}) {
        return apiClient.get('/sales/dashboard', { params })
    },

    // Projects
    /**
     * Get list of sales projects
     * GET /sales/projects
     * @returns {Promise<Array>} List of projects available to sales team
     */
    getProjects() {
        return apiClient.get('/sales/projects')
    },

    /**
     * Get project details
     * GET /sales/projects/:projectId
     * @param {number|string} projectId - Project ID
     * @returns {Promise<Object>} Project details
     */
    getProjectDetails(projectId) {
        return apiClient.get(`/sales/projects/${projectId}`)
    },

    /**
     * Get project units
     * GET /sales/projects/:projectId/units
     * @param {number|string} projectId - Project ID
     * @returns {Promise<Array>} List of units in the project
     */
    getProjectUnits(projectId) {
        return apiClient.get(`/sales/projects/${projectId}/units`)
    },

    /**
     * Get emergency contacts for a project
     * GET /sales/projects/:projectId/emergency-contacts
     * @param {number|string} projectId - Project ID
     * @returns {Promise<Array>} List of emergency contacts
     */
    getEmergencyContacts(projectId) {
        return apiClient.get(`/sales/projects/${projectId}/emergency-contacts`)
    },

    // Reservations
    /**
     * Get reservation context for a unit
     * GET /sales/units/:unitId/reservation-context
     * @param {number|string} unitId - Unit ID
     * @returns {Promise<Object>} Reservation context data
     */
    getReservationContext(unitId) {
        return apiClient.get(`/sales/units/${unitId}/reservation-context`)
    },

    /**
     * Create a new reservation
     * POST /sales/reservations
     * @param {Object} data - Reservation data (unit_id, client_name, client_mobile, etc.)
     * @returns {Promise<Object>} Created reservation
     */
    createReservation(data) {
        return apiClient.post('/sales/reservations', data)
    },

    /**
     * Get list of reservations
     * GET /sales/reservations
     * @param {Object} params - page, per_page, status
     * @returns {Promise<{ items: Array, total: number }>} List of reservations
     */
    async getReservations(params = {}) {
        try {
            const response = await apiClient.get('/sales/reservations', { params })
            const { items, total } = extractPaginatedData(response, [])
            return { items, total }
        } catch (error) {
            return handleServiceError(error, 'Fetch reservations', 'get') || { items: [], total: 0 }
        }
    },

    /**
     * Confirm a reservation
     * POST /sales/reservations/:reservationId/confirm
     * @param {number|string} reservationId - Reservation ID
     * @returns {Promise<Object>} Confirmed reservation
     */
    confirmReservation(reservationId) {
        return apiClient.post(`/sales/reservations/${reservationId}/confirm`)
    },

    /**
     * Cancel a reservation
     * POST /sales/reservations/:reservationId/cancel
     * @param {number|string} reservationId - Reservation ID
     * @returns {Promise<Object>} Cancelled reservation
     */
    cancelReservation(reservationId) {
        return apiClient.post(`/sales/reservations/${reservationId}/cancel`)
    },

    /**
     * Log an action for a reservation
     * POST /sales/reservations/:reservationId/actions
     * @param {number|string} reservationId - Reservation ID
     * @param {Object} data - Action data (action_type, notes, etc.)
     * @returns {Promise<Object>} Action log entry
     */
    logAction(reservationId, data) {
        return apiClient.post(`/sales/reservations/${reservationId}/actions`, data)
    },

    /**
     * Download reservation voucher
     * GET /sales/reservations/:reservationId/voucher
     * @param {number|string} reservationId - Reservation ID
     * @returns {Promise<Blob>} Voucher file (PDF/image)
     */
    downloadVoucher(reservationId) {
        return apiClient.get(`/sales/reservations/${reservationId}/voucher`, {
            responseType: 'blob'
        })
    },

    // Targets
    /**
     * Get my sales targets
     * GET /sales/targets/my
     * @returns {Promise<Array>} List of user's sales targets
     */
    getMyTargets() {
        return apiClient.get('/sales/targets/my')
    },

    /**
     * Update a sales target
     * PUT /sales/targets/:targetId
     * @param {number|string} targetId - Target ID
     * @param {Object} data - Target update data (amount, period, etc.)
     * @returns {Promise<Object>} Updated target
     */
    updateTarget(targetId, data) {
        return apiClient.put(`/sales/targets/${targetId}`, data)
    },

    /**
     * Create a new sales target
     * POST /sales/targets
     * @param {Object} data - Target data (amount, period, user_id, etc.)
     * @returns {Promise<Object>} Created target
     */
    createTarget(data) {
        return apiClient.post('/sales/targets', data)
    },

    // Attendance
    /**
     * Get my attendance records
     * GET /sales/attendance/my
     * @returns {Promise<Array>} List of attendance records
     */
    getMyAttendance() {
        return apiClient.get('/sales/attendance/my')
    },

    /**
     * Get team attendance records
     * GET /sales/attendance/team
     * @returns {Promise<Array>} List of team attendance records
     */
    getTeamAttendance() {
        return apiClient.get('/sales/attendance/team')
    },

    /**
     * Create attendance schedule
     * POST /sales/attendance/schedules
     * @param {Object} data - Schedule data (date, check_in, check_out, etc.)
     * @returns {Promise<Object>} Created schedule
     */
    createSchedule(data) {
        return apiClient.post('/sales/attendance/schedules', data)
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
            const response = await apiClient.get('/sales/team/projects', { params })
            const { items, total } = extractPaginatedData(response, [])
            return { items, total }
        } catch (error) {
            return handleServiceError(error, 'Fetch team projects', 'get') || { items: [], total: 0 }
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
            const response = await apiClient.get('/sales/assignments/my', { params })
            const { items, total } = extractPaginatedData(response, [])
            return { items, total }
        } catch (error) {
            return handleServiceError(error, 'Fetch my assignments', 'get') || { items: [], total: 0 }
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
            const response = await apiClient.get('/admin/sales/project-assignments', { params })
            const data = response.data?.data ?? response.data
            return Array.isArray(data) ? data : []
        } catch (error) {
            return handleServiceError(error, 'Fetch project assignments', 'get', [])
        }
    },

    /**
     * Get team members
     * GET /sales/team/members
     * @returns {Promise<Array>} List of team members
     */
    getTeamMembers() {
        return apiClient.get('/sales/team/members')
    },

    /**
     * Assign project to team members
     * POST /admin/sales/project-assignments
     * @param {Object} data - Assignment data (project_id, user_ids, etc.)
     * @returns {Promise<Object>} Assignment result
     */
    assignProject(data) {
        return apiClient.post('/admin/sales/project-assignments', data)
    },

    // Marketing Tasks (Leader)
    /**
     * Get projects with marketing tasks
     * GET /sales/tasks/projects
     * @returns {Promise<Array>} List of projects with tasks
     */
    getTaskProjects() {
        return apiClient.get('/sales/tasks/projects').then((response) => {
            const data = response?.data?.data ?? response?.data ?? []
            return Array.isArray(data) ? data : []
        })
    },

    /**
     * Get tasks for a specific project
     * GET /sales/tasks/projects/:projectId
     * @param {number|string} projectId - Project ID
     * @returns {Promise<Array>} List of tasks for the project
     */
    getProjectTasks(projectId) {
        return apiClient.get(`/sales/tasks/projects/${projectId}`).then((response) => {
            const data = response?.data?.data ?? response?.data ?? []
            return Array.isArray(data) ? data : []
        })
    },

    /**
     * Create a marketing task
     * POST /sales/marketing-tasks
     * @param {Object} data - Task data (project_id, description, due_date, etc.)
     * @returns {Promise<Object>} Created task
     */
    createMarketingTask(data) {
        return apiClient.post('/sales/marketing-tasks', data)
    },

    /**
     * Update task status
     * PUT /sales/marketing-tasks/:taskId
     * @param {number|string} taskId - Task ID
     * @param {Object} data - Update data (status, notes, etc.)
     * @returns {Promise<Object>} Updated task
     */
    updateTaskStatus(taskId, data) {
        return apiClient.put(`/sales/marketing-tasks/${taskId}`, data)
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
        const response = await apiClient.patch(`/sales/projects/${projectId}/emergency-contacts`, data)
        return response.data?.data || response.data || {}
    },

    /**
     * Update my target
     * PATCH /sales/targets
     * @param {Object} data - Target update data
     * @returns {Promise<Object>} Updated target
     */
    async updateMyTarget(data) {
        const response = await apiClient.patch('/sales/targets', data)
        return response.data?.data || response.data || {}
    },

    /**
     * Get waiting list
     * GET /sales/waiting-list
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} List of waiting list entries
     */
    async getWaitingList(params = {}) {
        const response = await apiClient.get('/sales/waiting-list', { params })
        const { items } = extractPaginatedData(response, [])
        return Array.isArray(items) ? items : []
    },

    /**
     * Get waiting list by unit
     * GET /sales/waiting-list/unit
     * @param {number|string} unitId - Unit ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Waiting list entries for unit
     */
    async getWaitingListByUnit(unitId, params = {}) {
        const response = await apiClient.get(`/sales/waiting-list/unit/${unitId}`, { params })
        const waitingList = response.data?.data || response.data || []
        return Array.isArray(waitingList) ? waitingList : []
    },

    /**
     * Add to waiting list
     * POST /sales/waiting-list
     * @param {Object} data - Waiting list entry data
     * @returns {Promise<Object>} Created waiting list entry
     */
    async addToWaitingList(data) {
        const response = await apiClient.post('/sales/waiting-list', data)
        return response.data?.data || response.data || {}
    },

    /**
     * Convert waiting list entry to reservation
     * POST /sales/waiting-list/convert
     * @param {number|string} waitingListId - Waiting list entry ID
     * @param {Object} data - Conversion data
     * @returns {Promise<Object>} Created reservation
     */
    async convertToReservation(waitingListId, data = {}) {
        const response = await apiClient.post(`/sales/waiting-list/${waitingListId}/convert`, data)
        return response.data?.data || response.data || {}
    },

    /**
     * Cancel waiting list entry
     * DELETE /sales/waiting-list
     * @param {number|string} id - Waiting list entry ID
     * @returns {Promise<Object>} Response
     */
    async cancelWaitingListEntry(id) {
        const response = await apiClient.delete(`/sales/waiting-list/${id}`)
        return response.data?.data || response.data || {}
    },

    /**
     * Get pending negotiations
     * GET /sales/negotiations/pending
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} List of pending negotiations
     */
    async getPendingNegotiations(params = {}) {
        const response = await apiClient.get('/sales/negotiations/pending', { params })
        const { items } = extractPaginatedData(response, [])
        return Array.isArray(items) ? items : []
    },

    /**
     * Approve negotiation
     * POST /sales/negotiations/approve
     * @param {number|string} negotiationId - Negotiation ID
     * @param {Object} data - Approval data
     * @returns {Promise<Object>} Approved negotiation
     */
    async approveNegotiation(negotiationId, data = {}) {
        const response = await apiClient.post(`/sales/negotiations/${negotiationId}/approve`, data)
        return response.data?.data || response.data || {}
    },

    /**
     * Reject negotiation
     * POST /sales/negotiations/reject
     * @param {number|string} negotiationId - Negotiation ID
     * @param {Object} data - Rejection data
     * @returns {Promise<Object>} Rejected negotiation
     */
    async rejectNegotiation(negotiationId, data = {}) {
        const response = await apiClient.post(`/sales/negotiations/${negotiationId}/reject`, data)
        return response.data?.data || response.data || {}
    },

    // Payment Plans (Off-plan Projects)
    /**
     * Get payment plan for a reservation
     * GET /sales/reservations/{reservation_id}/payment-plan
     * @param {number|string} reservationId - Reservation ID
     * @returns {Promise<Object>} Payment plan data
     */
    async getPaymentPlan(reservationId) {
        const response = await apiClient.get(`/sales/reservations/${reservationId}/payment-plan`)
        return response.data?.data || response.data || {}
    },

    /**
     * Create payment plan for off-plan project
     * POST /sales/reservations/{reservation_id}/payment-plan
     * @param {number|string} reservationId - Reservation ID
     * @param {Object} data - Payment plan data (installments array)
     * @returns {Promise<Object>} Created payment plan
     */
    async createPaymentPlan(reservationId, data) {
        const response = await apiClient.post(`/sales/reservations/${reservationId}/payment-plan`, data)
        return response.data?.data || response.data || {}
    },

    /**
     * Update payment installment
     * PUT /sales/payment-installments/{installment_id}
     * @param {number|string} installmentId - Installment ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated installment
     */
    async updatePaymentInstallment(installmentId, data) {
        const response = await apiClient.put(`/sales/payment-installments/${installmentId}`, data)
        return response.data?.data || response.data || {}
    },

    /**
     * Delete payment installment
     * DELETE /sales/payment-installments/{installment_id}
     * @param {number|string} installmentId - Installment ID
     * @returns {Promise<Object>} Response
     */
    async deletePaymentInstallment(installmentId) {
        const response = await apiClient.delete(`/sales/payment-installments/${installmentId}`)
        return response.data?.data || response.data || {}
    },

    /**
     * Update marketing task
     * PATCH /sales/marketing-tasks
     * @param {number|string} taskId - Task ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated task
     */
    async updateMarketingTask(taskId, data) {
        const response = await apiClient.patch(`/sales/marketing-tasks/${taskId}`, data)
        return response.data?.data || response.data || {}
    }
}

export default salesService
