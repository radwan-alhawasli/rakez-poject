/**
 * حقول الوحدة المباعة (محاسبة): توحيد أسماء الـ API مع القائمة وصفحة التفاصيل.
 */

const PRICE_KEYS = ['final_sale_price', 'final_selling_price', 'total_value', 'amount'];

/**
 * أول سعر نهائي صالح من جذر الكائن (يتوافق مع GET sold-units و Postman).
 * @param {Record<string, unknown>|null|undefined} unit
 * @returns {number|null}
 */
export function pickFinalSalePriceFromUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  for (const key of PRICE_KEYS) {
    const raw = unit[key];
    if (raw === '' || raw == null) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * دمج استجابة GET sold-units/:id مع صف القائمة دون طمس قيم صالحة بـ null/undefined من التفاصيل.
 * @param {Record<string, unknown>} base - صف القائمة
 * @param {Record<string, unknown>} detail - استجابة التفاصيل
 * @returns {Record<string, unknown>}
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

  const merged = { ...base, ...detail };
  for (const k of protectedKeys) {
    const v = detail[k];
    if (v === undefined || v === null) {
      if (base[k] !== undefined && base[k] !== null) {
        merged[k] = base[k];
      }
    }
  }
  return merged;
}

/**
 * نسبة السعي: أولاً من بيانات العقد المرتبطة، ثم من جذر الكائن (مثل جدول القائمة).
 * @param {Record<string, unknown>|null|undefined} unit
 * @returns {number|null}
 */
export function pickCommissionPercentForSoldUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const fromContract =
    c?.commission_percent ??
    c?.commission_percentage ??
    unit.contract_commission_percent ??
    unit.contract_commission_percentage ??
    null;
  if (fromContract !== '' && fromContract != null) {
    const n = Number(fromContract);
    if (Number.isFinite(n)) return n;
  }
  const root = unit.commission_percentage ?? unit.commission_percent;
  if (root === '' || root == null) return null;
  const n = Number(root);
  return Number.isFinite(n) ? n : null;
}

/**
 * مصدر السعي: من العقد ثم من جذر الكائن.
 * @param {Record<string, unknown>|null|undefined} unit
 * @returns {'owner'|'buyer'|null}
 */
export function pickCommissionSourceForSoldUnit(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const src = c?.commission_from ?? c?.commission_source ?? null;
  if (src === 'owner' || src === 'buyer') return src;
  const root = unit.commission_source;
  if (root === 'owner' || root === 'buyer') return root;
  return null;
}
