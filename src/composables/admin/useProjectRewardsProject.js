import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { PERMISSIONS } from '@/constants/permissions';
import {
  CALCULATION_MODE_OPTIONS,
  DEGREE_OPTIONS,
  MANAGEMENT_ROLES,
  OPERATION_FIELDS,
  PROJECT_SAI_PERCENTAGE_KEYS,
  PROJECT_SAI_SOURCE_KEYS,
  REWARD_SOURCE_OPTIONS,
  SCOPE_FIELDS,
  UNAVAILABLE_TEXT,
  UNSUPPORTED_TEXT,
} from '@/composables/admin/projectRewards/projectRewardConstants';
import {
  buildDegreeMatrixRows,
  displayPercent,
  emptyRewardForm,
  firstDefinedValue,
  formatDate,
  formatMoney,
  formatPercent,
  normalizeEmployeeLabel,
  normalizeProjectSaiSource,
  normalizeRewardSource,
  projectSaiSourceLabelFromValue,
  rewardSourceLabel,
  rewardStatusClass,
  rewardStatusLabel,
  sourceScopeLabel,
  sourceTypeLabel,
  toNumberOrNull,
  unresolvedReasonLabel,
} from '@/composables/admin/projectRewards/projectRewardUtils';
import { createProjectRewardActions } from '@/composables/admin/projectRewards/projectRewardActions';

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
    hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARD_SETTINGS_VIEW) ||
    hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_VIEW)
  );
  const canManageSettings = computed(() =>
    hasPermission(PERMISSIONS.ACCOUNTING_PROJECT_REWARD_SETTINGS_MANAGE) ||
    hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_MANAGE)
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

  const projectSaiSourceValue = computed(() =>
    normalizeProjectSaiSource(firstDefinedValue(project.value, PROJECT_SAI_SOURCE_KEYS))
  );
  const projectSaiSourceLabel = computed(() => projectSaiSourceLabelFromValue(projectSaiSourceValue.value));
  const projectSaiPercentageValue = computed(() =>
    toNumberOrNull(firstDefinedValue(project.value, PROJECT_SAI_PERCENTAGE_KEYS))
  );
  const projectSaiPercentageDisplay = computed(() =>
    projectSaiPercentageValue.value == null ? UNAVAILABLE_TEXT : `${projectSaiPercentageValue.value}%`
  );

  const activeSetting = computed(() => {
    const list = Array.isArray(settingsHistory.value) ? settingsHistory.value : [];
    return list.find(item => item?.is_active === true || item?.is_active === 1 || item?.is_active === '1') || list[0] || null;
  });

  const settingStatus = computed(() => {
    if (activeSetting.value && (activeSetting.value?.is_active === true || activeSetting.value?.is_active === 1 || activeSetting.value?.is_active === '1')) {
      return 'active';
    }
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
    return formatDate(value);
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
  const degreeMatrixRows = computed(() => buildDegreeMatrixRows(form));

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

    const bringPercent = toNumberOrNull(form[role.bringKey]) || 0;
    const convincePercent = toNumberOrNull(form[role.convinceKey]) || 0;
    const closePercent = toNumberOrNull(form[role.closeKey]) || 0;
    const totalPercentage = bringPercent + convincePercent + closePercent;

    if (totalPercentage === 0) return null;
    return (poolAmount * totalPercentage) / 100;
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

  const salaryRouteAvailable = computed(() => canViewSalaries.value);

  const rewardActions = createProjectRewardActions({
    contractId,
    canManageSettings,
    canManageRewards,
    canViewRewards,
    activeSetting,
    distributionBlockingError,
    latestPreviewResult,
    previewHasUnresolved,
    previewPoolAmount,
    previewRecipients,
    canGenerateReward,
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
    settingsHistory,
    settingId,
    rewards,
    rewardsTotal,
    selectedReward,
    showRewardDetailsModal,
    employees,
    reservations,
    form,
    errors,
    previewState,
    rewardsFilters,
    confirmState,
    rejectState,
    clearErrors,
    setError,
    mapRewardApiMessage,
    validateSettings,
    buildSettingPayload,
    router,
  });

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
    saveSettings: rewardActions.saveSettings,
    activateSetting: rewardActions.activateSetting,
    previewRewardAction: rewardActions.previewRewardAction,
    generateRewardAction: rewardActions.generateRewardAction,
    loadRewards: rewardActions.loadRewards,
    openRewardDetails: rewardActions.openRewardDetails,
    openConfirmAction: rewardActions.openConfirmAction,
    executeConfirmAction: rewardActions.executeConfirmAction,
    closeConfirmAction: rewardActions.closeConfirmAction,
    requestApproveReward: rewardActions.requestApproveReward,
    requestMarkPaid: rewardActions.requestMarkPaid,
    openRejectReward: rewardActions.openRejectReward,
    submitRejectReward: rewardActions.submitRejectReward,
    closeRejectReward: rewardActions.closeRejectReward,
    salaryRouteAvailable,
    openSalariesPage: rewardActions.openSalariesPage,
    init: rewardActions.init,
  };
}
