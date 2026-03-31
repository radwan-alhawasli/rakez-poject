import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';

export const contractServiceMiscMethods = {
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
   * DELETE {{base_url}}/contracts/units/delete/:unit_id
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
   * @param {any} data - Boards department data
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
    * @param {any} data
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
   * @param {any} data - Update data
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
   * @param {any} data - Approval data
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
