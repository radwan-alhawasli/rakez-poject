import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Remove empty/undefined query params so we don't send noise to the backend.
 * @param {Record<string, unknown>} params
 */
function cleanQueryParams(params = {}) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Normalize single-resource responses.
 * @param {import('axios').AxiosResponse} response
 * @returns {unknown}
 */
function oneFromResponse(response) {
  const raw = response?.data;
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data != null) return raw.data;
  return raw;
}

// ——— Cities: POST/GET /admin/cities, GET/PUT/DELETE /admin/cities/:id ———

/**
 * @param {Record<string, unknown>} [params]
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export async function listAdminCities(params = {}) {
  try {
    const r = await apiClient.get('/admin/cities', { params: cleanQueryParams(params) });
    return extractPaginatedData(r, []);
  } catch (error) {
    return handleServiceError(error, 'List admin cities', 'get', { items: [], total: 0 });
  }
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createAdminCity(payload) {
  try {
    const r = await apiClient.post('/admin/cities', payload);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Create city', 'post', null);
  }
}

/**
 * @param {string|number} cityId
 */
export async function getAdminCity(cityId) {
  try {
    const r = await apiClient.get(`/admin/cities/${cityId}`);
    return oneFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'Get city', 'get', null);
  }
}

/**
 * @param {string|number} cityId
 * @param {Record<string, unknown>} payload
 */
export async function updateAdminCity(cityId, payload) {
  try {
    const r = await apiClient.put(`/admin/cities/${cityId}`, payload);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Update city', 'put', null);
  }
}

/**
 * @param {string|number} cityId
 */
export async function deleteAdminCity(cityId) {
  try {
    const r = await apiClient.delete(`/admin/cities/${cityId}`);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Delete city', 'delete', null);
  }
}

// ——— Districts: POST/GET /admin/districts, GET/PATCH/DELETE /admin/districts/:id ———

/**
 * @param {Record<string, unknown>} [params]
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export async function listAdminDistricts(params = {}) {
  try {
    const r = await apiClient.get('/admin/districts', { params: cleanQueryParams(params) });
    return extractPaginatedData(r, []);
  } catch (error) {
    return handleServiceError(error, 'List admin districts', 'get', { items: [], total: 0 });
  }
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createAdminDistrict(payload) {
  try {
    const r = await apiClient.post('/admin/districts', payload);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Create district', 'post', null);
  }
}

/**
 * @param {string|number} districtId
 */
export async function getAdminDistrict(districtId) {
  try {
    const r = await apiClient.get(`/admin/districts/${districtId}`);
    return oneFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'Get district', 'get', null);
  }
}

/**
 * @param {string|number} districtId
 * @param {Record<string, unknown>} payload
 */
export async function updateAdminDistrict(districtId, payload) {
  try {
    const r = await apiClient.patch(`/admin/districts/${districtId}`, payload);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Update district', 'patch', null);
  }
}

/**
 * @param {string|number} districtId
 */
export async function deleteAdminDistrict(districtId) {
  try {
    const r = await apiClient.delete(`/admin/districts/${districtId}`);
    return r.data;
  } catch (error) {
    return handleServiceError(error, 'Delete district', 'delete', null);
  }
}

const adminLocationsService = {
  listAdminCities,
  createAdminCity,
  getAdminCity,
  updateAdminCity,
  deleteAdminCity,
  listAdminDistricts,
  createAdminDistrict,
  getAdminDistrict,
  updateAdminDistrict,
  deleteAdminDistrict,
};

export default adminLocationsService;
