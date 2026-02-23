import apiClient from '../api/apiClient';
import { handleServiceError } from '../utils/serviceErrorHandler';

/**
 * Boards Department Service
 * Manages boards/display department data for contracts
 * POSTMAN: /boards-department/*
 */
const boardsDepartmentService = {
  /**
   * Get boards department data for contract
   * GET /boards-department/show/:contract_id
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>}
   */
  async getByContractId(contractId) {
    try {
      const response = await apiClient.get(`/boards-department/show/${contractId}`);
      const data = response.data?.data ?? response.data;
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
   * @returns {Promise<Object>}
   */
  async store(contractId, data) {
    try {
      const response = await apiClient.post(`/boards-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Store boards department', 'post');
    }
  },

  /**
   * Update boards department data
   * PUT /boards-department/update/:contract_id
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async update(contractId, data) {
    try {
      const response = await apiClient.put(`/boards-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update boards department ${contractId}`, 'put');
    }
  },
};

export default boardsDepartmentService;
