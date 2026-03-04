import { ref, reactive, shallowRef, watch, nextTick } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesTargets() {
  const { hasPermission } = usePermissions();
  const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

  const targets = shallowRef([]);
  const isLoadingTargets = ref(false);
  const targetsLoadError = ref('');
  const showCreateTargetModal = ref(false);
  const targetForm = reactive({
    marketer_id: '',
    contract_id: '',
    contract_unit_ids: [],
    target_value: 0,
    deadline: '',
  });
  const targetFormUnits = shallowRef([]);
  const isLoadingTargetFormUnits = ref(false);
  const targetFormUnitsError = ref('');

  const loadTargets = async () => {
    targetsLoadError.value = '';
    isLoadingTargets.value = true;
    try {
      const raw = await salesService.getMyTargets();
      targets.value = Array.isArray(raw) ? raw : [];
    } catch (error) {
      logger.error('Error loading targets:', error);
      targets.value = [];
      const msg = error?.response?.data?.message || error?.message;
      const status = error?.response?.status;
      if (status === 403) {
        targetsLoadError.value = 'ليس لديك صلاحية عرض الأهداف (sales.targets.view).';
      } else if (status === 401) {
        targetsLoadError.value = 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
      } else {
        targetsLoadError.value = msg
          ? `فشل تحميل الأهداف: ${msg}`
          : 'فشل تحميل الأهداف. تحقق من الاتصال ثم أعد المحاولة.';
      }
    } finally {
      isLoadingTargets.value = false;
    }
  };

  const getProgressPercentage = target => {
    if (!target.target_value) return 0;
    const calculated = Math.min(
      Math.round(((target.achieved_value || 0) / target.target_value) * 100),
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
    if (teamMembers.value.length === 0) await loadTeamMembers();
    if (teamProjects.value.length === 0) await loadTeamProjects();
    targetFormUnits.value = [];
    targetFormUnitsError.value = '';
    targetForm.contract_unit_ids = [];
    showCreateTargetModal.value = true;
  };

  const createTarget = async () => {
    if (!hasPermission('sales.goals.create')) {
      notificationService.addNotification('غير مصرح لك بإنشاء أهداف', 'warning');
      return;
    }
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const basePayload = {
        marketer_id: targetForm.marketer_id,
        contract_id: targetForm.contract_id,
        target_type: 'reservation',
        start_date: startDate,
        end_date: targetForm.deadline,
        leader_notes: null,
        target_value: targetForm.target_value,
      };
      const unitIds = Array.isArray(targetForm.contract_unit_ids) ? targetForm.contract_unit_ids : [];
      if (unitIds.length === 0) {
        await salesService.createTarget({ ...basePayload, contract_unit_id: null });
        notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success');
      } else {
        let created = 0;
        for (const unitId of unitIds) {
          await salesService.createTarget({ ...basePayload, contract_unit_id: unitId });
          created++;
        }
        notificationService.addNotification(
          created === 1 ? 'تم إنشاء الهدف بنجاح' : `تم إنشاء ${created} أهداف بنجاح`,
          'success'
        );
      }
      showCreateTargetModal.value = false;
      loadTargets();
      Object.assign(targetForm, {
        marketer_id: '',
        contract_id: '',
        contract_unit_ids: [],
        target_value: 0,
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
    openCreateTargetModal,
    onTargetFullProjectChange,
    toggleTargetUnit,
    createTarget,
    formatCurrency,
    formatDate,
    hasPermission,
  };
}
