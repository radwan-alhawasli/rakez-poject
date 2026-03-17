/**
 * Inventory Department API (aligned with Rakez ERP API collection).
 * Base: /inventory/contracts/*
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

const inventoryService = {
  /**
   * Show contract
   * GET /inventory/contracts/show/:id
   * @param {number|string} id - Contract ID
   * @returns {Promise<Object>}
   */
  async getContract(id) {
    try {
      const response = await apiClient.get(`/inventory/contracts/show/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching inventory contract ${id}:`, error);
      throw error;
    }
  },

  /**
   * List contracts (admin index)
   * GET /inventory/contracts/admin-index
   * @param {Object} params - Query params
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getContractsAdminIndex(params = {}) {
    try {
      const response = await apiClient.get('/inventory/contracts/admin-index', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items: items ?? [], total: total ?? 0 };
    } catch (error) {
      logger.error('Error fetching inventory contracts:', error);
      return handleServiceError(error, 'Inventory contracts admin-index', 'get', {
        items: [],
        total: 0,
      });
    }
  },

  /**
   * Show contract unit
   * GET /inventory/contracts/units/show/:id
   * @param {number|string} id - Unit ID
   * @returns {Promise<Object>}
   */
  async getContractUnit(id) {
    try {
      const response = await apiClient.get(`/inventory/contracts/units/show/${id}`);
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error(`Error fetching inventory unit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get agency overview (dashboard stats)
   * GET /inventory/contracts/agency-overview
   * @param {Object} params - Query params (status, user_id, city, district)
   * @returns {Promise<Object>}
   */
  async getAgencyOverview(params = {}) {
    try {
      const response = await apiClient.get('/inventory/contracts/agency-overview', { params });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      logger.error('Error fetching inventory agency overview:', error);
      return handleServiceError(error, 'Inventory agency overview', 'get', {});
    }
  },

  /**
   * Get all locations
   * GET /inventory/contracts/locations
   * @param {Object} params - Query params
   * @returns {Promise<Array>}
   */
  async getContractsLocations(params = {}) {
    try {
      const response = await apiClient.get('/inventory/contracts/locations', { params });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('Error fetching inventory locations:', error);
      return handleServiceError(error, 'Inventory locations', 'get', []);
    }
  },
};

export default inventoryService;
