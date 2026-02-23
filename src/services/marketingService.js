import apiClient from '../api/apiClient';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';
import {
  normalizeMarketingDashboard,
  normalizeProjectDetails,
  normalizeExpectedSale,
  normalizeListResponse,
} from '../utils/marketingNormalizers';

const unwrap = (response, fallback = {}) => response?.data?.data ?? response?.data ?? fallback;

const normalizePaginated = (response, itemNormalizer = x => x) => {
  const { items, total } = extractPaginatedData(response, []);
  let list = Array.isArray(items) ? items : [];
  if (list.length === 0 && response?.data) {
    const d = response.data;
    if (Array.isArray(d.projects)) list = d.projects;
    else if (Array.isArray(d.data) && list.length === 0) list = d.data;
  }
  return {
    items: normalizeListResponse(list).map(itemNormalizer),
    total: Number(total) || list.length,
  };
};

const marketingService = {
  async getDashboard() {
    try {
      const response = await apiClient.get('/marketing/dashboard');
      return normalizeMarketingDashboard(unwrap(response, {}));
    } catch (error) {
      return handleServiceError(
        error,
        'Fetch marketing dashboard',
        'get',
        normalizeMarketingDashboard({})
      );
    }
  },

  async getProjects(params = {}) {
    try {
      const response = await apiClient.get('/marketing/projects', { params });
      return normalizePaginated(response, normalizeProjectDetails);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch marketing projects', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Get project by ID (path param). Prefer getProjectByContractId when you have contract_id.
   */
  async getProjectById(id) {
    try {
      const response = await apiClient.get(`/marketing/projects/${id}`);
      return normalizeProjectDetails(unwrap(response, {}));
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing project by id', 'get', {});
    }
  },

  /**
   * Get project details by contract ID (API path: GET /marketing/projects/:contract_id).
   */
  async getProjectByContractId(contractId) {
    try {
      const response = await apiClient.get(`/marketing/projects/${contractId}`);
      return normalizeProjectDetails(unwrap(response, {}));
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing project by contract id', 'get', {});
    }
  },

  /**
   * Get recommended employee for client communication (performance + developer booking ratio).
   * API path: GET /marketing/projects/:project_id/recommend-employee. Uses marketing project_id.
   * Returns null if endpoint not implemented or 404.
   */
  async getRecommendedEmployee(projectId) {
    try {
      const response = await apiClient.get(`/marketing/projects/${projectId}/recommend-employee`);
      return unwrap(response, null);
    } catch (error) {
      if (error.response?.status === 404) return null;
      return null;
    }
  },

  async calculateBudget(payload) {
    try {
      const response = await apiClient.post('/marketing/projects/calculate-budget', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Calculate marketing budget', 'post');
    }
  },

  async getDeveloperPlan(contractId) {
    try {
      const response = await apiClient.get(`/marketing/developer-plans/${contractId}`);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch developer plan', 'get', {});
    }
  },

  async getDeveloperPlans(params = {}) {
    try {
      const response = await apiClient.get('/marketing/developer-plans', { params });
      return normalizeListResponse(unwrap(response, []));
    } catch (error) {
      return handleServiceError(error, 'Fetch developer plans list', 'get', []);
    }
  },

  async storeDeveloperPlan(payload) {
    try {
      const response = await apiClient.post('/marketing/developer-plans', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create developer plan', 'post');
    }
  },

  async createDeveloperPlan(data) {
    return this.storeDeveloperPlan(data);
  },

  async getEmployeePlans(projectId, params = {}) {
    try {
      const requestParams = { ...params };
      if (projectId) requestParams.project_id = projectId;
      const response = await apiClient.get('/marketing/employee-plans', { params: requestParams });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch employee plans', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  async getEmployeePlansList(params = {}) {
    try {
      const response = await apiClient.get('/marketing/employee-plans', { params });
      return normalizePaginated(response);
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch employee plans list', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * Get employee plan by ID. API path: GET /marketing/employee-plans/:plan_id.
   */
  async getEmployeePlanById(planId) {
    try {
      const response = await apiClient.get(`/marketing/employee-plans/${planId}`);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch employee plan', 'get', {});
    }
  },

  async createEmployeePlan(data) {
    try {
      const payload = { ...data };
      if (payload.project_id && !payload.marketing_project_id) {
        payload.marketing_project_id = payload.project_id;
        delete payload.project_id;
      }
      const response = await apiClient.post('/marketing/employee-plans', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create employee plan', 'post');
    }
  },

  async autoGenerateEmployeePlan(payload) {
    try {
      const response = await apiClient.post('/marketing/employee-plans/auto-generate', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Auto-generate employee plan', 'post');
    }
  },

  async getExpectedSales(params = {}) {
    try {
      const response = await apiClient.get('/marketing/expected-sales', { params });
      const paginated = normalizePaginated(response, normalizeExpectedSale);
      return paginated;
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch expected sales', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  async createExpectedSale(data) {
    try {
      const response = await apiClient.post('/marketing/expected-sales', data);
      return normalizeExpectedSale(unwrap(response, {}));
    } catch (error) {
      return handleServiceError(error, 'Create expected sale', 'post');
    }
  },

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

  async createTask(data) {
    try {
      const response = await apiClient.post('/marketing/tasks', data);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create marketing task', 'post');
    }
  },

  async updateTask(taskId, data) {
    try {
      const response = await apiClient.put(`/marketing/tasks/${taskId}`, data);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, `Update marketing task ${taskId}`, 'put');
    }
  },

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

  async storeLead(payload) {
    try {
      const response = await apiClient.post('/marketing/leads', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create marketing lead', 'post');
    }
  },

  async assignLead(leadId, payload) {
    try {
      const response = await apiClient.post(`/marketing/leads/${leadId}/assign`, payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Assign lead', 'post');
    }
  },

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
   * Export employee plan. GET /marketing/reports/export/:plan_id?format=pdf|excel|csv.
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
   * Export developer plan. GET /marketing/reports/developer-plan/export/:contract_id?format=pdf|excel|csv.
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

export default marketingService;
