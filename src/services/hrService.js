import apiClient from '../api/apiClient'
import logger from '../utils/logger'
import { handleServiceError } from '../utils/serviceErrorHandler'
import { extractPaginatedData } from '../utils/paginationUtils'

/**
 * HR Service - Manages HR-related API calls
 *
 * TEAMS: Use getTeams() for HR teams (GET /hr/teams) - paginated, with performance data.
 * For Project Management teams use teamService.getTeams() (/project_management/teams/index).
 * For Teams Management module use teamService methods with /teams/* base.
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
        logger.error('Error fetching dashboard metrics:', error)
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
        const { items, total } = extractPaginatedData(response, [])
        return { items, total }
    } catch (error) {
        return handleServiceError(error, 'Error fetching employees', 'get') || { items: [], total: 0 }
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
        logger.error(`Error fetching employee ${employeeId}:`, error)
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
        logger.error('Error creating employee:', error)
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
        logger.error(`Error updating employee ${employeeId}:`, error)
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
        logger.error(`Error deleting employee ${employeeId}:`, error)
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
        logger.error('Error fetching marketer performance:', error)
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
        logger.error(`Error setting goal for marketer ${marketerId}:`, error)
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
        logger.error('Error generating team performance report:', error)
        throw error
    }
}

// ==================== Team Management APIs ====================

/**
 * Get paginated HR teams with performance data
 * GET /hr/teams?per_page=&page=&year=&month=
 * @param {Object} params - page, per_page (1-100), year, month
 * @returns {Promise<{ items: Array, total: number }>}
 */
export const getTeams = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/teams', { params })
        const { items, total } = extractPaginatedData(response, [])
        return { items, total }
    } catch (error) {
        return handleServiceError(error, 'Error fetching HR teams', 'get') || { items: [], total: 0 }
    }
}

/**
 * Get HR team members
 * GET /hr/teams/:team_id/members
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of team members
 */
export const getHRTeamMembers = async (teamId, params = {}) => {
    try {
        const response = await apiClient.get(`/hr/teams/${teamId}/members`, { params })
        const members = response.data?.data || response.data || []
        return Array.isArray(members) ? members : []
    } catch (error) {
        return handleServiceError(error, `Error fetching team ${teamId} members`, 'get', [])
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
        logger.error(`Error fetching team ${teamId}:`, error)
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
        logger.error('Error creating team:', error)
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
        logger.error(`Error updating team ${teamId}:`, error)
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
        logger.error(`Error deleting team ${teamId}:`, error)
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
        logger.error(`Error linking marketers to team ${teamId}:`, error)
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
        logger.error(`Error fetching contracts for team ${teamId}:`, error)
        throw error
    }
}

/**
 * Get team contract locations by team ID
 * GET /hr/teams/contracts/locations/:id
 */
export const getTeamContractLocations = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/contracts/locations/${teamId}`)
        return response.data.data || response.data || []
    } catch (error) {
        logger.error(`Error fetching locations for team ${teamId}:`, error)
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
        logger.error(`Error fetching teams for contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Get team sales average
 * GET /hr/teams/sales-average/:teamId
 * Returns: { average_sales: { sold_units_per_sales_employee: number } }
 */
export const getTeamSalesAverage = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/sales-average/${teamId}`)
        return response.data.data || response.data || {}
    } catch (error) {
        logger.error(`Error fetching sales average for team ${teamId}:`, error)
        throw error
    }
}

// ==================== Missing Endpoints ====================

/**
 * Refresh dashboard
 * POST /hr/dashboard/refresh
 */
export const refreshDashboard = async () => {
    try {
        const response = await apiClient.post('/hr/dashboard/refresh')
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error refreshing dashboard:', error)
        throw error
    }
}

/**
 * Create team (HR endpoint)
 * POST /hr/teams
 */
export const createHRTeam = async (teamData) => {
    try {
        const response = await apiClient.post('/hr/teams', teamData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error creating HR team:', error)
        throw error
    }
}

/**
 * Update team (HR endpoint)
 * PUT /hr/teams/:id
 */
export const updateHRTeam = async (teamId, teamData) => {
    try {
        const response = await apiClient.put(`/hr/teams/${teamId}`, teamData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error updating HR team ${teamId}:`, error)
        throw error
    }
}

/**
 * Delete team (HR endpoint)
 * DELETE /hr/teams/:id
 */
export const deleteHRTeam = async (teamId) => {
    try {
        const response = await apiClient.delete(`/hr/teams/${teamId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error deleting HR team ${teamId}:`, error)
        throw error
    }
}

