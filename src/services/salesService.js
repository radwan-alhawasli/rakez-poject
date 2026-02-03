import api from './api'

const salesService = {
    // Dashboard
    getDashboard(params = {}) {
        return api.get('/sales/dashboard', { params })
    },

    // Projects
    getProjects() {
        return api.get('/sales/projects')
    },

    getProjectDetails(projectId) {
        return api.get(`/sales/projects/${projectId}`)
    },

    getProjectUnits(projectId) {
        return api.get(`/sales/projects/${projectId}/units`)
    },

    getEmergencyContacts(projectId) {
        return api.get(`/sales/projects/${projectId}/emergency-contacts`)
    },

    // Reservations
    getReservationContext(unitId) {
        return api.get(`/sales/units/${unitId}/reservation-context`)
    },

    createReservation(data) {
        return api.post('/sales/reservations', data)
    },

    getReservations() {
        return api.get('/sales/reservations')
    },

    confirmReservation(reservationId) {
        return api.post(`/sales/reservations/${reservationId}/confirm`)
    },

    cancelReservation(reservationId) {
        return api.post(`/sales/reservations/${reservationId}/cancel`)
    },

    logAction(reservationId, data) {
        return api.post(`/sales/reservations/${reservationId}/actions`, data)
    },

    downloadVoucher(reservationId) {
        return api.get(`/sales/reservations/${reservationId}/voucher`, {
            responseType: 'blob'
        })
    },

    // Targets
    getMyTargets() {
        return api.get('/sales/targets/my')
    },

    updateTarget(targetId, data) {
        return api.put(`/sales/targets/${targetId}`, data)
    },

    createTarget(data) {
        return api.post('/sales/targets', data)
    },

    // Attendance
    getMyAttendance() {
        return api.get('/sales/attendance/my')
    },

    getTeamAttendance() {
        return api.get('/sales/attendance/team')
    },

    createSchedule(data) {
        return api.post('/sales/attendance/schedules', data)
    },

    // Team Management
    getTeamProjects() {
        return api.get('/sales/team/projects')
    },

    getTeamMembers() {
        return api.get('/sales/team/members')
    },

    assignProject(data) {
        return api.post('/admin/sales/project-assignments', data)
    },

    // Marketing Tasks (Leader)
    getTaskProjects() {
        return api.get('/sales/tasks/projects')
    },

    getProjectTasks(projectId) {
        return api.get(`/sales/tasks/projects/${projectId}`)
    },

    createMarketingTask(data) {
        return api.post('/sales/marketing-tasks', data)
    },

    updateTaskStatus(taskId, data) {
        return api.put(`/sales/marketing-tasks/${taskId}`, data)
    }
}

export default salesService
