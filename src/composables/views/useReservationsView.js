import { ref, computed, onMounted } from 'vue';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import salesService from '@/services/salesService';
import { usePermissions } from '@/composables/usePermissions';
import { ROLE_SALES, ROLE_SALES_LEADER } from '@/constants/roles';
import logger from '@/utils/logger';
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
  // showEvacuatedTab is defined after evacuatedUnits for data-dependent visibility.

  const activeTab = ref('active');
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any|null>} */
  const detailItem = ref(null);
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    /** @type {Function|null} */
    resolve: null,
  });

  /** @type {import('vue').Ref<any[]>} */
  const reservations = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const waitingList = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const negotiations = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const evacuatedUnits = ref([]);

  /**
   * الوحدات المفرغة: تبويب إضافي للمبيعات.
   * نُظهر التبويب فقط عندما يوجد بيانات فعلية لتجنّب تغيير UI بلا داعي.
   */
  const showEvacuatedTab = computed(() => {
    const u = authService.getCurrentUser();
    const t = Number(u?.type);
    const isSales = t === ROLE_SALES || t === ROLE_SALES_LEADER;
    return isSales && evacuatedUnits.value.length > 0;
  });

  const canConfirm = computed(
    () => isPmReservationsList.value || hasPermission('sales.reservations.confirm')
  );
  const canConvert = computed(() => hasPermission('sales.waiting_list.convert'));
  const canApproveNeg = computed(
    () => isPmReservationsList.value || hasPermission('sales.negotiation.approve')
  );

  /** Sold units belong exclusively in the evacuated tab */
  /** @param {any} r */
  const isSold = r => String(r.credit_status || '').toLowerCase() === 'sold';

  const activeCounts = computed(() => ({
    active: reservations.value.filter(
      r => {
        const item = /** @type {any} */ (r);
        return (
          item.status !== 'cancelled' &&
          item.status !== 'canceled' &&
          item.status !== 'rejected' &&
          !isSold(item)
        );
      }
    ).length,
    cancelled: reservations.value.filter(
      r => {
        const item = /** @type {any} */ (r);
        return (
          (item.status === 'cancelled' || item.status === 'canceled' || item.status === 'rejected') &&
          !isSold(item)
        );
      }
    ).length,
    waiting: waitingList.value.length,
    negotiations: negotiations.value.length,
    evacuated: evacuatedUnits.value.length,
  }));

  const filteredReservations = computed(() => {
    const cancelledStatuses = ['cancelled', 'canceled', 'rejected'];
    if (activeTab.value === 'cancelled') {
      return reservations.value
        .filter(r => {
          const item = /** @type {any} */ (r);
          return cancelledStatuses.includes(item.status) && !isSold(item);
        })
        .sort((a, b) => {
          const da = new Date(/** @type {any} */ (b).created_at || /** @type {any} */ (b).date).getTime();
          const db = new Date(/** @type {any} */ (a).created_at || /** @type {any} */ (a).date).getTime();
          return da - db;
        });
    }
    if (activeTab.value === 'evacuated') {
      return evacuatedUnits.value.sort(
        (a, b) => {
          const da = new Date(/** @type {any} */ (b).created_at || /** @type {any} */ (b).date).getTime();
          const db = new Date(/** @type {any} */ (a).created_at || /** @type {any} */ (a).date).getTime();
          return da - db;
        }
      );
    }
    return reservations.value
      .filter(r => {
        const item = /** @type {any} */ (r);
        return !cancelledStatuses.includes(item.status) && !isSold(item);
      })
      .sort((a, b) => {
        const da = new Date(/** @type {any} */ (b).created_at || /** @type {any} */ (b).date).getTime();
        const db = new Date(/** @type {any} */ (a).created_at || /** @type {any} */ (a).date).getTime();
        return da - db;
      });
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
        /** @type {any} */
        const res = result;
        const items = res?.items || res?.data || res || [];
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
        const item = /** @type {any} */ (r);
        const t = String(item.reservation_type || '').toLowerCase();
        const s = String(item.status || '').toLowerCase();
        return t === 'negotiation' || t.includes('negotiation') || s === 'under_negotiation';
      });
      return;
    }
    try {
      const result = await salesService.getReservations({ status: 'under_negotiation', per_page: 100 });
      /** @type {any} */
      const res = result;
      const items = res?.items || res?.data || res || [];
      negotiations.value = Array.isArray(items) ? items : [];
    } catch (e) {
      logger.error('Error loading negotiations:', e);
      try {
        const result = await salesService.getPendingNegotiations({ per_page: 100 });
        /** @type {any} */
        const res = result;
        const items = res?.items || res?.data || res || [];
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
      /** @type {any} */
      const res = result;
      const items = res?.items || res?.data || res || [];
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

  /** @param {string} tab */
  const switchTab = tab => {
    activeTab.value = tab;
  };

  const { formatDateISO: formatDate, formatNumber: formatCurrency } = useFormatters();

  /** @param {string} status */
  const getStatusLabel = status => {
    /** @type {Record<string, string>} */
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

  /**
   * يظهر زر التأكيد (مطابق لتبويب حجوزات المشروع)
   * @param {any} reservation
   */
  function reservationNeedsConfirm(reservation) {
    const s = String(reservation?.status || '').toLowerCase();
    return (
      s === 'pending' ||
      s === 'under_negotiation' ||
      s === 'negotiation' ||
      s === 'awaiting_confirmation'
    );
  }

  /** @param {any} item */
  const openDetails = item => {
    detailItem.value = item;
  };

  const downloadingReservationId = ref(null);

  /** @param {any} rid */
  const isDownloadingReservation = rid =>
    downloadingReservationId.value != null &&
    String(downloadingReservationId.value) === String(rid);

  /**
   * @param {Uint8Array|ArrayBuffer} pdfBytes
   * @param {string} filename
   */
  function triggerPdfDownloadFromBytes(pdfBytes, filename) {
    const blob = new Blob([/** @type {any} */ (pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * @param {Blob} blob
   * @param {string} filename
   */
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
   * @param {any} id
   */
  const downloadPmVoucherFromDataEndpoint = async id => {
    const { blob, contentType } = await fetchProjectManagementReservationVoucherDataBlob(id);
    const ct = (contentType || blob.type || '').toLowerCase();
    const ab = await blob.arrayBuffer();

    /** @param {any} rawText */
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

  /**
   * @param {any} item
   * @param {string} filename
   */
  const downloadVoucherFile = async (item, filename) => {
    const id = /** @type {any} */ (item).id;
    if (isDownloadingReservation(id)) return;
    /** @type {any} */
    const rid = id;
    downloadingReservationId.value = rid;
    try {
      const result = await fetchProjectManagementReservationVoucherDataBlob(id);
      const bytes = /** @type {any} */ (result);
      triggerPdfDownloadFromBytes(bytes, filename);
    } catch (e) {
      logger.error('Error downloading voucher:', e);
      toast.error('فشل تحميل الإيصال');
    } finally {
      downloadingReservationId.value = null;
    }
  };

  /** @param {any} id */
  const downloadVoucher = async id => {
    if (isDownloadingReservation(id)) return;
    /** @type {any} */
    const rid = id;
    downloadingReservationId.value = rid;
    try {
      const result = await fetchProjectManagementReservationVoucherDataBlob(id);
      const bytes = /** @type {any} */ (result);
      triggerPdfDownloadFromBytes(bytes, `voucher-${id}.pdf`);
    } catch (e) {
      logger.error('Error downloading voucher:', e);
      toast.error('فشل تحميل الإيصال');
    } finally {
      downloadingReservationId.value = null;
    }
  };

  /** @param {any} rawText */
  const formatProjectName = rawText => {
    if (!rawText) return '-';
    return String(rawText).replace('مشروع', '').trim();
  };

  const closeModal = () => {
    detailItem.value = null;
  };

  const closeConfirmModal = () => {
    showConfirmModal.value = false;
    confirmModalConfig.value = {
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    };
  };

  const confirmAction = () => {
    const config = /** @type {any} */ (confirmModalConfig.value);
    if (config.resolve) {
      config.resolve();
    }
    closeConfirmModal();
  };

  /** @param {any} reservation */
  const handleConfirmReservation = async reservation => {
    if (!reservation?.id) return;
    confirmModalConfig.value = {
      title: 'تأكيد الحجز',
      message: `هل أنت متأكد من تأكيد الحجز للوحدة ${reservation.unit_name || reservation.unit_id}؟`,
      type: 'warning',
      confirmText: 'تأكيد الحجز',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await confirmProjectManagementReservation(reservation.id);
            toast.success('تم تأكيد الحجز بنجاح');
            await loadAll();
          } catch (e) {
            logger.error('Error confirming reservation:', e);
            toast.error('فشل تأكيد الحجز');
          } finally {
            isLoading.value = false;
          }
        }
      ),
    };
    showConfirmModal.value = true;
  };

  /** @param {any} reservation */
  const handleCancelReservation = async reservation => {
    if (!reservation?.id) return;
    confirmModalConfig.value = {
      title: 'إلغاء الحجز',
      message: `هل أنت متأكد من إلغاء الحجز للوحدة ${reservation.unit_name || reservation.unit_id}؟`,
      type: 'error',
      confirmText: 'إلغاء الحجز',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await cancelProjectManagementReservation(reservation.id);
            toast.success('تم إلغاء الحجز بنجاح');
            await loadAll();
          } catch (e) {
            logger.error('Error cancelling reservation:', e);
            toast.error('فشل إلغاء الحجز');
          } finally {
            isLoading.value = false;
          }
        }
      ),
    };
    showConfirmModal.value = true;
  };

  /** @param {any} item */
  const handleConvertWaiting = async item => {
    if (!item?.id) return;
    confirmModalConfig.value = {
      title: 'تحويل قائمة الانتظار',
      message: `هل أنت متأكد من تحويل العميل ${item.customer_name} إلى حجز مؤكد؟`,
      type: 'warning',
      confirmText: 'تحويل',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await salesService.convertToReservation(item.id, {});
            toast.success('تم التحويل بنجاح');
            await loadAll();
          } catch (e) {
            logger.error('Error converting waiting:', e);
            toast.error('فشل التحويل');
          } finally {
            isLoading.value = false;
          }
        }
      ),
    };
    showConfirmModal.value = true;
  };

  /** @param {any} item */
  const handleCancelWaiting = async item => {
    if (!item?.id) return;
    confirmModalConfig.value = {
      title: 'إلغاء طلب الانتظار',
      message: `هل أنت متأكد من إلغاء طلب الانتظار للعميل ${item.customer_name}؟`,
      type: 'error',
      confirmText: 'إلغاء',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await salesService.cancelWaitingListEntry(item.id);
            toast.success('تم الإلغاء بنجاح');
            await loadAll();
          } catch (e) {
            logger.error('Error cancelling waiting:', e);
            toast.error('فشل الإلغاء');
          } finally {
            isLoading.value = false;
          }
        }
      ),
    };
    showConfirmModal.value = true;
  };

  /** @param {any} neg */
  const handleApproveNeg = async neg => {
    if (!neg?.id) return;
    confirmModalConfig.value = {
      title: 'قبول التفاوض',
      message: `هل أنت متأكد من قبول عرض التفاوض للعميل ${neg.customer_name}؟`,
      type: 'warning',
      confirmText: 'قبول',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await salesService.approveNegotiation(neg.id);
            toast.success('تم قبول التفاوض بنجاح');
            await loadAll();
          } catch (e) { 
            logger.error('Error approving neg:', e);
            toast.error('فشل القبول');
          } finally {
            isLoading.value = false;
          }
        }
      ),
    };
    showConfirmModal.value = true;
  };

  /** @param {any} neg */
  const handleRejectNeg = async neg => {
    if (!neg?.id) return;
    confirmModalConfig.value = {
      title: 'رفض التفاوض',
      message: `هل أنت متأكد من رفض عرض التفاوض للعميل ${neg.customer_name}؟`,
      type: 'error',
      confirmText: 'رفض',
      resolve: /** @type {any} */ (
        async () => {
          try {
            isLoading.value = true;
            await salesService.rejectNegotiation(neg.id);
            toast.success('تم رفض التفاوض بنجاح');
            await loadAll();
          } catch (e) {
            logger.error('Error rejecting neg:', e);
            toast.error('فشل الرفض');
          } finally {
            isLoading.value = false;
          }
        }
      ),
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
    handleConfirmReservation,
    handleCancelReservation,
    handleConvertWaiting,
    handleCancelWaiting,
    handleApproveNeg,
    handleRejectNeg,
    confirmAction,
    closeConfirmModal,
    formatProjectName,
    downloadVoucher,
    downloadVoucherFile,
    isDownloadingReservation,
    downloadPmVoucherFromDataEndpoint,
    closeModal,
    onConfirmModalConfirm,
  };
}
