import apiClient from '../api/apiClient'

/**
 * خدمة العقود - جميع عمليات API المتعلقة بالعقود
 */
const contractService = {
  /**
   * جلب جميع العقود
   * @returns {Promise} قائمة العقود
   */
  // --- Admin Endpoints ---

  /**
   * جلب جميع العقود (للمدمن)
   */
  async getAllContracts() {
    try {
      const response = await apiClient.get('/admin/contracts/adminIndex')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching admin contracts:', error)
      throw error
    }
  },

  /**
   * تحديث حالة العقد (قبول/رفض من المدمن)
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

  // --- Marketer Endpoints ---

  /**
   * جلب قائمة العقود (للمسوق)
   */
  async getContracts() {
    try {
      const response = await apiClient.get('/contracts/index')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching marketer contracts:', error)
      throw error
    }
  },

  /**
   * إنشاء طلب مشروع جديد
   */
  async createContract(payload) {
    try {
      const response = await apiClient.post('/contracts/store', payload)
      return response.data
    } catch (error) {
      console.error('Error creating contract:', error)
      throw error
    }
  },

  /**
   * جلب تفاصيل عقد معين بحسب المعرف
   */
  async getContractById(id) {
    try {
      const response = await apiClient.get(`/contracts/show/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching contract by id:', error)
      throw error
    }
  },

  /**
   * تحديث/استكمال العقد
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
   * تخزين بيانات العقد التفصيلية (الطرف الثاني، التواريخ، العمولة)
   */
  async storeContractInfo(id, payload) {
    try {
      const response = await apiClient.post(`/contracts/store/info/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error storing contract info:', error)
      throw error
    }
  },
}

export default contractService
