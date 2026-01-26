import apiClient from '../api/apiClient'

/**
 * HR Service - Manages all HR-related API calls using admin endpoints
 * Handles employees, performance tracking, and reporting
 */

// ==================== Dashboard APIs ====================

/**
 * Get dashboard KPIs and metrics
 * GET /hr/dashboard
 */
export const getDashboardMetrics = async () => {
    try {
        const response = await apiClient.get('/hr/dashboard')
        return response.data
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        throw error
    }
}

// ==================== Employee/User Management APIs ====================

/**
 * Get all employees with search support
 * GET /hr/list_employees
 * @param {Object} params - Query parameters including search term
 */
export const getEmployees = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/list_employees', { params })
        return response.data
    } catch (error) {
        console.error('Error fetching employees:', error)
        throw error
    }
}

/**
 * Get employee by ID
 * GET /hr/show_employee/:id
 */
export const getEmployeeById = async (employeeId) => {
    try {
        const response = await apiClient.get(`/hr/show_employee/${employeeId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Create new employee
 * POST /hr/add_employee
 * @param {Object} employeeData - Employee info
 */
export const createEmployee = async (employeeData) => {
    try {
        const response = await apiClient.post('/hr/add_employee', employeeData)
        return response.data
    } catch (error) {
        console.error('Error creating employee:', error)
        throw error
    }
}

/**
 * Update employee
 * PUT /hr/update_employee/:id
 */
export const updateEmployee = async (employeeId, employeeData) => {
    try {
        const response = await apiClient.put(`/hr/update_employee/${employeeId}`, employeeData)
        return response.data
    } catch (error) {
        console.error(`Error updating employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Delete employee (hard delete)
 * DELETE /hr/delete_employee/:id
 */
export const deleteEmployee = async (employeeId) => {
    try {
        const response = await apiClient.delete(`/hr/delete_employee/${employeeId}`)
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

// ==================== Team Management APIs ====================

/**
 * Get all teams
 * GET /teams/index
 */
export const getTeams = async (params = {}) => {
    try {
        const response = await apiClient.get('/teams/index', { params })
        return response.data.data || response.data || []
    } catch (error) {
        console.error('Error fetching teams:', error)
        throw error
    }
}

/**
 * Get team details by ID
 * GET /teams/show/:id
 */
export const getTeamById = async (teamId) => {
    try {
        const response = await apiClient.get(`/teams/show/${teamId}`)
        return response.data.data || response.data
    } catch (error) {
        console.error(`Error fetching team ${teamId}:`, error)
        throw error
    }
}

/**
 * Create a new team
 * POST /project_management/teams/store
 */
export const createTeam = async (teamData) => {
    try {
        const response = await apiClient.post('/project_management/teams/store', teamData)
        return response.data
    } catch (error) {
        console.error('Error creating team:', error)
        throw error
    }
}

/**
 * Update an existing team
 * POST /project_management/teams/update/:id
 */
export const updateTeam = async (teamId, teamData) => {
    try {
        const response = await apiClient.post(`/project_management/teams/update/${teamId}`, teamData)
        return response.data
    } catch (error) {
        console.error(`Error updating team ${teamId}:`, error)
        throw error
    }
}

/**
 * Delete a team
 * DELETE /project_management/teams/delete/:id
 */
export const deleteTeam = async (teamId) => {
    try {
        const response = await apiClient.delete(`/project_management/teams/delete/${teamId}`)
        return response.data
    } catch (error) {
        console.error(`Error deleting team ${teamId}:`, error)
        throw error
    }
}

/**
 * Link marketers to team
 * POST /project_teams/teams/add/:teamId
 */
export const linkMarketersToTeam = async (teamId, marketerIds) => {
    try {
        const response = await apiClient.post(`/project_teams/teams/add/${teamId}`, { team_ids: marketerIds })
        return response.data
    } catch (error) {
        console.error(`Error linking marketers to team ${teamId}:`, error)
        throw error
    }
}

/**
 * Get team contracts (projects)
 * GET /hr/teams/contracts/:id
 */
export const getTeamContracts = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/contracts/${teamId}`)
        return response.data.data || response.data || []
    } catch (error) {
        console.error(`Error fetching contracts for team ${teamId}:`, error)
        throw error
    }
}

/**
 * Get team contract locations
 * GET /hr/teams/contracts/locations/:id
 */
export const getTeamContractLocations = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/contracts/locations/${teamId}`)
        return response.data.data || response.data || []
    } catch (error) {
        console.error(`Error fetching locations for team ${teamId}:`, error)
        throw error
    }
}

/**
 * Get teams for a specific contract
 * GET /hr/teams/getTeamsForContract/:contractId
 */
export const getTeamsForContract = async (contractId) => {
    try {
        const response = await apiClient.get(`/hr/teams/getTeamsForContract/${contractId}`)
        return response.data.data || response.data || []
    } catch (error) {
        console.error(`Error fetching teams for contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Get team sales average
 * GET /hr/teams/sales-average/:teamId
 */
export const getTeamSalesAverage = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/sales-average/${teamId}`)
        return response.data.data || response.data || 0
    } catch (error) {
        console.error(`Error fetching sales average for team ${teamId}:`, error)
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

    // Teams
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    linkMarketersToTeam,
    getTeamContracts,
    getTeamContractLocations,
    getTeamsForContract,
    getTeamSalesAverage,

    // Performance
    getMarketerPerformance,
    setMarketerGoal,

    // Reports
    generateTeamPerformanceReport
}
