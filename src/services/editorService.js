import apiClient from '../api/apiClient';
import { handleServiceError } from '../utils/serviceErrorHandler';

/**
 * Editor Department Service
 * Manages contract editing and montage/video production tasks
 */
const editorService = {
  // --- Contracts ---

  /**
   * Get contracts for editing
   * GET /editor/contracts/index
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of contracts
   */
  async getContracts(params = {}) {
    try {
      const response = await apiClient.get('/editor/contracts/index', { params });
      const contracts = response.data?.data || response.data || [];
      return Array.isArray(contracts) ? contracts : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch editor contracts', 'get', []);
    }
  },

  /**
   * Get contract details for editing
   * GET /editor/contracts/show/:id
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Contract details
   */
  async getContractById(contractId) {
    const response = await apiClient.get(`/editor/contracts/show/${contractId}`);
    return response.data?.data || response.data || {};
  },

  // --- Montage Department ---

  /**
   * Get montage details for contract
   * GET /editor/montage-department/show/:contractId
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Montage details
   */
  async getMontage(contractId) {
    try {
      const response = await apiClient.get(`/editor/montage-department/show/${contractId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Fetch montage for contract ${contractId}`, 'get', {});
    }
  },

  /**
   * Create montage task
   * POST /editor/montage-department/store/:contractId
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Montage data (status, notes, etc.)
   * @returns {Promise<Object>} Created montage
   */
  async createMontage(contractId, data) {
    try {
      const response = await apiClient.post(`/editor/montage-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create montage', 'post');
    }
  },

  /**
   * Update montage status
   * PUT /editor/montage-department/update/:contractId
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data (status, file_url, etc.)
   * @returns {Promise<Object>} Updated montage
   */
  async updateMontage(contractId, data) {
    try {
      const response = await apiClient.put(`/editor/montage-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update montage ${contractId}`, 'put');
    }
  },
};

export default editorService;
