import { UNIT_TYPES } from '@/constants/lookups';

/** نفس خيارات «طلب مشروع حصري» (ExclusiveProjectView) */
export const CONTRACT_UNIT_TYPE_OPTIONS = UNIT_TYPES;

/** هل النص يطابق أحد خيارات القائمة المعروفة
 * @param {any} t
 */
export function isKnownContractUnitTypeLabel(t) {
  const s = String(t ?? '').trim();
  if (!s) return false;
  return UNIT_TYPES.some((o) => o.label === s);
}

/** صف افتراضي في جدول أنواع الوحدات (استكمال العقد). */
export function emptyUnitRow() {
  return { type: '', count: 0, price: 0 };
}

/**
 * تحويل مصفوفة الوحدات من الـ API إلى صفوف النموذج.
 * @param {any[]} arr
 */
export function normalizeUnitsFromApi(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [emptyUnitRow()];
  }
  return arr.map((u) => {
    const obj = /** @type {any} */ (u);
    return {
      type:
        obj != null && obj.type != null
          ? String(obj.type)
          : obj?.unit_type != null
            ? String(obj.unit_type)
            : '',
      count: Math.max(0, parseInt(obj.count ?? obj.quantity ?? obj.qty, 10) || 0),
      price: Math.max(0, Number(obj.price ?? obj.unit_price ?? 0) || 0),
    };
  });
}

/** يحدّث units_count و total_units_value و unit_type و average_unit_price من form.units
 * @param {any} form
 */
export function syncFormTotalsFromUnits(form) {
  const rows = Array.isArray(form.units) ? form.units : [];
  let totalCount = 0;
  let totalValue = 0;
  for (const u of rows) {
    const obj = /** @type {any} */ (u);
    const c = Math.max(0, parseInt(obj.count, 10) || 0);
    const p = Math.max(0, Number(obj.price) || 0);
    totalCount += c;
    totalValue += c * p;
  }
  form.units_count = totalCount;
  form.total_units_value = totalValue;
  const first = rows.find((/** @type {any} */ r) => String(r.type || '').trim());
  form.unit_type = first ? String(/** @type {any} */ (first).type).trim() : '';
  form.average_unit_price = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
}

/**
 * صفوف جاهزة للإرسال: نوع غير فارغ وعدد > 0.
 * @param {any[]} rows
 */
export function unitsForApi(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((u) => {
      const obj = /** @type {any} */ (u);
      return {
        type: String(obj.type ?? '').trim(),
        count: Math.max(0, parseInt(obj.count, 10) || 0),
        price: Math.max(0, Number(obj.price) || 0),
      };
    })
    .filter((u) => u.type !== '' && u.count > 0);
}

/** صف واحد فارغ أو كل الصفوف بلا نوع ولا عدد — يُسمح بدمج وحدات من مشروع المبيعات
 * @param {any[]} rows
 */
export function isUnitsFormEffectivelyEmpty(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return true;
  return rows.every((u) => {
    const obj = /** @type {any} */ (u);
    return !String(obj.type || '').trim() && !(parseInt(obj.count, 10) > 0);
  });
}
