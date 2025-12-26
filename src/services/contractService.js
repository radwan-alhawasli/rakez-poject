import apiClient from '../api/apiClient'

/**
 * خدمة العقود - API Integration
 */
const contractService = {
  // --- Admin Endpoints ---

  /**
   * جلب جميع العقود (للمسؤول)
   * GET /admin/contracts/adminIndex
   */
  async getAllContracts() {
    try {
      const response = await apiClient.get('/admin/contracts/adminIndex')
      const res = response.data
      let contracts = []
      if (Array.isArray(res)) {
          contracts = res
      } else if (res && res.data && Array.isArray(res.data)) {
          contracts = res.data
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
          contracts = res.data.data
      } else {
          // Fallback or empty
          contracts = res.data || []
      }
      return Array.isArray(contracts) ? contracts : []
    } catch (error) {
      console.error('Error fetching admin contracts:', error)
      throw error
    }
  },

  /**
   * تحديث حالة العقد (قبول/رفض)
   * PATCH /admin/contracts/adminUpdateStatus/:id
   * Payload: { status: 'approved' | 'rejected' }
   */
  async updateContractStatus(contractId, status) {
    try {
      const response = await apiClient.patch(
        `/admin/contracts/adminUpdateStatus/${contractId}`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error('Error updating contract status:', error)
      throw error
    }
  },

  async approveContract(contractId) {
    return this.updateContractStatus(contractId, 'approved')
  },

  async rejectContract(contractId) {
    return this.updateContractStatus(contractId, 'rejected')
  },

  // --- Marketer / User Endpoints ---

  /**
   * جلب قائمة العقود
   * GET /contracts/index
   */
  async getContracts() {
    try {
      const response = await apiClient.get('/contracts/index')
      const res = response.data
      let contracts = []
      if (Array.isArray(res)) {
          contracts = res
      } else if (res && res.data && Array.isArray(res.data)) {
          contracts = res.data
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        contracts = res.data.data
      } else {
          contracts = res.data || []
      }
      return Array.isArray(contracts) ? contracts : []
    } catch (error) {
      console.error('Error fetching contracts:', error)
      throw error
    }
  },

  /**
   * جلب تفاصيل عقد
   * GET /contracts/show/:id
   */
  async getContractById(id) {
    try {
      const response = await apiClient.get(`/contracts/show/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching contract by id:', error)
      throw error
    }
  },

  /**
   * إنشاء طلب مشروع جديد (حصري)
   * POST /contracts/store
   * Payload: project_name, developer_name, developer_number, etc.
   */
  async createContract(payload) {
    try {
      console.log('Creating contract payload:', payload)
      const response = await apiClient.post('/contracts/store', payload)
      return response.data
    } catch (error) {
      console.error('Error creating contract:', error)
      throw error
    }
  },

  /**
   * تحديث أولي للعقد (إذا لزم الأمر)
   * PUT /contracts/update/:id
   */
  async updateContract(id, payload) {
    try {
      const response = await apiClient.put(`/contracts/update/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating contract:', error)
      throw error
    }
  },

  /**
   * استكمال بيانات العقد (الطرف الثاني، التواريخ..)
   * POST /contracts/store/info/:id
   * وهذا Endpoint يستخدم عند "استكمال العقد"
   */
  async storeContractInfo(id, payload) {
    try {
      console.log(`Storing contract info for ${id}:`, payload)
      const response = await apiClient.post(`/contracts/store/info/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error storing contract info:', error)
      throw error
    }
  }
}

export default contractService
