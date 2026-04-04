import { ref, reactive } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { getApiErrorMessage } from '@/utils/errorHandler';

/**
 * @param {string|number} projectId
 */
export function useProjectUnitWaitingList(projectId) {
  const showWaitingListModal = ref(false);
  const waitingListUnit = ref(null);
  const waitingListSaving = ref(false);
  const waitingListForm = reactive({
    client_name: '',
    phone: '',
    priority: 10,
    notes: '',
  });

  const openWaitingListModal = (unit) => {
    waitingListUnit.value = unit;
    waitingListForm.client_name = '';
    waitingListForm.phone = '';
    waitingListForm.priority = 10;
    waitingListForm.notes = '';
    showWaitingListModal.value = true;
  };

  const closeWaitingListModal = () => {
    showWaitingListModal.value = false;
    waitingListUnit.value = null;
  };

  const submitWaitingList = async () => {
    if (!waitingListUnit.value || !projectId) return;
    waitingListSaving.value = true;
    try {
      await salesService.addToWaitingList({
        contract_unit_id: waitingListUnit.value.id,
        unit_id: waitingListUnit.value.id,
        contract_id: projectId,
        project_id: projectId,
        client_name: waitingListForm.client_name,
        phone: waitingListForm.phone,
        priority: waitingListForm.priority || 10,
        notes: waitingListForm.notes || undefined,
      });
      notificationService.addNotification('تمت إضافة العميل لقائمة الانتظار بنجاح', 'success');
      closeWaitingListModal();
    } catch (e) {
      logger.error('Waiting list add error:', e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل إضافة قائمة الانتظار'), 'error');
    } finally {
      waitingListSaving.value = false;
    }
  };

  return {
    showWaitingListModal,
    waitingListUnit,
    waitingListForm,
    waitingListSaving,
    openWaitingListModal,
    closeWaitingListModal,
    submitWaitingList,
  };
}