/**
 * Assign member to team
 * POST /hr/teams/members
 */
export const assignTeamMember = async (data) => {
    try {
        const response = await apiClient.post('/hr/teams/members', data)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error assigning team member:', error)
        throw error
    }
}

/**
 * Remove member from team
 * DELETE /hr/teams/members
 */
export const removeTeamMember = async (data) => {
    try {
        const response = await apiClient.delete('/hr/teams/members', { data })
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error removing team member:', error)
        throw error
    }
}

/**
 * List marketer performance
 * GET /hr/marketers/performance
 */
export const listMarketerPerformance = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/marketers/performance', { params })
        const performance = response.data?.data || response.data || []
        return Array.isArray(performance) ? performance : []
    } catch (error) {
        logger.error('Error fetching marketer performance list:', error)
        throw error
    }
}

/**
 * Show marketer performance details
 * GET /hr/marketers/performance/:id
 */
export const showMarketerPerformance = async (marketerId) => {
    try {
        const response = await apiClient.get(`/hr/marketers/performance/${marketerId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error fetching marketer performance ${marketerId}:`, error)
        throw error
    }
}

/**
 * List users
 * GET /hr/users
 */
export const listUsers = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/users', { params })
        const users = response.data?.data || response.data || []
        return Array.isArray(users) ? users : []
    } catch (error) {
        logger.error('Error fetching users:', error)
        throw error
    }
}

/**
 * Create user
 * POST /hr/users
 */
export const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/hr/users', userData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error creating user:', error)
        throw error
    }
}

/**
 * Show user details
 * GET /hr/users/:id
 */
export const showUser = async (userId) => {
    try {
        const response = await apiClient.get(`/hr/users/${userId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error fetching user ${userId}:`, error)
        throw error
    }
}

/**
 * Update user
 * PUT /hr/users/:id
 */
export const updateUser = async (userId, userData) => {
    try {
        const response = await apiClient.put(`/hr/users/${userId}`, userData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error updating user ${userId}:`, error)
        throw error
    }
}

/**
 * Toggle user status
 * PATCH /hr/users/status
 */
export const toggleUserStatus = async (data) => {
    try {
        const response = await apiClient.patch('/hr/users/status', data)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error toggling user status:', error)
        throw error
    }
}

/**
 * Delete user
 * DELETE /hr/users/:id
 */
export const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/hr/users/${userId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error deleting user ${userId}:`, error)
        throw error
    }
}

/**
 * Upload user files
 * POST /hr/users/files
 */
export const uploadUserFiles = async (formData) => {
    try {
        const response = await apiClient.post('/hr/users/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error uploading user files:', error)
        throw error
    }
}

/**
 * Get paginated warnings for a user
 * GET /hr/users/:user_id/warnings
 * @param {number|string} userId - User ID
 * @param {Object} params - page, per_page, year, type
 * @returns {Promise<{ items: Array, total: number }>}
 */
export const getUserWarnings = async (userId, params = {}) => {
    try {
        const response = await apiClient.get(`/hr/users/${userId}/warnings`, { params })
        const { items, total } = extractPaginatedData(response, [])
        return { items, total }
    } catch (error) {
        return handleServiceError(error, `Error fetching warnings for user ${userId}`, 'get') || { items: [], total: 0 }
    }
}

/**
 * @deprecated Use getUserWarnings(userId, params) instead
 * List user warnings - requires userId
 */
export const listUserWarnings = async (userId, params = {}) => {
    return getUserWarnings(userId, params)
}

/**
 * Create warning for user
 * POST /hr/users/:user_id/warnings
 */
