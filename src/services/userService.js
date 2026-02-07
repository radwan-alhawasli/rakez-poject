import apiClient from '../api/apiClient'

import { ROLE_MAP } from '../constants/roles'
import logger from '../utils/logger'

const userService = {
    /**
     * Get all employees
     * GET /admin/employees/list_employees
     * @returns {Promise<Array>} List of employees
     */
    async getEmployees(params = {}) {
        try {
            const response = await apiClient.get('/admin/employees/list_employees', { params })
            const result = response.data
            
            let employees = []

            if (result && result.employees && Array.isArray(result.employees)) {
                employees = result.employees
            } else if (result && result.data && Array.isArray(result.data)) {
                employees = result.data
            } else if (result && result.data && result.data.employees && Array.isArray(result.data.employees)) {
                employees = result.data.employees
            } else if (Array.isArray(result)) {
                employees = result
            } else if (result && typeof result === 'object') {
                // Last resort: find first array value
                const values = Object.values(result)
                const found = values.find(v => Array.isArray(v))
                if (found) employees = found
            }

            return employees.map(emp => ({
                ...emp,
                // Ensure type is mapped correctly if it comes as string/int
                type: (typeof emp.type === 'string' && ROLE_MAP[emp.type] !== undefined)
                    ? ROLE_MAP[emp.type]
                    : emp.type
            }))
        } catch (error) {
            logger.error('Error fetching employees:', error)
            throw error
        }
    },

    /**
     * Add a new employee
     * POST /admin/employees/add_employee
     * Payload: { email, password, phone, name, type }
     * @param {Object} employeeData 
     * @returns {Promise<Object>} Created employee
     */
    async addEmployee(employeeData) {
        try {
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
                salary: employeeData.salary,
                is_manager: !!employeeData.is_manager
            }

            const response = await apiClient.post('/admin/employees/add_employee', payload)
            return response.data
        } catch (error) {
            logger.error('Add Employee API Error:', error.response?.data || error.message)
            throw error
        }
    },

    /**
     * Update an existing employee
     * PUT /admin/employees/update_employee/:id
     * Payload: { email, phone, name, type } + optional password
     * @param {number|string} id 
     * @param {Object} employeeData 
     * @returns {Promise<Object>} Updated employee
     */
    async updateEmployee(id, employeeData) {
        try {
            const payload = {
                email: employeeData.email,
                // phone: employeeData.phone, // Commented out in some examples, keeping to be safe or strictly following request? 
                // Request image shows keys commented out, but we typically need to update them if changed. 
                // We will send what is provided.
                name: employeeData.name,
                type: parseInt(employeeData.type)
            }
            
            if (employeeData.phone) {
                payload.phone = employeeData.phone
            }

            if (employeeData.is_manager !== undefined) {
                payload.is_manager = !!employeeData.is_manager
            }

            // New HR fields
            if (employeeData.salary) payload.salary = employeeData.salary
            if (employeeData.iban) payload.iban = employeeData.iban
            if (employeeData.identity_image) payload.identity_image = employeeData.identity_image
            if (employeeData.signed_contract) payload.signed_contract = employeeData.signed_contract

            // Only add password if it's explicitly provided and not empty
            if (employeeData.password && employeeData.password.trim() !== '') {
                payload.password = employeeData.password
            }

            const response = await apiClient.put(`/admin/employees/update_employee/${id}`, payload)
            return response.data
        } catch (error) {
            logger.error('Update Employee API Error:', error.response?.data || error.message)
            throw error
        }
    },

    /**
     * Delete an employee
     * DELETE /admin/employees/delete_employee/:id
     * @param {number|string} id 
     * @returns {Promise<Object>} Response
     */
    async deleteEmployee(id) {
        try {
            const response = await apiClient.delete(`/admin/employees/delete_employee/${id}`)
            return response.data
        } catch (error) {
            logger.error('Error deleting employee:', error)
            throw error
        }
    },

    /**
     * Get specific employee details
     * GET /admin/employees/show_employee/:id
     * @param {number|string} id 
     * @returns {Promise<Object>} Employee details
     */
    async getEmployee(id) {
        try {
            const response = await apiClient.get(`/admin/employees/show_employee/${id}`)
            return response.data
        } catch (error) {
            logger.error('Error fetching employee details:', error)
            throw error
        }
    }
}

export default userService
