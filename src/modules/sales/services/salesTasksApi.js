import apiClient from '@/api/apiClient';

export default {
  async getTaskProjects() {
    const response = await apiClient.get('/sales/tasks/projects');
    const body = response?.data ?? response;
    return Array.isArray(body?.data) ? body.data : body?.projects ?? body ?? [];
  },

  async getProjectTasks(projectId) {
    const response = await apiClient.get(`/sales/tasks/projects/${projectId}`);
    const body = response?.data ?? response;
    return Array.isArray(body?.data) ? body.data : body?.tasks ?? body ?? [];
  },

  createMarketingTask(data) {
    return apiClient.post('/sales/marketing-tasks', data);
  },

  /**
   * Update marketing task status or details
   */
  updateTaskStatus(taskId, data) {
    return apiClient.patch(`/sales/marketing-tasks/${taskId}`, data);
  },
};
