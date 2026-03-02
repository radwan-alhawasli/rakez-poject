import apiClient from '../api/apiClient';
import logger from '../utils/logger';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';

/**
 * خدمة العقود - API Integration
 */
const contractService = {
  // --- Admin Endpoints ---

  /**
   * جلب جميع العقود (للمسؤول)
   * GET /contracts/admin-index (aligned with API collection)
   * @param {Object} params - page, per_page, status (pending|approved|rejected)
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getAllContracts(params = {}) {
    try {
      const response = await apiClient.get('/contracts/admin-index', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      const status = error?.response?.status || error?.status;
      if (status === 401) throw error;
      logger.error('Fetch admin contracts:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * List contracts for Project Management
   * GET /contracts/admin-index
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of contracts
   */
  async listContractsPM(params = {}) {
    try {
      const response = await apiClient.get('/contracts/admin-index', { params });
      const res = response.data;
      const data = res?.data ?? res;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    } catch (error) {
      const status = error?.response?.status || error?.status;
      if (status === 401) throw error;
      logger.error('Fetch PM contracts:', error);
      return [];
    }
  },

  /**
   * تحديث حالة العقد (قبول/رفض)
   * PATCH /admin/contracts/adminUpdateStatus/:id
   * Payload: { status: 'approved' | 'rejected' }
   */
  async updateContractStatus(contractId, status) {
    return this.updateContractStatusAdmin(contractId, status);
  },

  async approveContract(contractId) {
    return this.updateContractStatus(contractId, 'approved');
  },

  async rejectContract(contractId) {
    return this.updateContractStatus(contractId, 'rejected');
  },

  /**
   * تحديث حالة العقد (لمدير المشاريع)
   * PATCH /contracts/update-status/:id
   */
  async updateContractStatusProjectManager(contractId, status) {
    try {
      const response = await apiClient.patch(`/contracts/update-status/${contractId}`, { status });
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract status (PM)', 'patch');
    }
  },

  /**
   * تحديث حالة العقد (للمسؤول)
   * PATCH /admin/contracts/adminUpdateStatus/:id
   */
  async updateContractStatusAdmin(contractId, status) {
    try {
      const response = await apiClient.patch(`/admin/contracts/adminUpdateStatus/${contractId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract status (Admin)', 'patch');
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
      const response = await apiClient.get('/contracts/index', { params: filters });
      const res = response.data;
      let contracts = [];
      if (Array.isArray(res)) {
        contracts = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        contracts = res.data;
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        contracts = res.data.data;
      } else {
        contracts = res.data || [];
      }
      return Array.isArray(contracts) ? contracts : [];
    } catch (error) {
      const status = error?.response?.status || error?.status;
      if (status === 401) throw error;
      logger.error('Fetch contracts:', error);
      return [];
    }
  },

  /**
   * جلب المشاريع للمحرر
   * GET /editor/contracts/index
   */
  async getEditorContracts() {
    try {
      const response = await apiClient.get('/editor/contracts/index');
      const res = response.data;
      let contracts = [];
      if (Array.isArray(res)) {
        contracts = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        contracts = res.data;
      } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        contracts = res.data.data;
      } else {
        contracts = res.data || [];
      }
      return Array.isArray(contracts) ? contracts : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch editor contracts', 'get', []);
    }
  },

  /**
   * جلب تفاصيل مشروع للمحرر
   * GET /editor/contracts/show/:id
   */
  async getEditorContractById(id) {
    try {
      const response = await apiClient.get(`/editor/contracts/show/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return handleServiceError(error, 'Fetch editor contract by id', 'get', null);
    }
  },

  /**
   * جلب تفاصيل عقد
   * GET /contracts/show/:id
   */
  async getContractById(id) {
    const response = await apiClient.get(`/contracts/show/${id}`);
    return response.data.data || response.data;
  },

  /**
   * إنشاء طلب مشروع جديد (حصري)
   * POST /contracts/store
   * Payload: project_name, developer_name, developer_number, etc.
   */
  async createContract(payload) {
    try {
      logger.debug('Creating contract payload:', payload);
      const response = await apiClient.post('/contracts/store', payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Create contract', 'post');
    }
  },

  /**
   * تحديث أولي للعقد (إذا لزم الأمر)
   * PUT /contracts/update/:id
   */
  async updateContract(id, payload) {
    try {
      const response = await apiClient.put(`/contracts/update/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract', 'put');
    }
  },

  /**
   * استكمال بيانات العقد (الطرف الثاني، التواريخ..)
   * POST /contracts/store/info/:id
   * وهذا Endpoint يستخدم عند "استكمال العقد"
   */
  async storeContractInfo(id, payload) {
    try {
      logger.debug(`Storing contract info for ${id}:`, payload);
      const response = await apiClient.post(`/contracts/store/info/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Store contract info', 'post');
    }
  },

  /**
   * Alias: استكمال بيانات العقد (نفس storeContractInfo)
   * POST /contracts/store/info/:id
   */
  async completeContractInfo(id, payload) {
    return this.storeContractInfo(id, payload);
  },

  /**
   * حفظ بيانات الطرف الثاني (المتتبع)
   * POST /second-party-data/store/:id
   */
  async storeSecondPartyData(id, payload) {
    try {
      const response = await apiClient.post(`/second-party-data/store/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Store second party data', 'post');
    }
  },

  /**
   * تحديث بيانات الطرف الثاني
   * PUT /second-party-data/update/:id
   */
  async updateSecondPartyData(id, payload) {
    try {
      const response = await apiClient.put(`/second-party-data/update/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update second party data', 'put');
    }
  },

  /**
   * جلب بيانات الطرف الثاني (المتتبع)
   * GET /second-party-data/show/:id
   */
  async getSecondPartyData(id) {
    try {
      const response = await apiClient.get(`/second-party-data/show/${id}`);
      return response.data;
    } catch (error) {
      // Allow 404/400 to pass gracefully as "no data found"
      return handleServiceError(error, 'Fetch second party data', 'get', null);
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
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await apiClient.get(`/contracts/units/show/${id}`);
      }
      const res = response.data;
      let units = [];
      if (Array.isArray(res)) {
        units = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        units = res.data;
      } else {
        units = res.data || [];
      }
      return Array.isArray(units) ? units : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch contract units', 'get', []);
    }
  },

  /**
   * إضافة وحدة واحدة
   * POST /contracts/units/store/:id
   */
  async addContractUnit(id, payload) {
    try {
      const response = await apiClient.post(`/contracts/units/store/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Add contract unit', 'post');
    }
  },

  /**
   * تحديث وحدة
   * PUT /contracts/units/update/:unitId
   */
  async updateContractUnit(unitId, payload) {
    try {
      const response = await apiClient.put(`/contracts/units/update/${unitId}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract unit', 'put');
    }
  },

  /**
   * رفع ملف CSV للوحدات
   * POST /contracts/units/upload-csv/:id
   */
  async uploadContractUnitsCsv(id, formData) {
    try {
      const response = await apiClient.post(`/contracts/units/upload-csv/${id}`, formData);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Upload units CSV', 'post');
    }
  },

  /**
   * جلب بيانات قسم التصوير
   * GET /photography-department/show/:id
   */
  async getPhotography(id) {
    try {
      // Assuming this endpoint exists based on standard REST patterns in this project
      const response = await apiClient.get(`/photography-department/show/${id}`);
      return response.data;
    } catch (error) {
      // Return null rather than throwing so we can handle empty state gracefully
      return handleServiceError(error, 'Fetch photography data', 'get', null);
    }
  },

  /**
   * حفظ بيانات قسم التصوير
   * POST /photography-department/store/:id
   */
  async storePhotography(id, payload) {
    try {
      const response = await apiClient.post(`/photography-department/store/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Store photography data', 'post');
    }
  },

  /**
   * تحديث بيانات قسم التصوير
   * PUT /photography-department/update/:id
   */
  async updatePhotography(id, payload) {
    try {
      const response = await apiClient.put(`/photography-department/update/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update photography data', 'put');
    }
  },

  /**
   * اعتماد صور المشروع
   * POST /photography-department/approve/:id
   * Payload: { status: 'approved' | 'rejected', rejection_reason: string (optional) }
   */
  async approvePhotography(id, payload = {}) {
    try {
      // User specified {{server}}/photography-department/approve/1
      // likely expects a POST or GET. POST is safer for actions.
      const response = await apiClient.post(`/photography-department/approve/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Approve photography', 'post');
    }
  },

  // --- Developer / Second Party Endpoints ---

  /**
   * جلب قائمة المطورين
   * GET /second-party-data/second-parties
   */
  async getDevelopers() {
    try {
      const response = await apiClient.get('/second-party-data/second-parties');
      // Normalize response
      const res = response.data;
      let devs = [];
      if (Array.isArray(res)) {
        devs = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        devs = res.data;
      } else {
        devs = res.data || [];
      }
      return Array.isArray(devs) ? devs : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch developers', 'get', []);
    }
  },

  /**
   * List developers (Accounting Module API) – paginated, with projects_count, projects, units_count, teams.
   * GET /developers?search=&per_page=15&page=1
   * Accessible by accounting, project_management, admin.
   * @param {Object} params - { search, per_page, page }
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  async getDevelopersList(params = {}) {
    try {
      const response = await apiClient.get('/developers', { params });
      const res = response.data;
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
      const meta = res?.meta ?? res?.data?.meta ?? {};
      return { data, meta };
    } catch (error) {
      return handleServiceError(error, 'Fetch developers list', 'get', { data: [], meta: {} });
    }
  },

  /**
   * Get developer details (Accounting Module API).
   * GET /developers/:developer_number
   * Single developer with projects, units_count, teams. Use developer_number from list.
   * @param {string|number} developerNumber - developer_number (or id) from list
   * @returns {Promise<Object|null>} data object or null on 404/error
   */
  async getDeveloperDetail(developerNumber) {
    try {
      const response = await apiClient.get(`/developers/${developerNumber}`);
      const res = response.data;
      return res?.data ?? res ?? null;
    } catch (error) {
      return handleServiceError(error, 'Fetch developer detail', 'get', null);
    }
  },

  /**
   * جلب بيانات قسم المونتاج (editor prefix)
   * GET /editor/montage-department/show/:id
   */
  async getMontage(id) {
    try {
      const response = await apiClient.get(`/editor/montage-department/show/${id}`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Fetch montage data', 'get', null);
    }
  },

  /**
   * حفظ بيانات قسم المونتاج (editor prefix)
   * POST /editor/montage-department/store/:id
   */
  async storeMontage(id, payload) {
    try {
      const response = await apiClient.post(`/editor/montage-department/store/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Store montage data', 'post');
    }
  },

  /**
   * تحديث بيانات قسم المونتاج (editor prefix, PUT)
   * PUT /editor/montage-department/update/:id
   */
  async updateMontage(id, payload) {
    try {
      const response = await apiClient.put(`/editor/montage-department/update/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update montage data', 'put');
    }
  },

  /**
   * جلب مشاريع مطور بواسطة البريد الإلكتروني
   * GET /second-party-data/contracts-by-email
   */
  async getDeveloperContractsByEmail(email) {
    try {
      const response = await apiClient.get('/second-party-data/contracts-by-email', {
        params: { email },
      });
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Fetch developer contracts by email', 'get', []);
    }
  },

  // --- Missing Endpoints ---

  /**
   * Delete contract
   * DELETE /contracts/:id
   * @param {number|string} id - Contract ID
   * @returns {Promise<Object>} Response
   */
  async deleteContract(id) {
    try {
      const response = await apiClient.delete(`/contracts/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Delete contract ${id}`, 'delete');
    }
  },

  /**
   * Delete unit
   * DELETE /contracts/units/delete
   * @param {number|string} unitId - Unit ID
   * @returns {Promise<Object>} Response
   */
  async deleteUnit(unitId) {
    try {
      const response = await apiClient.delete(`/contracts/units/delete/${unitId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Delete unit ${unitId}`, 'delete');
    }
  },

  /**
   * Get boards department data
   * GET /boards-department/show/:contract_id
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Boards department data
   */
  async getBoardsDepartment(contractId) {
    try {
      const response = await apiClient.get(`/boards-department/show/${contractId}`);
      // If response.data.data is explicitly null, return empty object
      if (response.data?.data === null) {
        return {};
      }
      // Otherwise use normal extraction logic
      const data = response.data?.data ?? response.data;
      // Return empty object if final data is null or undefined
      return data === null || data === undefined ? {} : data;
    } catch (error) {
      return handleServiceError(
        error,
        `Fetch boards department for contract ${contractId}`,
        'get',
        {}
      );
    }
  },

  /**
   * Create boards department data
   * POST /boards-department/store/:contract_id
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Boards department data
   * @returns {Promise<Object>} Created boards department data
   */
  async storeBoardsDepartment(contractId, data) {
    try {
      const response = await apiClient.post(`/boards-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Store boards department', 'post');
    }
  },

  /**
   * Alias for storeBoardsDepartment (api.php: POST boards-department/store/{contractId})
   * @deprecated Use storeBoardsDepartment(contractId, data)
   */
  async createBoardsDepartment(data) {
    const contractId = data?.contract_id ?? data?.contractId;
    if (contractId) return this.storeBoardsDepartment(contractId, data);
    return Promise.reject(new Error('contract_id or contractId required for boards department'));
  },

  /**
   * Update boards department data
   * PUT /boards-department/update/:id
   * @param {number|string} id - Boards department ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated boards department data
   */
  async updateBoardsDepartment(id, data) {
    try {
      const response = await apiClient.put(`/boards-department/update/${id}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update boards department ${id}`, 'put');
    }
  },

  /**
   * Approve photography department (using PATCH as per gap analysis)
   * PATCH /photography-department/approve/:id
   * @param {number|string} id - Photography department ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approved photography
   */
  async approvePhotographyDepartment(id, data = {}) {
    try {
      const response = await apiClient.patch(`/photography-department/approve/${id}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Approve photography department ${id}`, 'patch');
    }
  },
};

export default contractService;
