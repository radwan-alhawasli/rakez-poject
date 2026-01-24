import apiClient from '../api/apiClient'

/**
 * HR Service - Manages all HR-related API calls
 * Handles employees, teams, performance tracking, and reporting
 */

// ==================== Dashboard APIs ====================

/**
 * Get dashboard KPIs and metrics
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

// ==================== Team Management APIs ====================

/**
 * Get all teams
 */
export const getTeams = async () => {
    try {
        const response = await apiClient.get('/hr/teams')
        return response.data
    } catch (error) {
        console.error('Error fetching teams:', error)
        throw error
    }
}

/**
 * Get team by ID
 */
export const getTeamById = async (teamId) => {
    try {
        const response = await apiClient.get(`/hr/teams/${teamId}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching team ${teamId}:`, error)
        throw error
    }
}

/**
 * Create new team
 */
export const createTeam = async (teamData) => {
    try {
        const response = await apiClient.post('/hr/teams', teamData)
        return response.data
    } catch (error) {
        console.error('Error creating team:', error)
        throw error
    }
}

/**
 * Update team
 */
export const updateTeam = async (teamId, teamData) => {
    try {
        const response = await apiClient.put(`/hr/teams/${teamId}`, teamData)
        return response.data
    } catch (error) {
        console.error(`Error updating team ${teamId}:`, error)
        throw error
    }
}

/**
 * Delete team
 */
export const deleteTeam = async (teamId) => {
    try {
        const response = await apiClient.delete(`/hr/teams/${teamId}`)
        return response.data
    } catch (error) {
        console.error(`Error deleting team ${teamId}:`, error)
        throw error
    }
}

/**
 * Link marketers to team
 */
export const linkMarketersToTeam = async (teamId, marketerIds) => {
    try {
        const response = await apiClient.post(`/hr/teams/${teamId}/marketers`, {
            marketer_ids: marketerIds
        })
        return response.data
    } catch (error) {
        console.error(`Error linking marketers to team ${teamId}:`, error)
        throw error
    }
}

// ==================== Employee/User Management APIs ====================

/**
 * Get all employees with search support
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
 * Create new employee with file uploads (CV and Contract)
 * @param {FormData} employeeData - FormData containing employee info and files
 */
