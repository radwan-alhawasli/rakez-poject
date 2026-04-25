/**
 * حقول الوحدة المباعة (محاسبة): توحيد أسماء الـ API مع القائمة وصفحة التفاصيل.
 */

const PRICE_KEYS = ['final_sale_price', 'final_selling_price', 'total_value', 'amount'];

/**
 * أول سعر نهائي صالح من جذر الكائن (يتوافق مع GET sold-units و Postman).
 * @param {any} unit
 * @returns {number|null}
 */
export function pickFinalSalePriceFromUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const u = /** @type {any} */ (unit);
  for (const key of PRICE_KEYS) {
    const raw = u[key];
    if (raw === '' || raw == null) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * دمج استجابة GET sold-units/:id مع صف القائمة دون طمس قيم صالحة بـ null/undefined من التفاصيل.
 * @param {any} base - صف القائمة
 * @param {any} detail - استجابة التفاصيل
 * @returns {any}
 */
export function mergeSoldUnitDetail(base, detail) {
  if (!detail || typeof detail !== 'object') return base && typeof base === 'object' ? { ...base } : {};
  if (!base || typeof base !== 'object') return { ...detail };

  const protectedKeys = [
    'final_sale_price',
    'final_selling_price',
    'total_value',
    'amount',
    'commission_percentage',
    'commission_percent',
    'commission_source',
    'team_name',
    'customer_name',
    'client_name',
    'project_name',
    'unit_number',
  ];

  const b = /** @type {any} */ (base);
  const d = /** @type {any} */ (detail);
  const merged = { ...b, ...d };
  for (const k of protectedKeys) {
    const v = d[k];
    if (v === undefined || v === null) {
      if (b[k] !== undefined && b[k] !== null) {
        merged[k] = b[k];
      }
    }
  }
  return merged;
}

/**
 * نسبة السعي: أولاً من بيانات العقد المرتبطة، ثم من جذر الكائن (مثل جدول القائمة).
 * @param {any} unit
 * @returns {number|null}
 */
export function pickCommissionPercentForSoldUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const u = /** @type {any} */ (unit);
  const nested =
    u.contract ??
    u.reservation?.contract ??
    u.contract_unit?.contract ??
    u.contract_info ??
    (Array.isArray(u.contract_infos) ? u.contract_infos[0] : u.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const fromContract =
    c?.commission_percent ??
    c?.commission_percentage ??
    u.contract_commission_percent ??
    u.contract_commission_percentage ??
    null;
  if (fromContract !== '' && fromContract != null) {
    const n = Number(fromContract);
    if (Number.isFinite(n)) return n;
  }
  const root = u.commission_percentage ?? u.commission_percent;
  if (root === '' || root == null) return null;
  const n = Number(root);
  return Number.isFinite(n) ? n : null;
}

/**
 * مصدر السعي: من العقد ثم من جذر الكائن.
 * @param {any} unit
 * @returns {'owner'|'buyer'|null}
 */
export function pickCommissionSourceForSoldUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const u = /** @type {any} */ (unit);
  const nested =
    u.contract ??
    u.reservation?.contract ??
    u.contract_unit?.contract ??
    u.contract_info ??
    (Array.isArray(u.contract_infos) ? u.contract_infos[0] : u.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const src = c?.commission_from ?? c?.commission_source ?? null;
  if (src === 'owner' || src === 'buyer') return src;
  const root = u.commission_source;
  if (root === 'owner' || root === 'buyer') return root;
  return null;
}
