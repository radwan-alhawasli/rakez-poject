import {
  computeAgreementTimeline,
  agreementRemainingPercent,
} from '@/utils/agreementTimeline.js';

/** عرض متتبع الاتفاقية: أيام متبقية + لون الشريط + نسبة العد التنازلي */
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

export function isArchivedProject(p) {
  return p.status === 'Refused' || p.status === 'Rejected';
}

/** تبويب «جاهزة للتسويق»: معتمد أو مُعلَم جاهزاً (من الـ API) + وجود وحدات؛ لا يشمل المؤرشف. */
export function isReadyForMarketingTab(p) {
  if (isArchivedProject(p)) return false;
  const hasUnits = Array.isArray(p.units) && p.units.length > 0;
  return hasUnits && p.is_ready_for_marketing === true;
}

export function isNotReadyTab(p) {
  return !isArchivedProject(p) && !isReadyForMarketingTab(p);
}
