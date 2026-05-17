import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '@/composables/useToast';
import { usePermissions } from '@/composables/usePermissions';
import { getApiErrorMessage } from '@/utils/errorHandler';
import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import salesService from '@/services/salesService';
import projectRewardService from '@/services/projectRewardService';
import { getProjectManagementReservations } from '@/services/teamReservationService';
import { PERMISSIONS } from '@/constants/permissions';

const PROJECT_SAI_PERCENTAGE_KEYS = [
  'commission_percentage',
  'commission_percent',
  'commission_rate',
  'saei_percentage',
  'sai_percentage',
  'pursuit_percentage',
  'brokerage_percentage',
  'sales_commission_percentage',
  'contract.commission_percentage',
  'contract.commission_percent',
  'contract.commission_rate',
  'contract.saei_percentage',
  'contract.sai_percentage',
  'contract.pursuit_percentage',
  'contract.brokerage_percentage',
  'contract.sales_commission_percentage',
  'contract_info.commission_percentage',
  'contract_info.commission_percent',
  'contract_info.commission_rate',
  'contract_info.saei_percentage',
  'contract_info.sai_percentage',
  'contract_info.pursuit_percentage',
  'contract_info.brokerage_percentage',
  'contract_info.sales_commission_percentage',
];

const PROJECT_SAI_SOURCE_KEYS = [
  'commission_source',
  'commission_from',
  'saei_source',
  'sai_source',
  'pursuit_source',
  'brokerage_source',
  'commission_paid_by',
  'contract.commission_source',
  'contract.commission_from',
  'contract.saei_source',
  'contract.sai_source',
  'contract.pursuit_source',
  'contract.brokerage_source',
  'contract.commission_paid_by',
  'contract_info.commission_source',
  'contract_info.commission_from',
  'contract_info.saei_source',
  'contract_info.sai_source',
  'contract_info.pursuit_source',
  'contract_info.brokerage_source',
  'contract_info.commission_paid_by',
];

const PROJECT_SAI_SOURCE_LABELS = {
  buyer: 'من المشتري',
  owner: 'من المالك',
  developer: 'من المالك / المطور',
};

const REWARD_SOURCE_OPTIONS = [
  { value: 'company', label: 'من الشركة' },
  { value: 'developer', label: 'من المالك / المطور' },
];

const CALCULATION_MODE_OPTIONS = [
  { value: 'percentage_of_sale', label: 'نسبة من قيمة البيع' },
  { value: 'manual_amount', label: 'قيمة مكافأة يدوية' },
];

const DEGREE_OPTIONS = [
  { key: 'quarter', label: 'ربع', value: 0.25 },
  { key: 'half', label: 'نصف', value: 0.5 },
  { key: 'three_quarters', label: 'ثلاثة أرباع', value: 0.75 },
  { key: 'full', label: 'كامل', value: 1 },
];

const OPERATION_FIELDS = [
  { key: 'bring', label: 'جلب' },
  { key: 'convince', label: 'إقناع' },
  { key: 'close', label: 'إقفال' },
];

const SCOPE_FIELDS = [
  { key: 'assigned', label: 'فريق المشروع' },
  { key: 'outside', label: 'خارج فريق المشروع' },
];

const MANAGEMENT_ROLES = [
  { key: 'ceo', label: 'المدير التنفيذي', userKey: 'ceo_user_id', bringKey: 'ceo_bring_percentage', convinceKey: 'ceo_convince_percentage', closeKey: 'ceo_close_percentage', sourceType: 'ceo' },
  { key: 'sales_manager', label: 'مدير التسويق والمبيعات', userKey: 'sales_manager_user_id', bringKey: 'sales_manager_bring_percentage', convinceKey: 'sales_manager_convince_percentage', closeKey: 'sales_manager_close_percentage', sourceType: 'sales_manager' },
  { key: 'sales_leader', label: 'السيلز ليدر', userKey: 'sales_leader_user_id', bringKey: 'sales_leader_bring_percentage', convinceKey: 'sales_leader_convince_percentage', closeKey: 'sales_leader_close_percentage', sourceType: 'sales_leader' },
  { key: 'group_leader', label: 'قائد المجموعة / الجروب ليدر', userKey: 'group_leader_user_id', bringKey: 'group_leader_bring_percentage', convinceKey: 'group_leader_convince_percentage', closeKey: 'group_leader_close_percentage', sourceType: 'group_leader' },
  { key: 'external_marketer', label: 'المسوق الخارجي', userKey: 'external_marketer_user_id', bringKey: 'external_marketer_bring_percentage', convinceKey: 'external_marketer_convince_percentage', closeKey: 'external_marketer_close_percentage', sourceType: 'external_marketer' },
];