export const createEmployee = async (employeeData) => {
    try {
        const response = await apiClient.post('/hr/add_employee', employeeData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error creating employee:', error)
        throw error
    }
}

/**
 * Update employee
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
 * Disable employee (soft delete)
 */
export const disableEmployee = async (employeeId) => {
    try {
        const response = await apiClient.patch(`/hr/employees/${employeeId}/disable`)
        return response.data
    } catch (error) {
        console.error(`Error disabling employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Enable employee
 */
export const enableEmployee = async (employeeId) => {
    try {
        const response = await apiClient.patch(`/hr/employees/${employeeId}/enable`)
        return response.data
    } catch (error) {
        console.error(`Error enabling employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Delete employee (hard delete)
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

// ==================== Performance Tracking APIs ====================

/**
 * Get marketer performance data
 */
export const getMarketerPerformance = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/marketers/performance', { params })
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
        const response = await apiClient.post(`/hr/marketers/${marketerId}/goal`, goalData)
        return response.data
    } catch (error) {
        console.error(`Error setting goal for marketer ${marketerId}:`, error)
        throw error
    }
}

/**
 * Get team performance data
 */
export const getTeamPerformance = async (params = {}) => {
    try {
        const response = await apiClient.get('/hr/teams/performance', { params })
        return response.data
    } catch (error) {
        console.error('Error fetching team performance:', error)
        throw error
    }
}

// ==================== File Upload APIs ====================

/**
 * Upload employee CV
 */
export const uploadCV = async (employeeId, file) => {
    try {
        const formData = new FormData()
        formData.append('cv', file)

        const response = await apiClient.post(`/hr/employees/${employeeId}/cv`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error(`Error uploading CV for employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Upload employee signature
 */
export const uploadSignature = async (employeeId, file) => {
    try {
        const formData = new FormData()
        formData.append('signature', file)

        const response = await apiClient.post(`/hr/employees/${employeeId}/signature`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error(`Error uploading signature for employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Upload employee contract
 */
export const uploadContract = async (employeeId, file) => {
    try {
        const formData = new FormData()
        formData.append('contract', file)

        const response = await apiClient.post(`/hr/employees/${employeeId}/contract`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error(`Error uploading contract for employee ${employeeId}:`, error)
        throw error
    }
}

// ==================== Contract Management APIs ====================

/**
 * Generate employee contract
 */
export const generateContract = async (employeeId, contractData) => {
    try {
        const response = await apiClient.post(`/hr/employees/${employeeId}/contract/generate`, contractData)
        return response.data
    } catch (error) {
        console.error(`Error generating contract for employee ${employeeId}:`, error)
        throw error
    }
}

/**
 * Download employee contract as PDF
 */
export const downloadContract = async (employeeId) => {
    try {
        const response = await apiClient.get(`/hr/employees/${employeeId}/contract/download`, {
            responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `contract_${employeeId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()

        return response.data
    } catch (error) {
        console.error(`Error downloading contract for employee ${employeeId}:`, error)
        throw error
    }
}

// ==================== Reporting APIs ====================

/**
 * Generate monthly team performance report
 */
export const generateTeamPerformanceReport = async (month, year, format = 'pdf') => {
    try {
        const response = await apiClient.post('/hr/reports/team-performance', {
            month,
            year,
            format
        }, {
            responseType: format === 'pdf' ? 'blob' : 'json'
        })

        if (format === 'pdf') {
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

/**
 * Generate individual marketer performance report
 */
export const generateMarketerReport = async (marketerId, month, year, format = 'pdf') => {
    try {
        const response = await apiClient.post('/hr/reports/marketer-performance', {
            marketer_id: marketerId,
            month,
            year,
            format
        }, {
            responseType: format === 'pdf' ? 'blob' : 'json'
        })

        if (format === 'pdf') {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `marketer_${marketerId}_${month}_${year}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }

        return response.data
    } catch (error) {
        console.error('Error generating marketer report:', error)
        throw error
    }
}

/**
 * Generate current employees report
 */
export const generateEmployeesReport = async (format = 'pdf') => {
    try {
        const response = await apiClient.post('/hr/reports/current-employees', {
            format
        }, {
            responseType: format === 'pdf' ? 'blob' : 'json'
        })

        if (format === 'pdf') {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `current_employees_${new Date().toISOString().split('T')[0]}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }

        return response.data
    } catch (error) {
        console.error('Error generating employees report:', error)
        throw error
    }
}

/**
 * Generate expiring contracts and trial periods report
 */
export const generateExpiringContractsReport = async (daysAhead = 30, format = 'pdf') => {
    try {
        const response = await apiClient.post('/hr/reports/expiring-contracts', {
            days_ahead: daysAhead,
            format
        }, {
            responseType: format === 'pdf' ? 'blob' : 'json'
        })

        if (format === 'pdf') {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `expiring_contracts_${new Date().toISOString().split('T')[0]}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }

        return response.data
    } catch (error) {
        console.error('Error generating expiring contracts report:', error)
        throw error
    }
}

export default {
    // Dashboard
    getDashboardMetrics,

    // Teams
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    linkMarketersToTeam,

    // Employees
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    disableEmployee,
    enableEmployee,
    deleteEmployee,

    // Performance
    getMarketerPerformance,
    setMarketerGoal,
    getTeamPerformance,

    // Files
    uploadCV,
    uploadSignature,
    uploadContract,

    // Contracts
    generateContract,
    downloadContract,

    // Reports
    generateTeamPerformanceReport,
    generateMarketerReport,
    generateEmployeesReport,
    generateExpiringContractsReport,

    // Contract-Team Integration
    getTeamContractLocations,
    getTeamsForContract,
    getTeamContracts,
    getProjectTeams
}
