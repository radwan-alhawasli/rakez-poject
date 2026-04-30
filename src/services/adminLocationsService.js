import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Normalize list responses from GET /admin/cities and GET /admin/districts.
 * @param {import('axios').AxiosResponse} response
 * @returns {unknown[]}
 */
function listFromResponse(response) {
  const { items } = extractPaginatedData(response, []);
  if (Array.isArray(items) && items.length) return items;
  const raw = response?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
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

export async function listAdminCities() {
  try {
    const r = await apiClient.get('/admin/cities');
    return listFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'List admin cities', 'get', []);
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

export async function listAdminDistricts() {
  try {
    const r = await apiClient.get('/admin/districts');
    return listFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'List admin districts', 'get', []);
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

// ——— Order Marketing Developers: GET /admin/order-marketing-developers, GET /admin/order-marketing-developers/:id ———

export async function listAdminOrderMarketingDevelopers() {
  try {
    const r = await apiClient.get('/admin/order-marketing-developers');
    return listFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'List admin order marketing developers', 'get', []);
  }
}

/**
 * @param {string|number} id
 */
export async function getAdminOrderMarketingDeveloper(id) {
  try {
    const r = await apiClient.get(`/admin/order-marketing-developers/${id}`);
    return oneFromResponse(r);
  } catch (error) {
    return handleServiceError(error, 'Get admin order marketing developer', 'get', null);
  }
}

/**
 * Update approval status for order marketing developer request.
 * Endpoint: /admin/order-marketing-developers/:id/status
 * Backend method/payload can vary, so we try common combinations.
 * @param {string|number} id
 * @param {boolean} isApproved
 */
export async function updateAdminOrderMarketingDeveloperStatus(id, isApproved) {
  const endpoint = `/admin/order-marketing-developers/${id}/status`;
  const payloads = [
    { status: isApproved ? 1 : 0 },
    { status: isApproved ? 'approved' : 'pending' },
    { approved: isApproved },
    { is_approved: isApproved ? 1 : 0 },
  ];
  const methods = ['patch', 'put', 'post'];

  for (const method of methods) {
    for (const payload of payloads) {
      try {
        const response = await apiClient[method](endpoint, payload);
        return response?.data?.data ?? response?.data ?? {};
      } catch (_error) {
        // try next combination
      }
    }
  }

  return handleServiceError(
    new Error('Unable to update order marketing developer status'),
    'Update admin order marketing developer status',
    'patch',
    null
  );
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
  listAdminOrderMarketingDevelopers,
  getAdminOrderMarketingDeveloper,
  updateAdminOrderMarketingDeveloperStatus,
};

export default adminLocationsService;
