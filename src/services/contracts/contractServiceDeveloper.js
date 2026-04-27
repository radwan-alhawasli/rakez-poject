// @ts-check
import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';

export const contractServiceDeveloperMethods = {

  // --- Developer / Second Party Endpoints ---

  /**
   * جلب قائمة المطورين
   * GET /second-party-data/second-parties
   * @returns {Promise<any[]>}
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
   * @param {Record<string, any>} params - { search, per_page, page }
   * @returns {Promise<{ data: any[], meta: Record<string, any> }>}
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
   * @returns {Promise<Record<string, any>|null>} data object or null on 404/error
   */
  async getDeveloperDetail(id) {

    try {
      const param = String(id).trim();
      // إرسال الـ id كما هو (رقم أو نص)؛ إذا كان شبيه برقم هاتف يبدأ بـ + نزيل الـ + للتوافق مع الـ backend
      const pathParam =
        param.startsWith('+') && /^\+?\d+$/.test(param) ? param.slice(1) : param;
      const response = await apiClient.get(`/developers/${pathParam}`);
      const res = response.data;
      return res?.data ?? res ?? null;
    } catch (error) {
      return handleServiceError(error, 'Fetch developer detail', 'get', null);
    }
  },

  /**
   * جلب بيانات قسم المونتاج (editor prefix)
   * GET /editor/montage-department/show/:id
   * @param {string|number} id
   * @returns {Promise<Record<string, any>>}
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * @param {string} email
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
};
