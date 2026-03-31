/** Pure UI helpers for marketing projects list/cards (used by useMarketingProjects). */

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
  const candidates = [
    project.contract_end_date,
    project.end_date,
    project.agreement_end_date,
    project.marketing_project?.contract_end_date,
  ];
  const endDateRaw = candidates.find(Boolean);
  if (!endDateRaw) return null;
  const endDate = new Date(endDateRaw);
  if (Number.isNaN(endDate.getTime())) return null;
  return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

export function formatDistribution(obj) {
  if (!obj || typeof obj !== 'object') return '—';
  const entries = Object.entries(obj);
  if (!entries.length) return '—';
  return entries.map(([k, v]) => `${k}: ${v}`).join(' • ');
}
