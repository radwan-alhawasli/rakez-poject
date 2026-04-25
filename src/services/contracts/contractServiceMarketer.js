// @ts-check
import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import {
  normalizeContractItem,
  normalizeContractWritePayload,
  unwrapContractShowPayload,
  mergeNestedProjectIntoRoot,
  normalizeContractShowResponse,
} from '@/services/contract/contractNormalize.js';
import { getCaughtStatus, toThrowable } from '@/utils/caughtError';
import {
  extractSecondPartyShowRow,
  hasSecondPartyTrackerRecord,
} from '@/utils/projectProgressSteps';


export const contractServiceMarketerMethods = {
  // --- Marketer / User Endpoints ---

  /**
   * جلب قائمة العقود بنفس تفاصيل GET /contracts/show (notes, project_progress, project_name, ...)
   * GET /contracts/index — يدعم التصفح بالصفحات (page, per_page)
   * @param {Record<string, any>} filters - Optional: page (1-based), per_page (default 15), status, user_id (تصفية طلبات مستخدم — طلباتي للموظفين), إلخ.
   * @returns {Promise<{ items: any[], total: number }>} items normalized, total from API
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
      const status = getCaughtStatus(error);
      if (status === 401) throw toThrowable(error);
      logger.error('Fetch contracts:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * جلب المشاريع للمحرر
   * GET /editor/contracts/index
   * @returns {Promise<any[]>}
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
   * @param {string|number} id
   * @returns {Promise<Record<string, any>>}
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
   * جلب تفاصيل عقد — المصدر الموحد لجميع بيانات العقد (مستكمل أو غير مستكمل).
   * GET /contracts/show/:id — يُستدعى من: تعديل العقد (EditExclusiveProjectModal)، تعديل بيانات استكمال العقد (EditContractInfoModal)، استكمال العقد (ContractFormView)، وعرض التفاصيل.
   * الاستجابة: { success, message, data: { id, project_name, units, commission_percent, commission_from, second_party_data, ... } }
   * @param {string|number} id
   * @returns {Promise<Record<string, any>|null>}
   */
  async getContractById(id) {

    try {
      const response = await apiClient.get(`/contracts/show/${id}`);
      let raw = response.data?.data ?? response.data;
      if (raw != null && typeof raw === 'object') {
        raw = unwrapContractShowPayload(raw) ?? raw;
        raw = mergeNestedProjectIntoRoot(raw);
      }
      return raw ? normalizeContractShowResponse(raw) : null;
    } catch (error) {
      return handleServiceError(error, 'Fetch contract by id', 'get', null);
    }
  },

  /**
   * إنشاء عقد / مشروع حصري
   * Endpoint: POST {{base_url}}/contracts/store (apiClient baseURL from appConfig)
   * Payload: project_name, developer_name, developer_number, city, city_id, district, district_id,
   *          developer_requiment?, project_image_url?, note?, units[{type,count,price}],
   *          commission_percent (أو commission_percentage — يُطبَّع تلقائياً), commission_from?,
   *          is_exclusive?, type? (مثلاً Exclusive لمشروع حصري)
   *
   * ملاحظة: لكي تظهر صورة المشروع في بطاقات إدارة المشاريع، يجب أن يرجع الـ API عند جلب
   * القائمة (GET /contracts/index) أو التفاصيل (GET /contracts/show/:id) حقل project_image_url
   * (أو image) في كل عقد.
   * @param {Record<string, any>} payload
   */
  async createContract(payload) {

    try {
      const body = normalizeContractWritePayload(payload);
      logger.debug('Creating contract (POST /contracts/store):', body);
      const response = await apiClient.post('/contracts/store', body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Create contract', 'post');
    }
  },

  /**
   * تحديث أولي للعقد (إذا لزم الأمر)
   * PUT /contracts/update/:id
   * @param {string|number} id
   * @param {Record<string, any>} payload
   */
  async updateContract(id, payload) {

    try {
      const body = normalizeContractWritePayload(payload);
      const response = await apiClient.put(`/contracts/update/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract', 'put');
    }
  },

  /**
   * استكمال بيانات العقد (الطرف الثاني، التواريخ..)
   * POST /contracts/store/info/:id
   * Payload (مثال): address, total_area, building_count, latitude, longitude — أو بيانات الطرف الثاني كاملة
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
   */
  async completeContractInfo(id, payload) {

    return this.storeContractInfo(id, payload);
  },

  /**
   * تحديث بيانات استكمال العقد (نفس حقول الاستكمال)
   * PUT /contracts/update/info/:id
   * @param {string|number} id
   * @param {Record<string, any>} payload
   */
  async updateContractInfo(id, payload) {

    try {
      const body =
        payload && typeof payload === 'object' ? normalizeContractWritePayload({ ...payload }) : payload;
      logger.debug(`Updating contract info for ${id}:`, body);
      const response = await apiClient.put(`/contracts/update/info/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract info', 'put');
    }
  },

  /**
   * حفظ بيانات الطرف الثاني (المتتبع)
   * POST /second-party-data/store/:id
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * متتبع الطرف الثاني: إن وُجد سجل (show) يُستخدم PUT /second-party-data/update/:id، وإلا POST .../store/:id
   * @param {string|number} contractId - معرف العقد كما في المثال store/2 و update/1
   * @param {Record<string, unknown>} payload - عادةً الست حقول من buildSecondPartyTrackerPayload
   */
  async saveSecondPartyTracker(contractId, payload) {
    const snap = await this.getSecondPartyData(contractId);
    const row = extractSecondPartyShowRow(snap);
    if (hasSecondPartyTrackerRecord(row)) {
      return this.updateSecondPartyData(contractId, payload);
    }
    return this.storeSecondPartyData(contractId, payload);
  },

  /**
   * جلب بيانات الطرف الثاني (المتتبع)
   * GET /second-party-data/show/:id
   * @param {string|number} id
   * @returns {Promise<Record<string, any>>}
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
};
