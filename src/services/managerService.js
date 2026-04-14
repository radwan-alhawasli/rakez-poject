/**
 * Manager API — employees, reviews, tasks.
 * Base: /manager/*
 * For users with is_manager === true.
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * استخراج مصفوفة المهام من أشكال Laravel/JSON شائعة عندما لا يطابقها extractPaginatedData.
 * @param {import('axios').AxiosResponse} response
 * @returns {unknown[]}
 */
function extractManagerTasksArray(response) {
  const root = response?.data ?? response;
  const asArray = v => (Array.isArray(v) ? v : null);

  let a = asArray(root);
  if (a) return a;

  if (root && typeof root === 'object') {
    for (const k of ['data', 'tasks', 'items', 'results', 'records']) {
      a = asArray(root[k]);
      if (a) return a;
    }
    const inner = root.data;
    if (inner && typeof inner === 'object') {
      for (const k of ['data', 'tasks', 'items', 'results', 'records']) {
        a = asArray(inner[k]);
        if (a) return a;
      }
    }
  }
  return [];
}

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
      if (Array.isArray(data)) return data;
      const { items } = extractPaginatedData(response, []);
      if (Array.isArray(items) && items.length) return items;
      if (data && typeof data === 'object' && Array.isArray(data.reviews)) return data.reviews;
      return [];
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
      const body = {
        rating: Number(data.rating),
        comment: data.comment != null ? String(data.comment).trim() : '',
      };
      const response = await apiClient.post(`/manager/employees/${employeeId}/reviews`, body);
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
      let { items, total } = extractPaginatedData(response, []);
      const raw = response.data?.data ?? response.data;
      if (!items || !items.length) {
        const fallback = extractManagerTasksArray(response);
        if (fallback.length) {
          items = fallback;
          total =
            (raw && typeof raw === 'object' && !Array.isArray(raw)
              ? raw.total ?? raw.meta?.total ?? raw.meta?.pagination?.total
              : null) ?? items.length;
        } else if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.tasks)) {
          items = raw.tasks;
          total = raw.total ?? raw.meta?.total ?? items.length;
        }
      }
      return { items: Array.isArray(items) ? items : [], total: total ?? 0 };
    } catch (error) {
      logger.error('Error fetching manager tasks:', error);
      return handleServiceError(error, 'Manager tasks', 'get', { items: [], total: 0 });
    }
  },

  /**
   * جلب كل الصفحات (حتى maxPages) — لصفحة «كل المهام».
   * @param {Record<string, unknown>} params — بدون page/per_page أو تُستبدل داخلياً
   * @param {{ perPage?: number, maxPages?: number }} [opts]
   */
  async getAllTasks(params = {}, opts = {}) {
    const perPage = Math.min(Math.max(Number(opts.perPage) || 100, 1), 200);
    const maxPages = Math.min(Math.max(Number(opts.maxPages) || 50, 1), 100);
    const base = { ...params, per_page: perPage };
    delete base.page;
    const all = [];
    let totalFromApi = 0;
    for (let page = 1; page <= maxPages; page++) {
      const res = await this.getTasks({ ...base, page });
      const batch = res?.items ?? [];
      totalFromApi = res?.total ?? totalFromApi;
      all.push(...batch);
      if (batch.length < perPage) break;
      if (totalFromApi && all.length >= totalFromApi) break;
    }
    return { items: all, total: all.length };
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
