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
    priority: 1,
    notes: '',
  });

  const openWaitingListModal = async (unit) => {
    waitingListUnit.value = unit;
    waitingListForm.client_name = '';
    waitingListForm.phone = '';
    waitingListForm.notes = '';
    waitingListForm.priority = 1;

    try {
      const list = await salesService.getWaitingListByUnit(unit.id);
      waitingListForm.priority = (Array.isArray(list) ? list.length : 0) + 1;
    } catch (e) {
      logger.warn('Could not fetch waiting list for priority calculation', e);
      waitingListForm.priority = 1;
    }

    showWaitingListModal.value = true;
  };

  const closeWaitingListModal = () => {
    showWaitingListModal.value = false;
    waitingListUnit.value = null;
  };

  const submitWaitingList = async () => {
    if (!waitingListUnit.value || !projectId) return;
    const name = String(waitingListForm.client_name || '').trim();
    const mobile = String(waitingListForm.phone || '').trim();
    if (!name || !mobile) {
      notificationService.addNotification('يرجى إدخال اسم العميل ورقم الجوال', 'error');
      return;
    }
    waitingListSaving.value = true;
    try {
      /** POST /sales/waiting-list يتطلب client_mobile (وليس phone فقط) */
      await salesService.addToWaitingList({
        contract_unit_id: waitingListUnit.value.id,
        unit_id: waitingListUnit.value.id,
        contract_id: projectId,
        project_id: projectId,
        client_name: name,
        client_mobile: mobile,
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
