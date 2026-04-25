/** Pure UI helpers for marketing projects list/cards (used by useMarketingProjects). */

import { computeAgreementTimeline } from '@/utils/agreementTimeline.js';

/**
 * @param {any} status
 * @returns {string}
 */
export function getStatusClass(status) {
  const s = String(status || '').toLowerCase();
  /** @type {Record<string, string>} */
  const statusMap = {
    active: 'status-active',
    approved: 'status-active',
    completed: 'status-completed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };
  return statusMap[s] || 'status-pending';
}

/**
 * @param {any} status
 * @returns {string}
 */
export function getStatusText(status) {
  const s = String(status || '').toLowerCase();
  /** @type {Record<string, string>} */
  const textMap = {
    active: 'نشط',
    approved: 'معتمد',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    cancelled: 'ملغي',
  };
  return textMap[s] || 'غير محدد';
}

/**
 * @param {any} project
 * @returns {number | null}
 */
export function contractTimelineDaysLeft(project) {
  if (!project) return null;
  const m = project.marketing_project;
  const source =
    m && typeof m === 'object'
      ? {
          ...m,
          ...project,
          marketing_project: undefined,
        }
      : project;
  const { daysLeft } = computeAgreementTimeline(source);
  return daysLeft;
}

/**
 * @param {number | null} daysLeft
 * @returns {string}
 */
export function durationStatusClass(daysLeft) {
  if (daysLeft === null) return 'status-pending';
  if (daysLeft < 30) return 'status-cancelled';
  if (daysLeft < 90) return 'status-pending';
  return 'status-active';
}

/**
 * @param {any} project
 * @returns {string}
 */
export function contractTimelineLabel(project) {
  const daysLeft = contractTimelineDaysLeft(project);
  if (daysLeft === null) return 'غير متاح';
  if (daysLeft < 0) return 'منتهي';
  if (daysLeft >= 90) return `${daysLeft} يوم (أخضر)`;
  if (daysLeft >= 30) return `${daysLeft} يوم (برتقالي)`;
  return `${daysLeft} يوم (أحمر)`;
}

/**
 * @param {any} project
 * @param {Record<string, any>} recommendedEmployeeByProjectId
 * @returns {string}
 */
export function getRecommendedEmployee(project, recommendedEmployeeByProjectId) {
  if (!project) return '—';
  const id = project.id ?? project.marketing_project_id;
  const apiRec = id != null ? recommendedEmployeeByProjectId?.[id] : null;
  if (apiRec && (apiRec.name || apiRec.employee_name || apiRec.user_name)) {
    return apiRec.name || apiRec.employee_name || apiRec.user_name;
  }
  const plans = project?.employee_plans || [];
  if (!plans.length) return 'تقديريًا: أعلى أداء غير متاح';
  const sorted = [...plans].sort((a, b) => (Number(b.marketing_value) || 0) - (Number(a.marketing_value) || 0));
  const top = sorted[0];
  const name = top?.user?.name || top?.user_name || `User #${top?.user_id ?? ''}`;
  return `${name} (تقديري حسب الأداء)`;
}

/** تسميات العرض لمفاتيح توزيع الحملة (المفاتيح الإنجليزية ثابتة للـ API) */
/** @type {Record<string, string>} */
export const CAMPAIGN_DISTRIBUTION_LABELS = {
  'Direct Communication': 'تواصل مباشر',
  'Hand Raise': 'Lead',
  Impression: 'Impression',
  Sales: 'subscription',
};

/**
 * @param {any} obj
 * @returns {string}
 */
export function formatDistribution(obj) {
  if (!obj || typeof obj !== 'object') return '—';
  const entries = Object.entries(obj);
  if (!entries.length) return '—';
  return entries
    .map(([k, v]) => `${CAMPAIGN_DISTRIBUTION_LABELS[k] ?? k}: ${v}`)
    .join(' • ');
}

/**
 * أعضاء مضمّنة في كائن الفريق من استجابة GET /marketing/projects/:id
 * @param {any} team
 * @returns {any[]}
 */
export function extractEmbeddedTeamMembers(team) {
  if (!team || typeof team !== 'object') return [];
  const t = /** @type {Record<string, any>} */ (team);
  const keys = [
    'members',
    'users',
    'employees',
    'team_members',
    'marketing_team_members',
    'sales_members',
    'responsible_members',
    'marketers',
  ];
  for (const k of keys) {
    const arr = t[k];
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return [];
}

/**
 * قائمة فرق التسويق المعروضة في تفاصيل المشروع: يُفضّل responsible_sales_teams ثم marketing_project.teams.
 * @param {any} project
 * @returns {any[]}
 */
export function getProjectMarketingTeamsList(project) {
  if (!project || typeof project !== 'object') return [];
  const responsible = project.responsible_sales_teams;
  if (Array.isArray(responsible) && responsible.length) return responsible;
  const mp = /** @type {Record<string, any> | null} */ (project.marketing_project);
  const legacy = mp && typeof mp === 'object' ? mp.teams : null;
  if (Array.isArray(legacy) && legacy.length) return legacy;
  return [];
}

/**
 * @param {any} team
 * @returns {string}
 */
export function marketingTeamDisplayName(team) {
  if (!team || typeof team !== 'object') return '—';
  return (
    team.name ??
    team.team_name ??
    team.title ??
    team.label ??
    team.user?.name ??
    `فريق #${team.id ?? '—'}`
  );
}

/**
 * @param {any} m
 * @returns {string}
 */
export function marketingMemberDisplayName(m) {
  if (!m || typeof m !== 'object') return '—';
  return m.name ?? m.user?.name ?? m.user_name ?? `عضو #${m.id ?? m.user_id ?? '—'}`;
}

/**
 * تقييم العضو (حقول شائعة من الـ API)
 * @param {any} m
 * @returns {number | null}
 */
export function marketingMemberRatingScore(m) {
  if (!m || typeof m !== 'object') return null;
  const raw =
    m.leader_rating ??
    m.rating ??
    m.avg_rating ??
    m.performance_score ??
    m.score ??
    m.performance_rating;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {any} m
 * @returns {string}
 */
export function marketingMemberRatingLabel(m) {
  const s = marketingMemberRatingScore(m);
  return s != null ? String(s) : '—';
}

/** @param {any} error */
export function firstMarketingPercentValidationMessage(error) {
  const data =
    error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object'
      ? (/** @type {any} */ (error.response)).data
      : null;
  if (!data || typeof data !== 'object' || !data.errors || typeof data.errors !== 'object') return null;
  const mp = /** @type {Record<string, unknown>} */ (data.errors).marketing_percent;
  return Array.isArray(mp) && typeof mp[0] === 'string' ? mp[0] : null;
}

/** @param {any} d */
export function resolveContractIdForMarketingPatch(d) {
  if (!d) return null;
  const v = d.marketing_project?.contract_id ?? d.contract_id ?? d.id;
  return v != null && v !== '' ? v : null;
}

/** @param {any} project */
export function resolveProjectPlanAttachmentUrl(project) {
  const raw = project?.project_plans || project?.marketing_project?.project_plans || project?.plan_url || '';
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const u = raw.trim();
  return u.startsWith('http') ? u : `${window.location.origin}${u.startsWith('/') ? u : `/${u}`}`;
}

/** @param {any} plan */
export function developerPlanLooksPresent(plan) {
  if (!plan || typeof plan !== 'object') return false;
  if (plan.raw_plan || plan.rawPlan) return true;
  return Boolean(
    plan.id ??
      plan.contract_id ??
      plan.average_cpm ??
      plan.averageCpm ??
      plan.marketing_value ??
      plan.marketingValue
  );
}
