import { ref } from 'vue';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import {
  getProjectManagementReservations,
  confirmProjectManagementReservation,
  cancelProjectManagementReservation,
  downloadProjectManagementReservationVoucher,
} from '@/services/teamService';

/**
 * معرف الحجز من عنصر القائمة
 * @param {any} r
 */
function reservationRowId(r) {
  return r?.reservation_id ?? r?.id;
}

/**
 * هل يمكن تأكيد الحجز من الواجهة
 * @param {any} status
 */
function statusAllowsConfirm(status) {
  const s = String(status || '').toLowerCase();
  return (
    s === 'pending' ||
    s === 'under_negotiation' ||
    s === 'negotiation' ||
    s === 'awaiting_confirmation'
  );
}

/**
 * هل يمكن إلغاء الحجز
 * @param {any} status
 */
function statusAllowsCancel(status) {
  const s = String(status || '').toLowerCase();
  return s !== 'cancelled' && s !== 'canceled';
}

/** @param {any} projectId */
export function useProjectReservations(projectId) {
  const { formatCurrencyAr: formatCurrency } = useFormatters();
  /** @type {import('vue').Ref<any[]>} */
  const projectReservations = ref([]);
  const reservationsLoading = ref(false);

  const showConfirmModal = ref(false);
  /** @type {import('vue').Ref<{title: string, message: string, type: string, confirmText: string, resolve: (() => Promise<void>) | null}>} */
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadReservations = async () => {
    reservationsLoading.value = true;
    try {
      const all = await getProjectManagementReservations({ per_page: 500 });
      /** @type {any[]} */
      const list = Array.isArray(all) ? all : [];
      const pid = projectId != null ? String(projectId) : '';
      projectReservations.value = pid
        ? list.filter(r => String(r.contract_id ?? r.contractId ?? '') === pid)
        : list;
    } catch (e) {
      logger.error('loadReservations PM', e);
      projectReservations.value = [];
      notificationService.addNotification('تعذر تحميل الحجوزات', 'error');
    } finally {
      reservationsLoading.value = false;
    }
  };

  /** @param {any} id */
  const confirmReservation = id => {
    confirmModalConfig.value = {
      title: 'تأكيد الحجز',
      message: 'تأكيد الحجز؟',
      type: 'info',
      confirmText: 'تأكيد',
      resolve: async () => {
        try {
          await confirmProjectManagementReservation(id, { notes: '' });
          notificationService.addNotification('تم تأكيد الحجز بنجاح', 'success');
          await loadReservations();
        } catch (e) {
          logger.error(e);
          notificationService.addNotification('فشل تأكيد الحجز', 'error');
        }
      },
    };
    showConfirmModal.value = true;
  };

  /** @param {any} id */
  const cancelReservation = id => {
    const reason = window.prompt('سبب الإلغاء (اختياري):') ?? '';
    confirmModalConfig.value = {
      title: 'إلغاء الحجز',
      message: 'هل تريد إلغاء هذا الحجز؟',
      type: 'warning',
      confirmText: 'إلغاء الحجز',
      resolve: async () => {
        try {
          await cancelProjectManagementReservation(id, {
            reason: reason || '—',
            notes: '',
          });
          notificationService.addNotification('تم إلغاء الحجز', 'success');
          await loadReservations();
        } catch (e) {
          logger.error(e);
          notificationService.addNotification('فشل إلغاء الحجز', 'error');
        }
      },
    };
    showConfirmModal.value = true;
  };

  /** @param {any} id */
  const downloadVoucher = async id => {
    try {
      const blob = await downloadProjectManagementReservationVoucher(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reservation-voucher-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      notificationService.addNotification('تم تنزيل السند', 'success');
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
    cancelReservation,
    downloadVoucher,
    reservationRowId,
    statusAllowsConfirm,
    statusAllowsCancel,
  };
}
