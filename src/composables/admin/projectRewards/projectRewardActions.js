import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import salesService from '@/services/salesService';
import projectRewardService from '@/services/projectRewardService';
import { getProjectManagementReservations } from '@/services/teamReservationService';
import { toast } from '@/composables/useToast';
import {
  buildPreviewPayload,
  emptyRewardForm,
  normalizeReservationItem,
  rewardRecipientsFromPayload,
  rewardUnresolvedFromPayload,
  toBoolean,
  toNumberOrNull,
} from './projectRewardUtils';

export function createProjectRewardActions(context) {
  const {
    contractId,
    canManageSettings,
    canViewRewards,
    activeSetting,
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
    mapRewardApiMessage,
    validateSettings,
    buildSettingPayload,
    router,
  } = context;

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

  function openSalariesPage() {
    router.push({ name: 'AccountingSalaries' });
  }

  return {
    fillFormFromSetting,
    resetFormToDefaults,
    loadProject,
    loadEmployees,
    loadSettings,
    loadReservations,
    loadRewards,
    init,
    saveSettings,
    activateSetting,
    previewRewardAction,
    generateRewardAction,
    openRewardDetails,
    openConfirmAction,
    executeConfirmAction,
    closeConfirmAction,
    requestApproveReward,
    requestMarkPaid,
    openRejectReward,
    submitRejectReward,
    closeRejectReward,
    openSalariesPage,
  };
}
