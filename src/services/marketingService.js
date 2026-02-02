import apiClient from '../api/apiClient'

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
      console.log('📊 Fetching marketing dashboard...')
      const response = await apiClient.get('/marketing/dashboard')
      console.log('✅ Dashboard data:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error fetching marketing dashboard:', error)
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
      console.log('📋 Fetching marketing projects...')
      const response = await apiClient.get('/marketing/projects')
      const projects = response.data?.data || response.data || []
      console.log('✅ Projects loaded:', Array.isArray(projects) ? projects.length : 0)
      return Array.isArray(projects) ? projects : []
    } catch (error) {
      console.error('❌ Error fetching projects:', error)
      throw error
    }
  },

  /**
   * جلب تفاصيل مشروع محدد
   * GET /api/marketing/projects/:id
   */
  async getProjectById(id) {
    try {
      console.log(`📄 Fetching project ${id} details...`)
      const response = await apiClient.get(`/marketing/projects/${id}`)
      console.log('✅ Project details:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error fetching project details:', error)
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
      console.log('💰 Calculating budget:', payload)
      const response = await apiClient.post('/marketing/projects/calculate-budget', payload)
      console.log('✅ Budget calculated:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error calculating budget:', error)
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
      console.log(`📋 Fetching developer plan ${id}...`)
      const response = await apiClient.get(`/marketing/developer-plans/${id}`)
      console.log('✅ Developer plan:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error fetching developer plan:', error)
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
      console.log('📝 Creating developer plan:', payload)
      const response = await apiClient.post('/marketing/developer-plans', payload)
      console.log('✅ Developer plan created:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error creating developer plan:', error)
      throw error
    }
  },

  /**
   * جلب قائمة خطط الموظفين لمشروع معين
   * GET /api/marketing/employee-plans/project/:projectId
   */
  async getEmployeePlans(projectId) {
    try {
      console.log(`📋 Fetching employee plans for project ${projectId}...`)
      const response = await apiClient.get(`/marketing/employee-plans/project/${projectId}`)
      const plans = response.data?.data || response.data || []
      console.log('✅ Employee plans loaded:', Array.isArray(plans) ? plans.length : 0)
      return Array.isArray(plans) ? plans : []
    } catch (error) {
      console.error('❌ Error fetching employee plans:', error)
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
      console.log('🤖 Auto-generating employee plan:', payload)
      const response = await apiClient.post('/marketing/employee-plans/auto-generate', payload)
      console.log('✅ Employee plan generated:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error auto-generating employee plan:', error)
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
      console.log('📋 Fetching marketing tasks...')
      const response = await apiClient.get('/marketing/tasks')
      const tasks = response.data?.data || response.data || []
      console.log('✅ Tasks loaded:', Array.isArray(tasks) ? tasks.length : 0)
      return Array.isArray(tasks) ? tasks : []
    } catch (error) {
      console.error('❌ Error fetching tasks:', error)
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
      console.log(`✏️ Updating task ${taskId} status to: ${status}`)
      const response = await apiClient.patch(`/marketing/tasks/${taskId}/status`, { status })
      console.log('✅ Task status updated:', response.data)
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
          console.log('✅ Task status updated (query param):', response.data)
          return response.data?.data || response.data || {}
        } catch (retryError) {
          console.error('❌ Error updating task status (retry):', retryError)
          throw retryError
        }
      }

      console.error('❌ Error updating task status:', error)
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
      console.log('📋 Fetching leads...')
      const response = await apiClient.get('/marketing/leads')
      const leads = response.data?.data || response.data || []
      console.log('✅ Leads loaded:', Array.isArray(leads) ? leads.length : 0)
      return Array.isArray(leads) ? leads : []
    } catch (error) {
      console.error('❌ Error fetching leads:', error)
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
      console.log('📝 Creating new lead:', payload)
      const response = await apiClient.post('/marketing/leads', payload)
      console.log('✅ Lead created:', response.data)
      return response.data?.data || response.data || {}
    } catch (error) {
      console.error('❌ Error creating lead:', error)
      throw error
    }
  }
}

export default marketingService
