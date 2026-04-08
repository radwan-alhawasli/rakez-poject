/**
 * Normalize GET /editor/contracts/show/:id body so cards get flat second_party_data, units, etc.
 * @param {unknown} raw
 * @returns {Record<string, unknown>}
 */
export function normalizeEditorContractShow(raw) {
  if (raw == null || typeof raw !== 'object') return {};
  let o = /** @type {Record<string, unknown>} */ ({ ...raw });

  const inner = o.contract;
  if (inner && typeof inner === 'object') {
    o = { ...inner, ...o };
  }
  const cd = o.contract_data;
  if (cd && typeof cd === 'object') {
    o = { ...cd, ...o };
  }

  if (o.data && typeof o.data === 'object' && !o.id) {
    const nested = /** @type {Record<string, unknown>} */ (o.data);
    if (nested.id != null) {
      o = { ...nested, ...o };
    }
  }

  return o;
}
