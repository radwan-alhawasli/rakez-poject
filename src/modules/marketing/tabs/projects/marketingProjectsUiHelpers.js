/** Pure UI helpers for marketing projects list/cards (used by useMarketingProjects). */

import { computeAgreementTimeline } from '@/utils/agreementTimeline.js';

export function getStatusClass(status) {
  const s = String(status || '').toLowerCase();
  const statusMap = {
    active: 'status-active',
    approved: 'status-active',
    completed: 'status-completed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
  };
  return statusMap[s] || 'status-pending';
}

export function getStatusText(status) {
  const s = String(status || '').toLowerCase();
  const textMap = {
    active: 'نشط',
    approved: 'معتمد',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    cancelled: 'ملغي',
  };
  return textMap[s] || 'غير محدد';
}

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

export function durationStatusClass(daysLeft) {
  if (daysLeft === null) return 'status-pending';
  if (daysLeft < 30) return 'status-cancelled';
  if (daysLeft < 90) return 'status-pending';
  return 'status-active';
}

export function contractTimelineLabel(project) {
  const daysLeft = contractTimelineDaysLeft(project);
  if (daysLeft === null) return 'غير متاح';
  if (daysLeft < 0) return 'منتهي';
  if (daysLeft >= 90) return `${daysLeft} يوم (أخضر)`;
  if (daysLeft >= 30) return `${daysLeft} يوم (برتقالي)`;
  return `${daysLeft} يوم (أحمر)`;
}

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
export const CAMPAIGN_DISTRIBUTION_LABELS = {
  'Direct Communication': 'تواصل مباشر',
  'Hand Raise': 'Lead',
  Impression: 'Impression',
  Sales: 'subscription',
};

export function formatDistribution(obj) {
  if (!obj || typeof obj !== 'object') return '—';
  const entries = Object.entries(obj);
  if (!entries.length) return '—';
  return entries
    .map(([k, v]) => `${CAMPAIGN_DISTRIBUTION_LABELS[k] ?? k}: ${v}`)
    .join(' • ');
}

/** أعضاء مضمّنة في كائن الفريق من استجابة GET /marketing/projects/:id */
export function extractEmbeddedTeamMembers(team) {
  if (!team || typeof team !== 'object') return [];
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
    const arr = team[k];
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return [];
}

/**
 * قائمة فرق التسويق المعروضة في تفاصيل المشروع: يُفضّل responsible_sales_teams ثم marketing_project.teams.
 * @param {Record<string, unknown> | null | undefined} project
 * @returns {unknown[]}
 */
export function getProjectMarketingTeamsList(project) {
  if (!project || typeof project !== 'object') return [];
  const responsible = project.responsible_sales_teams;
  if (Array.isArray(responsible) && responsible.length) return responsible;
  const mp = project.marketing_project;
  const legacy = mp && typeof mp === 'object' ? mp.teams : null;
  if (Array.isArray(legacy) && legacy.length) return legacy;
  return [];
}

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

export function marketingMemberDisplayName(m) {
  if (!m || typeof m !== 'object') return '—';
  return m.name ?? m.user?.name ?? m.user_name ?? `عضو #${m.id ?? m.user_id ?? '—'}`;
}

/** تقييم العضو (حقول شائعة من الـ API) */
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

export function marketingMemberRatingLabel(m) {
  const s = marketingMemberRatingScore(m);
  return s != null ? String(s) : '—';
}
