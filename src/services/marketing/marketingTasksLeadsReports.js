import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { normalizeListResponse } from '@/utils/marketingNormalizers';
import { unwrap, normalizePaginated } from './marketingShared.js';

export default {
  async getTasks(params = {}) {
    try {
      const response = await apiClient.get('/marketing/tasks', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch marketing tasks', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * @param {any} data
   */
  async createTask(data) {
    try {
      const response = await apiClient.post('/marketing/tasks', data);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create marketing task', 'post');
    }
  },

  /**
   * @param {any} taskId
   * @param {any} data
   */
  async updateTask(taskId, data) {
    try {
      const response = await apiClient.put(`/marketing/tasks/${taskId}`, data);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, `Update marketing task ${taskId}`, 'put');
    }
  },

  /**
   * @param {any} taskId
   * @param {any} status
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await apiClient.patch(`/marketing/tasks/${taskId}/status`, { status });
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Update task status', 'patch');
    }
  },

  async getLeads(params = {}) {
    try {
      const response = await apiClient.get('/marketing/leads', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch marketing leads', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * @param {any} leadId
   */
  async getLeadById(leadId) {
    try {
      const response = await apiClient.get(`/marketing/leads/${leadId}`);
      return unwrap(response, null);
    } catch (error) {
      return handleServiceError(error, 'Fetch lead details', 'get');
    }
  },

  /**
   * @param {any} payload
   */
  async storeLead(payload) {
    try {
      const response = await apiClient.post('/marketing/leads', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create marketing lead', 'post');
    }
  },

  /**
   * @param {any} leadId
   * @param {any} payload
   */
  async assignLead(leadId, payload) {
    try {
      const response = await apiClient.post(`/marketing/leads/${leadId}/assign`, payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Assign lead', 'post');
    }
  },

  /**
   * @param {any} leadId
   */
  async convertLead(leadId, payload = {}) {
    try {
      const response = await apiClient.post(`/marketing/leads/${leadId}/convert`, payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Convert lead', 'post');
    }
  },

  async getTeams(params = {}) {
    try {
      const response = await apiClient.get('/marketing/teams', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch marketing teams', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Assign campaign to team. Body: { team_id, campaign_id } (marketing_campaigns.id).
    * @param {any} data
   */
  async assignCampaign(data) {
    try {
      const response = await apiClient.post('/marketing/teams/assign', data);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Assign campaign to team', 'post');
    }
  },

  /**
   * Get marketers assigned to a marketing project. GET /marketing/projects/:project_id/team.
    * @param {any} projectId
   */
  async getProjectTeam(projectId) {
    try {
      const response = await apiClient.get(`/marketing/projects/${projectId}/team`);
      return unwrap(response, []);
    } catch (error) {
      return handleServiceError(error, 'Fetch project team', 'get', []);
    }
  },

  /**
   * Assign marketers to a marketing project. POST /marketing/projects/:project_id/team, body: { user_ids: number[] }.
    * @param {any} projectId
    * @param {any} payload
   */
  async assignProjectTeam(projectId, payload) {
    try {
      const response = await apiClient.post(`/marketing/projects/${projectId}/team`, payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Assign team to project', 'post');
    }
  },

  /**
   * Project performance report. GET /marketing/reports/project/:project_id.
    * @param {any} projectId
   */
  async getProjectPerformanceReport(projectId) {
    try {
      const response = await apiClient.get(`/marketing/reports/project/${projectId}`);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch project performance report', 'get', {});
    }
  },

  /**
   * Budget report. GET /marketing/reports/budget.
   */
  async getBudgetReport() {
    try {
      const response = await apiClient.get('/marketing/reports/budget');
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch budget report', 'get', {});
    }
  },

  /** Alias for getBudgetReport (backward compatibility). */
  async getBudgetAnalysisReport() {
    return this.getBudgetReport();
  },

  /**
   * Expected bookings report. GET /marketing/reports/expected-bookings.
   */
  async getExpectedBookingsReport() {
    try {
      const response = await apiClient.get('/marketing/reports/expected-bookings');
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch expected bookings report', 'get', {});
    }
  },

  /** Alias for getExpectedBookingsReport (backward compatibility). */
  async getBookingStatsReport() {
    return this.getExpectedBookingsReport();
  },

  /**
   * Employee performance report. GET /marketing/reports/employee/:user_id.
    * @param {any} userId
   */
  async getEmployeePerformanceReport(userId) {
    try {
      const response = await apiClient.get(`/marketing/reports/employee/${userId}`);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch employee performance report', 'get', {});
    }
  },

  /**
   * Export distribution report by project (الحملات الإعلانية على المنصات الإلكترونية).
   * GET /api/marketing/reports/distribution/project/{projectId}
   * Permission: marketing.reports.view. Returns PDF blob.
    * @param {any} projectId
   */
  async exportDistributionByProject(projectId) {
    try {
      const response = await apiClient.get(
        `/marketing/reports/distribution/project/${projectId}`,
        { responseType: 'blob' }
      );
      return response?.data ?? response;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Export employee plan. GET /marketing/reports/export/:plan_id?format=pdf|excel|csv.
    * @param {any} planId
   */
  async exportEmployeePlan(planId, format = 'pdf') {
    try {
      const response = await apiClient.get(`/marketing/reports/export/${planId}`, {
        params: { format },
        responseType: 'blob',
      });
      return response?.data ?? response;
    } catch (error) {
      return handleServiceError(error, 'Export employee plan', 'get');
    }
  },

  /**
   * Export all employee plans for a project (backend). GET /marketing/employee-plans/export?marketing_project_id=&format=pdf|csv|excel
   * Returns blob or null if endpoint not available.
    * @param {any} projectId
   */
  async exportEmployeePlansByProject(projectId, format = 'pdf') {
    try {
      const response = await apiClient.get('/marketing/employee-plans/export', {
        params: { marketing_project_id: projectId, format },
        responseType: 'blob',
      });
      return response?.data ?? response;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Export developer plan. GET /marketing/reports/developer-plan/export/:contract_id?format=pdf|excel|csv.
    * @param {any} contractId
   */
  async exportDeveloperPlan(contractId, format = 'pdf') {
    try {
      const response = await apiClient.get(
        `/marketing/reports/developer-plan/export/${contractId}`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response?.data ?? response;
    } catch (error) {
      return handleServiceError(error, 'Export developer plan', 'get');
    }
  },

  async getBudgetDistributions(params = {}) {
    try {
      const response = await apiClient.get('/marketing/budget-distributions', { params });
      return normalizeListResponse(unwrap(response, []));
    } catch (error) {
      return handleServiceError(error, 'Fetch budget distributions', 'get', []);
    }
  },

  /**
   * @param {any} projectId
   */
  async getBudgetDistributionByProject(projectId, params = {}) {
    try {
      const response = await apiClient.get(`/marketing/budget-distributions/${projectId}`, {
        params,
      });
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(
        error,
        `Fetch budget distribution for project ${projectId}`,
        'get',
        {}
      );
    }
  },

  /**
   * Recalculate budget distribution. POST with no body; uses existing distribution data.
    * @param {any} distributionId
   */
  async calculateBudgetDistribution(distributionId, data = {}) {
    try {
      const response = await apiClient.post(
        `/marketing/budget-distributions/${distributionId}/calculate`,
        data
      );
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, `Calculate budget distribution ${distributionId}`, 'post');
    }
  },

  /**
   * @param {any} distributionId
   */
  async getBudgetDistributionResults(distributionId) {
    try {
      const response = await apiClient.get(
        `/marketing/budget-distributions/${distributionId}/results`
      );
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(
        error,
        `Fetch budget distribution results ${distributionId}`,
        'get',
        {}
      );
    }
  },
};
