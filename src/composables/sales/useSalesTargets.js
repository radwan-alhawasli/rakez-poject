import { ref, reactive, shallowRef, watch, nextTick } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import logger from '@/utils/logger';

function num(v, fallback = 0) {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * يحوّل قيمة الحالة من الـ API إلى واحدة من: new | in_progress | completed (للعرض والـ select).
 */
export function normalizeTargetStatus(raw) {
  const rawStatus = String(raw?.status ?? '').trim();
  if (['منجز', 'مكتمل'].includes(rawStatus)) return 'completed';
  const s = rawStatus.toLowerCase().replace(/-/g, '_');
  const ar = String(raw?.status_label_ar ?? '').trim();
  if (['completed', 'achieved', 'done', 'complete', 'closed'].includes(s)) return 'completed';
  if (['in_progress', 'inprogress', 'progress', 'active'].includes(s)) return 'in_progress';
  if (['new', 'pending', 'draft', 'open'].includes(s)) return 'new';
  if (ar === 'منجز' || ar === 'مكتمل') return 'completed';
  if (ar === 'جديد') return 'new';
  if (ar.includes('قيد')) return 'in_progress';
  if (['new', 'in_progress', 'completed'].includes(s)) return s;
  return 'new';
}

/** قيمة الحالة المرسلة في PATCH (يمكن توسيع الخريطة لاحقاً إن اختلف الخادم) */
export function mapStatusForApiPatch(uiStatus) {
  const s = String(uiStatus ?? '').toLowerCase();
  if (s === 'completed' || s === 'new' || s === 'in_progress') return s;
  return s;
}

/**
 * يستخرج معرّف الهدف لـ PATCH من أشكال Laravel / JSON:API المتعددة.
 * لا نستخدم contract.id أو project.id أو marketer_id — معرفات مختلفة عن مسار الهدف.
 */
export function extractSalesTargetRowId(raw) {
  if (!raw || typeof raw !== 'object') return null;
  /** الخادم قد يرسل `sales_target` كرقم (المعرّف) وليس كائنًا */
  if (typeof raw.sales_target === 'number' && Number.isFinite(raw.sales_target) && raw.sales_target > 0) {
    return raw.sales_target;
  }
  if (typeof raw.sales_target === 'string' && /^\d+$/.test(String(raw.sales_target).trim())) {
    return String(raw.sales_target).trim();
  }
  const pick = (o) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    return (
      o.id ??
      o.target_id ??
      o.sales_target_id ??
      o.salesTargetId ??
      o.goal_id ??
      null
    );
  };
  /** معرّف الهدف أحياناً داخل عناصر الوحدات فقط */
  const pickFromUnits = () => {
    if (!Array.isArray(raw.units) || raw.units.length === 0) return null;
    for (const u of raw.units) {
      if (!u || typeof u !== 'object') continue;
      const nestedSt = u.sales_target;
      const fromNested =
        nestedSt && typeof nestedSt === 'object' && !Array.isArray(nestedSt) ? pick(nestedSt) : null;
      const x =
        u.sales_target_id ??
        u.target_id ??
        fromNested ??
        u.id;
      if (x != null && x !== '') return x;
    }
    return null;
  };
  const relSales = raw.relationships?.sales_target?.data ?? raw.relationships?.target?.data;
  const relPick =
    relSales && typeof relSales === 'object' && !Array.isArray(relSales)
      ? relSales.id ?? relSales.target_id ?? relSales.sales_target_id
      : null;
  const nestedBuckets = [
    raw.sales_target,
    raw.target,
    raw.salesTarget,
    raw.attributes,
    raw.resource,
    raw.model,
    raw.meta,
    raw.pivot,
    typeof raw.data === 'object' && raw.data != null && !Array.isArray(raw.data) ? raw.data : null,
  ];
  const fromNested = nestedBuckets.map(pick).find((v) => v != null && v !== '');
  const fromUnits = pickFromUnits();
  const v =
    pick(raw) ??
    raw.target_id ??
    raw.sales_target_id ??
    raw.salesTargetId ??
    raw.sales_target_row_id ??
    raw.sales_target_pk ??
    fromNested ??
    relPick ??
    fromUnits ??
    raw.uuid;
  if (v == null || v === '') return null;
  return v;
}

