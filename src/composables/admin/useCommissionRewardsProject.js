import { computed, reactive, ref } from 'vue';
import { toast } from '@/composables/useToast';
import { usePermissions } from '@/composables/usePermissions';
import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import {
  activateProjectCommissionSetting,
  createProjectCommissionSetting,
  listProjectCommissionSettings,
  previewProjectCommission,
  updateProjectCommissionSetting,
} from '@/services/commissionsApi';
import {
  COMMISSION_CONTRIBUTION_TYPES,
  COMMISSION_SOURCE_LABEL,
  COMMISSION_WEIGHT_OPTIONS,
} from '@/constants/commissionsRewards';
import { PERMISSIONS } from '@/constants/permissions';

const PROJECT_SAI_SOURCE_LABEL = {
  buyer: 'من المشتري',
  owner: 'من المالك',
};

const PROJECT_SAI_UNAVAILABLE_LABEL = 'غير متوفر من بيانات المشروع';

export function useCommissionRewardsProject(projectId) {
  const { hasPermission } = usePermissions();

  const loading = ref(false);
  const loadError = ref(false);
  const saving = ref(false);
  const activating = ref(false);

  const canManage = computed(() => hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_MANAGE));

  const project = ref(null);
  const projectName = computed(() => {
    const id = String(projectId.value || '').trim();
    return (
      project.value?.name ||
      project.value?.project_name ||
      project.value?.title ||
      `مشروع #${id}`
    );
  });

  const settingsHistory = ref([]);
  const settingId = ref('');
  const isActiveSetting = ref(false);

  const contributionTypes = COMMISSION_CONTRIBUTION_TYPES;
  const weightOptions = COMMISSION_WEIGHT_OPTIONS;

  const weightLabelByValue = computed(() => {
    /** @type {Record<string, string>} */
    const map = {};
    for (const w of weightOptions) {
      map[String(w.value)] = w.label;
    }
    return map;
  });

  const matrixScopes = [
    { key: 'assigned', label: 'فريق المشروع' },
    { key: 'outside', label: 'خارج فريق المشروع' },
  ];

  const managementRoles = [
    { key: 'ceo', label: 'المدير التنفيذي', userKey: 'ceo_user_id', percentKey: 'ceo_percentage' },
    { key: 'sales_manager', label: 'مدير التسويق والمبيعات', userKey: 'sales_manager_user_id', percentKey: 'sales_manager_percentage' },
    { key: 'sales_leader', label: 'السيلز ليدر', userKey: 'sales_leader_user_id', percentKey: 'sales_leader_percentage' },
    { key: 'group_leader', label: 'قائد المجموعة / الجروب ليدر', userKey: 'group_leader_user_id', percentKey: 'group_leader_percentage' },
    { key: 'external_marketer', label: 'المسوق الخارجي', userKey: 'external_marketer_user_id', percentKey: 'external_marketer_percentage' },
  ];

  function emptyForm() {
    return {
      project_id: String(projectId.value || '').trim(),
      commission_source: 'buyer',
      commission_percentage: '',
      is_active: true,
      assigned_bring_percentage: '',
      assigned_convince_percentage: '',
      assigned_close_percentage: '',
      outside_bring_percentage: '',
      outside_convince_percentage: '',
      outside_close_percentage: '',
      ceo_user_id: '',
      ceo_percentage: '',
      sales_manager_user_id: '',
      sales_manager_percentage: '',
      sales_leader_user_id: '',
      sales_leader_percentage: '',
      group_leader_user_id: '',
      group_leader_percentage: '',
      external_marketer_user_id: '',
      external_marketer_percentage: '',
    };
  }

  const form = reactive(emptyForm());
  const errors = reactive({});

  const preview = reactive({
    base_amount: '',
    project_commission_amount: null,
    formula_key: null,
  });
  const previewLoading = ref(false);
  const previewError = ref('');

  const employeesLoading = ref(false);
  const employees = ref([]);

  function weightLabel(value) {
    return weightLabelByValue.value[String(value)] || 'كامل';
  }

  function normalizeSaiSource(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'buyer' || normalized === 'owner') return normalized;
    return '';
  }

  function firstProjectValue(keys) {
    const source = project.value ?? {};
    for (const key of keys) {
      const value = key.split('.').reduce((acc, part) => acc?.[part], source);
      if (value !== null && value !== undefined && value !== '') return value;
    }
    return null;
  }

  const projectSaiSourceValue = computed(() =>
    normalizeSaiSource(
      firstProjectValue([
        'commission_from',
        'commission_source',
        'contract.commission_from',
        'contract.commission_source',
        'contract_info.commission_from',
        'contract_info.commission_source',
      ])
    )
  );

  const projectSaiSourceLabel = computed(() =>
    PROJECT_SAI_SOURCE_LABEL[projectSaiSourceValue.value] ?? PROJECT_SAI_UNAVAILABLE_LABEL
  );

  const projectSaiPercentageValue = computed(() => {
    const rawValue = firstProjectValue([
      'commission_percent',
      'commission_percentage',
      'contract.commission_percent',
      'contract.commission_percentage',
      'contract_info.commission_percent',
      'contract_info.commission_percentage',
    ]);
    return toNumberOrNull(rawValue);
  });

  const projectSaiPercentageDisplay = computed(() =>
    projectSaiPercentageValue.value == null
      ? PROJECT_SAI_UNAVAILABLE_LABEL
      : `${projectSaiPercentageValue.value}%`
  );

  function toNumberOrNull(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function sumPercents(list) {
    return list.reduce((acc, v) => acc + (toNumberOrNull(v) ?? 0), 0);
  }

  const assignedTotal = computed(() => sumPercents([
    form.assigned_bring_percentage,
    form.assigned_convince_percentage,
    form.assigned_close_percentage,
  ]));
  const outsideTotal = computed(() => sumPercents([
    form.outside_bring_percentage,
    form.outside_convince_percentage,
    form.outside_close_percentage,
  ]));
  const managementTotal = computed(() => sumPercents(managementRoles.map(r => form[r.percentKey])));
  const totalDistribution = computed(() => assignedTotal.value + outsideTotal.value + managementTotal.value);
  const blockingError = computed(() => totalDistribution.value > 100);

  function sourceLabel(v) {
    return COMMISSION_SOURCE_LABEL[String(v || '')] ?? '—';
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-SA').format(d);
  }

  const moneyFmt = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' });
  function formatMoney(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return moneyFmt.format(n);
  }

  function formatPercent(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return `${n}%`;
  }
  function displayPercent(v) {
    const n = toNumberOrNull(v);
    return n == null ? '—' : `${n}%`;
  }

  function weightedPercent(base, weight) {
    const n = toNumberOrNull(base);
    if (n == null) return null;
    return Number((n * Number(weight)).toFixed(4));
  }

  function weightedAmount(base, weight) {
    if (preview.project_commission_amount == null) return null;
    const p = weightedPercent(base, weight);
    if (p == null) return null;
    return (Number(preview.project_commission_amount) * p) / 100;
  }

  function basePercent(scope, type) {
    const key = scope === 'assigned' ? `assigned_${type}_percentage` : `outside_${type}_percentage`;
    return form[key];
  }

  function clearErrors() {
    for (const k of Object.keys(errors)) delete errors[k];
  }

  function setError(key, message) {
    errors[key] = message;
  }

  function validate() {
    clearErrors();
    const percentKeys = [
      'commission_percentage',
      'assigned_bring_percentage',
      'assigned_convince_percentage',
      'assigned_close_percentage',
      'outside_bring_percentage',
      'outside_convince_percentage',
      'outside_close_percentage',
      ...managementRoles.map(r => r.percentKey),
    ];

    for (const k of percentKeys) {
      const n = toNumberOrNull(form[k]);
      if (n == null) continue;
      if (n < 0 || n > 100) setError(k, 'النسبة يجب أن تكون بين 0 و 100');
    }

    const commissionSource = normalizeSaiSource(form.commission_source);
    if (commissionSource && commissionSource !== 'buyer' && commissionSource !== 'owner') {
      setError('commission_source', 'هذا الحقل مطلوب');
    }

    if (blockingError.value) {
      setError('total', 'إجمالي نسب التوزيع يتجاوز 100%');
    }

    for (const r of managementRoles) {
      const percent = toNumberOrNull(form[r.percentKey]) ?? 0;
      const userId = String(form[r.userKey] || '').trim();
      if (percent > 0 && !userId) {
        setError(r.userKey, 'يجب اختيار الموظف عند إدخال نسبة أكبر من صفر');
      }
    }

    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    const id = String(projectId.value || '').trim();
    return {
      project_id: Number(id),
      commission_source: normalizeSaiSource(form.commission_source) || null,
      commission_percentage: toNumberOrNull(form.commission_percentage),
      is_active: !!form.is_active,
      assigned_bring_percentage: toNumberOrNull(form.assigned_bring_percentage),
      assigned_convince_percentage: toNumberOrNull(form.assigned_convince_percentage),
      assigned_close_percentage: toNumberOrNull(form.assigned_close_percentage),
      outside_bring_percentage: toNumberOrNull(form.outside_bring_percentage),
      outside_convince_percentage: toNumberOrNull(form.outside_convince_percentage),
      outside_close_percentage: toNumberOrNull(form.outside_close_percentage),
      ceo_user_id: form.ceo_user_id ? Number(form.ceo_user_id) : null,
      ceo_percentage: toNumberOrNull(form.ceo_percentage),
      sales_manager_user_id: form.sales_manager_user_id ? Number(form.sales_manager_user_id) : null,
      sales_manager_percentage: toNumberOrNull(form.sales_manager_percentage),
      sales_leader_user_id: form.sales_leader_user_id ? Number(form.sales_leader_user_id) : null,
      sales_leader_percentage: toNumberOrNull(form.sales_leader_percentage),
      group_leader_user_id: form.group_leader_user_id ? Number(form.group_leader_user_id) : null,
      group_leader_percentage: toNumberOrNull(form.group_leader_percentage),
      external_marketer_user_id: form.external_marketer_user_id ? Number(form.external_marketer_user_id) : null,
      external_marketer_percentage: toNumberOrNull(form.external_marketer_percentage),
    };
  }

  function hydrateFormFromSetting(s) {
    const next = emptyForm();
    for (const k of Object.keys(next)) {
      if (k === 'project_id') continue;
      if (k === 'is_active') next[k] = !!s?.is_active;
      else next[k] = s?.[k] ?? next[k];
    }
    for (const k of Object.keys(next)) {
      if (k.endsWith('_user_id')) next[k] = next[k] ? String(next[k]) : '';
      else if (typeof next[k] === 'number') next[k] = String(next[k]);
    }
    Object.assign(form, next);
  }

  function syncReadOnlySaiFields() {
    const source = projectSaiSourceValue.value;
    const percentage = projectSaiPercentageValue.value;

    form.commission_source = source || '';
    form.commission_percentage = percentage == null ? '' : String(percentage);
  }

  async function loadEmployees() {
    employeesLoading.value = true;
    try {
      const res = await userService.getEmployees({ per_page: 500 });
      employees.value = res?.items ?? [];
    } finally {
      employeesLoading.value = false;
    }
  }

  async function loadProjectAndSettings() {
    loading.value = true;
    loadError.value = false;
    try {
      const [proj, settingsRes] = await Promise.all([
        marketingService.getProjectByContractId(projectId.value),
        listProjectCommissionSettings({ project_id: projectId.value, per_page: 100 }),
      ]);
      project.value = proj || null;
      const items = settingsRes?.items ?? [];
      settingsHistory.value = Array.isArray(items) ? items : [];
      const active =
        settingsHistory.value.find(s => s?.is_active === true || s?.is_active === 1 || s?.is_active === '1') ||
        null;
      const chosen = active || (settingsHistory.value.length ? settingsHistory.value[0] : null);
      if (chosen) {
        settingId.value = String(chosen.id || '');
        isActiveSetting.value = !!active;
        hydrateFormFromSetting(chosen);
      } else {
        settingId.value = '';
        isActiveSetting.value = false;
        Object.assign(form, emptyForm());
      }
      syncReadOnlySaiFields();
    } catch (_) {
      loadError.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function runPreview() {
    previewError.value = '';
    const base = toNumberOrNull(preview.base_amount);
    if (base == null || base <= 0) {
      previewError.value = 'أدخل مبلغًا صحيحًا أكبر من صفر.';
      return;
    }
    const commission = toNumberOrNull(form.commission_percentage);
    if (commission == null) {
      previewError.value = 'أدخل نسبة العمولة الأساسية أولاً.';
      return;
    }
    previewLoading.value = true;
    try {
      const data = await previewProjectCommission(projectId.value, { base_amount: base });
      preview.project_commission_amount =
        data?.project_commission_amount ?? data?.commission_amount ?? data?.amount ?? null;
      preview.formula_key = data?.formula_key ?? data?.calculation_formula_key ?? null;
      toast.success('تم حساب المعاينة بنجاح.');
    } catch (_) {
      preview.project_commission_amount = null;
      preview.formula_key = null;
      previewError.value = 'تعذر تحميل معاينة العمولة. تأكد من البيانات وحاول مرة أخرى.';
    } finally {
      previewLoading.value = false;
    }
  }

  async function save() {
    if (!canManage.value) return;
    if (!validate()) {
      toast.error(errors.total || 'تحقق من الحقول ثم حاول مرة أخرى.');
      return;
    }
    saving.value = true;
    try {
      const payload = buildPayload();
      if (settingId.value) {
        await updateProjectCommissionSetting(settingId.value, payload);
      } else {
        const created = await createProjectCommissionSetting(payload);
        settingId.value = String(created?.id || '');
      }
      await loadProjectAndSettings();
      toast.success('تم حفظ إعداد العمولات والمكافآت بنجاح');
    } catch (_) {
      toast.error('تعذر حفظ الإعداد. حاول مرة أخرى.');
    } finally {
      saving.value = false;
    }
  }

  async function activate() {
    if (!canManage.value) return;
    if (!settingId.value) return;
    activating.value = true;
    try {
      await activateProjectCommissionSetting(settingId.value);
      await loadProjectAndSettings();
      toast.success('تم تفعيل إعداد العمولات لهذا المشروع');
    } catch (_) {
      toast.error('تعذر تفعيل الإعداد. حاول مرة أخرى.');
    } finally {
      activating.value = false;
    }
  }

  async function init() {
    await Promise.all([loadEmployees(), loadProjectAndSettings()]);
  }

  return {
    loading,
    loadError,
    saving,
    activating,
    canManage,
    project,
    projectName,
    settingsHistory,
    settingId,
    isActiveSetting,
    form,
    errors,
    preview,
    previewLoading,
    previewError,
    employeesLoading,
    employees,
    contributionTypes,
    weightOptions,
    weightLabel,
    matrixScopes,
    managementRoles,
    assignedTotal,
    outsideTotal,
    managementTotal,
    totalDistribution,
    blockingError,
    projectSaiSourceValue,
    projectSaiSourceLabel,
    projectSaiPercentageValue,
    projectSaiPercentageDisplay,
    sourceLabel,
    formatDate,
    formatMoney,
    formatPercent,
    displayPercent,
    weightedPercent,
    weightedAmount,
    basePercent,
    runPreview,
    save,
    activate,
    init,
  };
}
