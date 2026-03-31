/**
 * Manager API — employees, reviews, tasks.
 * Base: /manager/*
 * For users with is_manager === true.
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

const managerService = {
  /**
   * List employees under manager
   * GET /manager/employees
   * @param {any} params - Query params
   * @returns {Promise<{ items: unknown[], total?: number }>}
   */
  async getEmployees(params = {}) {
    try {
      const response = await apiClient.get('/manager/employees', { params });
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      const { items, total } = extractPaginatedData(response, []);
      return { items: items ?? [], total: total ?? 0 };
    } catch (error) {
      logger.error('Error fetching manager employees:', error);
      return handleServiceError(error, 'Manager employees', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Show employee
   * GET /manager/employees/:employeeId
    * @param {any} employeeId
   */
  async getEmployee(employeeId) {
    try {
      const response = await apiClient.get(`/manager/employees/${employeeId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching manager employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * List reviews per employee
   * GET /manager/employees/:employeeId/reviews
    * @param {any} employeeId
   */
  async getReviews(employeeId, params = {}) {
    try {
      const response = await apiClient.get(`/manager/employees/${employeeId}/reviews`, { params });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error(`Error fetching reviews for employee ${employeeId}:`, error);
      return handleServiceError(error, 'Manager reviews', 'get', []);
    }
  },

  /**
   * Show a review
   * GET /manager/employees/:employeeId/reviews/:reviewId
    * @param {any} employeeId
    * @param {any} reviewId
   */
  async getReview(employeeId, reviewId) {
    try {
      const response = await apiClient.get(`/manager/employees/${employeeId}/reviews/${reviewId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching review ${reviewId}:`, error);
      throw error;
    }
  },

  /**
   * Create a review
   * POST /manager/employees/:employeeId/reviews
    * @param {any} employeeId
    * @param {any} data
   */
  async createReview(employeeId, data) {
    try {
      const response = await apiClient.post(`/manager/employees/${employeeId}/reviews`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  },

  /**
   * Update a review
   * PUT /manager/employees/:employeeId/reviews/:reviewId
    * @param {any} employeeId
    * @param {any} reviewId
    * @param {any} data
   */
  async updateReview(employeeId, reviewId, data) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/reviews/${reviewId}`, data);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   * DELETE /manager/employees/:employeeId/reviews/:reviewId
    * @param {any} employeeId
    * @param {any} reviewId
   */
  async deleteReview(employeeId, reviewId) {
    try {
      await apiClient.delete(`/manager/employees/${employeeId}/reviews/${reviewId}`);
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * List tasks
   * GET /manager/tasks?status=&assigned_to=&section=&sort_by=due_at&sort_order=asc&per_page=
   */
  async getTasks(params = {}) {
    try {
      const response = await apiClient.get('/manager/tasks', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items: items ?? [], total: total ?? 0 };
    } catch (error) {
      logger.error('Error fetching manager tasks:', error);
      return handleServiceError(error, 'Manager tasks', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Show a task
   * GET /manager/tasks/:taskId
    * @param {any} taskId
   */
  async getTask(taskId) {
    try {
      const response = await apiClient.get(`/manager/tasks/${taskId}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Task statistics
   * GET /manager/tasks/statistics
   */
  async getTaskStatistics() {
    try {
      const response = await apiClient.get('/manager/tasks/statistics');
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error fetching task statistics:', error);
      return handleServiceError(error, 'Manager task statistics', 'get', {});
    }
  },
};

export default managerService;
