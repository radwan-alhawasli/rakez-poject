import { ref } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useProjectReservations(projectId) {
  const { formatCurrencyAr: formatCurrency } = useFormatters();
  const projectReservations = ref([]);
  const reservationsLoading = ref(false);

  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadReservations = async () => {
    reservationsLoading.value = true;
    try {
      const res = await salesService.getReservations();
      const all = res.data?.data || res.data || [];
      projectReservations.value = all.filter(r => r.contract_id == projectId);
    } catch (e) {
      logger.error(e);
    } finally {
      reservationsLoading.value = false;
    }
  };

  const confirmReservation = (id) => {
    confirmModalConfig.value = {
      title: 'تأكيد الحجز',
      message: 'تأكيد الحجز؟',
      type: 'info',
      confirmText: 'تأكيد',
      resolve: async () => {
        try {
          await salesService.confirmReservation(id);
          notificationService.addNotification('تم تأكيد الحجز بنجاح', 'success');
          loadReservations();
        } catch (e) {
          logger.error(e);
          notificationService.addNotification('فشل تأكيد الحجز', 'error');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const downloadVoucher = async (id) => {
    try {
      const blob = await salesService.downloadVoucher(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      logger.error(e);
      notificationService.addNotification('فشل تنزيل الإيصال', 'error');
    }
  };

  return {
    projectReservations,
    reservationsLoading,
    formatCurrency,
    showConfirmModal,
    confirmModalConfig,
    onConfirmModalConfirm,
    loadReservations,
    confirmReservation,
    downloadVoucher,
  };
}
