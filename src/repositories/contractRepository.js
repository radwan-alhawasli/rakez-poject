/**
 * Contract Repository
 * Data access layer for contracts
 */

import apiClient from '../api/apiClient';
import logger from '../utils/logger';

class ContractRepository {
  /**
   * Get all contracts
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Contracts
   */
  async findAll(filters = {}) {
    try {
      const response = await apiClient.get('/contracts/index', { params: filters });
      const data = response.data;

      // Normalize response structure
      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        return data.data.data;
      }

      return data?.data || [];
    } catch (error) {
      logger.error('ContractRepository.findAll error:', error);
      throw error;
    }
  }

  /**
   * Get contract by ID
   * @param {number} id - Contract ID
   * @returns {Promise<Object>} Contract
   */
  async findById(id) {
    try {
      const response = await apiClient.get(`/contracts/show/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('ContractRepository.findById error:', error);
      throw error;
    }
  }

  /**
   * Create contract
   * @param {Object} data - Contract data
   * @returns {Promise<Object>} Created contract
   */
  async create(data) {
    try {
      const response = await apiClient.post('/contracts/store', data);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('ContractRepository.create error:', error);
      throw error;
    }
  }

  /**
   * Update contract
   * @param {number} id - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated contract
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`/contracts/update/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('ContractRepository.update error:', error);
      throw error;
    }
  }

  /**
   * Update contract status
   * @param {number} id - Contract ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated contract
   */
  async updateStatus(id, status) {
    try {
      const response = await apiClient.patch(`/contracts/update-status/${id}`, { status });
      return response.data?.data || response.data;
    } catch (error) {
      logger.error('ContractRepository.updateStatus error:', error);
      throw error;
    }
  }

  /**
   * Get contract units
   * @param {number} id - Contract ID
   * @returns {Promise<Array>} Units
   */
  async getUnits(id) {
    try {
      const response = await apiClient.get(`/contracts/units/show/${id}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }

      return data?.data || [];
    } catch (error) {
      logger.error('ContractRepository.getUnits error:', error);
      throw error;
    }
  }
}

export default new ContractRepository();
