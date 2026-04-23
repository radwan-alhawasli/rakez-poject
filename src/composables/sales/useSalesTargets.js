import { ref, reactive, shallowRef, watch, nextTick } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import logger from '@/utils/logger';

import { 
  mapStatusForApiPatch, 
  normalizeSalesTargetItem, 
  getSalesTargetPatchId, 
  num,
} from './salesTargetsNormalizer';

export * from './salesTargetsNormalizer';


export function useSalesTargets() {
  const { hasPermission } = usePermissions();
  const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

  const targets = shallowRef([]);
  const isLoadingTargets = ref(false);
  const targetsLoadError = ref('');
  const showCreateTargetModal = ref(false);
  const targetForm = reactive({
    assignee_marketer_id: '',
    contract_id: '',
    contract_unit_ids: [],
    assigned_target_value: 0,
    deadline: '',
  });
  const targetFormUnits = shallowRef([]);
  const isLoadingTargetFormUnits = ref(false);
  const targetFormUnitsError = ref('');

  /** أثناء PATCH حالة الهدف — لنفس المسار API للجميع */
  const updatingTargetId = ref(null);

  /** null = GET /sales/targets/my؛ عند التعيين = GET /sales/targets/by-project/{id} (سياق مشروع) */
  const activeContractId = ref(null);

  const targetsMeta = reactive({
    total: 0,
    perPage: 25,
    currentPage: 1,
  });

  const loadTargets = async (options = {}) => {
    if (options !== undefined && options !== null && typeof options === 'object') {
      if ('contractId' in options) {
        const v = options.contractId;
        activeContractId.value = v != null && v !== '' ? String(v) : null;
      }
      if ('page' in options) targetsMeta.currentPage = options.page;
      if ('perPage' in options) targetsMeta.perPage = options.perPage;
    }
    const contractScope = activeContractId.value;
    const params = {
      page: targetsMeta.currentPage,
      per_page: targetsMeta.perPage,
    };

    targetsLoadError.value = '';
    isLoadingTargets.value = true;
    try {
      let result;
      if (contractScope) {
        result = await salesService.getTargetsByProject(contractScope, params);
        logger.info('[SalesTargets] by-project API:', { contractId: contractScope, total: result?.total });
      } else {
        result = await salesService.getMyTargets(params);
        logger.info('[SalesTargets] my API response:', { total: result?.total });
      }

      const list = result?.items || (Array.isArray(result) ? result : []);
      targetsMeta.total = result?.total ?? list.length;

      targets.value = list.map((item) => {
        const normalized = normalizeSalesTargetItem(item);
        if (contractScope && (normalized.contract_id == null || normalized.contract_id === '')) {
          return { ...normalized, contract_id: contractScope };
        }
        return normalized;
      });
    } catch (error) {
      logger.error('[SalesTargets] Error loading targets:', error);
      logger.error('[SalesTargets] Response status:', error?.response?.status, 'data:', error?.response?.data);
      targets.value = [];
      const msg = error?.response?.data?.message || error?.message;
      const status = error?.response?.status;
      if (status === 403) {
        targetsLoadError.value = 'ليس لديك صلاحية عرض الأهداف (sales.targets.view).';
      } else if (status === 401) {
        targetsLoadError.value = 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
      } else if (status === 404) {
        targetsLoadError.value = 'خدمة الأهداف غير متوفرة حالياً. تأكد من تحديث النظام.';
      } else if (status >= 500) {
        targetsLoadError.value = 'خطأ في الخادم. حاول مرة أخرى لاحقاً.';
      } else {
        targetsLoadError.value = msg
          ? `فشل تحميل الأهداف: ${msg}`
          : 'فشل تحميل الأهداف. تحقق من الاتصال ثم أعد المحاولة.';
      }
    } finally {
      isLoadingTargets.value = false;
    }
  };

  function formatTargetStatusUpdateError(err) {
    const d = err?.response?.data;
    const msg =
      (typeof d === 'string' && d) ||
      d?.message ||
      d?.error ||
      err?.message;
    const code = err?.response?.status;
    if (msg) return code ? `${msg} (${code})` : String(msg);
    return code ? `فشل تحديث الحالة (${code})` : 'فشل تحديث الحالة';
  }

  const isTargetUpdating = (target) => {
    const id = getSalesTargetPatchId(target);
    if (id == null || updatingTargetId.value == null) return false;
    return String(updatingTargetId.value) === String(id);
  };

  /**
   * تحديث حالة الهدف: PATCH {baseURL}/sales/targets/{id} (مثال الإنتاج: https://api.rakez.com.sa/api/sales/targets/4)
   * قائد المبيعات والمسوق العادي يستخدمان salesService.updateTarget — لا مسار منفصل للقائد.
   */
  const patchTargetStatus = async (target, newStatus) => {
    const targetId = getSalesTargetPatchId(target);
    const statusNorm = String(newStatus ?? '').trim();
    if (targetId == null || targetId === '') {
      notificationService.addNotification('تعذّر تحديد معرّف الهدف لتحديث الحالة.', 'error');
      logger.warn('[SalesTargets] patchTargetStatus: missing target id', {
        keys: target && typeof target === 'object' ? Object.keys(target) : [],
        hasUnits: Boolean(target && typeof target === 'object' && Array.isArray(target.units) && target.units.length > 0),
        target,
      });
      return;
    }
    if (!['new', 'in_progress', 'completed'].includes(statusNorm)) {
      notificationService.addNotification('قيمة حالة غير صالحة.', 'warning');
      return;
    }
    updatingTargetId.value = targetId;
    try {
      await salesService.updateTarget(targetId, { status: mapStatusForApiPatch(statusNorm) });
      notificationService.addNotification('تم تحديث حالة الهدف', 'success');
      await loadTargets();
    } catch (err) {
      logger.error('[SalesTargets] patchTargetStatus:', err);
      notificationService.addNotification(formatTargetStatusUpdateError(err), 'error');
    } finally {
      updatingTargetId.value = null;
    }
  };

  const getProgressPercentage = target => {
    const goal = num(target?.target_value, 0);
    if (!goal) return 0;
    const calculated = Math.min(
      Math.round((num(target?.achieved_value, 0) / goal) * 100),
      100
    );
    const completedStatuses = ['completed', 'achieved', 'done', 'منجز'];
    const isCompleted =
      completedStatuses.includes(String(target.status || '').toLowerCase()) ||
      String(target.status_label_ar || '').trim() === 'منجز';
    if (isCompleted && calculated === 0) return 100;
    return calculated;
  };

  const getTargetStatusClass = target => {
    const status = String(target.status || '').toLowerCase();
    const statusToClass = {
      completed: 'completed',
      achieved: 'completed',
      done: 'completed',
      in_progress: 'in-progress',
      on_track: 'on-track',
      at_risk: 'at-risk',
      new: 'at-risk',
    };
    if (statusToClass[status]) return statusToClass[status];
    const percentage = getProgressPercentage(target);
    if (percentage >= 100) return 'completed';
    if (percentage >= 75) return 'on-track';
    if (percentage >= 50) return 'in-progress';
    return 'at-risk';
  };

  const getTargetStatusText = target => {
    if (target.status_label_ar) return target.status_label_ar;
    const percentage = getProgressPercentage(target);
    if (percentage >= 100) return 'مكتمل';
    if (percentage >= 75) return 'على المسار الصحيح';
    if (percentage >= 50) return 'قيد التنفيذ';
    return 'يحتاج متابعة';
  };

  const isTargetCompletedLocal = target => {
    const status = String(target?.status || '').toLowerCase();
    const label = String(target?.status_label_ar || '').trim();
    return status === 'completed' || status === 'achieved' || status === 'done' || label === 'منجز';
  };

  /** محقق معروض: إذا كان الهدف منجزاً والخادم أرسل 0 للمحقق، نعرض الهدف كاملاً */
  const getDisplayedAchievedValue = target => {
    const achieved = num(target?.achieved_value, 0);
    const goal = num(target?.target_value, 0);
    if (isTargetCompletedLocal(target) && achieved === 0 && goal > 0) return goal;
    return achieved;
  };

  const loadTargetFormUnits = async (contractId) => {
    if (!contractId) {
      targetFormUnits.value = [];
      targetFormUnitsError.value = '';
      return;
    }
    isLoadingTargetFormUnits.value = true;
    targetFormUnitsError.value = '';
    try {
      const { data } = await salesService.getProjectUnits(contractId, { per_page: 500 });
      const list = Array.isArray(data) ? data : [];
      targetFormUnits.value = list.map(u => ({
        ...u,
        id: u.id ?? u.unit_id,
        unit_number: u.unit_number ?? u.unit_id,
        area: u.area ?? u.area_m2,
      }));
    } catch (error) {
      logger.error('Error loading target form units:', error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message ?? error?.message;
      if (status === 403) {
        targetFormUnitsError.value = 'لا تملك صلاحية الوصول لهذا المشروع.';
      } else {
        targetFormUnitsError.value = msg || 'فشل تحميل الوحدات.';
      }
      targetFormUnits.value = [];
    } finally {
      isLoadingTargetFormUnits.value = false;
    }
  };

  const onTargetFullProjectChange = (e) => {
    if (e.target.checked) targetForm.contract_unit_ids = [];
  };

  const toggleTargetUnit = (unitId) => {
    const ids = targetForm.contract_unit_ids;
    const i = ids.indexOf(unitId);
    if (i === -1) ids.push(unitId);
    else ids.splice(i, 1);
  };

  watch(
    () => targetForm.contract_id,
    (newContractId) => {
      nextTick(() => {
        targetForm.contract_unit_ids = [];
        if (newContractId) {
          loadTargetFormUnits(newContractId);
        } else {
          targetFormUnits.value = [];
          targetFormUnitsError.value = '';
        }
      });
    }
  );

  const openCreateTargetModal = async (teamMembers, teamProjects, loadTeamMembers, loadTeamProjects) => {
    if (teamMembers.value.length === 0) await loadTeamMembers({ with_ratings: true });
    if (teamProjects.value.length === 0) await loadTeamProjects();
    targetFormUnits.value = [];
    targetFormUnitsError.value = '';
    targetForm.contract_unit_ids = [];
    showCreateTargetModal.value = true;
  };

  /**
   * إنشاء هدف مبيعات جديد.
   * المرجع: docs/SALES_TARGETS_API_SUMMARY.md
   */
  const createTarget = async () => {
    const canManageTeam = hasPermission('sales.team.manage') || isSalesLeader(authService.getCurrentUser());
    if (!canManageTeam) {
      notificationService.addNotification('غير مصرح لك بإنشاء أهداف', 'warning');
      return;
    }
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const basePayload = {
        assignee_marketer_id: targetForm.assignee_marketer_id,
        contract_id: targetForm.contract_id,
        target_type: 'reservation',
        start_date: startDate,
        end_date: targetForm.deadline,
        leader_notes: null,
        assigned_target_value: targetForm.assigned_target_value,
      };
      const unitIds = Array.isArray(targetForm.contract_unit_ids) ? targetForm.contract_unit_ids : [];
      if (unitIds.length === 0) {
        // Project Level
        await salesService.createTarget({ ...basePayload, contract_unit_id: null });
        notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success');
      } else if (unitIds.length === 1) {
        // Single Unit
        await salesService.createTarget({ 
            ...basePayload, 
            contract_unit_id: unitIds[0], 
            must_sell_units_count: 1 
        });
        notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success');
      } else {
        // Multi Units
        await salesService.createTarget({ 
            ...basePayload, 
            contract_unit_ids: unitIds, 
            must_sell_units_count: unitIds.length 
        });
        notificationService.addNotification(`تم إنشاء الهدف لـ ${unitIds.length} وحدات بنجاح`, 'success');
      }
      showCreateTargetModal.value = false;
      loadTargets();
      Object.assign(targetForm, {
        assignee_marketer_id: '',
        contract_id: '',
        contract_unit_ids: [],
        assigned_target_value: 0,
        deadline: '',
      });
      targetFormUnits.value = [];
      targetFormUnitsError.value = '';
    } catch (error) {
      logger.error('Error creating target:', error);
      notificationService.addNotification('حدث خطأ أثناء إنشاء الهدف', 'error');
    }
  };

  return {
    targets,
    targetsMeta,
    activeContractId,
    updatingTargetId,
    patchTargetStatus,
    isTargetUpdating,
    isLoadingTargets,
    targetsLoadError,
    showCreateTargetModal,
    targetForm,
    targetFormUnits,
    isLoadingTargetFormUnits,
    targetFormUnitsError,
    loadTargets,
    getProgressPercentage,
    getTargetStatusClass,
    getTargetStatusText,
    getDisplayedAchievedValue,
    openCreateTargetModal,
    onTargetFullProjectChange,
    toggleTargetUnit,
    createTarget,
    formatCurrency,
    formatDate,
    hasPermission,
  };
}
