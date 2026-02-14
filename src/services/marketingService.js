import apiClient from '../api/apiClient'
import { handleServiceError } from '../utils/serviceErrorHandler'
import { extractPaginatedData } from '../utils/paginationUtils'
import {
  normalizeMarketingDashboard,
  normalizeProjectDetails,
  normalizeExpectedSale,
  normalizeListResponse
} from '../utils/marketingNormalizers'

const unwrap = (response, fallback = {}) => response?.data?.data ?? response?.data ?? fallback

const normalizePaginated = (response, itemNormalizer = (x) => x) => {
  const { items, total } = extractPaginatedData(response, [])
  return { items: normalizeListResponse(items).map(itemNormalizer), total: Number(total) || 0 }
}

const marketingService = {
  async getDashboard() {
    try {
      const response = await apiClient.get('/marketing/dashboard')
      return normalizeMarketingDashboard(unwrap(response, {}))
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing dashboard', 'get', normalizeMarketingDashboard({}))
    }
  },

  async getProjects(params = {}) {
    try {
      const response = await apiClient.get('/marketing/projects', { params })
      return normalizePaginated(response, normalizeProjectDetails)
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing projects', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async getProjectById(id) {
    try {
      const response = await apiClient.get(`/marketing/projects/${id}`)
      return normalizeProjectDetails(unwrap(response, {}))
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing project by id', 'get', {})
    }
  },

  async calculateBudget(payload) {
    try {
      const response = await apiClient.post('/marketing/projects/calculate-budget', payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Calculate marketing budget', 'post')
    }
  },

  async getDeveloperPlan(contractId) {
    try {
      const response = await apiClient.get(`/marketing/plans/developer/${contractId}`)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Fetch developer plan', 'get', {})
    }
  },

  async getDeveloperPlans(params = {}) {
    try {
      const response = await apiClient.get('/marketing/plans/developer', { params })
      return normalizeListResponse(unwrap(response, []))
    } catch (error) {
      return handleServiceError(error, 'Fetch developer plans list', 'get', [])
    }
  },

  async storeDeveloperPlan(payload) {
    try {
      const response = await apiClient.post('/marketing/plans/developer', payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Create developer plan', 'post')
    }
  },

  async createDeveloperPlan(data) {
    return this.storeDeveloperPlan(data)
  },

  async getEmployeePlans(projectId, params = {}) {
    try {
      const requestParams = { ...params }
      if (projectId) requestParams.project_id = projectId
      const response = await apiClient.get('/marketing/plans/employee', { params: requestParams })
      return normalizePaginated(response)
    } catch (error) {
      return handleServiceError(error, 'Fetch employee plans', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async getEmployeePlansList(params = {}) {
    try {
      const response = await apiClient.get('/marketing/plans/employee', { params })
      return normalizePaginated(response)
    } catch (error) {
      return handleServiceError(error, 'Fetch employee plans list', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async getEmployeePlanById(planId) {
    try {
      const response = await apiClient.get(`/marketing/plans/employee/${planId}`)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Fetch employee plan', 'get', {})
    }
  },

  async createEmployeePlan(data) {
    try {
      const payload = { ...data }
      if (payload.project_id && !payload.marketing_project_id) {
        payload.marketing_project_id = payload.project_id
        delete payload.project_id
      }
      const response = await apiClient.post('/marketing/plans/employee', payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Create employee plan', 'post')
    }
  },

  async autoGenerateEmployeePlan(payload) {
    try {
      const response = await apiClient.post('/marketing/employee-plans/auto-generate', payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Auto-generate employee plan', 'post')
    }
  },

  async getExpectedSales(params = {}) {
    try {
      const response = await apiClient.get('/marketing/expected-sales', { params })
      const paginated = normalizePaginated(response, normalizeExpectedSale)
      return paginated
    } catch (error) {
      return handleServiceError(error, 'Fetch expected sales', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async createExpectedSale(data) {
    try {
      const response = await apiClient.post('/marketing/expected-sales', data)
      return normalizeExpectedSale(unwrap(response, {}))
    } catch (error) {
      return handleServiceError(error, 'Create expected sale', 'post')
    }
  },

  async getTasks(params = {}) {
    try {
      const response = await apiClient.get('/marketing/tasks', { params })
      return normalizePaginated(response)
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing tasks', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async createTask(data) {
    try {
      const response = await apiClient.post('/marketing/tasks', data)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Create marketing task', 'post')
    }
  },

  async updateTask(taskId, data) {
    try {
      const response = await apiClient.put(`/marketing/tasks/${taskId}`, data)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, `Update marketing task ${taskId}`, 'put')
    }
  },

  async updateTaskStatus(taskId, status) {
    try {
      return await this.updateTask(taskId, { status })
    } catch (error) {
      return handleServiceError(error, 'Update task status', 'put')
    }
  },

  async getLeads(params = {}) {
    try {
      const response = await apiClient.get('/marketing/leads', { params })
      return normalizePaginated(response)
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing leads', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async storeLead(payload) {
    try {
      const response = await apiClient.post('/marketing/leads', payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Create marketing lead', 'post')
    }
  },

  async assignLead(leadId, payload) {
    try {
      const response = await apiClient.post(`/marketing/leads/${leadId}/assign`, payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Assign lead', 'post')
    }
  },

  async convertLead(leadId, payload = {}) {
    try {
      const response = await apiClient.post(`/marketing/leads/${leadId}/convert`, payload)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Convert lead', 'post')
    }
  },

  async getTeams(params = {}) {
    try {
      const response = await apiClient.get('/marketing/teams', { params })
      return normalizePaginated(response)
    } catch (error) {
      return handleServiceError(error, 'Fetch marketing teams', 'get', { items: [], total: 0 }) || { items: [], total: 0 }
    }
  },

  async assignCampaign(data) {
    try {
      const response = await apiClient.post('/marketing/teams/assign', data)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Assign campaign to team', 'post')
    }
  },

  async getProjectPerformanceReport(params = {}) {
    try {
      const response = await apiClient.get('/marketing/reports/project-performance', { params })
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Fetch project performance report', 'get', {})
    }
  },

  async getBudgetAnalysisReport(params = {}) {
    try {
      const response = await apiClient.get('/marketing/reports/budget-analysis', { params })
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Fetch budget analysis report', 'get', {})
    }
  },

  async getBookingStatsReport(params = {}) {
    try {
      const response = await apiClient.get('/marketing/reports/booking-stats', { params })
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, 'Fetch booking stats report', 'get', {})
    }
  },

  async getBudgetDistributions(params = {}) {
    try {
      const response = await apiClient.get('/marketing/budget-distributions', { params })
      return normalizeListResponse(unwrap(response, []))
    } catch (error) {
      return handleServiceError(error, 'Fetch budget distributions', 'get', [])
    }
  },

  async getBudgetDistributionByProject(projectId, params = {}) {
    try {
      const response = await apiClient.get(`/marketing/budget-distributions/${projectId}`, { params })
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, `Fetch budget distribution for project ${projectId}`, 'get', {})
    }
  },

  async calculateBudgetDistribution(distributionId, data = {}) {
    try {
      const response = await apiClient.post(`/marketing/budget-distributions/${distributionId}/calculate`, data)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, `Calculate budget distribution ${distributionId}`, 'post')
    }
  },

  async getBudgetDistributionResults(distributionId) {
    try {
      const response = await apiClient.get(`/marketing/budget-distributions/${distributionId}/results`)
      return unwrap(response, {})
    } catch (error) {
      return handleServiceError(error, `Fetch budget distribution results ${distributionId}`, 'get', {})
    }
  }
}

export default marketingService
