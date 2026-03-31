import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getCaughtStatus, toThrowable } from '@/utils/caughtError';

export const contractServiceAdminMethods = {
  // --- Admin Endpoints ---

  /**
   * جلب جميع العقود (للمسؤول)
   * GET /contracts/admin-index (aligned with API collection)
   * @param {any} params - page, per_page, status (pending|approved|rejected)
   * @returns {Promise<{ items: unknown[], total: number }>}
   */
  async getAllContracts(params = {}) {
    try {
      const response = await apiClient.get('/contracts/admin-index', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      const status = getCaughtStatus(error);
      if (status === 401) throw toThrowable(error);
      logger.error('Fetch admin contracts:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * List contracts for Project Management
   * GET /contracts/admin-index
   * @param {any} params - Query parameters
   * @returns {Promise<unknown[]>} List of contracts
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
      const status = getCaughtStatus(error);
      if (status === 401) throw toThrowable(error);
      logger.error('Fetch PM contracts:', error);
      return [];
    }
  },

  /**
   * تحديث حالة العقد (قبول/رفض) — يحفظ في API
   * PATCH /admin/contracts/adminUpdateStatus/:id
   * Payload: { status: 'approved' | 'rejected' }
    * @param {any} contractId
    * @param {any} status
   */
  async updateContractStatus(contractId, status) {
    return this.updateContractStatusAdmin(contractId, status);
  },

  /**
   * أرشفة عقد
   * PATCH /contracts/:id/archive
    * @param {any} contractId
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
    * @param {any} contractId
   */
  async markContractComplete(contractId) {
    try {
      const response = await apiClient.patch(`/contracts/${contractId}/complete`);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Mark contract complete', 'patch');
    }
  },

  /**
   * @param {any} contractId
   */
  async approveContract(contractId, notes = '') {
    return this.updateContractStatusAdmin(contractId, 'approved', notes);
  },

  /**
   * @param {any} contractId
   */
  async rejectContract(contractId, notes = '') {
    return this.updateContractStatusAdmin(contractId, 'rejected', notes);
  },

  /**
   * تحديث حالة العقد (لمدير المشاريع)
   * PATCH /contracts/update-status/:id
    * @param {any} contractId
    * @param {any} status
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
    * @param {any} contractId
    * @param {any} status
   */
  async updateContractStatusAdmin(contractId, status, notes = '') {
    try {
      const id = contractId != null ? String(contractId).trim() : '';
      if (!id) {
        const err = new Error('معرف العقد مطلوب');
        err.response = { status: 400, data: { message: 'معرف العقد مطلوب' } };
        throw err;
      }
      /** @type {{ status: any, notes?: string }} */
      const body = { status };
      const notesStr = notes != null ? String(notes).trim() : '';
      if (notesStr) body.notes = notesStr;
      const response = await apiClient.patch(`/admin/contracts/adminUpdateStatus/${id}`, body);
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Update contract status (Admin)', 'patch');
    }
  },
};
