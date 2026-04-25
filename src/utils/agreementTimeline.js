/**
 * حساب الأيام المتبقية في متتبع الاتفاقية.
 * - إن وُجد تاريخ انتهاء صريح يُستخدم.
 * - وإلا: مدة الاتفاق (أيام) + تاريخ بداية (إصدار/إنشاء/بداية العقد).
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * @param {any} v
 * @returns {number | null}
 */
function parseDateMs(v) {
  if (v == null || v === '') return null;
  const d = new Date(/** @type {any} */ (v));
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * @param {any} c
 * @returns {{ daysLeft: number | null, totalDays: number | null }}
 */
export function computeAgreementTimeline(c) {
  if (!c || typeof c !== 'object') {
    return { daysLeft: null, totalDays: null };
  }

  const obj = /** @type {any} */ (c);
  const endExplicit =
    parseDateMs(obj.contract_end_date) ??
    parseDateMs(obj.end_date) ??
    parseDateMs(obj.agreement_end_date) ??
    parseDateMs(obj.release_and_end_date);

  const durationRaw =
    obj.agreement_duration_days ?? obj.agreement_duration ?? (obj.info && obj.info.agreement_duration_days);
  const totalDays =
    durationRaw != null && durationRaw !== '' ? Math.max(0, Math.floor(Number(durationRaw))) : null;
  const totalDaysValid = totalDays != null && Number.isFinite(totalDays) && totalDays > 0;

  const startMs =
    parseDateMs(obj.contract_start_date) ??
    parseDateMs(obj.agreement_start_date) ??
    parseDateMs(obj.release_date) ??
    (obj.info && parseDateMs(obj.info.release_date)) ??
    (obj.info && parseDateMs(obj.info.gregorian_date)) ??
    (obj.second_party_data && parseDateMs(obj.second_party_data.gregorian_date)) ??
    parseDateMs(obj.created_at);

  let endMs = endExplicit;
  if (endMs == null && totalDaysValid && startMs != null) {
    endMs = startMs + (totalDays || 0) * MS_PER_DAY;
  }

  if (endMs == null) {
    return { daysLeft: null, totalDays: totalDaysValid ? totalDays : null };
  }

  const daysLeft = Math.ceil((endMs - Date.now()) / MS_PER_DAY);
  const totalForBar =
    totalDaysValid && startMs != null
      ? totalDays
      : endExplicit != null && startMs != null
        ? Math.max(1, Math.ceil((endMs - startMs) / MS_PER_DAY))
        : null;

  return { daysLeft, totalDays: totalForBar };
}

/**
 * نسبة ملء شريط «الوقت المتبقي» (100% = كل المدة باقية، 0% = منتهي).
 * @param {number | null} daysLeft
 * @param {number | null} totalDays
 */
export function agreementRemainingPercent(daysLeft, totalDays) {
  if (daysLeft == null) return 0;
  if (daysLeft < 0) return 0;
  if (totalDays == null || totalDays <= 0) {
    return Math.min(100, Math.max(0, daysLeft));
  }
  return Math.min(100, Math.max(0, Math.round((daysLeft / totalDays) * 100)));
}
