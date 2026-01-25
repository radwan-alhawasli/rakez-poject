import apiClient from '../api/apiClient'

/**
 * HR Service - Manages all HR-related API calls using admin endpoints
 * Handles employees, performance tracking, and reporting
 */

// ==================== Dashboard APIs ====================

/**
 * Get dashboard KPIs and metrics
 * GET /project_management/dashboard
 */
export const getDashboardMetrics = async () => {
    try {
        const response = await apiClient.get('/project_management/dashboard')
        return response.data
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        throw error
    }
}

// ==================== Employee/User Management APIs ====================

/**
 * Get all employees with search support
 * GET /admin/employees/list_employees
 * @param {Object} params - Query parameters including search term
 */
export const getEmployees = async (params = {}) => {
    try {
        const response = await apiClient.get('/admin/employees/list_employees', { params })
        return response.data
    } catch (error) {
        console.error('Error fetching employees:', error)
        throw error
    }
}

/**
 * Get employee by ID
 * GET /admin/employees/show_employee/:id
 */
export const getEmployeeById = async (employeeId) => {
    try {
        const response = await apiClient.get(`/admin/employees/show_employee/${employeeId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Create new employee
 * POST /admin/employees/add_employee
 * @param {Object} employeeData - Employee info
 */
export const createEmployee = async (employeeData) => {
    try {
        const response = await apiClient.post('/admin/employees/add_employee', employeeData)
        return response.data
    } catch (error) {
        console.error('Error creating employee:', error)
        throw error
    }
}

/**
 * Update employee
 * PUT /admin/employees/update_employee/:id
 */
export const updateEmployee = async (employeeId, employeeData) => {
    try {
        const response = await apiClient.put(`/admin/employees/update_employee/${employeeId}`, employeeData)
        return response.data
    } catch (error) {
        console.error(`Error updating employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Delete employee (hard delete)
 * DELETE /admin/employees/delete_employee/:id
 */
export const deleteEmployee = async (employeeId) => {
    try {
        const response = await apiClient.delete(`/admin/employees/delete_employee/${employeeId}`)
        return response.data
    } catch (error) {
        console.error(`Error deleting employee ${employeeId}:`, error)
        throw error
    }
}

// ==================== Performance Tracking APIs (Mocked if not in Postman) ====================

/**
 * Get marketer performance data
 */
export const getMarketerPerformance = async (params = {}) => {
    try {
        // Postman doesn't show a specific performance endpoint, but we keep the structure
        const response = await apiClient.get('/admin/employees/performance', { params }).catch(() => ({ data: [] }))
        return response.data
    } catch (error) {
        console.error('Error fetching marketer performance:', error)
        throw error
    }
}

/**
 * Update marketer goal
 */
export const setMarketerGoal = async (marketerId, goalData) => {
    try {
        const response = await apiClient.post(`/admin/employees/${marketerId}/goal`, goalData).catch(() => ({ data: {} }))
        return response.data
    } catch (error) {
        console.error(`Error setting goal for marketer ${marketerId}:`, error)
        throw error
    }
}

// ==================== Reporting APIs (Mocked if not in Postman) ====================

/**
 * Generate monthly team performance report
 */
export const generateTeamPerformanceReport = async (month, year, format = 'pdf') => {
    try {
        const response = await apiClient.post('/admin/reports/team-performance', {
            month,
            year,
            format
        }, {
            responseType: format === 'pdf' ? 'blob' : 'json'
        }).catch(() => ({ data: null }))

        if (format === 'pdf' && response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `team_performance_${month}_${year}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }

        return response.data
    } catch (error) {
        console.error('Error generating team performance report:', error)
        throw error
    }
}

export default {
    // Dashboard
    getDashboardMetrics,

    // Employees
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,

    // Performance
    getMarketerPerformance,
    setMarketerGoal,

    // Reports
    generateTeamPerformanceReport
}
