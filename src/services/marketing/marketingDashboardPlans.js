import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getCaughtStatus } from '@/utils/caughtError';
import { ROLE_MAP } from '@/constants/roles';
import {
  normalizeMarketingDashboard,
  normalizeProjectDetails,
  normalizeExpectedSale,
  normalizeListResponse,
} from '@/utils/marketingNormalizers';
import { unwrap, normalizePaginated } from './marketingShared.js';

export default {
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
    * @param {any} id
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
    * @param {any} contractId
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
   * Canonical marketing % on `marketing_projects.marketing_percent` (syncs to developer + employee plans).
   * PATCH /marketing/projects/{contractId}/marketing-percent — body must include `marketing_percent` (6–10 or null to clear).
   * Permission: marketing.budgets.manage
   * @param {string|number} contractId - contracts.id
   * @param {number|null} marketingPercent
   */
  async updateMarketingProjectPercent(contractId, marketingPercent) {
    try {
      const response = await apiClient.patch(`/marketing/projects/${contractId}/marketing-percent`, {
        marketing_percent: marketingPercent,
      });
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Update marketing project percent', 'patch');
    }
  },

  /**
   * Get recommended employee for client communication (performance + developer booking ratio).
   * API path: GET /marketing/projects/:project_id/recommend-employee. Uses marketing project_id.
   * Returns null if endpoint not implemented or 404.
    * @param {any} projectId
   */
  async getRecommendedEmployee(projectId) {
    try {
      const response = await apiClient.get(`/marketing/projects/${projectId}/recommend-employee`);
      return unwrap(response, null);
    } catch (error) {
      if (getCaughtStatus(error) === 404) return null;
      return null;
    }
  },

  /**
   * @param {any} payload
   */
  async calculateBudget(payload) {
    try {
      const response = await apiClient.post('/marketing/projects/calculate-budget', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Calculate marketing budget', 'post');
    }
  },

  /**
   * @param {any} contractId
   */
  async getDeveloperPlan(contractId) {
    try {
      const response = await apiClient.get(`/marketing/developer-plans/${contractId}`);
      const data = unwrap(response, {});
      const contract = data?.contract ?? data?.data?.contract ?? null;
      return { ...data, contract };
    } catch (error) {
      return handleServiceError(error, 'Fetch developer plan', 'get', {});
    }
  },

  /**
   * استدعاء PDF من الـ API: GET /marketing/developer-plans/{contract_id}/pdf
   * يرجع Blob لتحميل الملف مباشرةً.
   * @param {string|number} contractId
   * @returns {Promise<Blob>}
   */
  async getDeveloperPlanPdf(contractId) {
    const response = await apiClient.get(
      `/marketing/developer-plans/${contractId}/pdf`,
      { responseType: 'blob' }
    );
    // الـ response قد يكون الـ blob مباشرةً أو في response.data
    const blob = response?.data instanceof Blob ? response.data : response;
    return blob;
  },

  /**
   * حساب ميزانية الحملة: عمولة = نسبة السعي × متوسط السعر، ميزانية الحملة = عمولة × نسبة التسويق (6%-10%).
   * POST /api/marketing/developer-plans/calculate-budget
   * Permission: marketing.plans.create
    * @param {any} contractId
    * @param {any} marketingPercent
   */
  async calculateDeveloperPlanBudget(contractId, marketingPercent, unitPrice = null) {
    try {
      /** @type {any} */
      const payload = { contract_id: Number(contractId), marketing_percent: Number(marketingPercent) };
      if (unitPrice != null && unitPrice !== '') payload.unit_price = Number(unitPrice);
      const response = await apiClient.post('/marketing/developer-plans/calculate-budget', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Calculate developer plan budget', 'post', {});
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

  /**
   * @param {any} payload
   */
  async storeDeveloperPlan(payload) {
    try {
      const response = await apiClient.post('/marketing/developer-plans', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Create developer plan', 'post');
    }
  },

  /**
   * @param {any} data
   */
  async createDeveloperPlan(data) {
    return this.storeDeveloperPlan(data);
  },

  /**
   * Get users list for employee-plans (dropdown). Use this instead of GET /hr/users to avoid 403.
   * API: GET /api/marketing/users. Permission: marketing.plans.create
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/marketing/users', { params });
      const { items, total } = extractPaginatedData(response, []);
      const list = /** @type {any[]} */ (items || []);
      const users = list.map(emp => ({
        ...emp,
        type:
          typeof emp.type === 'string' && ROLE_MAP[emp.type] !== undefined
            ? ROLE_MAP[emp.type]
            : emp.type,
      }));
      return { items: users, total };
    } catch (error) {
      return (
        handleServiceError(error, 'Fetch marketing users', 'get', { items: [], total: 0 }) || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * @param {any} projectId
   */
  async getEmployeePlans(projectId, params = {}) {
    try {
      /** @type {Record<string, unknown>} */
      const requestParams = { ...params };
      if (projectId) {
        requestParams.project_id = projectId;
        requestParams.marketing_project_id = projectId;
      }
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
    * @param {any} planId
   */
  async getEmployeePlanById(planId) {
    try {
      const response = await apiClient.get(`/marketing/employee-plans/${planId}`);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Fetch employee plan', 'get', {});
    }
  },

  /**
   * @param {any} data
   */
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

  /**
   * @param {any} payload
   */
  async suggestEmployeePlan(payload) {
    try {
      const response = await apiClient.post('/marketing/employee-plans/suggest', payload);
      return unwrap(response, {});
    } catch (error) {
      return handleServiceError(error, 'Suggest employee plan', 'post');
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

  /**
   * @param {any} data
   */
  async createExpectedSale(data) {
    try {
      const response = await apiClient.post('/marketing/expected-sales', data);
      return normalizeExpectedSale(unwrap(response, {}));
    } catch (error) {
      return handleServiceError(error, 'Create expected sale', 'post');
    }
  },
};
