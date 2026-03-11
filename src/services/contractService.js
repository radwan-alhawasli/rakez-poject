import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/** Normalize a contract from GET /contracts/index or /contracts/show to the same details shape we use everywhere. */
function normalizeContractItem(p) {
  if (!p || typeof p !== 'object') return p;
  return {
    ...p,
    id: p.id ?? p.contract_id,
    contract_id: p.contract_id ?? p.id,
    name: p.project_name ?? p.name ?? (p.id != null ? `مشروع #${p.id}` : ''),
    project_name: p.project_name ?? p.name,
    notes: p.notes ?? null,
    project_progress: p.project_progress ?? null,
    image: p.project_image_url ?? p.image ?? null,
    project_image_url: p.project_image_url ?? p.image,
  };
}

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
   * تحديث حالة العقد (قبول/رفض) — يحفظ في API
   * PATCH /admin/contracts/adminUpdateStatus/:id
   * Payload: { status: 'approved' | 'rejected' }
   */
  async updateContractStatus(contractId, status) {
    return this.updateContractStatusAdmin(contractId, status);
  },

  /**
   * أرشفة عقد
   * PATCH /contracts/:id/archive
   */
  async archiveContract(contractId) {
    try {
      const response = await apiClient.patch(`/contracts/${contractId}/archive`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Archive contract', 'patch');
    }
  },

  /**
   * تحديد عقد كمكتمل
   * PATCH /contracts/:id/complete
   */
  async markContractComplete(contractId) {
    try {
      const response = await apiClient.patch(`/contracts/${contractId}/complete`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Mark contract complete', 'patch');
    }
  },

  async approveContract(contractId, notes = '') {
    return this.updateContractStatusAdmin(contractId, 'approved', notes);
  },

  async rejectContract(contractId, notes = '') {
    return this.updateContractStatusAdmin(contractId, 'rejected', notes);
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
   * تحديث حالة العقد (للمسؤول) — مطابق لـ API: PATCH /admin/contracts/adminUpdateStatus/:id
   * Body: { status: 'approved' | 'rejected', notes?: string }
   */
  async updateContractStatusAdmin(contractId, status, notes = '') {
    try {
      const id = contractId != null ? String(contractId).trim() : '';
      if (!id) {
        const err = new Error('معرف العقد مطلوب');
        err.response = { status: 400, data: { message: 'معرف العقد مطلوب' } };
        throw err;
      }
      const body = { status };
      const notesStr = notes != null ? String(notes).trim() : '';
      if (notesStr) body.notes = notesStr;
      const response = await apiClient.patch(`/admin/contracts/adminUpdateStatus/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract status (Admin)', 'patch');
    }
  },

  // --- Marketer / User Endpoints ---

  /**
   * جلب قائمة العقود بنفس تفاصيل GET /contracts/show (notes, project_progress, project_name, ...)
   * GET /contracts/index — يدعم التصفح بالصفحات (page, per_page)
   * @param {Object} filters - Optional: page (1-based), per_page (default 15), status, etc.
   * @returns {Promise<{ items: Array, total: number }>} items normalized, total from API
   */
  async getContracts(filters = {}) {
    try {
      const params = {
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 15,
        ...filters,
      };
      const response = await apiClient.get('/contracts/index', { params });
      const { items, total } = extractPaginatedData(response, []);
      const list = Array.isArray(items) ? items : [];
      return {
        items: list.map(p => normalizeContractItem(p)),
        total: typeof total === 'number' ? total : parseInt(total, 10) || list.length,
      };
    } catch (error) {
      const status = error?.response?.status || error?.status;
      if (status === 401) throw error;
      logger.error('Fetch contracts:', error);
      return { items: [], total: 0 };
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
    try {
      const response = await apiClient.get(`/contracts/show/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return handleServiceError(error, 'Fetch contract by id', 'get', null);
    }
  },

  /**
   * إنشاء عقد / مشروع حصري
   * Endpoint: POST {{base_url}}/contracts/store (apiClient baseURL from appConfig)
   * Payload: project_name, developer_name, developer_number, city, district,
   *          developer_requiment?, project_image_url?, note?, units[], commission_percentage?, commission_from?
   */
  async createContract(payload) {
    try {
      logger.debug('Creating contract (POST /contracts/store):', payload);
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
   * Payload (مثال): address, total_area, building_count, latitude, longitude — أو بيانات الطرف الثاني كاملة
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
   * إضافة وحدة يدوياً
   * POST {{base_url}}/contracts/units/store/:contract_id
   * Body: { unit_type, unit_number, price, area, description?, status? }
   */
  async addContractUnit(contractId, payload) {
    try {
      const body = {
        unit_type: payload.unit_type ?? '',
        unit_number: payload.unit_number ?? '',
        price: Number(payload.price) || 0,
        area: payload.area != null ? Number(payload.area) : undefined,
        description: payload.description != null ? String(payload.description) : undefined,
        status: payload.status ?? 'available',
      };
      const response = await apiClient.post(`/contracts/units/store/${contractId}`, body);
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
   * GET /photography-department/show/:contract_id
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
   * POST {{base_url}}/photography-department/store/:contract_id
   * Body: { image_url, video_url, description }
   */
  async storePhotography(id, payload) {
    try {
      const body = {
        image_url: payload?.image_url != null ? String(payload.image_url) : '',
        video_url: payload?.video_url != null ? String(payload.video_url) : '',
        description: payload?.description != null ? String(payload.description) : '',
      };
      const response = await apiClient.post(`/photography-department/store/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Store photography data', 'post');
    }
  },

  /**
   * تحديث بيانات قسم التصوير
   * PUT {{base_url}}/photography-department/update/:contract_id
   * Body: { image_url, video_url, description }
   */
  async updatePhotography(id, payload) {
    try {
      const body = {
        image_url: payload?.image_url != null ? String(payload.image_url) : '',
        video_url: payload?.video_url != null ? String(payload.video_url) : '',
        description: payload?.description != null ? String(payload.description) : '',
      };
      const response = await apiClient.put(`/photography-department/update/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update photography data', 'put');
    }
  },

  /**
   * اعتماد صور المشروع (للمدير is_manager)
   * PATCH {{base_url}}/photography-department/approve/:contract_id
   * Payload: { status: 'approved' | 'rejected', rejection_reason?: string }
   */
  async approvePhotography(id, payload = {}) {
    try {
      const response = await apiClient.patch(`/photography-department/approve/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Approve photography', 'patch');
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
   * List developers (Accounting Module API) – نفس المصدر المستخدم في "عرض المطورين" بقسم المحاسبة.
   * GET /developers?search=&per_page=15&page=1
   * Accessible by accounting, project_management, admin.
   * @param {Object} params - { search, per_page, page }
   * @returns {Promise<{ data: Array, meta: Object }>}
   */
  async getDevelopersList(params = {}) {
    try {
      const response = await apiClient.get('/developers', { params });
      const res = response.data;
      let data =
        (Array.isArray(res?.data) && res.data) ||
        (Array.isArray(res?.data?.data) && res.data.data) ||
        (Array.isArray(res?.developers) && res.developers) ||
        (Array.isArray(res?.items) && res.items) ||
        (Array.isArray(res?.results) && res.results) ||
        [];
      const meta = res?.meta ?? res?.data?.meta ?? {};
      return { data, meta };
    } catch (error) {
      return handleServiceError(error, 'Fetch developers list', 'get', { data: [], meta: {} });
    }
  },

  /**
   * Get developer details (Accounting Module API).
   * GET /developers/:id — يُستدعى بالـ id الرقمي (يُرجع من قائمة المطورين).
   * @param {string|number} id - numeric id or developer identifier from list
   * @returns {Promise<Object|null>} data object or null on 404/error
   */
  async getDeveloperDetail(id) {
    try {
      const param = String(id).trim();
      // إرسال الـ id كما هو (رقم أو نص)؛ إذا كان شبيه برقم هاتف يبدأ بـ + نزيل الـ + للتوافق مع الـ backend
      const pathParam =
        param.startsWith('+') && /^\+?\d+$/.test(param) ? param.slice(1) : param;
      const encoded = encodeURIComponent(pathParam);
      const response = await apiClient.get(`/developers/${encoded}`);
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
