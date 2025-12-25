import apiClient from '../api/apiClient'

import { ROLE_MAP } from '../constants/roles'

const userService = {
    /**
     * Get all employees
     * @returns {Promise<Array>} List of employees
     */
    async getEmployees(params = {}) {
        try {
            const response = await apiClient.get('/admin/employees/list_employees', { params })
            const result = response.data
            console.log('Raw Employee API Response:', result)

            let employees = []

            // More robust extraction
            if (result && result.employees && Array.isArray(result.employees)) {
                employees = result.employees
            } else if (result && result.data && Array.isArray(result.data)) {
                employees = result.data
            } else if (result && result.data && result.data.employees && Array.isArray(result.data.employees)) {
                employees = result.data.employees
            } else if (Array.isArray(result)) {
                employees = result
            } else if (result && result.data && typeof result.data === 'object') {
                // If data is an object, try to find an array property
                const keys = Object.keys(result.data)
                const arrayKey = keys.find(k => Array.isArray(result.data[k]))
                if (arrayKey) employees = result.data[arrayKey]
            }

            if (!Array.isArray(employees)) {
                console.warn('Could not find employee array in response', result)
                employees = []
            }

            // Map string patterns to integers if needed for UI consistency
            return employees.map(emp => ({
                ...emp,
                type: (typeof emp.type === 'string' && ROLE_MAP[emp.type] !== undefined)
                    ? ROLE_MAP[emp.type]
                    : emp.type
            }))
        } catch (error) {
            console.error('Error fetching employees:', error)
            throw error
        }
    },

    /**
     * Add a new employee
     * @param {Object} employeeData 
     * @returns {Promise<Object>} Created employee
     */
    async addEmployee(employeeData) {
        try {
            // Include all available fields in the payload
            const payload = {
                name: employeeData.name,
                email: employeeData.email,
                password: employeeData.password,
                phone: employeeData.phone,
                type: parseInt(employeeData.type),
                team: employeeData.team,
                national_id: employeeData.national_id,
                dob: employeeData.dob,
                start_date: employeeData.start_date,
                contract_type: employeeData.contract_type,
                social_status: employeeData.social_status,
                iban: employeeData.iban,
                salary: employeeData.salary
            }

            console.log('Adding employee with full payload:', payload)
            const response = await apiClient.post('/admin/employees/add_employee', payload)
            return response.data
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Add Employee API Error Details:', error.response.data)
            }
            throw error
        }
    },

    /**
     * Update an existing employee
     * @param {number|string} id 
     * @param {Object} employeeData 
     * @returns {Promise<Object>} Updated employee
     */
    async updateEmployee(id, employeeData) {
        try {
            // Strict payload for update
            const payload = {
                name: employeeData.name,
                email: employeeData.email,
                phone: employeeData.phone,
                type: (typeof employeeData.type === 'string' && ROLE_MAP[employeeData.type] !== undefined)
                    ? ROLE_MAP[employeeData.type]
                    : parseInt(employeeData.type)
            }

            // Only add password if it's not empty
            if (employeeData.password && employeeData.password.trim() !== '') {
                payload.password = employeeData.password
            }

            console.log(`Updating employee ${id} with strict payload:`, payload)
            const response = await apiClient.put(`/admin/employees/update_employee/${id}`, payload)
            return response.data
        } catch (error) {
            if (error.response) {
                console.error('Update Employee API Error:', error.response.data)
            }
            throw error
        }
    },

    /**
     * Delete an employee
     * @param {number|string} id 
     * @returns {Promise<Object>} Response
     */
    async deleteEmployee(id) {
        try {
            console.log(`Sending DELETE request for employee ID: ${id}`)
            const response = await apiClient.delete(`/admin/employees/delete_employee/${id}`)
            console.log('Delete response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error deleting employee:', error)
            throw error
        }
    },

    /**
     * Get specific employee details
     * @param {number|string} id 
     * @returns {Promise<Object>} Employee details
     */
    async getEmployee(id) {
        try {
            const response = await apiClient.get(`/admin/employees/show_employee/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching employee details:', error)
            throw error
        }
    }
}

export default userService
