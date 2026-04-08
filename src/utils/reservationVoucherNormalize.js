/**
 * Normalize reservation voucher JSON from GET .../voucher-data (PM or sales)
 * into { reservation, project, unit, employee } for generateReservationVoucherPdf.
 */

const NEST_KEYS = new Set([
  'project',
  'unit',
  'employee',
  'Project',
  'Unit',
  'Employee',
  'reservation',
  'Reservation',
]);

/**
 * Unwrap nested `{ data: ... }` until voucher fields appear (max depth).
 * @param {unknown} raw
 * @returns {Record<string, unknown>|null}
 */
function unwrapPayload(raw) {
  let p = raw;
  for (let depth = 0; depth < 4 && p != null && typeof p === 'object' && !Array.isArray(p); depth++) {
    const o = /** @type {Record<string, unknown>} */ (p);
    if (
      o.reservation != null ||
      o.Reservation != null ||
      o.client_name != null ||
      o.contract_date != null ||
      o.down_payment_amount != null ||
      o.reservation_type != null
    ) {
      return o;
    }
    const inner = o.data;
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      p = inner;
      continue;
    }
    return o;
  }
  return p != null && typeof p === 'object' && !Array.isArray(p)
    ? /** @type {Record<string, unknown>} */ (p)
    : null;
}

/**
 * @param {Record<string, unknown>} vd
 * @returns {boolean}
 */
function looksLikeReservationFields(vd) {
  return (
    vd.client_name != null ||
    vd.contract_date != null ||
    vd.down_payment_amount != null ||
    vd.reservation_type != null ||
    vd.payment_method != null ||
    vd.purchase_mechanism != null
  );
}

/**
 * @param {unknown} raw - Response body or nested `data` from API
 * @returns {{ reservation: Record<string, unknown>, project: Record<string, unknown>, unit: Record<string, unknown>, employee: Record<string, unknown> } | null}
 */
export function normalizeVoucherDataPayload(raw) {
  const vd = unwrapPayload(raw);
  if (vd == null) return null;

  let reservation = vd.reservation ?? vd.Reservation ?? null;
  let project = /** @type {Record<string, unknown>} */ (
    vd.project ?? vd.Project ?? {}
  );
  let unit = /** @type {Record<string, unknown>} */ (vd.unit ?? vd.Unit ?? {});
  let employee = /** @type {Record<string, unknown>} */ (
    vd.employee ?? vd.Employee ?? {}
  );

  if (reservation != null && typeof reservation === 'object' && !Array.isArray(reservation)) {
    return {
      reservation: /** @type {Record<string, unknown>} */ (reservation),
      project: project && typeof project === 'object' ? project : {},
      unit: unit && typeof unit === 'object' ? unit : {},
      employee: employee && typeof employee === 'object' ? employee : {},
    };
  }

  if (looksLikeReservationFields(vd)) {
    const resCopy = { ...vd };
    NEST_KEYS.forEach(k => {
      delete resCopy[k];
    });
    delete resCopy.data;
    return {
      reservation: resCopy,
      project:
        vd.project != null && typeof vd.project === 'object' && !Array.isArray(vd.project)
          ? /** @type {Record<string, unknown>} */ (vd.project)
          : {},
      unit:
        vd.unit != null && typeof vd.unit === 'object' && !Array.isArray(vd.unit)
          ? /** @type {Record<string, unknown>} */ (vd.unit)
          : {},
      employee:
        vd.employee != null && typeof vd.employee === 'object' && !Array.isArray(vd.employee)
          ? /** @type {Record<string, unknown>} */ (vd.employee)
          : {},
    };
  }

  return null;
}
