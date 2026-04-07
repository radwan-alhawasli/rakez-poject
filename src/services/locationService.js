import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/** حدّ الخادم: لا يقبل per_page أكبر من 100 */
const LOCATIONS_PER_PAGE = 100;

/**
 * GET /cities — قائمة المدن (مع دعم التصفح عند الحاجة)
 * @param {Record<string, unknown>} params
 * @returns {Promise<Array<{ id: number, name: string, code?: string }>>}
 */
export async function getCities(params = {}) {
  try {
    const response = await apiClient.get('/cities', {
      params: { ...params, per_page: LOCATIONS_PER_PAGE, page: 1 },
    });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : [];
    const meta = response.data?.meta?.pagination ?? response.data?.meta;
    const totalPages = meta?.total_pages ?? 1;
    if (totalPages <= 1 || list.length === 0) return list;

    const all = [...list];
    for (let page = 2; page <= totalPages && page <= 50; page += 1) {
      const r = await apiClient.get('/cities', {
        params: { ...params, per_page: LOCATIONS_PER_PAGE, page },
      });
      const { items: nextItems } = extractPaginatedData(r, []);
      if (!Array.isArray(nextItems) || nextItems.length === 0) break;
      all.push(...nextItems);
    }
    return all;
  } catch (error) {
    return handleServiceError(error, 'Fetch cities', 'get', []);
  }
}

/**
 * GET /districts — قائمة الأحياء (يُصفّى حسب المدينة في الواجهة عبر city_id)
 * @param {Record<string, unknown>} params
 * @returns {Promise<Array<{ id: number, city_id: number, name: string, city?: object }>>}
 */
export async function getDistricts(params = {}) {
  try {
    const response = await apiClient.get('/districts', {
      params: { ...params, per_page: LOCATIONS_PER_PAGE, page: 1 },
    });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : [];
    const meta = response.data?.meta?.pagination ?? response.data?.meta;
    const totalPages = meta?.total_pages ?? 1;
    if (totalPages <= 1 || list.length === 0) return list;

    const all = [...list];
    for (let page = 2; page <= totalPages && page <= 50; page += 1) {
      const r = await apiClient.get('/districts', {
        params: { ...params, per_page: LOCATIONS_PER_PAGE, page },
      });
      const { items: nextItems } = extractPaginatedData(r, []);
      if (!Array.isArray(nextItems) || nextItems.length === 0) break;
      all.push(...nextItems);
    }
    return all;
  } catch (error) {
    return handleServiceError(error, 'Fetch districts', 'get', []);
  }
}

const locationService = {
  getCities,
  getDistricts,
};

export default locationService;
