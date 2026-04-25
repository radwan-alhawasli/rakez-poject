export const platformLabelsAr = {
  instagram: 'منصة انستغرام',
  snapchat: 'منصة سناب',
  tiktok: 'منصة تيك توك',
  x: 'منصة تويتر X',
  google_youtube: 'منصة جوجل (يوتيوب)',
  other: 'منصات اخرى',
  aqar: 'منصة عقار',
};

/**
 * @param {any} devPlan
 * @returns {string}
 */
export function devPlanCpmCpcSummary(devPlan) {
  if (!devPlan) return '—';
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm;
  if (pcpm && Object.keys(pcpm).length) return 'حسب المنصة';
  const avgCpm = devPlan.average_cpm ?? devPlan.averageCpm;
  const avgCpc = devPlan.average_cpc ?? devPlan.averageCpc;
  if (avgCpm != null || avgCpc != null) return `${avgCpm ?? '—'} / ${avgCpc ?? '—'}`;
  return '—';
}

/**
 * @param {any} devPlan
 * @returns {boolean}
 */
export function hasDevPlanPerPlatform(devPlan) {
  if (!devPlan) return false;
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm ?? {};
  const pcpc = devPlan.platform_cpc ?? devPlan.platformCpc ?? {};
  return Object.keys(pcpm).length > 0 || Object.keys(pcpc).length > 0;
}

/**
 * @param {any} devPlan
 * @param {string} key
 * @returns {string}
 */
export function devPlanPlatformValue(devPlan, key) {
  if (!devPlan) return '';
  const pcpm = devPlan.platform_cpm ?? devPlan.platformCpm ?? {};
  const pcpc = devPlan.platform_cpc ?? devPlan.platformCpc ?? {};
  const cpm = pcpm[key];
  const cpc = pcpc[key];
  if (cpm == null && cpc == null) return '';
  return `CPM: ${cpm ?? '—'} | CPC: ${cpc ?? '—'}`;
}

/** 
 * يعرض مدينة/موقع قد يأتي كسلسلة أو كائن من الـ API (يتفادى [object Object]).
 * @param {any} val - Input value to format
 * @returns {string}
 */
export function formatGeoLabel(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val).trim();
  if (Array.isArray(val)) {
    return val.map(v => formatGeoLabel(v)).filter(Boolean).join('، ');
  }
  if (typeof val === 'object') {
    const o = /** @type {Record<string, any>} */ (val);
    const keys = ['name', 'label', 'title', 'ar_name', 'name_ar', 'name_en', 'city', 'district', 'address'];
    for (const k of keys) {
      const x = o[k];
      if (x != null && x !== '') {
        if (typeof x === 'object') return formatGeoLabel(x);
        return String(x).trim();
      }
    }
  }
  return '';
}

/**
 * @param {any} project
 * @returns {string}
 */
export function formatProjectLocationRow(project) {
  if (!project) return '—';
  const loc = formatGeoLabel(project.location);
  if (loc) return loc;
  return formatGeoLabel(project.city) || '—';
}

/**
 * @param {any} project
 * @returns {string}
 */
export function formatCityDistrictRow(project) {
  if (!project) return '—';
  const a = formatGeoLabel(project.city);
  const b = formatGeoLabel(project.district);
  if (a && b) return `${a} / ${b}`;
  return a || b || '—';
}
