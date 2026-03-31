/**
 * Shared helpers for marketing API modules (split from marketingService).
 * @module services/marketing/marketingShared
 */

import { extractPaginatedData } from '@/utils/paginationUtils';
import { normalizeListResponse } from '@/utils/marketingNormalizers';

/**
 * @param {*} response
 * @param {*} [fallback]
 */
export function unwrap(response, fallback) {
  const v = response?.data?.data ?? response?.data;
  if (v !== undefined && v !== null) return v;
  if (arguments.length < 2) return {};
  return fallback;
}

/**
 * @param {any} response
 * @param {(item: any) => any} [itemNormalizer]
 */
export const normalizePaginated = (
  response,
  itemNormalizer = /** @type {(x: any) => any} */ (x => x)
) => {
  const { items, total } = extractPaginatedData(response, []);
  let list = Array.isArray(items) ? items : [];
  if (list.length === 0 && response?.data) {
    const d = response.data;
    if (Array.isArray(d.projects)) list = d.projects;
    else if (Array.isArray(d.data) && list.length === 0) list = d.data;
  }
  return {
    items: normalizeListResponse(list).map(itemNormalizer),
    total: Number(total) || list.length,
  };
};
