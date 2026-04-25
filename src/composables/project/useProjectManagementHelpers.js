import {
  computeAgreementTimeline,
  agreementRemainingPercent,
} from '@/utils/agreementTimeline.js';

/**
 * عرض متتبع الاتفاقية: أيام متبقية + لون الشريط + نسبة العد التنازلي
 * @param {any} source
 */
export function contractTimelineDisplay(source) {
  const { daysLeft, totalDays } = computeAgreementTimeline(source);
  const daysLeftVal = daysLeft;
  const contractRemainingLabel =
    daysLeftVal === null ? '—' : daysLeftVal < 0 ? 'منتهي' : `${daysLeftVal} يوم`;
  const contractColor =
    daysLeftVal === null
      ? 'gray'
      : daysLeftVal < 0
        ? 'red'
        : daysLeftVal <= 7
          ? 'red'
          : daysLeftVal <= 30
            ? 'yellow'
            : 'green';
  const contractDurationPercent =
    daysLeftVal != null && daysLeftVal < 0
      ? 100
      : agreementRemainingPercent(daysLeftVal, totalDays);
  return { daysLeftVal, contractRemainingLabel, contractColor, contractDurationPercent };
}

/** @param {any} p */
export function isArchivedProject(p) {
  return p.status === 'Refused' || p.status === 'Rejected';
}

/**
 * قيمة is_complete_second من الـ API (boolean أو 1 أو "true")
 * @param {any} p
 */
export function isCompleteSecondTruthy(p) {
  if (!p || typeof p !== 'object') return false;
  const v = p.is_complete_second;
  return v === true || v === 1 || String(v).toLowerCase() === 'true';
}

/**
 * تبويب «جاهزة للتسويق»: العقود المكتملة حسب الخادم (is_complete_second)؛ لا يشمل المؤرشف.
 * @param {any} p
 */
export function isReadyForMarketingTab(p) {
  if (isArchivedProject(p)) return false;
  return isCompleteSecondTruthy(p);
}

/** @param {any} p */
export function isNotReadyTab(p) {
  return !isArchivedProject(p) && !isReadyForMarketingTab(p);
}
