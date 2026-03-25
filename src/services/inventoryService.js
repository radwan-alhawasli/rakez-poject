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
   * Contract + units (inventory map detail / pin popup)
   * GET /inventory/contracts/units/show/:contractId
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>}
   */
  async getContractUnitsShow(contractId) {
    try {
      const response = await apiClient.get(`/inventory/contracts/units/show/${contractId}`);
      const root = response.data;
      // Laravel: { data: [...] } | { data: { contract_units, units } } | أحياناً طبقة data إضافية
      let body = root?.data ?? root ?? {};
      if (body && typeof body === 'object' && !Array.isArray(body) && body.data != null) {
        const inner = body.data;
        if (
          Array.isArray(inner) ||
          (typeof inner === 'object' &&
            (Array.isArray(inner.contract_units) ||
              Array.isArray(inner.units) ||
              inner.contract != null))
        ) {
          body = inner;
        }
      }
      return body ?? {};
    } catch (error) {
      logger.error(`Error fetching inventory contract units ${contractId}:`, error);
      throw error;
    }
  },

  /**
   * @deprecated Use getContractUnitsShow(contractId) — same endpoint (contract id).
   */
  async getContractUnit(contractId) {
    return this.getContractUnitsShow(contractId);
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
   * Map pins — project locations
   * GET /inventory/contracts/locations?status=&user_id=&city=&district=&project_name=&has_photography=&has_montage=&per_page=
   * @param {Object} params - Query params
   * @returns {Promise<Array>}
   */
  async getContractsLocations(params = {}) {
    try {
      const response = await apiClient.get('/inventory/contracts/locations', { params });
      let { items } = extractPaginatedData(response, []);
      if (!Array.isArray(items) || items.length === 0) {
        const body = response.data?.data ?? response.data;
        if (Array.isArray(body)) {
          items = body;
        } else if (body && typeof body === 'object') {
          if (Array.isArray(body.locations)) items = body.locations;
          else if (Array.isArray(body.items)) items = body.items;
          else if (Array.isArray(body.data)) items = body.data;
        }
      }
      return Array.isArray(items) ? items : [];
    } catch (error) {
      logger.error('Error fetching inventory locations:', error);
      return handleServiceError(error, 'Inventory locations', 'get', []);
    }
  },
};

export default inventoryService;
