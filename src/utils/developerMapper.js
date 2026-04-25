/**
 * Shared normalizer for developer/second-party data.
 * List and detail UIs must use ONLY this shape so they stay consistent.
 *
 * @typedef {Object} NormalizedDeveloper
 * @property {number|string|null} id
 * @property {string} name
 * @property {string} [email]
 * @property {string} [representative]
 * @property {string} [commercialRecord]
 * @property {string} [phone]
 * @property {string} [location]
 * @property {string} [role]
 * @property {number} [projectCount] - Optional; set when known (e.g. from list placeholder or detail)
 */

/**
 * Normalize a raw second-party/developer object from the API into a single display shape.
 * Supports both list response (second-parties) and show/detail response (second_party_* fields).
 *
 * @param {any} d - Raw item from API (snake_case or mixed)
 * @param {any} [options] - Optional: { projectCount: number }
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
      role: '',
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

  const projectCount =
    options.projectCount ??
    d.contracts_count ??
    d.project_count ??
    d.projects_count ??
    0;

  /** @type {any} */
  const normalized = {
    id:
      d.id ??
      d.second_party_id ??
      (d.developer_number != null && String(d.developer_number).trim() !== ''
        ? String(d.developer_number).trim()
        : null) ??
      (email.trim() !== '' ? email.trim() : null),
    developer_number: d.developer_number != null ? String(d.developer_number) : undefined,
    name,
    email,
    representative,
    commercialRecord,
    phone,
    location,
    projectCount: Number(projectCount) || 0,
    role: d.second_party_role != null && String(d.second_party_role).trim() !== '' ? String(d.second_party_role).trim() : '',
  };
  if (Array.isArray(d.projects)) {
    normalized.projects = d.projects;
  }
  if (d.units_count != null) normalized.unitsCount = d.units_count;
  if (d.teams != null) normalized.teams = d.teams;
  return normalized;
}

/**
 * Enrich a normalized developer with data from a contract (second_party_*).
 * Use when the detail view should display data as stored in the contract.
 *
 * @param {NormalizedDeveloper} developer - Existing normalized developer (will not be mutated)
 * @param {any} contract - Raw contract from API (may have second_party_*)
 * @returns {NormalizedDeveloper} New object with contract fields applied (overwrite if contract has value)
 */
export function enrichDeveloperFromContract(developer, contract) {
  if (!developer || !contract || typeof contract !== 'object') return developer;
  const c = /** @type {any} */ (contract);
  const rep = c.second_party_signatory ?? c.signatory ?? '';
  const cr = c.second_party_cr_number ?? (c.developer_number != null ? String(c.developer_number) : '');
  const ph = c.second_party_phone ?? '';
  const loc = c.second_party_address ?? c.address ?? '';
  const name = c.second_party_name ?? c.developer_name ?? '';
  const email = c.second_party_email ?? '';
  return {
    ...developer,
    representative: rep || developer.representative || '-',
    commercialRecord: cr || developer.commercialRecord || '-',
    phone: ph || developer.phone || '-',
    location: loc || developer.location || '-',
    name: name || developer.name,
    email: email || developer.email,
  };
}

/**
 * Normalize an array of raw developers (e.g. from getDevelopers).
 *
 * @param {any[]} list - Raw list from API
 * @param {any} [options] - Optional: { projectCount: (d) => number } per item
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
