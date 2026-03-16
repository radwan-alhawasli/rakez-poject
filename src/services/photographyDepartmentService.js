import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';

/**
 * Photography Department Service
 * Manages photography department data for contracts
 * POSTMAN: /photography-department/*
 */
const photographyDepartmentService = {
  /**
   * Get photography department data for contract
   * GET /photography-department/show/:contract_id
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>}
   */
  async getByContractId(contractId) {
    try {
      const response = await apiClient.get(`/photography-department/show/${contractId}`);
      const data = response.data?.data ?? response.data;
      return data === null || data === undefined ? {} : data;
    } catch (error) {
      return handleServiceError(error, `Fetch photography for contract ${contractId}`, 'get', {});
    }
  },

  /**
   * Create photography department data
   * POST /photography-department/store/:contract_id
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Photography department data
   * @returns {Promise<Object>}
   */
  async store(contractId, data) {
    try {
      const response = await apiClient.post(`/photography-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Store photography department', 'post');
    }
  },

  /**
   * Update photography department data
   * PUT /photography-department/update/:contract_id
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async update(contractId, data) {
    try {
      const response = await apiClient.put(`/photography-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update photography department ${contractId}`, 'put');
    }
  },

  /**
   * Approve photography for contract (manager acceptance)
   * PATCH /photography-department/approve/:contract_id
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Approval data (status: 'approved' | 'rejected', rejection_reason?)
   * @returns {Promise<Object>}
   */
  async approve(contractId, data = {}) {
    try {
      const response = await apiClient.patch(`/photography-department/approve/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Approve photography for contract ${contractId}`, 'patch');
    }
  },
};

export default photographyDepartmentService;
