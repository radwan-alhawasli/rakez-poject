import { ref, computed, onMounted } from 'vue';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import salesService from '@/services/salesService';
import { usePermissions } from '@/composables/usePermissions';
import { ROLE_SALES, ROLE_SALES_LEADER } from '@/constants/roles';
import logger from '@/utils/logger';
import { normalizeVoucherDataPayload } from '@/utils/reservationVoucherNormalize';
import {
  blobFromVoucherAssetDescriptor,
  guessVoucherFilename,
  pickVoucherAssetDescriptor,
} from '@/utils/reservationVoucherAsset';
import authService from '@/services/authService';
import {
  getProjectManagementReservations,
  confirmProjectManagementReservation,
  cancelProjectManagementReservation,
  fetchProjectManagementReservationVoucherDataBlob,
} from '@/services/teamService';

/** إدارة المشاريع (2) أو المدير (1): قائمة الحجوزات من project_management وليس sales/mine */
function usePmReservationsApi() {
  const u = authService.getCurrentUser();
  const t = Number(u?.type);
  return t === 1 || t === 2;
}

export function useReservationsView() {
  const { hasPermission } = usePermissions();

  const isPmReservationsList = computed(() => usePmReservationsApi());

  /** الوحدات المفرغة visible only for Sales (6) and Sales Leader (7) */
  const showEvacuatedTab = computed(() => {
    const u = authService.getCurrentUser();
    const t = Number(u?.type);
    return t === ROLE_SALES || t === ROLE_SALES_LEADER;
  });

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
  const evacuatedUnits = ref([]);

  const canConfirm = computed(
    () => isPmReservationsList.value || hasPermission('sales.reservations.confirm')
  );
  const canConvert = computed(() => hasPermission('sales.waiting_list.convert'));
  const canApproveNeg = computed(
    () => isPmReservationsList.value || hasPermission('sales.negotiation.approve')
  );

  /** Sold units belong exclusively in the evacuated tab */
  const isSold = r => String(r.credit_status || '').toLowerCase() === 'sold';

  const activeCounts = computed(() => ({
    active: reservations.value.filter(
      r =>
        r.status !== 'cancelled' &&
        r.status !== 'canceled' &&
        r.status !== 'rejected' &&
        !isSold(r)
    ).length,
    cancelled: reservations.value.filter(
      r =>
        (r.status === 'cancelled' || r.status === 'canceled' || r.status === 'rejected') &&
        !isSold(r)
    ).length,
    waiting: waitingList.value.length,
    negotiations: negotiations.value.length,
    evacuated: evacuatedUnits.value.length,
  }));

  const filteredReservations = computed(() => {
    const cancelledStatuses = ['cancelled', 'canceled', 'rejected'];
    if (activeTab.value === 'cancelled') {
      return reservations.value
        .filter(r => cancelledStatuses.includes(r.status) && !isSold(r))
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
    }
    if (activeTab.value === 'evacuated') {
      return evacuatedUnits.value.sort(
        (a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
      );
    }
    return reservations.value
      .filter(r => !cancelledStatuses.includes(r.status) && !isSold(r))
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  });

  const loadReservations = async () => {
    try {
      if (isPmReservationsList.value) {
        const items = await getProjectManagementReservations({ per_page: 500 });
        reservations.value = Array.isArray(items) ? items : [];
      } else {
        const u = authService.getCurrentUser();
        const result = await salesService.getReservations({
          marketing_employee_id: u?.id,
          include_cancelled: true,
          per_page: 100,
        });
        const items = result?.items || result?.data || result || [];
        reservations.value = Array.isArray(items) ? items : [];
      }
    } catch (e) {
      logger.error('Error loading reservations:', e);
      reservations.value = [];
      toast.error('تعذر تحميل قائمة الحجوزات');
    }
  };

  const loadWaitingList = async () => {
    if (isPmReservationsList.value) {
      waitingList.value = [];
      return;
    }
    try {
      const items = await salesService.getWaitingList({ per_page: 100 });
      waitingList.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading waiting list:', e);
      waitingList.value = [];
    }
  };

  const loadNegotiations = async () => {
    if (isPmReservationsList.value) {
      const list = reservations.value;
      negotiations.value = list.filter(r => {
        const t = String(r.reservation_type || '').toLowerCase();
        const s = String(r.status || '').toLowerCase();
        return t === 'negotiation' || t.includes('negotiation') || s === 'under_negotiation';
      });
      return;
    }
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

  const loadEvacuatedUnits = async () => {
    if (isPmReservationsList.value) {
      evacuatedUnits.value = [];
      return;
    }
    try {
      const u = authService.getCurrentUser();
      const result = await salesService.getReservations({
        marketing_employee_id: u?.id,
        credit_status: 'sold',
        per_page: 100,
      });
      const items = result?.items || result?.data || result || [];
      evacuatedUnits.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading evacuated units:', e);
      evacuatedUnits.value = [];
    }
  };

  const loadAll = async () => {
    isLoading.value = true;
    try {
      await Promise.all([
        loadReservations(),
        loadWaitingList(),
        loadNegotiations(),
        loadEvacuatedUnits(),
      ]);
    } finally {
      isLoading.value = false;
    }
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
      canceled: 'ملغي',
      rejected: 'مرفوض',
      sold: 'مباع',
    };
    return labels[status] || status;
  };

  /** يظهر زر التأكيد (مطابق لتبويب حجوزات المشروع) */
  function reservationNeedsConfirm(reservation) {
    const s = String(reservation?.status || '').toLowerCase();
    return (
      s === 'pending' ||
      s === 'under_negotiation' ||
      s === 'negotiation' ||
      s === 'awaiting_confirmation'
    );
  }

  const openDetails = item => {
    detailItem.value = item;
  };

  const downloadingReservationId = ref(null);

  const isDownloadingReservation = rid =>
    downloadingReservationId.value != null &&
    String(downloadingReservationId.value) === String(rid);

  /** @param {Uint8Array|ArrayBuffer} pdfBytes */
  function triggerPdfDownloadFromBytes(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** @param {Blob} blob */
  function triggerPdfDownloadFromBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * مسار إدارة المشاريع: GET .../voucher-data فقط (blob) — صورة/PDF أو JSON فيه رابط/صورة.
   */
  const downloadPmVoucherFromDataEndpoint = async id => {
    const { blob, contentType } = await fetchProjectManagementReservationVoucherDataBlob(id);
    const ct = (contentType || blob.type || '').toLowerCase();
    const ab = await blob.arrayBuffer();

    const handleJsonText = async rawText => {
      let payload;
      try {
        payload = JSON.parse(rawText);
      } catch {
        toast.error('تعذر قراءة بيانات السند');
        return;
      }
      const data = payload?.data ?? payload;
      const obj = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
      const asset = pickVoucherAssetDescriptor(obj);
      if (asset) {
        const b = await blobFromVoucherAssetDescriptor(asset);
        triggerPdfDownloadFromBlob(b, guessVoucherFilename(id, b));
        toast.success('تم تنزيل السند');
        return;
      }
      toast.error('لا يوجد ملف سند أو رابط في الاستجابة');
    };

    if (ct.includes('json') || ct.includes('text/plain')) {
      await handleJsonText(new TextDecoder().decode(ab));
      return;
    }

    const head = new TextDecoder('utf-8', { fatal: false }).decode(
      ab.slice(0, Math.min(256, ab.byteLength))
    );
    if (head.trimStart().startsWith('{')) {
      await handleJsonText(new TextDecoder().decode(ab));
      return;
    }

    const outBlob = new Blob([ab], { type: blob.type || 'application/octet-stream' });
    triggerPdfDownloadFromBlob(outBlob, guessVoucherFilename(id, outBlob));
    toast.success('تم تنزيل السند');
  };

  const downloadVoucher = async reservation => {
    const id = reservation.reservation_id || reservation.id;
    if (id == null || id === '') {
      toast.error('تعذر تحديد الحجز');
      return;
    }
    downloadingReservationId.value = id;
    try {
      if (isPmReservationsList.value) {
        await downloadPmVoucherFromDataEndpoint(id);
        return;
      }

      const { generateReservationVoucherPdf } = await import('@/services/pdfService');

      let reservationData;
      let project;
      let unit;
      let employee;
      try {
        const { getReservationVoucherData } = await import('@/services/pdfApi');
        const data = await getReservationVoucherData(id);
        const n = normalizeVoucherDataPayload(data);
        if (n?.reservation != null) {
          reservationData = n.reservation;
          project = n.project ?? {};
          unit = n.unit ?? {};
          employee = n.employee ?? {};
        }
      } catch (_) {
        // Fallback when helper endpoint is unavailable.
      }

      if (reservationData == null) {
        try {
          const blob = await salesService.downloadVoucher(id);
          triggerPdfDownloadFromBlob(blob, guessVoucherFilename(id, blob));
          toast.success('تم تنزيل السند');
          return;
        } catch (_) {
          // Continue to detail + client PDF.
        }
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
      triggerPdfDownloadFromBytes(pdfBytes, `voucher-${id}.pdf`);
      toast.success('تم تنزيل السند');
    } catch (e) {
      logger.error('Error downloading voucher:', e);
      toast.error('حدث خطأ أثناء تحميل السند');
    } finally {
      downloadingReservationId.value = null;
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
          if (isPmReservationsList.value) {
            await confirmProjectManagementReservation(id, { notes: '' });
          } else {
            await salesService.confirmReservation(id);
          }
          toast.success('تم تأكيد الحجز بنجاح');
          await loadAll();
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
          if (isPmReservationsList.value) {
            await cancelProjectManagementReservation(id, {
              reason: 'تم الإلغاء من واجهة إدارة المشاريع',
              notes: '',
            });
          } else {
            await salesService.cancelReservation(id, {
              cancellation_reason: 'تم الإلغاء من قبل المستخدم',
            });
          }
          toast.success('تم إلغاء الحجز');
          await loadAll();
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
          if (isPmReservationsList.value) {
            await confirmProjectManagementReservation(id, { notes: 'قبول التفاوض' });
          } else {
            await salesService.approveNegotiation(id);
          }
          toast.success('تم قبول التفاوض');
          await loadAll();
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
          if (isPmReservationsList.value) {
            await cancelProjectManagementReservation(id, {
              reason: 'رفض التفاوض',
              notes: '',
            });
          } else {
            await salesService.rejectNegotiation(id);
          }
          toast.success('تم رفض التفاوض');
          await loadAll();
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
    isPmReservationsList,
    detailItem,
    showConfirmModal,
    confirmModalConfig,
    reservations,
    waitingList,
    negotiations,
    evacuatedUnits,
    showEvacuatedTab,
    canConfirm,
    canConvert,
    canApproveNeg,
    activeCounts,
    filteredReservations,
    switchTab,
    formatDate,
    formatCurrency,
    getStatusLabel,
    reservationNeedsConfirm,
    openDetails,
    downloadVoucher,
    isDownloadingReservation,
    confirmRes,
    cancelRes,
    convertWaiting,
    cancelWaiting,
    approveNeg,
    rejectNeg,
    onConfirmModalConfirm,
  };
}
