import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Task Service
 * Handles core task management API operations.
 */
export default {
  /**
   * Build POST /tasks body to match API contract (task_name, section, due_at, assigned_to).
   * Accepts legacy shape with `title` instead of `task_name`.
   * @param {any} taskData
   * @returns {Record<string, unknown>}
   */
  _buildCreateTaskPayload(taskData) {
    const task_name = taskData.task_name ?? taskData.title;
    const body = {
      task_name: typeof task_name === 'string' ? task_name.trim() : String(task_name ?? '').trim(),
      section: taskData.section,
      due_at: taskData.due_at ?? null,
    };
    const rawAssignee = taskData.assigned_to;
    if (rawAssignee !== '' && rawAssignee != null) {
      const n = Number(rawAssignee);
      if (!Number.isNaN(n)) {
        body.assigned_to = n;
      }
    }
    const desc = taskData.description;
    if (typeof desc === 'string' && desc.trim() !== '') {
      body.description = desc.trim();
    }
    return body;
  },

  /**
   * Create a new task
   * @param {any} taskData - The task details (task_name or title, section, due_at, assigned_to, optional description)
   * @returns {Promise<Object>} The created task data
   */
  async createTask(taskData) {
    try {
      const payload = this._buildCreateTaskPayload(taskData);
      const response = await apiClient.post('/tasks', payload);
      return response.data?.data || response.data;
    } catch (error) {
      return handleServiceError(error, 'Create task', 'post');
    }
  },

  /**
   * Get task sections (departments) with labels for the Add Task form.
   * API: GET /tasks/sections → [{ value, label }, ...] (e.g. value: 'marketing', label: 'قسم التسويق')
   * @returns {Promise<Array<{ value: string, label: string }>>}
   */
  async getTaskSections() {
    try {
      const response = await apiClient.get('/tasks/sections');
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch task sections', 'get', []);
    }
  },

  /**
   * Get users for a given section (for assignee dropdown).
   * API: GET /tasks/sections/:section/users → list of users in that section/role.
   * @param {string} section - Section key (e.g. 'marketing', 'sales')
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async getSectionUsers(section) {
    if (!section) return [];
    try {
      const response = await apiClient.get(`/tasks/sections/${encodeURIComponent(section)}/users`);
      const data = response.data?.data ?? response.data;
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items;
    } catch (error) {
      return handleServiceError(error, 'Fetch section users', 'get', []);
    }
  },

  /**
   * Get tasks assigned to the current authenticated user
   * @param {any} params - Query parameters (status, per_page, page)
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
   * Get tasks created/requested by the current user and assigned to others
   * @param {any} params - Query parameters (status, per_page, page)
   * @returns {Promise<Object>} Paginated task list { items: [...], total: ... }
   */
  async getRequestedTasks(params = {}) {
    try {
      const response = await apiClient.get('/requested-tasks', { params });
      return extractPaginatedData(response, []);
    } catch (error) {
      return handleServiceError(error, 'Fetch requested tasks', 'get', { items: [], total: 0 });
    }
  },

  /**
   * Update the status of a task assigned to the current user
   * @param {number|string} taskId - The ID of the task
   * @param {any} data - Update data { status, cannot_complete_reason }
   * @returns {Promise<Object>} The updated task data
   */
  async updateTaskStatus(taskId, data) {
    try {
      const response = await apiClient.patch(`/my-tasks/${taskId}/status`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return handleServiceError(error, `Update task ${taskId} status`, 'patch');
    }
  },
};
