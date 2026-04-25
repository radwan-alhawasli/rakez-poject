// @ts-check
import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';

export const contractServiceUnitsMethods = {

  // --- Units Endpoints ---

  /**
   * جلب وحدات العقد
   * GET /contracts/units/show/:id
   * @param {string|number} id
   * @param {File|null} [csvFile]
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
   * @param {string|number} contractId
   * @param {Record<string, any>} payload
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
   * PUT {{base_url}}/contracts/units/update/:unit_id
   * @param {string|number} unitId
   * @param {Record<string, any>} payload
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
   * POST {{base_url}}/contracts/units/upload-csv/:contract_id
   * Body: multipart/form-data with field "csv_file" (the CSV file). Do not set Content-Type so axios sends boundary.
   * @param {string|number} id
   * @param {FormData} formData
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
   * @param {string|number} id
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * @param {string|number} id
   * @param {Record<string, any>} payload
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
   * Body (API): { approved: "1" | "0", comment?: string } — يدعم أيضاً الشكل القديم status / rejection_reason.
   * @param {string|number} id
   * @param {Record<string, any>} [payload]
   */
  async approvePhotography(id, payload = {}) {

    try {
      /** @type {Record<string, string>} */
      let body = {};
      if (payload.approved !== undefined && payload.approved !== null) {
        body.approved = String(payload.approved);
        if (payload.comment != null && String(payload.comment).trim() !== '') {
          body.comment = String(payload.comment).trim();
        }
        if (payload.rejection_comment != null && String(payload.rejection_comment).trim() !== '') {
          body.rejection_comment = String(payload.rejection_comment).trim();
        }
      } else if (payload.status === 'approved') {
        body = { approved: '1' };
      } else if (payload.status === 'rejected') {
        const c = String(payload.rejection_reason ?? payload.comment ?? '').trim();
        body = { approved: '0', comment: c };
      } else {
        body =
          typeof payload === 'object' && payload !== null
            ? { ...payload }
            : {};
        if (body.approved != null) body.approved = String(body.approved);
      }
      const response = await apiClient.patch(`/photography-department/approve/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Approve photography', 'patch');
    }
  },
};