/**
 * يوحّد أسماء الحقول القادمة من الـ API (Laravel Resource / أشكال متعددة) لعرض البطاقة بشكل صحيح.
 */
export function normalizeSalesTargetItem(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const project = raw.project || raw.contract || {};
  const projectName =
    raw.project_name ??
    raw.project_title ??
    project.project_name ??
    project.name ??
    project.title ??
    project.contract_name ??
    '';

  const contractId =
    raw.contract_id ??
    project.id ??
    project.contract_id ??
    raw.project_id ??
    null;

  const targetId = extractSalesTargetRowId(raw);
  const mid = raw.marketer_id ?? raw.user_id ?? raw.assignee_id;
  const marketerId =
    mid != null && mid !== '' && Number.isFinite(Number(mid)) ? Number(mid) : mid;

  const targetValue = num(
    raw.target_value ??
      raw.goal_amount ??
      raw.goal ??
      raw.target_amount ??
      raw.amount ??
      project.target_value,
    0,
  );

  const achievedValue = num(
    raw.achieved_value ??
      raw.achieved_amount ??
      raw.current_amount ??
      raw.progress_value ??
      raw.realized_amount ??
      raw.sales_achieved ??
      raw.total_achieved,
    0,
  );

  const endDate =
    raw.end_date ??
    raw.deadline ??
    raw.period_end ??
    raw.target_end_date ??
    raw.ends_at ??
    project.end_date ??
    null;

  const resolvedEnd = endDate ?? raw.end_date ?? raw.deadline ?? null;
  const normalizedStatus = normalizeTargetStatus(raw);

  return {
    ...raw,
    project_name: projectName || raw.project_name || '',
    contract_id: contractId ?? raw.contract_id,
    id: targetId ?? raw.id,
    target_id: targetId ?? raw.target_id,
    marketer_id: marketerId ?? raw.marketer_id,
    target_value: targetValue,
    achieved_value: achievedValue,
    end_date: resolvedEnd,
    deadline: raw.deadline ?? resolvedEnd,
    status: normalizedStatus,
  };
}

/**
 * معرّف الهدف لـ PATCH /sales/targets/{id} — يعيد محاولة الاستخراج من الشكل الخام إن لزم.
 */
export function getSalesTargetPatchId(target) {
  if (!target || typeof target !== 'object') return null;
  const direct =
    target.id ??
    target.target_id ??
    target.sales_target_id ??
    target.salesTargetId ??
    target.sales_target_row_id ??
    target.sales_target_pk ??
    target.uuid;
  if (direct != null && direct !== '') return direct;
  return extractSalesTargetRowId(target);
}

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

  /**
   * @param {{ contractId?: string|number|null }} [options] - عند تمرير { contractId } يُحدَّد مصدر القائمة؛ بدون وسيط يُعاد التحميل بنفس النطاق الأخير.
   */
  const loadTargets = async (options) => {
    if (options !== undefined && options !== null && typeof options === 'object' && 'contractId' in options) {
      const v = options.contractId;
      activeContractId.value = v != null && v !== '' ? String(v) : null;
    }
    const contractScope = activeContractId.value;

    targetsLoadError.value = '';
    isLoadingTargets.value = true;
    try {
      let raw;
      if (contractScope) {
        raw = await salesService.getTargetsByProject(contractScope);
        logger.info('[SalesTargets] by-project API:', { contractId: contractScope, length: Array.isArray(raw) ? raw.length : 'N/A' });
      } else {
        raw = await salesService.getMyTargets();
        logger.info('[SalesTargets] my API response:', { type: typeof raw, isArray: Array.isArray(raw), length: Array.isArray(raw) ? raw.length : 'N/A' });
      }
      const list = Array.isArray(raw) ? raw : [];
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
