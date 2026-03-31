import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

// ==================== Dashboard APIs ====================

/**
 * Get dashboard KPIs and metrics
 * GET /hr/dashboard
 */
export const getDashboardMetrics = async () => {
  try {
    const response = await apiClient.get('/hr/dashboard');
    return response.data;
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

// ==================== Employee/User Management APIs (aligned with API collection) ====================

/**
 * Get all employees (api: GET /hr/list_employees)
 * @param {Object} params - Query parameters including search term
 */
export const getEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/list_employees', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  } catch (error) {
    return handleServiceError(error, 'Error fetching employees', 'get') || { items: [], total: 0 };
  }
};

/**
 * Get employee by ID (api: GET /hr/show_employee/:id)
 */
export const getEmployeeById = async employeeId => {
  try {
    const response = await apiClient.get(`/hr/show_employee/${employeeId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error fetching employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Create new employee (api: POST /hr/add_employee)
 * @param {Object} employeeData - Employee info (name, email, type, password, etc.)
 */
export const createEmployee = async employeeData => {
  try {
    const response = await apiClient.post('/hr/add_employee', employeeData);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Update employee (api: PUT /hr/update_employee/:id)
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiClient.put(`/hr/update_employee/${employeeId}`, employeeData);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error updating employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Delete employee (api: DELETE /hr/delete_employee/:id)
 */
export const deleteEmployee = async employeeId => {
  try {
    const response = await apiClient.delete(`/hr/delete_employee/${employeeId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error deleting employee ${employeeId}:`, error);
    throw error;
  }
};
