import apiClient from '../api/apiClient';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';

/**
 * Task Service
 * Handles core task management API operations.
 */
export default {
  /**
   * Create a new task
   * @param {Object} taskData - The task details (task_name, team_id, due_at, assigned_to, status, etc.)
   * @returns {Promise<Object>} The created task data
   */
  async createTask(taskData) {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data?.data || response.data;
    } catch (error) {
      return handleServiceError(error, 'Create task', 'post');
    }
  },

  /**
   * Get tasks assigned to the current authenticated user
   * @param {Object} params - Query parameters (status, per_page, page)
   * @returns {Promise<Object>} Paginated task list { items: [...], total: ... }
   */
  async getMyTasks(params = {}) {
    try {
      const response = await apiClient.get('/my-tasks', { params });
      return extractPaginatedData(response, []);
    } catch (error) {
      return handleServiceError(error, 'Fetch my tasks', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Update the status of a task assigned to the current user
   * @param {number|string} taskId - The ID of the task
   * @param {Object} data - Update data { status, cannot_complete_reason }
   * @returns {Promise<Object>} The updated task data
   */
  async updateTaskStatus(taskId, data) {
    try {
      const response = await apiClient.patch(`/my-tasks/${taskId}/status`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return handleServiceError(error, `Update task ${taskId} status`, 'patch');
    }
  }
};
