import {
  CALCULATION_MODE_OPTIONS,
  DEGREE_OPTIONS,
  MANAGEMENT_ROLES,
  OPERATION_FIELDS,
  PROJECT_SAI_SOURCE_LABELS,
  REWARD_SOURCE_OPTIONS,
  REWARD_STATUS_LABELS,
  SCOPE_FIELDS,
  SOURCE_SCOPE_LABELS,
  SOURCE_TYPE_LABELS,
  UNAVAILABLE_TEXT,
  UNRESOLVED_REASON_LABELS,
} from './projectRewardConstants';

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

export function emptyRewardForm(contractId) {
  const base = {
    contract_id: String(contractId || '').trim(),
    calculation_mode: CALCULATION_MODE_OPTIONS[0].value,
    reward_percentage: '',
    source: REWARD_SOURCE_OPTIONS[0].value,
    tax_enabled: false,
    vat_percentage: '15',
    assigned_bring_percentage: '',
    assigned_convince_percentage: '',
    assigned_close_percentage: '',
    outside_bring_percentage: '',
    outside_convince_percentage: '',
    outside_close_percentage: '',
    is_active: true,
  };

  MANAGEMENT_ROLES.forEach(role => {
    base[role.userKey] = '';
    base[role.bringKey] = '';
    base[role.convinceKey] = '';
    base[role.closeKey] = '';
  });

  return base;
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

export function buildDegreeMatrixRows(form) {
  return SCOPE_FIELDS.flatMap(scope =>
    OPERATION_FIELDS.map(operation => {
      const fieldKey = `${scope.key}_${operation.key}_percentage`;
      const baseValue = toNumberOrNull(form[fieldKey]);
      return {
        scope: scope.label,
        operation: operation.label,
        base: baseValue,
        values: DEGREE_OPTIONS.map(option => ({
          ...option,
          result: baseValue == null ? null : Number((baseValue * option.value).toFixed(4)),
        })),
      };
    })
  );
}

export function rewardSourceLabel(value) {
  const normalized = normalizeRewardSource(value);
  return REWARD_SOURCE_OPTIONS.find(item => item.value === normalized)?.label ?? '—';
}

export function rewardStatusLabel(value) {
  return REWARD_STATUS_LABELS[String(value || '').trim().toLowerCase()] ?? '—';
}

export function sourceScopeLabel(value) {
  return SOURCE_SCOPE_LABELS[String(value || '').trim()] ?? '—';
}

export function sourceTypeLabel(value) {
  return SOURCE_TYPE_LABELS[String(value || '').trim()] ?? '—';
}

export function unresolvedReasonLabel(value) {
  return UNRESOLVED_REASON_LABELS[String(value || '').trim()] ?? 'سبب غير معروف';
}

export function formatMoney(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '—';
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(numberValue);
}

export function formatPercent(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '—';
  return `${numberValue}%`;
}

export function displayPercent(v) {
  const n = toNumberOrNull(v);
  return n == null ? '—' : `${n}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ar-SA').format(date);
}

export function rewardStatusClass(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'approved' || normalized === 'paid') return 'ok';
  if (normalized === 'rejected') return 'danger';
  return 'warn';
}

export function projectSaiSourceLabelFromValue(value) {
  return PROJECT_SAI_SOURCE_LABELS[value] ?? UNAVAILABLE_TEXT;
}
