import { ref, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import logger from '@/utils/logger';

export function useSalesNegotiations() {
  const { hasPermission } = usePermissions();

  /** @type {import('vue').ShallowRef<any[]>} */
  const pendingNegotiations = shallowRef([]);
  const isLoadingNegotiations = ref(false);
  const showNegotiationApprovalModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedNegotiation = ref(null);
  const isSavingNegotiation = ref(false);

  /**
   * @param {string} permission
   * @param {string} [message]
   */
  const ensurePermission = (permission, message = 'غير مصرح بهذا الإجراء') => {
    if (hasPermission(permission)) return true;
    notificationService.addNotification(message, 'warning');
    return false;
  };

  const loadPendingNegotiations = async () => {
    isLoadingNegotiations.value = true;
    try {
      const data = await salesService.getPendingNegotiations();
      pendingNegotiations.value = Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('Error loading pending negotiations:', error);
      pendingNegotiations.value = [];
    } finally {
      isLoadingNegotiations.value = false;
    }
  };

  /** @param {any} negotiation */
  const openNegotiationApproval = negotiation => {
    if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك بمراجعة التفاوضات')) return;
    selectedNegotiation.value = negotiation;
    showNegotiationApprovalModal.value = true;
  };

  /** @param {any} data */
  const handleApproveNegotiation = async data => {
    if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك بالموافقة على التفاوضات'))
      return;
    if (!selectedNegotiation.value) return;
    isSavingNegotiation.value = true;
    try {
      await salesService.approveNegotiation(selectedNegotiation.value.id, data);
      notificationService.addNotification('تم الموافقة على التفاوض بنجاح', 'success');
      showNegotiationApprovalModal.value = false;
      loadPendingNegotiations();
    } catch (error) {
      logger.error('Error approving negotiation:', error);
      notificationService.addNotification('حدث خطأ أثناء الموافقة على التفاوض', 'error');
    } finally {
      isSavingNegotiation.value = false;
    }
  };

  /** @param {any} data */
  const handleRejectNegotiation = async data => {
    if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك برفض التفاوضات')) return;
    if (!selectedNegotiation.value) return;
    isSavingNegotiation.value = true;
    try {
      await salesService.rejectNegotiation(selectedNegotiation.value.id, data);
      notificationService.addNotification('تم رفض التفاوض', 'success');
      showNegotiationApprovalModal.value = false;
      loadPendingNegotiations();
    } catch (error) {
      logger.error('Error rejecting negotiation:', error);
      notificationService.addNotification('حدث خطأ أثناء رفض التفاوض', 'error');
    } finally {
      isSavingNegotiation.value = false;
    }
  };

  return {
    pendingNegotiations,
    isLoadingNegotiations,
    showNegotiationApprovalModal,
    selectedNegotiation,
    isSavingNegotiation,
    loadPendingNegotiations,
    openNegotiationApproval,
    handleApproveNegotiation,
    handleRejectNegotiation,
  };
}
