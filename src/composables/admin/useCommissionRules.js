import { computed, reactive, ref, watch } from 'vue';
import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import {
  activateProjectCommissionSetting,
  createProjectCommissionSetting,
  getProjectCommissionSetting,
  listProjectCommissionSettings,
  previewProjectCommission,
  updateProjectCommissionSetting,
} from '@/services/commissionsApi';

export const SALE_CONTRIBUTION_TYPES = [
  { value: 'bring', label: 'جلب' },
  { value: 'convince', label: 'إقناع' },
  { value: 'close', label: 'إقفال' },
  { value: 'half_bring', label: 'نصف جلب' },
  { value: 'half_convince', label: 'نصف إقناع' },
  { value: 'half_close', label: 'نصف إقفال' },
  { value: 'quarter_bring', label: 'ربع جلب' },
  { value: 'quarter_convince', label: 'ربع إقناع' },
  { value: 'quarter_close', label: 'ربع إقفال' },
];

const MVP_OPS = /** @type {const} */ (['bring', 'convince', 'close']);
const UI_ONLY_OPS = /** @type {const} */ ([
  'half_bring',
  'half_convince',
  'half_close',
  'quarter_bring',
  'quarter_convince',
  'quarter_close',
]);

const MANAGEMENT_FIELDS = [
  { key: 'ceo', label: 'المدير التنفيذي' },
  { key: 'sales_manager', label: 'مدير التسويق والمبيعات' },
  { key: 'sales_leader', label: 'سيلز ليدر' },
  { key: 'group_leader', label: 'جروب ليدر / مدير المجموعة' },
  { key: 'external_marketer', label: 'المسوق الخارجي' },
];

function blankOps() {
  return {
    bring: null,
    convince: null,
    close: null,
    half_bring: null,
    half_convince: null,
    half_close: null,
    quarter_bring: null,
    quarter_convince: null,
    quarter_close: null,
  };
}

