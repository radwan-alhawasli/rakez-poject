export const SALES_EXECUTIVE_TARGET_TYPES = Object.freeze([
  { value: 'villa', label: 'فيلا' },
  { value: 'apartment', label: 'شقه' },
  { value: 'townhouse', label: 'تاون هاوس' },
  { value: 'floors', label: 'ادوار' },
  { value: 'land', label: 'اراضي' },
  { value: 'penthouse', label: 'بنتهاوس' },
]);

/** @type {Record<string, string>} */
const SALES_EXECUTIVE_TARGET_TYPE_ALIASES = Object.freeze({
  villa: 'villa',
  فيلا: 'villa',
  apartment: 'apartment',
  شقه: 'apartment',
  شقة: 'apartment',
  townhouse: 'townhouse',
  'تاون هاوس': 'townhouse',
  floors: 'floors',
  floor: 'floors',
  ادوار: 'floors',
  أدوار: 'floors',
  land: 'land',
  اراضي: 'land',
  أراضي: 'land',
  penthouse: 'penthouse',
  بنتهاوس: 'penthouse',
});

/**
 * @param {any} value
 * @returns {string}
 */
export function normalizeSalesExecutiveLineType(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  return SALES_EXECUTIVE_TARGET_TYPE_ALIASES[normalized] || normalized.toLowerCase();
}
