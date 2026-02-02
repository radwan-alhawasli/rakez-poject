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
    }
}

export default salesService
