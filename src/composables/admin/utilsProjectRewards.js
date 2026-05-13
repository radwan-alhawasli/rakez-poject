// دوال مساعدة لمشروع مكافآت المشاريع
// جميع الدوال utility كانت سابقا داخل useProjectRewardsProject.js

export function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (normalized === '') return null;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function toBoolean(value) {
  return value === true || value === 1 || value === '1';
}

export function getNestedValue(source, keyPath) {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], source);
}

export function firstDefinedValue(source, keys) {
  const base = source ?? {};
  for (const key of keys) {
    const value = getNestedValue(base, key);
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return null;
}

export function normalizeProjectSaiSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'buyer') return 'buyer';
  if (normalized === 'owner') return 'owner';
  if (normalized === 'developer') return 'developer';
  return '';
}

export function normalizeRewardSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'company' || normalized === 'developer') return normalized;
  return '';
}

export function normalizeEmployeeLabel(employee) {
  const type = employee?.type ? ` — ${employee.type}` : '';
  return `${employee?.name || employee?.employee_name || employee?.full_name || 'موظف'}${type}`;
}

export function normalizeReservationItem(item) {
  const id = item?.reservation_id ?? item?.id ?? item?.sales_reservation_id ?? null;
  return {
    id: id != null ? String(id) : '',
    raw: item,
    projectId: String(item?.contract_id ?? item?.project_id ?? item?.contractId ?? ''),
    unitNumber: item?.unit_number ?? item?.unit?.unit_number ?? item?.unit?.number ?? item?.contract_unit_number ?? '—',
    customerName: item?.customer_name ?? item?.client_name ?? item?.user_name ?? item?.client?.name ?? '—',
    status: item?.status ?? item?.reservation_status ?? '—',
    reservationNumber: item?.reservation_number ?? item?.code ?? item?.id ?? '—',
  };
}

export function rewardRecipientsFromPayload(payload) {
  const recipients = payload?.recipients ?? payload?.project_reward_recipients ?? payload?.preview_recipients ?? [];
  return Array.isArray(recipients) ? recipients : [];
}

export function rewardUnresolvedFromPayload(payload) {
  const unresolved = payload?.unresolved ?? payload?.remaining ?? payload?.unresolved_items ?? [];
  return Array.isArray(unresolved) ? unresolved : [];
}

export function buildPreviewPayload(form, manualAmount) {
  const payload = {};
  const rewardPercentage = toNumberOrNull(form.reward_percentage);
  const manualAmountNumber = toNumberOrNull(manualAmount);
  if (manualAmountNumber != null) payload.manual_amount = manualAmountNumber;
  if (rewardPercentage != null) payload.reward_percentage = rewardPercentage;
  return payload;
}
