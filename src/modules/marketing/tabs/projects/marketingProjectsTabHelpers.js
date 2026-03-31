export const platformLabelsAr = {
  instagram: 'منصة انستغرام',
  snapchat: 'منصة سناب',
  tiktok: 'منصة تيك توك',
  x: 'منصة تويتر X',
  google_youtube: 'منصة جوجل (يوتيوب)',
  other: 'منصات اخرى',
  aqar: 'منصة عقار',
};

export function devPlanCpmCpcSummary(devPlan) {
  if (!devPlan) return '—';
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm;
  if (pcpm && Object.keys(pcpm).length) return 'حسب المنصة';
  const avgCpm = devPlan.average_cpm ?? devPlan.averageCpm;
  const avgCpc = devPlan.average_cpc ?? devPlan.averageCpc;
  if (avgCpm != null || avgCpc != null) return `${avgCpm ?? '—'} / ${avgCpc ?? '—'}`;
  return '—';
}

export function hasDevPlanPerPlatform(devPlan) {
  if (!devPlan) return false;
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm ?? {};
  const pcpc = devPlan.platform_cpc ?? devPlan.platformCpc ?? {};
  return Object.keys(pcpm).length > 0 || Object.keys(pcpc).length > 0;
}

export function devPlanPlatformValue(devPlan, key) {
  if (!devPlan) return '';
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm ?? {};
  const pcpc = devPlan.platform_cpc ?? devPlan.platformCpc ?? {};
  const cpm = pcpm[key];
  const cpc = pcpc[key];
  if (cpm == null && cpc == null) return '';
  return `CPM: ${cpm ?? '—'} | CPC: ${cpc ?? '—'}`;
}
