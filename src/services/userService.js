import apiClient from '@/api/apiClient';
import { ROLE_MAP } from '@/constants/roles';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

const userService = {
  /**
   * Get all employees (api: GET /hr/users)
   * @returns {Promise<{ items: Array, total: number }>} List of employees
   */
  async getEmployees(params = {}) {
    try {
      const response = await apiClient.get('/hr/users', { params });
      const { items, total } = extractPaginatedData(response, []);
      const employees = items.map(emp => ({
        ...emp,
        type:
          typeof emp.type === 'string' && ROLE_MAP[emp.type] !== undefined
            ? ROLE_MAP[emp.type]
            : emp.type,
      }));
      return { items: employees, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch employees', 'get') || { items: [], total: 0 };
    }
  },

  /**
   * Add a new employee (api: POST /hr/users)
   * Payload: { email, password, phone, name, type, ... }
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
        team_id: employeeData.team_id ?? employeeData.team,
        national_id: employeeData.national_id,
        dob: employeeData.dob,
        start_date: employeeData.start_date,
        contract_type: employeeData.contract_type,
        social_status: employeeData.social_status,
        iban: employeeData.iban,
        salary: employeeData.salary,
        is_manager: !!employeeData.is_manager,
      };

      const response = await apiClient.post('/hr/users', payload);
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Add employee', 'post');
    }
  },

  /**
   * Update an existing employee (api: PUT /hr/users/:id)
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
        type: parseInt(employeeData.type),
      };

      if (employeeData.phone) {
        payload.phone = employeeData.phone;
      }

      if (employeeData.is_manager !== undefined) {
        payload.is_manager = !!employeeData.is_manager;
      }

      // New HR fields
      if (employeeData.salary) payload.salary = employeeData.salary;
      if (employeeData.iban) payload.iban = employeeData.iban;
      if (employeeData.identity_image) payload.identity_image = employeeData.identity_image;
      if (employeeData.signed_contract) payload.signed_contract = employeeData.signed_contract;

      // Only add password if it's explicitly provided and not empty
      if (employeeData.password && employeeData.password.trim() !== '') {
        payload.password = employeeData.password;
      }

      const response = await apiClient.put(`/hr/users/${id}`, payload);
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Update employee', 'put');
    }
  },

  /**
   * Delete an employee (api: DELETE /hr/users/:id)
   * @param {number|string} id
   * @returns {Promise<Object>} Response
   */
  async deleteEmployee(id) {
    try {
      const response = await apiClient.delete(`/hr/users/${id}`);
      return response.data?.data ?? response.data;
    } catch (error) {
      return handleServiceError(error, 'Delete employee', 'delete');
    }
  },

  /**
   * Get specific employee details (api: GET /hr/users/:id)
   * @param {number|string} id
   * @returns {Promise<Object>} Employee details
   */
  async getEmployee(id) {
    try {
      const response = await apiClient.get(`/hr/users/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, `Fetch employee ${id}`, 'get', {});
    }
  },

  /**
   * List all roles (api: GET /hr/users/roles)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of roles
   */
  async listRoles(params = {}) {
    try {
      const response = await apiClient.get('/hr/users/roles', { params });
      const roles = response.data?.data ?? response.data ?? [];
      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch roles', 'get', []);
    }
  },

  /**
   * Restore a deleted employee (api: PATCH /hr/users/:id/restore)
   * @param {number|string} id - Employee ID
   * @returns {Promise<Object>} Restored employee
   */
  async restoreEmployee(id) {
    try {
      const response = await apiClient.patch(`/hr/users/${id}/restore`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      return handleServiceError(error, `Restore employee ${id}`, 'patch');
    }
  },
};

export default userService;
