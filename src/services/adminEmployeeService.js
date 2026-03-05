/**
 * Admin — Employees API (aligned with Rakez ERP API collection).
 * Requires: role admin + permission employees.manage
 * Base: GET/POST/PUT/DELETE/PATCH /admin/employees/*
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

const adminEmployeeService = {
  /**
   * List roles
   * GET /admin/employees/roles
   * @returns {Promise<Array>}
   */
  async listRoles() {
    try {
      const response = await apiClient.get('/admin/employees/roles');
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('Error fetching employee roles:', error);
      return handleServiceError(error, 'List roles', 'get', []);
    }
  },

  /**
   * Add employee
   * POST /admin/employees/add_employee
   * @param {Object} data - { name, email, password, type, role }
   * @returns {Promise<Object>}
   */
  async addEmployee(data) {
    try {
      const response = await apiClient.post('/admin/employees/add_employee', data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error adding employee:', error);
      throw error;
    }
  },

  /**
   * List employees
   * GET /admin/employees/list_employees
   * @param {Object} params - Query params
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async listEmployees(params = {}) {
    try {
      const response = await apiClient.get('/admin/employees/list_employees', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items: items ?? [], total: total ?? 0 };
    } catch (error) {
      logger.error('Error listing employees:', error);
      return handleServiceError(error, 'List employees', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Show employee
   * GET /admin/employees/show_employee/:id
   * @param {number|string} id - Employee ID
   * @returns {Promise<Object>}
   */
  async showEmployee(id) {
    try {
      const response = await apiClient.get(`/admin/employees/show_employee/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update employee
   * PUT /admin/employees/update_employee/:id
   * @param {number|string} id - Employee ID
   * @param {Object} data - { name?, type?, ... }
   * @returns {Promise<Object>}
   */
  async updateEmployee(id, data) {
    try {
      const response = await apiClient.put(`/admin/employees/update_employee/${id}`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete employee
   * DELETE /admin/employees/delete_employee/:id
   * @param {number|string} id - Employee ID
   * @returns {Promise<Object>}
   */
  async deleteEmployee(id) {
    try {
      const response = await apiClient.delete(`/admin/employees/delete_employee/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restore employee
   * PATCH /admin/employees/restore/:id
   * @param {number|string} id - Employee ID
   * @returns {Promise<Object>}
   */
  async restoreEmployee(id) {
    try {
      const response = await apiClient.patch(`/admin/employees/restore/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error restoring employee ${id}:`, error);
      throw error;
    }
  },
};

export default adminEmployeeService;