export const createWarning = async (userId, warningData) => {
    try {
        const response = await apiClient.post(`/hr/users/${userId}/warnings`, warningData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error creating warning:', error)
        throw error
    }
}

/**
 * Delete warning
 * DELETE /hr/warnings/:id
 */
export const deleteWarning = async (warningId) => {
    try {
        const response = await apiClient.delete(`/hr/warnings/${warningId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error deleting warning ${warningId}:`, error)
        throw error
    }
}

/**
 * Get paginated employment contracts for a user
 * GET /hr/users/:user_id/contracts
 * @param {number|string} userId - User ID
 * @param {Object} params - page, per_page
 * @returns {Promise<{ items: Array, total: number }>}
 */
export const getUserContracts = async (userId, params = {}) => {
    try {
        const response = await apiClient.get(`/hr/users/${userId}/contracts`, { params })
        const { items, total } = extractPaginatedData(response, [])
        return { items, total }
    } catch (error) {
        return handleServiceError(error, `Error fetching contracts for user ${userId}`, 'get') || { items: [], total: 0 }
    }
}

/**
 * @deprecated Use getUserContracts(userId, params) instead
 * List user contracts - requires userId
 */
export const listUserContracts = async (userId, params = {}) => {
    return getUserContracts(userId, params)
}

/**
 * Create user contract
 * POST /hr/users/:user_id/contracts
 */
export const createUserContract = async (userId, contractData) => {
    try {
        const response = await apiClient.post(`/hr/users/${userId}/contracts`, contractData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error creating user contract:', error)
        throw error
    }
}

/**
 * Show HR contract
 * GET /hr/contracts/:id
 */
export const showHRContract = async (contractId) => {
    try {
        const response = await apiClient.get(`/hr/contracts/${contractId}`)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error fetching HR contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Update HR contract
 * PUT /hr/contracts/:id
 */
export const updateHRContract = async (contractId, contractData) => {
    try {
        const response = await apiClient.put(`/hr/contracts/${contractId}`, contractData)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error updating HR contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Generate contract PDF
 * POST /hr/contracts/pdf
 */
export const generateContractPDF = async (contractId) => {
    try {
        const response = await apiClient.post(`/hr/contracts/${contractId}/pdf`, {}, {
            responseType: 'blob'
        })
        return response.data
    } catch (error) {
        logger.error(`Error generating contract PDF ${contractId}:`, error)
        throw error
    }
}

/**
 * Download contract PDF
 * GET /hr/contracts/pdf/:id
 */
export const downloadContractPDF = async (contractId) => {
    try {
        const response = await apiClient.get(`/hr/contracts/${contractId}/pdf`, {
            responseType: 'blob'
        })
        return response.data
    } catch (error) {
        logger.error(`Error downloading contract PDF ${contractId}:`, error)
        throw error
    }
}

/**
 * Activate contract
 * POST /hr/contracts/activate
 */
export const activateContract = async (contractId, data = {}) => {
    try {
        const response = await apiClient.post(`/hr/contracts/${contractId}/activate`, data)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error activating contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Terminate contract
 * POST /hr/contracts/terminate
 */
export const terminateContract = async (contractId, data = {}) => {
    try {
        const response = await apiClient.post(`/hr/contracts/${contractId}/terminate`, data)
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error(`Error terminating contract ${contractId}:`, error)
        throw error
    }
}

/**
 * Get team performance report
 * GET /hr/reports/team-performance
 */
export const getTeamPerformanceReport = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/reports/team-performance', { params })
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error fetching team performance report:', error)
        throw error
    }
}

/**
 * Get marketer performance report
 * GET /hr/reports/marketer-performance
 */
export const getMarketerPerformanceReport = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/reports/marketer-performance', { params })
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error fetching marketer performance report:', error)
        throw error
    }
}

/**
 * Get employee count report
 * GET /hr/reports/employee-count
 */
export const getEmployeeCountReport = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/reports/employee-count', { params })
        return response.data?.data || response.data || {}
    } catch (error) {
        logger.error('Error fetching employee count report:', error)
        throw error
    }
}

/**
 * Get expiring contracts report
 * GET /hr/reports/expiring-contracts
 */
export const getExpiringContractsReport = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/reports/expiring-contracts', { params })
        const contracts = response.data?.data || response.data || []
        return Array.isArray(contracts) ? contracts : []
    } catch (error) {
        logger.error('Error fetching expiring contracts report:', error)
        throw error
    }
}

export default {
    // Dashboard
    getDashboardMetrics,
    refreshDashboard,

    // Employees
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,

    // Teams
    getTeams,
    getHRTeamMembers,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    linkMarketersToTeam,
    getTeamContracts,
    getTeamContractLocations,
    getTeamsForContract,
    getTeamSalesAverage,
    createHRTeam,
    updateHRTeam,
    deleteHRTeam,
    assignTeamMember,
    removeTeamMember,

    // Performance
    getMarketerPerformance,
    setMarketerGoal,
    listMarketerPerformance,
    showMarketerPerformance,

    // Users
    listUsers,
    createUser,
    showUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    uploadUserFiles,

    // Warnings
    getUserWarnings,
    listUserWarnings,
    createWarning,
    deleteWarning,

    // Contracts
    getUserContracts,
    listUserContracts,
    createUserContract,
    showHRContract,
    updateHRContract,
    generateContractPDF,
    downloadContractPDF,
    activateContract,
    terminateContract,

    // Reports
    generateTeamPerformanceReport,
    getTeamPerformanceReport,
    getMarketerPerformanceReport,
    getEmployeeCountReport,
    getExpiringContractsReport
}
