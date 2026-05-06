/**
 * Admin commissions rules API.
 *
 * NOTE:
 * Backend endpoints were not found in this frontend repo. Do not guess URLs.
 * Wire these methods to the real backend endpoints when available.
 */

export const COMMISSIONS_API_IMPLEMENTED = false;

/**
 * @param {string|number} projectId
 */
export async function getCommissionRules(projectId) {
  void projectId;
  // TODO(api): implement get commission rules endpoint
  return null;
}

/**
 * @param {string|number} projectId
 */
export async function getCommissionSummary(projectId) {
  void projectId;
  // TODO(api): implement commission/budget summary endpoint
  return null;
}

/**
 * @param {string|number} projectId
 * @param {any} payload
 */
export async function saveCommissionRules(projectId, payload) {
  void projectId;
  void payload;
  // TODO(api): implement save commission rules endpoint
  throw new Error('COMMISSIONS_API_NOT_IMPLEMENTED');
}

