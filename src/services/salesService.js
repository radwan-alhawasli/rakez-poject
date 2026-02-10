import apiClient from '../api/apiClient'

const salesService = {
    // Dashboard
    getDashboard(params = {}) {
        return apiClient.get('/sales/dashboard', { params })
    },

    // Projects
    getProjects() {
        return apiClient.get('/sales/projects')
    },

    getProjectDetails(projectId) {
        return apiClient.get(`/sales/projects/${projectId}`)
    },

    /** Get units for a project by its id. API: GET /sales/projects/:id/units */
    getProjectUnits(projectId) {
        const id = projectId != null ? String(projectId) : ''
        return apiClient.get(`/sales/projects/${id}/units`)
    },

    getEmergencyContacts(projectId) {
        return apiClient.get(`/sales/projects/${projectId}/emergency-contacts`)
    },

    // Reservations
    getReservationContext(unitId) {
        return apiClient.get(`/sales/units/${unitId}/reservation-context`)
    },

    createReservation(data) {
        return apiClient.post('/sales/reservations', data)
    },

    getReservations() {
        return apiClient.get('/sales/reservations')
    },

    confirmReservation(reservationId) {
        return apiClient.post(`/sales/reservations/${reservationId}/confirm`)
    },

    cancelReservation(reservationId) {
        return apiClient.post(`/sales/reservations/${reservationId}/cancel`)
    },

    logAction(reservationId, data) {
        return apiClient.post(`/sales/reservations/${reservationId}/actions`, data)
    },

    downloadVoucher(reservationId) {
        return apiClient.get(`/sales/reservations/${reservationId}/voucher`, {
            responseType: 'blob'
        })
    },

    // Targets
    getMyTargets() {
        return apiClient.get('/sales/targets/my')
    },

    updateTarget(targetId, data) {
        return apiClient.put(`/sales/targets/${targetId}`, data)
    },

    createTarget(data) {
        return apiClient.post('/sales/targets', data)
    },

    // Attendance
    getMyAttendance() {
        return apiClient.get('/sales/attendance/my')
    },

    getTeamAttendance() {
        return apiClient.get('/sales/attendance/team')
    },

    createSchedule(data) {
        return apiClient.post('/sales/attendance/schedules', data)
    },

    // Team Management
    getTeamProjects() {
        return apiClient.get('/sales/team/projects')
    },

    getTeamMembers() {
        return apiClient.get('/sales/team/members')
    },

    assignProject(data) {
        return apiClient.post('/admin/sales/project-assignments', data)
    },

    // Marketing Tasks (Leader)
    getTaskProjects() {
        return apiClient.get('/sales/tasks/projects')
    },

    getProjectTasks(projectId) {
        return apiClient.get(`/sales/tasks/projects/${projectId}`)
    },

    createMarketingTask(data) {
        return apiClient.post('/sales/marketing-tasks', data)
    },

    updateTaskStatus(taskId, data) {
        return apiClient.put(`/sales/marketing-tasks/${taskId}`, data)
    }
}

export default salesService
