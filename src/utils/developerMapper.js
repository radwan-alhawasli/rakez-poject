/**
 * Shared normalizer for developer/second-party data.
 * List and detail UIs must use ONLY this shape so they stay consistent.
 *
 * @typedef {Object} NormalizedDeveloper
 * @property {number|string} id
 * @property {string} name
 * @property {string} [email]
 * @property {string} [representative]
 * @property {string} [commercialRecord]
 * @property {string} [phone]
 * @property {string} [location]
 * @property {number} [projectCount] - Optional; set when known (e.g. from list placeholder or detail)
 */

/**
 * Normalize a raw second-party/developer object from the API into a single display shape.
 * Supports both list response (second-parties) and show/detail response (second_party_* fields).
 *
 * @param {Object} d - Raw item from API (snake_case or mixed)
 * @param {Object} [options] - Optional: { projectCount: number }
 * @returns {NormalizedDeveloper}
 */
export function normalizeDeveloper(d, options = {}) {
  if (!d || typeof d !== 'object') {
    return {
      id: null,
      name: 'مطور غير معروف',
      email: '',
      representative: '-',
      commercialRecord: '-',
      phone: '-',
      location: '-',
      projectCount: options.projectCount ?? 0,
    };
  }

  const name = d.name ?? d.second_party_name ?? d.developer_name ?? 'مطور غير معروف';
  const representative =
    d.representative ?? d.second_party_signatory ?? d.signatory ?? d.name ?? '-';
  const commercialRecord =
    d.commercial_record ??
    d.second_party_cr_number ??
    (d.developer_number != null ? String(d.developer_number) : null) ??
    '-';
  const phone = d.phone ?? d.second_party_phone ?? '-';
  const location = d.city ?? d.location ?? d.second_party_address ?? d.address ?? '-';
  const email = d.email ?? d.second_party_email ?? '';

  const projectCount = options.projectCount ?? d.project_count ?? d.projects_count ?? 0;

  const normalized = {
    id: d.id ?? d.second_party_id ?? d.developer_number ?? null,
    name,
    email,
    representative,
    commercialRecord,
    phone,
    location,
    projectCount: Number(projectCount) || 0,
  };
  if (Array.isArray(d.projects)) {
    normalized.projects = d.projects;
  }
  if (d.units_count != null) normalized.unitsCount = d.units_count;
  if (d.teams != null) normalized.teams = d.teams;
  return normalized;
}

/**
 * Normalize an array of raw developers (e.g. from getDevelopers).
 *
 * @param {Array<Object>} list - Raw list from API
 * @param {Object} [options] - Optional: { projectCount: (d) => number } per item
 * @returns {NormalizedDeveloper[]}
 */
export function normalizeDeveloperList(list, options = {}) {
  if (!Array.isArray(list)) return [];
  return list.map((d, i) => {
    const projectCount =
      typeof options.projectCount === 'function'
        ? options.projectCount(d, i)
        : options.projectCount ?? 0;
    return normalizeDeveloper(d, { projectCount });
  });
}
