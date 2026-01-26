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
    return this.updateContractStatusAdmin(contractId, status)
  },

  async approveContract(contractId) {
    return this.updateContractStatus(contractId, 'approved')
  },

  async rejectContract(contractId) {
    return this.updateContractStatus(contractId, 'rejected')
  },

  /**
   * تحديث حالة العقد (لمدير المشاريع)
   * PATCH /contracts/update-status/:id
   */
  async updateContractStatusProjectManager(contractId, status) {
    try {
      const response = await apiClient.patch(
        `/contracts/update-status/${contractId}`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error('Error updating contract status (PM):', error)
      throw error
    }
  },

  /**
   * تحديث حالة العقد (للمسؤول)
   * PATCH /admin/contracts/adminUpdateStatus/:id
   */
  async updateContractStatusAdmin(contractId, status) {
    try {
      const response = await apiClient.patch(
        `/admin/contracts/adminUpdateStatus/${contractId}`,
        { status }
      )
      return response.data
    } catch (error) {
      console.error('Error updating contract status (Admin):', error)
      throw error
    }
  },

  // --- Marketer / User Endpoints ---

  /**
   * جلب قائمة العقود
   * GET /contracts/index
   * @param {Object} filters - Optional filters like { status: 'completed', has_photography: 1 }
   */
  async getContracts(filters = {}) {
    try {
      const response = await apiClient.get('/contracts/index', { params: filters })
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
   * جلب المشاريع للمحرر
   * GET /editor/contracts/index
   */
  async getEditorContracts() {
    try {
      const response = await apiClient.get('/editor/contracts/index')
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
      console.error('Error fetching editor contracts:', error)
      throw error
    }
  },

  /**
   * جلب تفاصيل مشروع للمحرر
   * GET /editor/contracts/show/:id
   */
  async getEditorContractById(id) {
    try {
      const response = await apiClient.get(`/editor/contracts/show/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching editor contract by id:', error)
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
      console.log(`📝 Storing contract info for ${id}:`, payload)
      const response = await apiClient.post(`/contracts/store/info/${id}`, payload)
      console.log('✅ Contract info stored successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error storing contract info:', error.response?.data || error)
      throw error
    }
  },

  /**
   * Alias: استكمال بيانات العقد (نفس storeContractInfo)
   * POST /contracts/store/info/:id
   */
  async completeContractInfo(id, payload) {
    return this.storeContractInfo(id, payload)
  },

  /**
   * حفظ بيانات الطرف الثاني (المتتبع)
   * POST /second-party-data/store/:id
   */
  async storeSecondPartyData(id, payload) {
    try {
      console.log(`Storing second party data for ${id}:`, payload)
      const response = await apiClient.post(`/second-party-data/store/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error storing second party data:', error)
      throw error
    }
  },

  /**
   * تحديث بيانات الطرف الثاني
   * PUT /second-party-data/update/:id
   */
  async updateSecondPartyData(id, payload) {
    try {
      console.log(`Updating second party data for ${id}:`, payload)
      const response = await apiClient.put(`/second-party-data/update/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating second party data:', error)
      throw error
    }
  },

  /**
   * جلب بيانات الطرف الثاني (المتتبع)
   * GET /second-party-data/show/:id
   */
  async getSecondPartyData(id) {
    try {
      const response = await apiClient.get(`/second-party-data/show/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching second party data:', error)
      // Allow 404/400 to pass gracefully as "no data found"
      return null
    }
  },

  // --- Units Endpoints ---

  /**
   * جلب وحدات العقد
   * GET /contracts/units/show/:id
   */
  async getContractUnits(id, csvFile = null) {
    try {
      let response;
      if (csvFile) {
        const formData = new FormData();
        formData.append('csv_file', csvFile);
        response = await apiClient.get(`/contracts/units/show/${id}`, {
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiClient.get(`/contracts/units/show/${id}`);
      }
      const res = response.data
      let units = []
      if (Array.isArray(res)) {
        units = res
      } else if (res && res.data && Array.isArray(res.data)) {
        units = res.data
      } else {
        units = res.data || []
      }
      return Array.isArray(units) ? units : []
    } catch (error) {
      console.error('Error fetching contract units:', error)
      return []
    }
  },

  /**
   * إضافة وحدة واحدة
   * POST /contracts/units/store/:id
   */
  async addContractUnit(id, payload) {
    try {
      const response = await apiClient.post(`/contracts/units/store/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error adding contract unit:', error)
      throw error
    }
  },

  /**
   * تحديث وحدة
   * PUT /contracts/units/update/:unitId
   */
  async updateContractUnit(unitId, payload) {
    try {
      const response = await apiClient.put(`/contracts/units/update/${unitId}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating contract unit:', error)
      throw error
    }
  },

  /**
   * رفع ملف CSV للوحدات
   * POST /contracts/units/upload-csv/:id
   */
  async uploadContractUnitsCsv(id, formData) {
    try {
      const response = await apiClient.post(`/contracts/units/upload-csv/${id}`, formData)
      return response.data
    } catch (error) {
      console.error('Error uploading units CSV:', error)
      throw error
    }
  },

  /**
  async uploadContractUnitsCsv(id, formData) {
    try {
      const response = await apiClient.post(`/contracts/units/upload-csv/${id}`, formData)
      return response.data
    } catch (error) {
      console.error('Error uploading units CSV:', error)
      throw error
    }
  },

  /**
   * جلب بيانات قسم التصوير
   * GET /photography-department/show/:id
   */
  async getPhotography(id) {
    try {
      // Assuming this endpoint exists based on standard REST patterns in this project
      const response = await apiClient.get(`/photography-department/show/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching photography data:', error)
      // Return null rather than throwing so we can handle empty state gracefully
      return null
    }
  },

  /**
   * حفظ بيانات قسم التصوير
   * POST /photography-department/store/:id
   */
  async storePhotography(id, payload) {
    try {
      const response = await apiClient.post(`/photography-department/store/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error storing photography data:', error)
      throw error
    }
  },

  /**
   * تحديث بيانات قسم التصوير
   * PUT /photography-department/update/:id
   */
  async updatePhotography(id, payload) {
    try {
      const response = await apiClient.put(`/photography-department/update/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating photography data:', error)
      throw error
    }
  },

  // --- Developer / Second Party Endpoints ---

  /**
   * جلب قائمة المطورين
   * GET /second-party-data/second-parties
   */
  async getDevelopers() {
    try {
      const response = await apiClient.get('/second-party-data/second-parties')
      // Normalize response
      const res = response.data
      let devs = []
      if (Array.isArray(res)) {
        devs = res
      } else if (res && res.data && Array.isArray(res.data)) {
        devs = res.data
      } else {
        devs = res.data || []
      }
      return Array.isArray(devs) ? devs : []
    } catch (error) {
      console.error('Error fetching developers:', error)
      return []
    }
  },

  /**
   * جلب بيانات قسم المونتاج
   * GET /montage-department/show/:id
   */
  async getMontage(id) {
    try {
      const response = await apiClient.get(`/montage-department/show/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching montage data:', error)
      return null
    }
  },

  /**
   * حفظ بيانات قسم المونتاج
   * POST /montage-department/store/:id
   */
  async storeMontage(id, payload) {
    try {
      const response = await apiClient.post(`/montage-department/store/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error storing montage data:', error)
      throw error
    }
  },

  /**
   * تحديث بيانات قسم المونتاج
   * POST /montage-department/update/:id
   * (User request implies POST or PUT, keeping standard unless failed)
   */
  async updateMontage(id, payload) {
    try {
      // User specific endpoint example usually POST for updates in Laravel often?
      // But adhering to REST for now or POST as per user implicit text.
      // User text: {{server}}/montage-department/update/2
      const response = await apiClient.post(`/montage-department/update/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating montage data:', error)
      throw error
    }
  },

  /**
   * جلب مشاريع مطور بواسطة البريد الإلكتروني
   * GET /second-party-data/contracts-by-email
   */
  async getDeveloperContractsByEmail(email) {
    try {
      const response = await apiClient.get('/second-party-data/contracts-by-email', { params: { email } })
      return response.data
    } catch (error) {
      console.error('Error fetching developer contracts:', error)
      return []
    }
  }
}

export default contractService
