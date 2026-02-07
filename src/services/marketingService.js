import apiClient from '../api/apiClient'
import logger from '../utils/logger'

/**
 * خدمة التسويق - Marketing Service
 * API Integration for Marketing Module
 */
const marketingService = {
  // --- Dashboard ---

  /**
   * جلب إحصائيات لوحة التحكم التسويقية
   * GET /api/marketing/dashboard
   */
  async getDashboard() {
    try {
      const response = await apiClient.get('/marketing/dashboard')
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error fetching marketing dashboard:', error)
      throw error
    }
  },

  // --- Projects ---

  /**
   * جلب قائمة المشاريع التسويقية
   * GET /api/marketing/projects
   */
  async getProjects() {
    try {
      const response = await apiClient.get('/marketing/projects')
      const projects = response.data?.data || response.data || []
      return Array.isArray(projects) ? projects : []
    } catch (error) {
      logger.error('Error fetching projects:', error)
      throw error
    }
  },

  /**
   * جلب تفاصيل مشروع محدد
   * GET /api/marketing/projects/:id
   */
  async getProjectById(id) {
    try {
      const response = await apiClient.get(`/marketing/projects/${id}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error fetching project details:', error)
      throw error
    }
  },

  /**
   * حساب الميزانية التسويقية
   * POST /api/marketing/projects/calculate-budget
   * Payload: { contract_id, unit_price }
   */
  async calculateBudget(payload) {
    try {
      const response = await apiClient.post('/marketing/projects/calculate-budget', payload)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error calculating budget:', error)
      throw error
    }
  },

  // --- Plans ---

  /**
   * جلب خطة المطور
   * GET /api/marketing/developer-plans/:id
   */
  async getDeveloperPlan(id) {
    try {
      const response = await apiClient.get(`/marketing/developer-plans/${id}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error fetching developer plan:', error)
      throw error
    }
  },

  /**
   * إنشاء خطة مطور جديدة
   * POST /api/marketing/developer-plans
   * Payload: { contract_id, marketing_value, average_cpm, average_cpc }
   */
  async storeDeveloperPlan(payload) {
    try {
      const response = await apiClient.post('/marketing/developer-plans', payload)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error creating developer plan:', error)
      throw error
    }
  },

  /**
   * جلب قائمة خطط الموظفين لمشروع معين
   * GET /api/marketing/employee-plans/project/:projectId
   */
  async getEmployeePlans(projectId) {
    try {
      const response = await apiClient.get(`/marketing/employee-plans/project/${projectId}`)
      const plans = response.data?.data || response.data || []
      return Array.isArray(plans) ? plans : []
    } catch (error) {
      logger.error('Error fetching employee plans:', error)
      throw error
    }
  },

  /**
   * توليد خطة موظف تلقائياً
   * POST /api/marketing/employee-plans/auto-generate
   * Payload: { marketing_project_id, user_id }
   */
  async autoGenerateEmployeePlan(payload) {
    try {
      const response = await apiClient.post('/marketing/employee-plans/auto-generate', payload)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error auto-generating employee plan:', error)
      throw error
    }
  },

  // --- Tasks ---

  /**
   * جلب قائمة مهامي التسويقية
   * GET /api/marketing/tasks
   */
  async getTasks() {
    try {
      const response = await apiClient.get('/marketing/tasks')
      const tasks = response.data?.data || response.data || []
      return Array.isArray(tasks) ? tasks : []
    } catch (error) {
      logger.error('Error fetching tasks:', error)
      throw error
    }
  },

  /**
   * تحديث حالة مهمة
   * PATCH /api/marketing/tasks/:id/status
   * Payload: { status: 'completed' | 'in-progress' | 'pending' }
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await apiClient.patch(`/marketing/tasks/${taskId}/status`, { status })
      return response.data?.data || response.data || {}
    } catch (error) {
      // بعض بيئات الـ API قد تقبل status كـ query param بدلاً من body (حسب إعدادات الباك-إند)
      if (error?.status === 400 || error?.status === 422) {
        try {
          const response = await apiClient.patch(
            `/marketing/tasks/${taskId}/status`,
            null,
            { params: { status } }
          )
          return response.data?.data || response.data || {}
        } catch (retryError) {
          logger.error('Error updating task status (retry):', retryError)
          throw retryError
        }
      }

      logger.error('Error updating task status:', error)
      throw error
    }
  },

  // --- Leads ---

  /**
   * جلب قائمة العملاء المحتملين
   * GET /api/marketing/leads
   */
  async getLeads() {
    try {
      const response = await apiClient.get('/marketing/leads')
      const leads = response.data?.data || response.data || []
      return Array.isArray(leads) ? leads : []
    } catch (error) {
      logger.error('Error fetching leads:', error)
      throw error
    }
  },

  /**
   * إضافة عميل محتمل جديد
   * POST /api/marketing/leads
   * Payload: { name, contact_info, source, project_id }
   */
  async storeLead(payload) {
    try {
      const response = await apiClient.post('/marketing/leads', payload)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error creating lead:', error)
      throw error
    }
  }
}

export default marketingService
