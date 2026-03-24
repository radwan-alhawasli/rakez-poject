/**
 * Pagination utilities for normalizing API responses
 * Handles various pagination formats from backend
 */

/**
 * Extract paginated data and total count from API response
 * Supports common formats:
 * - { data: [...], meta: { total, current_page, per_page } }
 * - { data: [...], total: N }
 * - { items: [...], total: N }
 * - { data: { data: [...], total: N } }
 * - Plain array (fallback: total = length)
 *
 * @param {Object} response - Axios response (response.data) or raw API response object
 * @param {Array} fallbackItems - Fallback if no items found
 * @returns {{ items: Array, total: number }}
 */
export function extractPaginatedData(response, fallbackItems = []) {
  const data = response?.data ?? response;
  if (!data) return { items: fallbackItems, total: 0 };

  let items = [];
  let total = 0;

  // Format: { data: [...], meta: { total, current_page, per_page } } or meta.pagination (Credit sold-projects)
  if (Array.isArray(data.data)) {
    items = data.data;
    total =
      data.meta?.total ??
      data.meta?.pagination?.total ??
      data.meta?.total_count ??
      data.total ??
      items.length;
  }
  // Format: { items: [...], total: N }
  else if (Array.isArray(data.items)) {
    items = data.items;
    total = data.total ?? data.meta?.total ?? items.length;
  }
  // Format: { data: { data: [...], total: N } } (nested)
  else if (data.data && Array.isArray(data.data.data)) {
    items = data.data.data;
    total = data.data.total ?? data.data.meta?.total ?? items.length;
  }
  // Format: { employees: [...] } (legacy)
  else if (Array.isArray(data.employees)) {
    items = data.employees;
    total = data.meta?.total ?? data.total ?? items.length;
  }
  // Format: { projects: [...] } (marketing projects, etc.)
  else if (Array.isArray(data.projects)) {
    items = data.projects;
    total = data.meta?.total ?? data.total ?? items.length;
  }
  // Format: { locations: [...] } (inventory map)
  else if (Array.isArray(data.locations)) {
    items = data.locations;
    total = data.meta?.total ?? data.total ?? items.length;
  }
  // Format: plain array
  else if (Array.isArray(data)) {
    items = data;
    total = items.length;
  }
  // Format: { data: { ... } } where data might be object with nested array
  else if (data.data && typeof data.data === 'object') {
    const nested = data.data;
    if (Array.isArray(nested.data)) {
      items = nested.data;
      total = nested.total ?? nested.meta?.total ?? items.length;
    } else if (Array.isArray(nested.employees)) {
      items = nested.employees;
      total = nested.total ?? nested.meta?.total ?? items.length;
    } else if (Array.isArray(nested.locations)) {
      items = nested.locations;
      total = nested.total ?? nested.meta?.total ?? items.length;
    } else if (Array.isArray(nested.items)) {
      items = nested.items;
      total = nested.total ?? nested.meta?.total ?? items.length;
    }
  }

  return {
    items: Array.isArray(items) ? items : fallbackItems,
    total: typeof total === 'number' ? total : parseInt(total, 10) || 0,
  };
}

/**
 * Build pagination params for API requests
 * @param {number} page - Current page (1-based)
 * @param {number} perPage - Items per page
 * @param {Object} extra - Additional params to merge
 * @returns {Object}
 */
export function buildPaginationParams(page = 1, perPage = 25, extra = {}) {
  return {
    page,
    per_page: perPage,
    ...extra,
  };
}