const REWARD_STATUS_LABELS = {
  pending: 'بانتظار الاعتماد',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
  paid: 'مدفوعة',
};

const SOURCE_SCOPE_LABELS = {
  assigned_project_team: 'فريق المشروع',
  outside_project_team: 'خارج فريق المشروع',
  management: 'الإدارة',
};

const SOURCE_TYPE_LABELS = {
  bring: 'جلب',
  convince: 'إقناع',
  close: 'إقفال',
  ceo: 'المدير التنفيذي',
  sales_manager: 'مدير التسويق والمبيعات',
  sales_leader: 'السيلز ليدر',
  group_leader: 'قائد المجموعة',
  external_marketer: 'المسوق الخارجي',
};

const UNRESOLVED_REASON_LABELS = {
  no_matching_participants: 'لا يوجد مشاركون مطابقون لهذه النسبة.',
  missing_management_user: 'توجد نسبة إدارية بدون موظف محدد.',
};

const UNAVAILABLE_TEXT = 'غير متوفر من بيانات المشروع';
const UNSUPPORTED_TEXT = 'غير مدعوم حالياً من واجهة API';

function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (normalized === '') return null;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function getNestedValue(source, keyPath) {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], source);
}

function firstDefinedValue(source, keys) {
  const base = source ?? {};
  for (const key of keys) {
    const value = getNestedValue(base, key);
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return null;
}

function normalizeProjectSaiSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'buyer') return 'buyer';
  if (normalized === 'owner') return 'owner';
  if (normalized === 'developer') return 'developer';
  return '';
}

function normalizeRewardSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'company' || normalized === 'developer') return normalized;
  return '';
}

