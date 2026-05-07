import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Simple Commission MVP — Admin/Accounting APIs.
 * Based on docs:
 * - SIMPLE_COMMISSION_MVP_API.md
 * - SIMPLE_COMMISSION_MVP_FULL_AUDIT_AND_API_AR.md
 *
 * All calls use `apiClient` baseURL (already includes `/api`).
 */

/**
 * List project commission settings (paginated).
 * GET /accounting/project-commission-settings?project_id=&per_page=&page=
 * @param {{ project_id?: string|number, per_page?: number, page?: number }} params
 * @returns {Promise<{ items: any[], total: number, meta: any }>}
 */
export async function listProjectCommissionSettings(params = {}) {
  try {
    const r = await apiClient.get('/accounting/project-commission-settings', { params });
    const { items, total } = extractPaginatedData(r, []);
    const body = r?.data ?? r;
    const meta = body?.meta ?? body?.data?.meta ?? body?.pagination ?? {};
    return { items: Array.isArray(items) ? items : [], total: total ?? 0, meta };
  } catch (e) {
    return (
      handleServiceError(e, 'List project commission settings', 'get') || {
        items: [],
        total: 0,
        meta: {},
      }
    );
  }
}

/**
 * Create project commission setting.
 * POST /accounting/project-commission-settings
 * @param {Record<string, any>} payload
 */
export async function createProjectCommissionSetting(payload) {
  const r = await apiClient.post('/accounting/project-commission-settings', payload);
  return r?.data?.data ?? r?.data ?? r;
}

/**
 * Get project commission setting details.
 * GET /accounting/project-commission-settings/{id}
 * @param {string|number} id
 */
export async function getProjectCommissionSetting(id) {
  const r = await apiClient.get(`/accounting/project-commission-settings/${id}`);
  return r?.data?.data ?? r?.data ?? r;
}

/**
 * Update project commission setting.
 * PUT /accounting/project-commission-settings/{id}
 * @param {string|number} id
 * @param {Record<string, any>} payload
 */
export async function updateProjectCommissionSetting(id, payload) {
  const r = await apiClient.put(`/accounting/project-commission-settings/${id}`, payload);
  return r?.data?.data ?? r?.data ?? r;
}

/**
 * Activate a setting (deactivates siblings for same project).
 * POST /accounting/project-commission-settings/{id}/activate
 * @param {string|number} id
 */
export async function activateProjectCommissionSetting(id) {
  const r = await apiClient.post(`/accounting/project-commission-settings/${id}/activate`);
  return r?.data?.data ?? r?.data ?? r;
}

/**
 * Preview project commission for a base amount (read-only).
 * POST /accounting/projects/{project}/preview-commission
 * @param {string|number} projectId
 * @param {{ base_amount: number }} body
 */
export async function previewProjectCommission(projectId, body) {
  const r = await apiClient.post(`/accounting/projects/${projectId}/preview-commission`, body);
  return r?.data?.data ?? r?.data ?? r;
}

