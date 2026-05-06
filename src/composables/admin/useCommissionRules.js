import { ref, reactive, computed, watch } from 'vue';
import marketingService from '@/services/marketingService';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';
import {
  COMMISSIONS_API_IMPLEMENTED,
  getCommissionRules,
  getCommissionSummary,
  saveCommissionRules,
} from '@/services/commissionsApi';

export const COMMISSION_OPERATION_FIELDS = [
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

const DEFAULT_RULES = () => ({
  marketers_full: 0,
  bring: 0,
  convince: 0,
  close: 0,
  half_bring: 0,
  half_convince: 0,
  half_close: 0,
  quarter_bring: 0,
  quarter_convince: 0,
  quarter_close: 0,
});

export function useCommissionRules() {
  const projects = ref([]);
  const projectsLoading = ref(false);
  const selectedProjectId = ref('');
  const selectedProject = ref(null);

  const summary = ref(null);
  const summaryLoading = ref(false);

  const assignedRules = reactive(DEFAULT_RULES());
  const unassignedRules = reactive(DEFAULT_RULES());
  const managementRules = reactive({
    executive_director: 0,
    marketing_sales_director: 0,
    sales_leader: 0,
    group_leader: 0,
  });

  const activeTab = ref('assigned'); // assigned|unassigned|management
  const saveBusy = ref(false);

  const marketersTotalAssigned = computed(() => {
    const r = assignedRules;
    return [
      r.marketers_full,
      r.bring,
      r.convince,
      r.close,
      r.half_bring,
      r.half_convince,
      r.half_close,
      r.quarter_bring,
      r.quarter_convince,
      r.quarter_close,
    ].reduce((sum, v) => sum + (Number(v) || 0), 0);
  });

  const marketersTotalUnassigned = computed(() => {
    const r = unassignedRules;
    return [
      r.marketers_full,
      r.bring,
      r.convince,
      r.close,
      r.half_bring,
      r.half_convince,
      r.half_close,
      r.quarter_bring,
      r.quarter_convince,
      r.quarter_close,
    ].reduce((sum, v) => sum + (Number(v) || 0), 0);
  });

  const managementTotal = computed(() => {
    const r = managementRules;
    return [
      r.executive_director,
      r.marketing_sales_director,
      r.sales_leader,
      r.group_leader,
    ].reduce((sum, v) => sum + (Number(v) || 0), 0);
  });

  const loadProjects = async () => {
    projectsLoading.value = true;
    try {
      const res = await marketingService.getProjects({ per_page: 200 });
      projects.value = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
    } catch (e) {
      projects.value = [];
      toast.error(getApiErrorMessage(e, 'تعذر تحميل قائمة المشاريع'));
    } finally {
      projectsLoading.value = false;
    }
  };

  const loadProjectContext = async () => {
    const id = selectedProjectId.value;
    if (!id) {
      selectedProject.value = null;
      summary.value = null;
      return;
    }

    // Best-effort project details from marketing service
    try {
      selectedProject.value = await marketingService.getProjectById(id);
    } catch {
      selectedProject.value = projects.value.find(p => String(p?.id ?? p?.contract_id ?? '') === String(id)) ?? null;
    }

    if (!COMMISSIONS_API_IMPLEMENTED) {
      summary.value = null;
      return;
    }

    summaryLoading.value = true;
    try {
      summary.value = await getCommissionSummary(id);
      const rules = await getCommissionRules(id);
      if (rules?.assigned) Object.assign(assignedRules, rules.assigned);
      if (rules?.unassigned) Object.assign(unassignedRules, rules.unassigned);
      if (rules?.management) Object.assign(managementRules, rules.management);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر تحميل بيانات العمولات'));
      summary.value = null;
    } finally {
      summaryLoading.value = false;
    }
  };

  const validatePercent = v => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 100;
  };

  const isValid = computed(() => {
    const assignedOk = Object.values(assignedRules).every(validatePercent);
    const unassignedOk = Object.values(unassignedRules).every(validatePercent);
    const managementOk = Object.values(managementRules).every(validatePercent);
    return assignedOk && unassignedOk && managementOk;
  });

  const save = async () => {
    if (!selectedProjectId.value) {
      toast.warning('اختر مشروعاً أولاً');
      return;
    }
    if (!isValid.value) {
      toast.error('تحقق من قيم النسب (0 إلى 100)');
      return;
    }

    if (!COMMISSIONS_API_IMPLEMENTED) {
      toast.warning('API العمولات غير متوفر حالياً (TODO)');
      return;
    }

    saveBusy.value = true;
    try {
      await saveCommissionRules(selectedProjectId.value, {
        assigned: { ...assignedRules },
        unassigned: { ...unassignedRules },
        management: { ...managementRules },
      });
      toast.success('تم حفظ نسب العمولات بنجاح');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر حفظ نسب العمولات'));
    } finally {
      saveBusy.value = false;
    }
  };

  watch(
    () => selectedProjectId.value,
    () => {
      Object.assign(assignedRules, DEFAULT_RULES());
      Object.assign(unassignedRules, DEFAULT_RULES());
      Object.assign(managementRules, {
        executive_director: 0,
        marketing_sales_director: 0,
        sales_leader: 0,
        group_leader: 0,
      });
      loadProjectContext();
    }
  );

  return {
    projects,
    projectsLoading,
    selectedProjectId,
    selectedProject,
    summary,
    summaryLoading,
    assignedRules,
    unassignedRules,
    managementRules,
    activeTab,
    marketersTotalAssigned,
    marketersTotalUnassigned,
    managementTotal,
    isValid,
    saveBusy,
    loadProjects,
    save,
    COMMISSIONS_API_IMPLEMENTED,
  };
}