function emptyRewardForm(contractId) {
  const base = {
    contract_id: String(contractId || '').trim(),
    calculation_mode: 'percentage_of_sale',
    reward_percentage: '',
    source: 'company',
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

function normalizeEmployeeLabel(employee) {
  const type = employee?.type ? ` — ${employee.type}` : '';
  return `${employee?.name || employee?.employee_name || employee?.full_name || 'موظف'}${type}`;
}

function normalizeReservationItem(item) {
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

function rewardRecipientsFromPayload(payload) {
  const recipients = payload?.recipients ?? payload?.project_reward_recipients ?? payload?.preview_recipients ?? [];
  return Array.isArray(recipients) ? recipients : [];
}

function rewardUnresolvedFromPayload(payload) {
  const unresolved = payload?.unresolved ?? payload?.remaining ?? payload?.unresolved_items ?? [];
  return Array.isArray(unresolved) ? unresolved : [];
}

function buildPreviewPayload(form, manualAmount) {
  const payload = {};
  const rewardPercentage = toNumberOrNull(form.reward_percentage);
  const manualAmountNumber = toNumberOrNull(manualAmount);
  if (manualAmountNumber != null) payload.manual_amount = manualAmountNumber;
  if (rewardPercentage != null) payload.reward_percentage = rewardPercentage;
  return payload;
}

export function useProjectRewardsProject(contractId) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const loading = ref(false);
  const loadError = ref('');
  const settingsLoading = ref(false);
  const savingSetting = ref(false);
  const activatingSetting = ref(false);
  const previewLoading = ref(false);
  const generatingReward = ref(false);
  const rewardsLoading = ref(false);
  const rewardDetailLoading = ref(false);
  const employeesLoading = ref(false);
  const reservationsLoading = ref(false);

  const project = ref(null);
  const settingsHistory = ref([]);
  const settingId = ref('');
  const rewards = ref([]);
  const rewardsTotal = ref(0);
  const selectedReward = ref(null);
  const showRewardDetailsModal = ref(false);

  const employees = ref([]);
  const reservations = ref([]);

  const form = reactive(emptyRewardForm(contractId.value));
  const errors = reactive({});
  const previewState = reactive({
    sales_reservation_id: '',
    manual_amount: '',
    reward_percentage_override: '',
    notes: '',
    result: null,
    recipients: [],
    unresolved: [],
    error: '',
  });

  const rewardsFilters = reactive({
    status: '',
  });

  const confirmState = reactive({
    open: false,
    title: '',
    message: '',
    type: 'warning',
    action: null,
    loading: false,
  });

  const rejectState = reactive({
    open: false,
    rewardId: '',
    reason: '',
    loading: false,
  });

  const canViewSettings = computed(() =>
    hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARD_SETTINGS_VIEW) || hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_VIEW)
  );
  const canManageSettings = computed(() =>
    hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARD_SETTINGS_MANAGE) || hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_MANAGE)
  );
  const canViewRewards = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARDS_VIEW));
  const canManageRewards = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARDS_MANAGE));
  const canApproveRewards = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARDS_APPROVE));
  const canPayRewards = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARDS_PAY));
  const canViewSalaries = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_SALARIES_VIEW));

  const projectName = computed(() => {
    const id = String(contractId.value || '').trim();
    return project.value?.name || project.value?.project_name || project.value?.title || `مشروع #${id}`;
  });

  const projectContractNumber = computed(() =>
    project.value?.contract_number ?? project.value?.project_number ?? project.value?.id ?? contractId.value ?? '—'
  );

  const projectSaiSourceValue = computed(() => normalizeProjectSaiSource(firstDefinedValue(project.value, PROJECT_SAI_SOURCE_KEYS)));
  const projectSaiSourceLabel = computed(() => PROJECT_SAI_SOURCE_LABELS[projectSaiSourceValue.value] ?? UNAVAILABLE_TEXT);
  const projectSaiPercentageValue = computed(() => toNumberOrNull(firstDefinedValue(project.value, PROJECT_SAI_PERCENTAGE_KEYS)));
  const projectSaiPercentageDisplay = computed(() =>
    projectSaiPercentageValue.value == null ? UNAVAILABLE_TEXT : `${projectSaiPercentageValue.value}%`
  );

  const activeSetting = computed(() => {
    const list = Array.isArray(settingsHistory.value) ? settingsHistory.value : [];
    return list.find(item => toBoolean(item?.is_active)) || list[0] || null;
  });

  const settingStatus = computed(() => {
    if (activeSetting.value && toBoolean(activeSetting.value?.is_active)) return 'active';
    if (settingsHistory.value.length) return 'inactive';
    return 'none';
  });

  const settingStatusLabel = computed(() => {
    if (settingStatus.value === 'active') return 'إعداد نشط';
    if (settingStatus.value === 'inactive') return 'غير نشط';
    return 'غير مهيأ';
  });

  const lastUpdatedAt = computed(() => {
    const value = activeSetting.value?.updated_at ?? activeSetting.value?.created_at;
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ar-SA').format(date);
  });

  const employeeOptions = computed(() =>
    (Array.isArray(employees.value) ? employees.value : []).map(employee => ({
      value: String(employee.id),
      label: normalizeEmployeeLabel(employee),
    }))
  );

  const selectedReservation = computed(() =>
    reservations.value.find(item => item.id === String(previewState.sales_reservation_id || '')) || null
  );

  const distributionTotal = computed(() => {
    const numbers = [
      form.assigned_bring_percentage,
      form.assigned_convince_percentage,
      form.assigned_close_percentage,
      form.outside_bring_percentage,
      form.outside_convince_percentage,
      form.outside_close_percentage,
    ].map(toNumberOrNull);

    MANAGEMENT_ROLES.forEach(role => {
      numbers.push(toNumberOrNull(form[role.bringKey]));
      numbers.push(toNumberOrNull(form[role.convinceKey]));
      numbers.push(toNumberOrNull(form[role.closeKey]));
    });

    return numbers.reduce((sum, value) => sum + (value ?? 0), 0);
  });

  const remainingDistribution = computed(() => Math.max(0, 100 - distributionTotal.value));
  const distributionBlockingError = computed(() => distributionTotal.value > 100);

  const degreeMatrixRows = computed(() => {
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
  });

  const latestPreviewResult = computed(() => previewState.result ?? {});
  const previewSummaryCards = computed(() => ([
    { key: 'calculation_base_amount', label: 'قيمة أساس الحساب', value: latestPreviewResult.value?.calculation_base_amount ?? latestPreviewResult.value?.sale_amount ?? null },
    { key: 'base_amount', label: 'مبلغ المكافأة الأساسي', value: latestPreviewResult.value?.base_amount ?? latestPreviewResult.value?.reward_amount ?? null },
    { key: 'vat_amount', label: 'VAT', value: latestPreviewResult.value?.vat_amount ?? null },
    { key: 'total_amount', label: 'الإجمالي المحاسبي', value: latestPreviewResult.value?.total_amount ?? null },
    { key: 'distribution_pool_amount', label: 'مبلغ التوزيع', value: latestPreviewResult.value?.distribution_pool_amount ?? null },
    { key: 'total_distributed', label: 'إجمالي الموزع', value: latestPreviewResult.value?.total_distributed ?? null },
    { key: 'remaining_amount', label: 'المتبقي غير موزع', value: latestPreviewResult.value?.remaining_amount ?? null },
  ]));

  const previewRecipients = computed(() => previewState.recipients);
  const unresolvedItems = computed(() => previewState.unresolved);
  const previewHasUnresolved = computed(() => unresolvedItems.value.length > 0);
  const previewPoolAmount = computed(() => Number(latestPreviewResult.value?.distribution_pool_amount ?? 0) || 0);
  const canGenerateReward = computed(() =>
    canManageRewards.value &&
    !!previewState.sales_reservation_id &&
    !!previewState.result &&
    !previewHasUnresolved.value &&
    previewPoolAmount.value > 0 &&
    previewRecipients.value.length > 0
  );

  function managementPreviewAmount(percentKey) {
    const percentage = toNumberOrNull(form[percentKey]);
    const poolAmount = Number(latestPreviewResult.value?.distribution_pool_amount ?? 0) || 0;
    if (percentage == null || poolAmount <= 0) return null;
    return (poolAmount * percentage) / 100;
  }

  function managementTotalPreview(role) {
    const poolAmount = Number(latestPreviewResult.value?.distribution_pool_amount ?? 0) || 0;
    if (poolAmount <= 0) return null;

    const b = toNumberOrNull(form[role.bringKey]) || 0;
    const c = toNumberOrNull(form[role.convinceKey]) || 0;
    const l = toNumberOrNull(form[role.closeKey]) || 0;
    const totalPercentage = b + c + l;

    if (totalPercentage === 0) return null;
    return (poolAmount * totalPercentage) / 100;
  }

  function rewardSourceLabel(value) {
    const normalized = normalizeRewardSource(value);
    return REWARD_SOURCE_OPTIONS.find(item => item.value === normalized)?.label ?? '—';
  }

  function rewardStatusLabel(value) {
    return REWARD_STATUS_LABELS[String(value || '').trim().toLowerCase()] ?? '—';
  }

  function sourceScopeLabel(value) {
    return SOURCE_SCOPE_LABELS[String(value || '').trim()] ?? '—';
  }

  function sourceTypeLabel(value) {
    return SOURCE_TYPE_LABELS[String(value || '').trim()] ?? '—';
  }

  function unresolvedReasonLabel(value) {
    return UNRESOLVED_REASON_LABELS[String(value || '').trim()] ?? 'سبب غير معروف';
  }

  function formatMoney(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return '—';
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(numberValue);
  }

  function formatPercent(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return '—';
    return `${numberValue}%`;
  }

  function displayPercent(v) {
    const n = toNumberOrNull(v);
    return n == null ? '—' : `${n}%`;
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ar-SA').format(date);
  }

  function rewardStatusClass(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'paid') return 'ok';
    if (normalized === 'rejected') return 'danger';
    return 'warn';
  }

  function clearErrors() {
    for (const key of Object.keys(errors)) delete errors[key];
  }

  function setError(key, message) {
    errors[key] = message;
  }

  function mapRewardApiMessage(error, fallback) {
    const raw = getApiErrorMessage(error, fallback);
    const normalized = String(raw || '').toLowerCase();
    if (normalized.includes('distribution_total')) return 'إجمالي نسب التوزيع يتجاوز 100%.';
    if (normalized.includes('project_reward_setting')) return 'لا يوجد إعداد مكافأة فعال لهذا المشروع.';
    if (normalized.includes('sale_amount')) return 'تعذر تحديد مبلغ البيع من الحجز أو الوحدة.';
    if (normalized.includes('unresolved')) return 'لا يمكن توليد المكافأة لوجود مبالغ غير موزعة.';
    if (normalized.includes('recipients')) return 'لا يوجد مستفيدون للمكافأة.';
    if (normalized.includes('project_reward')) return 'لا يمكن توليد مكافأة جديدة لهذا الحجز بعد اعتمادها أو دفعها.';
    if (normalized.includes('status')) return 'حالة المكافأة لا تسمح بهذا الإجراء.';
    if (normalized.includes('manual_amount')) return 'قيمة المكافأة مطلوبة في وضع المبلغ اليدوي.';
    if (normalized.includes('reward_percentage')) return 'نسبة المكافأة مطلوبة ويجب أن تكون بين 0.01 و 100.';
    if (String(error?.status || error?.response?.status || '') === '403') return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
    if (String(error?.status || error?.response?.status || '') === '404') return 'العنصر المطلوب غير موجود.';
    return raw || fallback;
  }

  function fillFormFromSetting(setting) {
    const next = emptyRewardForm(contractId.value);
    for (const key of Object.keys(next)) {
      if (key === 'contract_id') continue;
      if (key === 'is_active' || key === 'tax_enabled') {
        next[key] = toBoolean(setting?.[key]);
        continue;
      }
      next[key] = setting?.[key] ?? next[key];
    }
    for (const key of Object.keys(next)) {
      if (key.endsWith('_user_id')) next[key] = next[key] ? String(next[key]) : '';
      else if (typeof next[key] === 'number') next[key] = String(next[key]);
    }
    Object.assign(form, next);
  }

  function resetFormToDefaults() {
    Object.assign(form, emptyRewardForm(contractId.value));
  }

  function validateSettings() {
    clearErrors();
    if (!String(contractId.value || '').trim()) {
      setError('contract_id', 'هذا الحقل مطلوب');
    }

    if (!['percentage_of_sale', 'manual_amount'].includes(String(form.calculation_mode || ''))) {
      setError('calculation_mode', 'هذا الحقل مطلوب');
    }

    if (String(form.calculation_mode) === 'percentage_of_sale') {
      const rewardPercentage = toNumberOrNull(form.reward_percentage);
      if (rewardPercentage == null || rewardPercentage < 0.01 || rewardPercentage > 100) {
        setError('reward_percentage', 'نسبة المكافأة مطلوبة ويجب أن تكون بين 0.01 و 100.');
      }
    }

    if (!['company', 'developer'].includes(normalizeRewardSource(form.source))) {
      setError('source', 'هذا الحقل مطلوب');
    }

    const vatPercentage = toNumberOrNull(form.vat_percentage);
    if (vatPercentage != null && (vatPercentage < 0 || vatPercentage > 100)) {
      setError('vat_percentage', 'النسبة يجب أن تكون بين 0 و 100');
    }

    const percentageKeys = [
      'assigned_bring_percentage',
      'assigned_convince_percentage',
      'assigned_close_percentage',
      'outside_bring_percentage',
      'outside_convince_percentage',
      'outside_close_percentage',
    ];

    MANAGEMENT_ROLES.forEach(role => {
      percentageKeys.push(role.bringKey, role.convinceKey, role.closeKey);
    });

    for (const key of percentageKeys) {
      const value = toNumberOrNull(form[key]);
      if (value == null) continue;
      if (value < 0 || value > 100) {
        setError(key, 'النسبة يجب أن تكون بين 0 و 100');
      }
    }

    // Removed the requirement to choose a staff member when a percentage is entered
    // as per user request: "I don't have to choose a staff member"

    if (distributionBlockingError.value) {
      setError('distribution_total', 'إجمالي نسب التوزيع يتجاوز 100%.');
    }

    return Object.keys(errors).length === 0;
  }

  function buildSettingPayload() {
    const payload = {
      contract_id: Number(contractId.value),
      calculation_mode: String(form.calculation_mode),
      reward_percentage: String(form.calculation_mode) === 'percentage_of_sale' ? toNumberOrNull(form.reward_percentage) : null,
      source: normalizeRewardSource(form.source) || null,
      tax_enabled: !!form.tax_enabled,
      vat_percentage: toNumberOrNull(form.vat_percentage),
      assigned_bring_percentage: toNumberOrNull(form.assigned_bring_percentage),
      assigned_convince_percentage: toNumberOrNull(form.assigned_convince_percentage),
      assigned_close_percentage: toNumberOrNull(form.assigned_close_percentage),
      outside_bring_percentage: toNumberOrNull(form.outside_bring_percentage),
      outside_convince_percentage: toNumberOrNull(form.outside_convince_percentage),
      outside_close_percentage: toNumberOrNull(form.outside_close_percentage),
      is_active: !!form.is_active,
    };

    MANAGEMENT_ROLES.forEach(role => {
      payload[role.userKey] = form[role.userKey] ? Number(form[role.userKey]) : null;
      payload[role.bringKey] = toNumberOrNull(form[role.bringKey]);
      payload[role.convinceKey] = toNumberOrNull(form[role.convinceKey]);
      payload[role.closeKey] = toNumberOrNull(form[role.closeKey]);
    });

    return payload;
  }

  async function loadProject() {
    project.value = await marketingService.getProjectByContractId(contractId.value);
  }

  async function loadEmployees() {
    employeesLoading.value = true;
    try {
      const result = await userService.getEmployees({ per_page: 500 });
      employees.value = result?.items ?? [];
    } finally {
      employeesLoading.value = false;
    }
  }

  async function loadSettings() {
    settingsLoading.value = true;
    try {
      const result = await projectRewardService.listSettings({ contract_id: contractId.value, per_page: 100 });
      settingsHistory.value = Array.isArray(result?.items) ? result.items : [];
      const selected = activeSetting.value;
      settingId.value = selected?.id != null ? String(selected.id) : '';
      if (selected) fillFormFromSetting(selected);
      else resetFormToDefaults();
    } finally {
      settingsLoading.value = false;
    }
  }

  async function loadReservations() {
    reservationsLoading.value = true;
    try {
      let list = [];
      try {
        const result = await salesService.getReservations({ contract_id: contractId.value, per_page: 100 });
        list = Array.isArray(result?.items) ? result.items : [];
      } catch {
        list = [];
      }
      if (!list.length) {
        const pmItems = await getProjectManagementReservations({ per_page: 500 });
        list = Array.isArray(pmItems) ? pmItems : [];
      }
      reservations.value = list
        .map(normalizeReservationItem)
        .filter(item => item.id && (!contractId.value || item.projectId === String(contractId.value)));
    } catch {
      reservations.value = [];
    } finally {
      reservationsLoading.value = false;
    }
  }

  async function loadRewards() {
    if (!canViewRewards.value) {
      rewards.value = [];
      rewardsTotal.value = 0;
      return;
    }
    rewardsLoading.value = true;
    try {
      const result = await projectRewardService.listRewards({
        contract_id: contractId.value,
        sales_reservation_id: previewState.sales_reservation_id || undefined,
        status: rewardsFilters.status || undefined,
        per_page: 100,
      });
      rewards.value = Array.isArray(result?.items) ? result.items : [];
      rewardsTotal.value = Number(result?.total ?? rewards.value.length) || rewards.value.length;
    } finally {
      rewardsLoading.value = false;
    }
  }

  async function init() {
    loading.value = true;
    loadError.value = '';
    try {
      await Promise.all([loadProject(), loadEmployees(), loadSettings(), loadReservations(), loadRewards()]);
    } catch (error) {
      loadError.value = mapRewardApiMessage(error, 'تعذر تحميل بيانات المكافآت. حاول مرة أخرى.');
    } finally {
      loading.value = false;
    }
  }

  async function saveSettings() {
    if (!canManageSettings.value) return false;
    if (!validateSettings()) {
      toast.error(errors.distribution_total || 'تحقق من الحقول ثم حاول مرة أخرى.');
      return false;
    }
    savingSetting.value = true;
    try {
      const payload = buildSettingPayload();
      if (settingId.value) {
        await projectRewardService.updateSetting(settingId.value, payload);
      } else {
        const created = await projectRewardService.createSetting(payload);
        settingId.value = String(created?.id || '');
      }
      await loadSettings();
      await loadRewards();
      toast.success('تم حفظ إعداد المكافآت بنجاح');
      return true;
    } catch (error) {
      toast.error(mapRewardApiMessage(error, 'تعذر حفظ إعداد المكافآت. حاول مرة أخرى.'));
      return false;
    } finally {
      savingSetting.value = false;
    }
  }

  async function activateSetting() {
    if (!canManageSettings.value || !settingId.value) return;
    activatingSetting.value = true;
    try {
      await projectRewardService.activateSetting(settingId.value);
      await loadSettings();
      toast.success('تم تفعيل إعداد المكافأة بنجاح');
    } catch (error) {
      toast.error(mapRewardApiMessage(error, 'تعذر تفعيل إعداد المكافأة. حاول مرة أخرى.'));
    } finally {
      activatingSetting.value = false;
    }
  }

  async function previewRewardAction() {
    previewState.error = '';
    previewState.result = null;
    previewState.recipients = [];
    previewState.unresolved = [];

    if (!previewState.sales_reservation_id) {
      previewState.error = 'اختر الحجز أولاً.';
      return;
    }

    if (String(form.calculation_mode) === 'manual_amount') {
      const manualAmount = toNumberOrNull(previewState.manual_amount);
      if (manualAmount == null || manualAmount <= 0) {
        previewState.error = 'قيمة المكافأة مطلوبة في وضع المبلغ اليدوي.';
        return;
      }
    }

    if (String(form.calculation_mode) === 'percentage_of_sale') {
      const rewardPercentage = toNumberOrNull(previewState.reward_percentage_override || form.reward_percentage);
      if (rewardPercentage == null || rewardPercentage < 0.01 || rewardPercentage > 100) {
        previewState.error = 'نسبة المكافأة مطلوبة ويجب أن تكون بين 0.01 و 100.';
        return;
      }
    }

    previewLoading.value = true;
    try {
      const payload = buildPreviewPayload(
        {
          ...form,
          reward_percentage: previewState.reward_percentage_override || form.reward_percentage,
        },
        String(form.calculation_mode) === 'manual_amount' ? previewState.manual_amount : null
      );
      const result = await projectRewardService.previewReward(previewState.sales_reservation_id, payload);
      previewState.result = result;
      previewState.recipients = rewardRecipientsFromPayload(result);
      previewState.unresolved = rewardUnresolvedFromPayload(result);
      await loadRewards();
      toast.success('تم تحميل معاينة المكافأة بنجاح');
    } catch (error) {
      previewState.error = mapRewardApiMessage(error, 'تعذر تحميل معاينة المكافأة.');
      toast.error(previewState.error);
    } finally {
      previewLoading.value = false;
    }
  }

  async function generateRewardAction() {
    if (!canGenerateReward.value || generatingReward.value) return;
    generatingReward.value = true;
    try {
      const payload = {
        ...buildPreviewPayload(
          { ...form, reward_percentage: previewState.reward_percentage_override || form.reward_percentage },
          String(form.calculation_mode) === 'manual_amount' ? previewState.manual_amount : null
        ),
        notes: previewState.notes ? String(previewState.notes) : null,
      };
      await projectRewardService.generateReward(previewState.sales_reservation_id, payload);
      toast.success('تم توليد المكافأة بنجاح');
      await Promise.all([loadRewards(), previewRewardAction()]);
    } catch (error) {
      toast.error(mapRewardApiMessage(error, 'تعذر توليد المكافأة.'));
    } finally {
      generatingReward.value = false;
    }
  }

  async function openRewardDetails(id) {
    showRewardDetailsModal.value = true;
    rewardDetailLoading.value = true;
    try {
      selectedReward.value = await projectRewardService.showReward(id);
    } catch (error) {
      toast.error(mapRewardApiMessage(error, 'تعذر تحميل تفاصيل المكافأة.'));
      selectedReward.value = null;
      showRewardDetailsModal.value = false;
    } finally {
      rewardDetailLoading.value = false;
    }
  }

  function openConfirmAction({ title, message, type = 'warning', action }) {
    confirmState.open = true;
    confirmState.title = title;
    confirmState.message = message;
    confirmState.type = type;
    confirmState.action = action;
  }

  async function executeConfirmAction() {
    if (!confirmState.action || confirmState.loading) return;
    confirmState.loading = true;
    try {
      await confirmState.action();
      confirmState.open = false;
      confirmState.action = null;
    } finally {
      confirmState.loading = false;
    }
  }

  function closeConfirmAction() {
    if (confirmState.loading) return;
    confirmState.open = false;
    confirmState.action = null;
  }

  function requestApproveReward(reward) {
    openConfirmAction({
      title: 'اعتماد المكافأة',
      message: 'هل تريد اعتماد هذه المكافأة؟',
      type: 'info',
      action: async () => {
        try {
          await projectRewardService.approveReward(reward.id);
          toast.success('تم اعتماد المكافأة بنجاح');
          if (selectedReward.value?.id === reward.id) selectedReward.value = await projectRewardService.showReward(reward.id);
          await loadRewards();
        } catch (error) {
          toast.error(mapRewardApiMessage(error, 'تعذر اعتماد المكافأة.'));
        }
      },
    });
  }

  function requestMarkPaid(reward) {
    openConfirmAction({
      title: 'تعليم كمدفوعة',
      message: 'هل تريد تعليم هذه المكافأة كمدفوعة؟',
      type: 'warning',
      action: async () => {
        try {
          await projectRewardService.markRewardPaid(reward.id);
          toast.success('تم تعليم المكافأة كمدفوعة');
          if (selectedReward.value?.id === reward.id) selectedReward.value = await projectRewardService.showReward(reward.id);
          await loadRewards();
        } catch (error) {
          toast.error(mapRewardApiMessage(error, 'تعذر تحديث حالة الدفع.'));
        }
      },
    });
  }

  function openRejectReward(reward) {
    rejectState.open = true;
    rejectState.rewardId = String(reward.id || '');
    rejectState.reason = '';
  }

  async function submitRejectReward() {
    if (!rejectState.rewardId || rejectState.loading) return;
    rejectState.loading = true;
    try {
      await projectRewardService.rejectReward(rejectState.rewardId, rejectState.reason || 'تم الرفض من الواجهة');
      toast.success('تم رفض المكافأة');
      if (selectedReward.value?.id === rejectState.rewardId) {
        selectedReward.value = await projectRewardService.showReward(rejectState.rewardId);
      }
      await loadRewards();
      rejectState.open = false;
      rejectState.rewardId = '';
      rejectState.reason = '';
    } catch (error) {
      toast.error(mapRewardApiMessage(error, 'تعذر رفض المكافأة.'));
    } finally {
      rejectState.loading = false;
    }
  }

  function closeRejectReward() {
    if (rejectState.loading) return;
    rejectState.open = false;
    rejectState.rewardId = '';
    rejectState.reason = '';
  }

  const salaryRouteAvailable = computed(() => canViewSalaries.value);

  function openSalariesPage() {
    if (!salaryRouteAvailable.value) return;
    router.push({ name: 'AccountingSalaries' });
  }

  return {
    loading,
    loadError,
    settingsLoading,
    savingSetting,
    activatingSetting,
    previewLoading,
    generatingReward,
    rewardsLoading,
    rewardDetailLoading,
    employeesLoading,
    reservationsLoading,
    project,
    projectName,
    projectContractNumber,
    projectSaiSourceValue,
    projectSaiSourceLabel,
    projectSaiPercentageDisplay,
    settingsHistory,
    settingId,
    settingStatus,
    settingStatusLabel,
    lastUpdatedAt,
    rewards,
    rewardsTotal,
    selectedReward,
    showRewardDetailsModal,
    employees,
    employeeOptions,
    reservations,
    selectedReservation,
    form,
    errors,
    previewState,
    rewardsFilters,
    confirmState,
    rejectState,
    canViewSettings,
    canManageSettings,
    canViewRewards,
    canManageRewards,
    canApproveRewards,
    canPayRewards,
    canViewSalaries,
    activeSetting,
    distributionTotal,
    remainingDistribution,
    distributionBlockingError,
    degreeMatrixRows,
    previewSummaryCards,
    previewResult: latestPreviewResult,
    previewRecipients,
    unresolvedItems,
    previewHasUnresolved,
    canGenerateReward,
    rewardSourceOptions: REWARD_SOURCE_OPTIONS,
    calculationModeOptions: CALCULATION_MODE_OPTIONS,
    degreeOptions: DEGREE_OPTIONS,
    operationFields: OPERATION_FIELDS,
    scopeFields: SCOPE_FIELDS,
    managementRoles: MANAGEMENT_ROLES,
    unsupportedText: UNSUPPORTED_TEXT,
    rewardSourceLabel,
    rewardStatusLabel,
    rewardStatusClass,
    sourceScopeLabel,
    sourceTypeLabel,
    unresolvedReasonLabel,
    managementPreviewAmount,
    managementTotalPreview,
    formatMoney,
    formatPercent,
    displayPercent,
    formatDate,
    saveSettings,
    activateSetting,
    previewRewardAction,
    generateRewardAction,
    loadRewards,
    openRewardDetails,
    openConfirmAction,
    executeConfirmAction,
    closeConfirmAction,
    requestApproveReward,
    requestMarkPaid,
    openRejectReward,
    submitRejectReward,
    closeRejectReward,
    salaryRouteAvailable,
    openSalariesPage,
    init,
  };
}
