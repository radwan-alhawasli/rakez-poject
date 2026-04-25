/**
 * User Repository
 * Data access layer for users.
 * Uses API paths: GET/POST/PUT/DELETE /users (not documented in v2_rakez_api_summary.json;
 * the doc uses /hr/users and /admin/employees). This repository is not imported anywhere
 * in the app; UserManagement uses hrService (/hr/users or /hr/list_employees) and
 * adminEmployeeService (/admin/employees). Kept for future use or if backend exposes /users.
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';

class UserRepository {
  /**
   * Get all users
   * @param {Object} filters - Filters
   * @returns {Promise<Array<any>>} Users
   */
  async findAll(filters = {}) {
    try {
      const response = await apiClient.get('/users', { params: filters });
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }

      return data?.data || [];
    } catch (error) {
      logger.error('UserRepository.findAll error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User
   */
  async findById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('UserRepository.findById error:', error);
      throw error;
    }
  }

  /**
   * Create user
   * @param {Object} data - User data
   * @returns {Promise<Object>} Created user
   */
  async create(data) {
    try {
      const response = await apiClient.post('/users', data);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('UserRepository.create error:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated user
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('UserRepository.update error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      logger.error('UserRepository.delete error:', error);
      throw error;
    }
  }
}

export default new UserRepository();
