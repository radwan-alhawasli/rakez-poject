import { ref, computed, onMounted } from 'vue';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import salesService from '@/services/salesService';
import { usePermissions } from '@/composables/usePermissions';
import logger from '@/utils/logger';

export function useReservationsView() {
  const { hasPermission } = usePermissions();

  const activeTab = ref('active');
  const isLoading = ref(false);
  const detailItem = ref(null);
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });

  const reservations = ref([]);
  const waitingList = ref([]);
  const negotiations = ref([]);

  const canConfirm = computed(() => hasPermission('sales.reservations.confirm'));
  const canConvert = computed(() => hasPermission('sales.waiting_list.convert'));
  const canApproveNeg = computed(() => hasPermission('sales.negotiation.approve'));

  const activeCounts = computed(() => ({
    active: reservations.value.filter(r => r.status !== 'cancelled' && r.status !== 'rejected').length,
    cancelled: reservations.value.filter(r => r.status === 'cancelled' || r.status === 'rejected').length,
    waiting: waitingList.value.length,
    negotiations: negotiations.value.length,
  }));

  const filteredReservations = computed(() => {
    const cancelledStatuses = ['cancelled', 'rejected'];
    if (activeTab.value === 'cancelled') {
      return reservations.value
        .filter(r => cancelledStatuses.includes(r.status))
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
    }
    return reservations.value
      .filter(r => !cancelledStatuses.includes(r.status))
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  });

  const loadReservations = async () => {
    try {
      const result = await salesService.getReservations({
        mine: true,
        include_cancelled: true,
        per_page: 100,
      });
      const items = result?.items || result?.data || result || [];
      reservations.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading reservations:', e);
      reservations.value = [];
    }
  };

  const loadWaitingList = async () => {
    try {
      const items = await salesService.getWaitingList({ per_page: 100 });
      waitingList.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading waiting list:', e);
      waitingList.value = [];
    }
  };

  const loadNegotiations = async () => {
    try {
      const result = await salesService.getReservations({ status: 'under_negotiation', per_page: 100 });
      const items = result?.items || result?.data || result || [];
      negotiations.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading negotiations:', e);
      try {
        const items = await salesService.getPendingNegotiations({ per_page: 100 });
        negotiations.value = Array.isArray(items) ? items : [];
      } catch {
        negotiations.value = [];
      }
    }
  };

  const loadAll = async () => {
    isLoading.value = true;
    await Promise.all([loadReservations(), loadWaitingList(), loadNegotiations()]);
    isLoading.value = false;
  };

  const switchTab = tab => {
    activeTab.value = tab;
  };

  const { formatDateISO: formatDate, formatNumber: formatCurrency } = useFormatters();

  const getStatusLabel = status => {
    const labels = {
      confirmed: 'مؤكد',
      approved: 'مؤكد',
      under_negotiation: 'تفاوض',
      pending: 'قيد الانتظار',
      waiting: 'انتظار',
      cancelled: 'ملغي',
      rejected: 'مرفوض',
      sold: 'مباع',
    };
    return labels[status] || status;
  };

  const openDetails = item => {
    detailItem.value = item;
  };

  const downloadVoucher = async reservation => {
    try {
      const id = reservation.reservation_id || reservation.id;
      const { generateReservationVoucherPdf } = await import('@/services/pdfService');
      let reservationData;
      let project;
      let unit;
      let employee;
      try {
        const { getReservationVoucherData } = await import('@/services/pdfApi');
        const data = await getReservationVoucherData(id);
        if (data?.reservation != null) {
          reservationData = data.reservation;
          project = data.project ?? {};
          unit = data.unit ?? {};
          employee = data.employee ?? {};
        }
      } catch (_) {
        // Fallback when helper endpoint is unavailable.
      }
      if (reservationData == null) {
        let detail = reservation;
        try {
          const full = await salesService.getReservation(id);
          if (full && typeof full === 'object') detail = full;
        } catch (_) {
          // Keep current payload when detail fetch fails.
        }
        reservationData = detail;
        project = detail.project ?? {
          name: detail.project_name ?? detail.projectName,
          city: detail.project_city ?? detail.city,
          district: detail.project_district ?? detail.district,
          developer_name: detail.developer_name ?? detail.developerName,
        };
        unit = detail.unit ?? {
          number: detail.unit_number ?? detail.unitNumber,
          type: detail.unit_type ?? detail.unitType,
          area: detail.unit_area ?? detail.area,
          floor: detail.unit_floor ?? detail.floor,
          price: detail.unit_price ?? detail.price,
        };
        employee = detail.employee ?? {
          name: detail.employee_name ?? detail.employeeName,
          team: detail.employee_team ?? detail.team,
        };
      }
      const pdfBytes = await generateReservationVoucherPdf(reservationData, project, unit, employee);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voucher-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      logger.error('Error downloading voucher:', e);
      toast.error('حدث خطأ أثناء تحميل السند');
    }
  };

  const confirmRes = async reservation => {
    const id = reservation.reservation_id || reservation.id;
    confirmModalConfig.value = {
      title: 'تأكيد الحجز',
      message: `هل تريد تأكيد الحجز للوحدة ${reservation.unit_number || ''}؟`,
      type: 'info',
      confirmText: 'تأكيد',
      resolve: async () => {
        try {
          await salesService.confirmReservation(id);
          toast.success('تم تأكيد الحجز بنجاح');
          await loadReservations();
        } catch (e) {
          logger.error('Error confirming reservation:', e);
          toast.error('حدث خطأ أثناء تأكيد الحجز');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const cancelRes = reservation => {
    const id = reservation.reservation_id || reservation.id;
    confirmModalConfig.value = {
      title: 'تأكيد الإلغاء',
      message: 'هل أنت متأكد من إلغاء هذا الحجز؟',
      type: 'warning',
      confirmText: 'إلغاء الحجز',
      resolve: async () => {
        try {
          await salesService.cancelReservation(id, {
            cancellation_reason: 'تم الإلغاء من قبل المستخدم',
          });
          toast.success('تم إلغاء الحجز');
          await loadReservations();
        } catch (e) {
          logger.error('Error cancelling reservation:', e);
          toast.error('حدث خطأ أثناء إلغاء الحجز');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const convertWaiting = item => {
    confirmModalConfig.value = {
      title: 'تحويل لحجز',
      message: `هل تريد تحويل "${item.client_name}" إلى حجز مؤكد؟`,
      type: 'info',
      confirmText: 'تحويل',
      resolve: async () => {
        try {
          await salesService.convertToReservation(item.id, {
            contract_date: new Date().toISOString().slice(0, 10),
            reservation_type: 'confirmed_reservation',
          });
          toast.success('تم التحويل لحجز بنجاح');
          await Promise.all([loadReservations(), loadWaitingList()]);
        } catch (e) {
          logger.error('Error converting waiting list:', e);
          toast.error('حدث خطأ أثناء التحويل');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const cancelWaiting = item => {
    confirmModalConfig.value = {
      title: 'حذف من قائمة الانتظار',
      message: `هل أنت متأكد من حذف "${item.client_name}" من قائمة الانتظار؟`,
      type: 'warning',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await salesService.cancelWaitingListEntry(item.id);
          toast.success('تم الحذف من قائمة الانتظار');
          await loadWaitingList();
        } catch (e) {
          logger.error('Error deleting waiting list entry:', e);
          toast.error('حدث خطأ أثناء الحذف');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const approveNeg = neg => {
    const id = neg.reservation_id || neg.id || neg.negotiation_id;
    confirmModalConfig.value = {
      title: 'قبول التفاوض',
      message: `هل تريد قبول التفاوض للوحدة ${neg.unit_number || ''}؟`,
      type: 'info',
      confirmText: 'قبول',
      resolve: async () => {
        try {
          await salesService.approveNegotiation(id);
          toast.success('تم قبول التفاوض');
          await loadNegotiations();
        } catch (e) {
          logger.error('Error approving negotiation:', e);
          toast.error('حدث خطأ أثناء القبول');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const rejectNeg = neg => {
    const id = neg.reservation_id || neg.id || neg.negotiation_id;
    confirmModalConfig.value = {
      title: 'رفض التفاوض',
      message: `هل أنت متأكد من رفض التفاوض للوحدة ${neg.unit_number || ''}؟`,
      type: 'warning',
      confirmText: 'رفض',
      resolve: async () => {
        try {
          await salesService.rejectNegotiation(id);
          toast.success('تم رفض التفاوض');
          await loadNegotiations();
        } catch (e) {
          logger.error('Error rejecting negotiation:', e);
          toast.error('حدث خطأ أثناء الرفض');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  onMounted(loadAll);

  return {
    activeTab,
    isLoading,
    detailItem,
    showConfirmModal,
    confirmModalConfig,
    reservations,
    waitingList,
    negotiations,
    canConfirm,
    canConvert,
    canApproveNeg,
    activeCounts,
    filteredReservations,
    switchTab,
    formatDate,
    formatCurrency,
    getStatusLabel,
    openDetails,
    downloadVoucher,
    confirmRes,
    cancelRes,
    convertWaiting,
    cancelWaiting,
    approveNeg,
    rejectNeg,
    onConfirmModalConfirm,
  };
}