function blankManagement() {
  return {
    ceo_user_id: '',
    ceo_percentage: null,
    sales_manager_user_id: '',
    sales_manager_percentage: null,
    sales_leader_user_id: '',
    sales_leader_percentage: null,
    group_leader_user_id: '',
    group_leader_percentage: null,
    external_marketer_user_id: '',
    external_marketer_percentage: null,
  };
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStringId(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function percentIsValid(value) {
  if (value === null || value === undefined || value === '') return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

export function useCommissionRules() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const canViewAccounting = computed(() =>
    hasAnyPermission([
      PERMISSIONS.ACCOUNTING_SOLD_UNITS_VIEW,
      PERMISSIONS.ACCOUNTING_SOLD_UNITS_MANAGE,
    ])
  );
  const canManageAccounting = computed(() =>
    hasPermission(PERMISSIONS.ACCOUNTING_SOLD_UNITS_MANAGE)
  );

  const projects = ref([]);
  const projectsLoading = ref(false);
  const selectedProjectId = ref('');
  const selectedProject = ref(null);

  const employees = ref([]);
  const employeesLoading = ref(false);

  const settingsList = ref([]);
  const settingsLoading = ref(false);
  const activeSetting = ref(null);
  const activeSettingId = ref('');

  const form = reactive({
    commission_source: 'buyer',
    commission_percentage: null,
    assigned_ops: blankOps(),
    outside_ops: blankOps(),
    management: blankManagement(),
  });

  const previewBaseAmount = ref(null);
  const previewBusy = ref(false);
  const previewResult = ref(null);

  const saveBusy = ref(false);
  const activateBusy = ref(false);

  const activeTab = ref('assigned'); // assigned|outside|management|preview
  const dirty = ref(false);
  const isHydrating = ref(false);

  const projectDisplayName = computed(() => {
    if (!selectedProjectId.value) return '—';
    const p = selectedProject.value || {};
    return p.name ?? p.project_name ?? p.contract_name ?? `#${selectedProjectId.value}`;
  });

  const activeSettingBadge = computed(() => {
    if (!activeSetting.value) return null;
    const id = activeSetting.value.id ?? activeSetting.value.setting_id ?? activeSettingId.value;
    return `#${id}`;
  });

  const assignedMvpTotal = computed(() =>
    MVP_OPS.reduce((sum, key) => sum + (Number(form.assigned_ops[key]) || 0), 0)
  );
  const outsideMvpTotal = computed(() =>
    MVP_OPS.reduce((sum, key) => sum + (Number(form.outside_ops[key]) || 0), 0)
  );
  const managementTotal = computed(() => {
    const m = form.management;
    return (
      (Number(m.ceo_percentage) || 0) +
      (Number(m.sales_manager_percentage) || 0) +
      (Number(m.sales_leader_percentage) || 0) +
      (Number(m.group_leader_percentage) || 0) +
      (Number(m.external_marketer_percentage) || 0)
    );
  });

  const validationErrors = computed(() => {
    /** @type {Record<string, string>} */
    const errors = {};

    if (!selectedProjectId.value) {
      errors.project_id = 'اختر مشروعاً أولاً';
    }

    if (!percentIsValid(form.commission_percentage)) {
      errors.commission_percentage = 'يجب أن تكون النسبة بين 0 و 100';
    }

    for (const bucket of ['assigned_ops', 'outside_ops']) {
      for (const field of [...MVP_OPS, ...UI_ONLY_OPS]) {
        if (!percentIsValid(form[bucket][field])) {
          errors[`${bucket}.${field}`] = 'قيمة غير صحيحة (0 - 100)';
        }
      }
    }

    for (const role of MANAGEMENT_FIELDS) {
      const pctKey = `${role.key}_percentage`;
      const userKey = `${role.key}_user_id`;
      const pct = toNullableNumber(form.management[pctKey]);

      if (!percentIsValid(pct)) {
        errors[`management.${pctKey}`] = 'قيمة غير صحيحة (0 - 100)';
        continue;
      }

      if ((pct || 0) > 0 && !toStringId(form.management[userKey])) {
        errors[`management.${userKey}`] = 'اختر مستخدماً لهذا الحقل';
      }
    }

    if (managementTotal.value > 100) {
      errors.management_total = 'إجمالي نسب الإدارة يتجاوز 100%';
    }

    return errors;
  });

  const canSave = computed(() => {
    if (!canManageAccounting.value) return false;
    if (!selectedProjectId.value) return false;
    return Object.keys(validationErrors.value).length === 0;
  });

  const loadProjects = async () => {
    projectsLoading.value = true;
    try {
      const res = await marketingService.getProjects({ per_page: 200 });
      const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      projects.value = list;
    } catch (e) {
      projects.value = [];
      toast.error(getApiErrorMessage(e, 'تعذر تحميل قائمة المشاريع'));
    } finally {
      projectsLoading.value = false;
    }
  };

  const loadEmployees = async () => {
    employeesLoading.value = true;
    try {
      const res = await userService.getEmployees({ per_page: 500 });
      employees.value = Array.isArray(res?.items) ? res.items : [];
    } catch (e) {
      employees.value = [];
      toast.error(getApiErrorMessage(e, 'تعذر تحميل قائمة الموظفين'));
    } finally {
      employeesLoading.value = false;
    }
  };

  function resetForm() {
    form.commission_source = 'buyer';
    form.commission_percentage = null;
    form.assigned_ops = blankOps();
    form.outside_ops = blankOps();
    form.management = blankManagement();
    dirty.value = false;
    previewResult.value = null;
    previewBaseAmount.value = null;
  }

  function applySettingToForm(setting) {
    isHydrating.value = true;
    resetForm();
    if (!setting) {
      isHydrating.value = false;
      return;
    }

    form.commission_source = setting.commission_source ?? 'buyer';
    form.commission_percentage = toNullableNumber(setting.commission_percentage);

    form.assigned_ops.bring = toNullableNumber(setting.assigned_bring_percentage);
    form.assigned_ops.convince = toNullableNumber(setting.assigned_convince_percentage);
    form.assigned_ops.close = toNullableNumber(setting.assigned_close_percentage);

    form.outside_ops.bring = toNullableNumber(setting.outside_bring_percentage);
    form.outside_ops.convince = toNullableNumber(setting.outside_convince_percentage);
    form.outside_ops.close = toNullableNumber(setting.outside_close_percentage);

    form.management.ceo_user_id = toStringId(setting.ceo_user_id);
    form.management.ceo_percentage = toNullableNumber(setting.ceo_percentage);
    form.management.sales_manager_user_id = toStringId(setting.sales_manager_user_id);
    form.management.sales_manager_percentage = toNullableNumber(setting.sales_manager_percentage);
    form.management.sales_leader_user_id = toStringId(setting.sales_leader_user_id);
    form.management.sales_leader_percentage = toNullableNumber(setting.sales_leader_percentage);
    form.management.group_leader_user_id = toStringId(setting.group_leader_user_id);
    form.management.group_leader_percentage = toNullableNumber(setting.group_leader_percentage);
    form.management.external_marketer_user_id = toStringId(setting.external_marketer_user_id);
    form.management.external_marketer_percentage = toNullableNumber(setting.external_marketer_percentage);

    dirty.value = false;
    isHydrating.value = false;
  }

  const loadProjectContext = async () => {
    const projectId = selectedProjectId.value;
    if (!projectId) {
      selectedProject.value = null;
      settingsList.value = [];
      activeSetting.value = null;
      activeSettingId.value = '';
      isHydrating.value = true;
      resetForm();
      isHydrating.value = false;
      return;
    }

    try {
      selectedProject.value = await marketingService.getProjectById(projectId);
    } catch {
      selectedProject.value =
        projects.value.find(p => String(p?.contract_id ?? p?.id ?? '') === String(projectId)) ?? null;
    }

    if (!canViewAccounting.value) {
      settingsList.value = [];
      activeSetting.value = null;
      activeSettingId.value = '';
      isHydrating.value = true;
      resetForm();
      isHydrating.value = false;
      return;
    }

    settingsLoading.value = true;
    try {
      const { items } = await listProjectCommissionSettings({ project_id: projectId, per_page: 50 });
      settingsList.value = Array.isArray(items) ? items : [];

      const active = settingsList.value.find(s => !!s?.is_active) ?? null;
      activeSettingId.value = toStringId(active?.id);

      if (activeSettingId.value) {
        const full = await getProjectCommissionSetting(activeSettingId.value);
        activeSetting.value = full ?? active;
        applySettingToForm(activeSetting.value);
      } else {
        activeSetting.value = null;
        isHydrating.value = true;
        resetForm();
        isHydrating.value = false;
      }
    } catch (e) {
      settingsList.value = [];
      activeSetting.value = null;
      activeSettingId.value = '';
      isHydrating.value = true;
      resetForm();
      isHydrating.value = false;
      toast.error(getApiErrorMessage(e, 'تعذر تحميل إعدادات عمولة المشروع'));
    } finally {
      settingsLoading.value = false;
    }
  };

  function buildPayload() {
    const projectId = selectedProjectId.value;
    const ceoPct = toNullableNumber(form.management.ceo_percentage) || 0;
    const salesManagerPct = toNullableNumber(form.management.sales_manager_percentage) || 0;
    const salesLeaderPct = toNullableNumber(form.management.sales_leader_percentage) || 0;
    const groupLeaderPct = toNullableNumber(form.management.group_leader_percentage) || 0;
    const externalMarketerPct = toNullableNumber(form.management.external_marketer_percentage) || 0;
    return {
      project_id: projectId ? Number(projectId) : null,
      commission_source: form.commission_source,
      commission_percentage: toNullableNumber(form.commission_percentage),

      assigned_bring_percentage: toNullableNumber(form.assigned_ops.bring),
      assigned_convince_percentage: toNullableNumber(form.assigned_ops.convince),
      assigned_close_percentage: toNullableNumber(form.assigned_ops.close),

      outside_bring_percentage: toNullableNumber(form.outside_ops.bring),
      outside_convince_percentage: toNullableNumber(form.outside_ops.convince),
      outside_close_percentage: toNullableNumber(form.outside_ops.close),

      ceo_user_id: ceoPct > 0 ? Number(form.management.ceo_user_id) : null,
      ceo_percentage: toNullableNumber(form.management.ceo_percentage),

      sales_manager_user_id: salesManagerPct > 0 ? Number(form.management.sales_manager_user_id) : null,
      sales_manager_percentage: toNullableNumber(form.management.sales_manager_percentage),

      sales_leader_user_id: salesLeaderPct > 0 ? Number(form.management.sales_leader_user_id) : null,
      sales_leader_percentage: toNullableNumber(form.management.sales_leader_percentage),

      group_leader_user_id: groupLeaderPct > 0 ? Number(form.management.group_leader_user_id) : null,
      group_leader_percentage: toNullableNumber(form.management.group_leader_percentage),

      external_marketer_user_id: externalMarketerPct > 0 ? Number(form.management.external_marketer_user_id) : null,
      external_marketer_percentage: toNullableNumber(form.management.external_marketer_percentage),
    };
  }

  const save = async () => {
    if (!canManageAccounting.value) {
      toast.warning('لا توجد صلاحية لإدارة إعدادات العمولات');
      return;
    }
    if (!selectedProjectId.value) {
      toast.warning('اختر مشروعاً أولاً');
      return;
    }
    const errors = validationErrors.value;
    if (Object.keys(errors).length) {
      toast.error('تحقق من القيم المدخلة قبل الحفظ');
      return;
    }

    saveBusy.value = true;
    try {
      const payload = buildPayload();
      const id = activeSettingId.value;
      if (id) {
        await updateProjectCommissionSetting(id, payload);
      } else {
        const created = await createProjectCommissionSetting(payload);
        activeSettingId.value = toStringId(created?.id);
      }
      toast.success('تم حفظ نسب العمولات بنجاح');
      dirty.value = false;
      await loadProjectContext();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر حفظ نسب العمولات'));
    } finally {
      saveBusy.value = false;
    }
  };

  const activate = async () => {
    if (!canManageAccounting.value) {
      toast.warning('لا توجد صلاحية لتفعيل الإعداد');
      return;
    }
    if (!activeSettingId.value) {
      toast.warning('لا يوجد إعداد محفوظ لتفعيله');
      return;
    }

    activateBusy.value = true;
    try {
      await activateProjectCommissionSetting(activeSettingId.value);
      toast.success('تم تفعيل الإعداد بنجاح');
      await loadProjectContext();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر تفعيل الإعداد'));
    } finally {
      activateBusy.value = false;
    }
  };

  const runPreview = async () => {
    if (!canViewAccounting.value) {
      toast.warning('لا توجد صلاحية لعرض المعاينة');
      return;
    }
    if (!selectedProjectId.value) {
      toast.warning('اختر مشروعاً أولاً');
      return;
    }
    const baseAmount = toNullableNumber(previewBaseAmount.value);
    if (!baseAmount || baseAmount <= 0) {
      toast.error('أدخل قيمة صحيحة لـ base_amount (أكبر من 0)');
      return;
    }

    previewBusy.value = true;
    try {
      previewResult.value = await previewProjectCommission(selectedProjectId.value, { base_amount: baseAmount });
    } catch (e) {
      previewResult.value = null;
      toast.error(getApiErrorMessage(e, 'تعذر جلب معاينة العمولة'));
    } finally {
      previewBusy.value = false;
    }
  };

  const createNewSetting = () => {
    if (!canManageAccounting.value) return;
    activeSetting.value = null;
    activeSettingId.value = '';
    isHydrating.value = true;
    resetForm();
    isHydrating.value = false;
    dirty.value = false;
  };

  watch(
    () => selectedProjectId.value,
    () => {
      loadProjectContext();
    }
  );

  watch(
    () => ({
      commission_source: form.commission_source,
      commission_percentage: form.commission_percentage,
      assigned_ops: form.assigned_ops,
      outside_ops: form.outside_ops,
      management: form.management,
    }),
    () => {
      if (!selectedProjectId.value) return;
      if (isHydrating.value) return;
      dirty.value = true;
    },
    { deep: true }
  );

  return {
    // permissions
    canViewAccounting,
    canManageAccounting,

    // lists
    projects,
    projectsLoading,
    employees,
    employeesLoading,

    // selection
    selectedProjectId,
    selectedProject,
    projectDisplayName,

    // settings
    settingsList,
    settingsLoading,
    activeSetting,
    activeSettingId,
    activeSettingBadge,

    // ui state
    activeTab,
    dirty,
    saveBusy,
    activateBusy,

    // form
    form,
    validationErrors,
    assignedMvpTotal,
    outsideMvpTotal,
    managementTotal,
    canSave,
    SALE_CONTRIBUTION_TYPES,

    // preview
    previewBaseAmount,
    previewBusy,
    previewResult,

    // actions
    loadProjects,
    loadEmployees,
    save,
    activate,
    runPreview,
    createNewSetting,
  };
}
