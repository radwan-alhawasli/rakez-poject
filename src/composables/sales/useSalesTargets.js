import { ref, reactive, shallowRef, watch, nextTick } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import authService from '@/services/authService';
import { isSalesExecutive, isSalesLeader, isSalesManager, normalizeRole } from '@/utils/rbac';
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
  const TARGET_ROLE_MODES = /** @type {const} */ (['executive', 'manager', 'leader', 'group_leader', 'member']);

  /** @type {import('vue').Ref<any[]>} */
  const targets = shallowRef([]);
  const isLoadingTargets = ref(false);
  const targetsLoadError = ref('');
  const showCreateTargetModal = ref(false);
  const salesTargetMode = ref('legacy');
  const forcedSalesTargetMode = ref('');
  const targetForm = reactive({
    assignee_marketer_id: '',
    contract_id: '',
    /** @type {any[]} */
    contract_unit_ids: [],
    assigned_target_value: 0,
    line_type: '',
    value: '',
    deadline: '',
  });
  /** @type {import('vue').Ref<any[]>} */
  const targetFormUnits = shallowRef([]);
  const isLoadingTargetFormUnits = ref(false);
  const targetFormUnitsError = ref('');

  /** أثناء PATCH حالة الهدف — لنفس المسار API للجميع */
  const updatingTargetId = ref(null);

  /** @type {import('vue').Ref<string | null>} */
  const activeContractId = ref(null);

  const targetsMeta = reactive({
    total: 0,
    perPage: 25,
    currentPage: 1,
  });

  const targetsOverview = reactive({
    assigned_lines_count: 0,
    in_progress_lines_count: 0,
    completed_lines_count: 0,
    completion_rate: 0,
    target_total_value: 0,
    achieved_total_value: 0,
    value_achievement_rate: 0,
    ranking_position: null,
    ranking_total: null,
  });

  const distributionValidation = reactive({
    requireExactDistribution: true,
  });

  const isTruthyFlag = value => value === true || value === 1 || value === '1';
  const sanitizeSalesTargetMode = mode =>
    TARGET_ROLE_MODES.includes(String(mode || ''))
      ? String(mode || '')
      : '';

  const resolveSalesTargetMode = () => {
    const user = /** @type {any} */ (authService.getCurrentUser()) || {};
    if (isSalesExecutive(user)) return 'executive';
    if (isSalesManager(user)) return 'manager';

    const role = normalizeRole(user.type);
    const isGroupLeader =
      isTruthyFlag(user.is_group_leader) ||
      isTruthyFlag(user.is_team_group_leader) ||
      String(user.role_key || '').toLowerCase() === 'group_leader';
    if (isGroupLeader) return 'group_leader';

    const pureSalesLeader =
      role === 7 ||
      (role === 6 &&
        isTruthyFlag(user.is_leader) &&
        !isTruthyFlag(user.is_manager) &&
        !isTruthyFlag(user.is_executive_director));
    if (pureSalesLeader) return 'leader';

    if (isSalesLeader(user)) return 'leader';
    return 'member';
  };

  const resolveActiveSalesTargetMode = explicitMode => {
    const explicit = sanitizeSalesTargetMode(explicitMode);
    if (explicit) return explicit;
    const forced = sanitizeSalesTargetMode(forcedSalesTargetMode.value);
    if (forced) return forced;
    return resolveSalesTargetMode();
  };

  const setSalesTargetModeOverride = mode => {
    forcedSalesTargetMode.value = sanitizeSalesTargetMode(mode);
    salesTargetMode.value = resolveActiveSalesTargetMode();
  };

  /** @param {any} [options] */
  const loadTargets = async (options = {}) => {
    if (options !== undefined && options !== null && typeof options === 'object') {
      if ('contractId' in options) {
        const v = (/** @type {any} */ (options)).contractId;
        activeContractId.value = v != null && v !== '' ? String(v) : null;
      }
      if ('page' in options) targetsMeta.currentPage = (/** @type {any} */ (options)).page;
      if ('perPage' in options) targetsMeta.perPage = (/** @type {any} */ (options)).perPage;
    }
    const contractScope = activeContractId.value;
    const params = {
      page: targetsMeta.currentPage,
      per_page: targetsMeta.perPage,
    };
    const requestedMode =
      options !== undefined && options !== null && typeof options === 'object'
        ? (/** @type {any} */ (options)).mode ?? (/** @type {any} */ (options)).salesTargetMode
        : '';
    if (requestedMode !== undefined) {
      setSalesTargetModeOverride(requestedMode);
    }

    targetsLoadError.value = '';
    isLoadingTargets.value = true;
    try {
      let result;
      salesTargetMode.value = resolveActiveSalesTargetMode(requestedMode);
      if (salesTargetMode.value === 'manager') {
        result = await salesService.getManagerTargets(params);
      } else if (salesTargetMode.value === 'executive') {
        result = await salesService.getExecutiveTargets(params);
      } else if (salesTargetMode.value === 'leader') {
        result = await salesService.getTeamLeaderTargets(params);
      } else if (salesTargetMode.value === 'group_leader') {
        result = await salesService.getGroupLeaderTargets(params);
      } else if (contractScope) {
        result = await salesService.getTargetsByProject(contractScope, params);
        logger.info('[SalesTargets] by-project API:', { contractId: contractScope, total: result?.total });
      } else {
        result = await salesService.getMemberTargets(params);
        logger.info('[SalesTargets] my API response:', { total: result?.total });
      }

      const list = result?.items || (Array.isArray(result) ? result : []);
      targetsMeta.total = result?.total ?? list.length;
      const meta = result?.meta && typeof result.meta === 'object' ? result.meta : {};
      const overview = meta.member_overview && typeof meta.member_overview === 'object'
        ? meta.member_overview
        : {};
      const ranking = meta.ranking && typeof meta.ranking === 'object' ? meta.ranking : {};

      targetsOverview.assigned_lines_count = num(overview.assigned_lines_count, 0);
      targetsOverview.in_progress_lines_count = num(overview.in_progress_lines_count, 0);
      targetsOverview.completed_lines_count = num(overview.completed_lines_count, 0);
      targetsOverview.completion_rate = num(overview.completion_rate, 0);
      targetsOverview.target_total_value = num(overview.target_total_value, 0);
      targetsOverview.achieved_total_value = num(overview.achieved_total_value, 0);
      targetsOverview.value_achievement_rate = num(overview.value_achievement_rate, 0);
      targetsOverview.ranking_position = ranking.position ?? ranking.rank ?? null;
      targetsOverview.ranking_total = ranking.total_sales_staff ?? ranking.total ?? null;

      targets.value = list.map((/** @type {any} */ item) => {
        const normalized = normalizeSalesTargetItem(item);
        if (contractScope && (normalized.contract_id == null || normalized.contract_id === '')) {
          return { ...normalized, contract_id: contractScope };
        }
        return normalized;
      });
    } catch (err) {
      const error = /** @type {any} */ (err);
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
      targetsOverview.assigned_lines_count = 0;
      targetsOverview.in_progress_lines_count = 0;
      targetsOverview.completed_lines_count = 0;
      targetsOverview.completion_rate = 0;
      targetsOverview.target_total_value = 0;
      targetsOverview.achieved_total_value = 0;
      targetsOverview.value_achievement_rate = 0;
      targetsOverview.ranking_position = null;
      targetsOverview.ranking_total = null;
    } finally {
      isLoadingTargets.value = false;
    }
  };

  /** @param {any} err */
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

  /** @param {any} target */
  const isTargetUpdating = (target) => {
    const id = getSalesTargetPatchId(target);
    if (id == null || updatingTargetId.value == null) return false;
    return String(updatingTargetId.value) === String(id);
  };

  /**
   * تحديث حالة الهدف: PATCH {baseURL}/sales/targets/{id} (مثال الإنتاج: https://api.rakez.com.sa/api/sales/targets/4)
   * قائد المبيعات والمسوق العادي يستخدمان salesService.updateTarget — لا مسار منفصل للقائد.
   * @param {any} target
   * @param {any} newStatus
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
      salesTargetMode.value = resolveActiveSalesTargetMode();
      if (salesTargetMode.value === 'manager') {
        notificationService.addNotification('Manager cannot update target status from this screen.', 'warning');
        return;
      }
      if (salesTargetMode.value === 'executive') {
        await salesService.updateExecutiveTarget(targetId, { status: mapStatusForApiPatch(statusNorm) });
      } else {
        await salesService.updateTarget(targetId, { status: mapStatusForApiPatch(statusNorm) });
      }
      notificationService.addNotification('تم تحديث حالة الهدف', 'success');
      await loadTargets();
    } catch (err) {
      logger.error('[SalesTargets] patchTargetStatus:', err);
      notificationService.addNotification(formatTargetStatusUpdateError(err), 'error');
    } finally {
      updatingTargetId.value = null;
    }
  };

  /** @param {any} target */
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

  /** @param {any} target */
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
    if (statusToClass[/** @type {keyof typeof statusToClass} */ (status)]) return statusToClass[/** @type {keyof typeof statusToClass} */ (status)];
    const percentage = getProgressPercentage(target);
    if (percentage >= 100) return 'completed';
    if (percentage >= 75) return 'on-track';
    if (percentage >= 50) return 'in-progress';
    return 'at-risk';
  };

  /** @param {any} target */
  const getTargetStatusText = target => {
    if (target.status_label_ar) return target.status_label_ar;
    const percentage = getProgressPercentage(target);
    if (percentage >= 100) return 'مكتمل';
    if (percentage >= 75) return 'على المسار الصحيح';
    if (percentage >= 50) return 'قيد التنفيذ';
    return 'يحتاج متابعة';
  };

  /** @param {any} target */
  const isTargetCompletedLocal = target => {
    const status = String(target?.status || '').toLowerCase();
    const label = String(target?.status_label_ar || '').trim();
    return status === 'completed' || status === 'achieved' || status === 'done' || label === 'منجز';
  };

  /** 
   * محقق معروض: إذا كان الهدف منجزاً والخادم أرسل 0 للمحقق، نعرض الهدف كاملاً 
   * @param {any} target
   */
  const getDisplayedAchievedValue = target => {
    const achieved = num(target?.achieved_value, 0);
    const goal = num(target?.target_value, 0);
    if (isTargetCompletedLocal(target) && achieved === 0 && goal > 0) return goal;
    return achieved;
  };

  /** @param {any} contractId */
  const loadTargetFormUnits = async (contractId) => {
    if (!contractId) {
      targetFormUnits.value = [];
      targetFormUnitsError.value = '';
      return;
    }
    isLoadingTargetFormUnits.value = true;
    targetFormUnitsError.value = '';
    try {
      const { data } = /** @type {any} */ (await salesService.getProjectUnits(contractId, { per_page: 500 }));
      const list = Array.isArray(data) ? data : [];
      targetFormUnits.value = list.map((/** @type {any} */ u) => ({
        ...u,
        id: u.id ?? u.unit_id,
        unit_number: u.unit_number ?? u.unit_id,
        area: u.area ?? u.area_m2,
      }));
    } catch (err) {
      const error = /** @type {any} */ (err);
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

  /** @param {any} e */
  const onTargetFullProjectChange = (e) => {
    if (e.target.checked) targetForm.contract_unit_ids = [];
  };

  /** @param {any} unitId */
  const toggleTargetUnit = (unitId) => {
    const ids = targetForm.contract_unit_ids;
    const i = ids.indexOf(unitId);
    if (i === -1) ids.push(unitId);
    else ids.splice(i, 1);
  };

  watch(
    () => targetForm.contract_id,
    (newContractId) => {
      if (resolveActiveSalesTargetMode() !== 'leader') return;
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

  /** 
   * @param {any} teamMembers 
   * @param {any} teamProjects 
   * @param {Function} loadTeamMembers 
   * @param {Function} loadTeamProjects 
   */
  const openCreateTargetModal = async (teamMembers, teamProjects, loadTeamMembers, loadTeamProjects) => {
    salesTargetMode.value = resolveActiveSalesTargetMode();
    if (salesTargetMode.value === 'executive') {
      targetForm.line_type = targetForm.line_type || '';
      targetForm.value = targetForm.value || '';
      showCreateTargetModal.value = true;
      return;
    }
    if (salesTargetMode.value !== 'leader') return;
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
    salesTargetMode.value = resolveActiveSalesTargetMode();

    if (salesTargetMode.value === 'manager' || salesTargetMode.value === 'group_leader' || salesTargetMode.value === 'member') {
      notificationService.addNotification('لا يمكن إنشاء هدف من هذه الشاشة لهذا الدور.', 'warning');
      return;
    }

    if (salesTargetMode.value === 'executive') {
      try {
        const lineType = String(targetForm.line_type || '').trim();
        const valueRaw = targetForm.value ?? targetForm.assigned_target_value;
        const valueNum = Number(valueRaw);
        if (!lineType) {
          notificationService.addNotification('Line type is required.', 'warning');
          return;
        }
        if (!Number.isFinite(valueNum) || valueNum <= 0) {
          notificationService.addNotification('Target value must be greater than zero.', 'warning');
          return;
        }

        await salesService.createExecutiveTarget({
          line_type: lineType,
          value: String(valueNum),
        });
        notificationService.addNotification('Target created successfully.', 'success');
        showCreateTargetModal.value = false;
        await loadTargets();

        Object.assign(targetForm, {
          assignee_marketer_id: '',
          contract_id: '',
          contract_unit_ids: [],
          assigned_target_value: 0,
          line_type: '',
          value: '',
          deadline: '',
        });
      } catch (err) {
        const error = /** @type {any} */ (err);
        logger.error('Error creating executive target:', error);
        const msg = error?.response?.data?.message || error?.message || 'Failed to create target';
        notificationService.addNotification(msg, 'error');
      }
      return;
    }

    const user = /** @type {any} */ (authService.getCurrentUser());
    const canManageTeam = salesTargetMode.value === 'leader' && (hasPermission('sales.team.manage') || isSalesLeader(user));
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
        line_type: '',
        value: '',
        deadline: '',
      });
      targetFormUnits.value = [];
      targetFormUnitsError.value = '';
    } catch (err) {
      const error = /** @type {any} */ (err);
      logger.error('Error creating target:', error);
      notificationService.addNotification('حدث خطأ أثناء إنشاء الهدف', 'error');
    }
  };

  /**
   * Sales Executive only: delete target line.
   * @param {any} target
   */
  const deleteTarget = async target => {
    salesTargetMode.value = resolveActiveSalesTargetMode();
    if (salesTargetMode.value !== 'executive') return;
    const targetId = getSalesTargetPatchId(target);
    if (targetId == null || targetId === '') {
      notificationService.addNotification('Missing target id.', 'error');
      return;
    }
    try {
      await salesService.deleteExecutiveTarget(targetId);
      notificationService.addNotification('Target deleted successfully.', 'success');
      await loadTargets();
    } catch (err) {
      logger.error('Error deleting executive target:', err);
      const error = /** @type {any} */ (err);
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete target';
      notificationService.addNotification(msg, 'error');
    }
  };

  return {
    targets,
    targetsMeta,
    targetsOverview,
    distributionValidation,
    salesTargetMode,
    forcedSalesTargetMode,
    activeContractId,
    updatingTargetId,
    setSalesTargetModeOverride,
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
    deleteTarget,
    formatCurrency,
    formatDate,
    hasPermission,
  };
}
