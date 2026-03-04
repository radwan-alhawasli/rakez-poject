import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useCreditBookings() {
  const route = useRoute();
  const router = useRouter();
  const isLoading = ref(false);
  const searchQuery = ref('');

  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const confirmedBookings = ref([]);
  const negotiationBookings = ref([]);
  const waitingBookings = ref([]);
  const soldBookings = ref([]);
  const rejectedBookings = ref([]);
  const allBookings = ref([]);

  const selectedBooking = ref(null);
  const selectedFinancingTracker = ref(null);

  const showNegotiationModal = ref(false);
  const showProcessModal = ref(false);
  const showAdvanceConfirmModal = ref(false);
  const isAdvancing = ref(false);
  const showRejectFinancingModal = ref(false);
  const rejectFinancingReason = ref('');
  const rejectFinancingError = ref('');
  const isRejectingFinancing = ref(false);
  const isSavingNegotiation = ref(false);
  const isProcessing = ref(false);

  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });

  const { formatDate: _fmtDate } = useFormatters();
  const formatDate = dateStr => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));

  // ── Sub-tab routing ──

  const bookingsSubTab = computed(() => {
    if (route.name !== 'CreditBookings') return 'confirmed';
    const t = route.query.tab || 'all';
    const allowed = ['all', 'confirmed', 'negotiation', 'waiting', 'sold', 'rejected'];
    return allowed.includes(t) ? t : 'all';
  });

  const setBookingsSubTab = tab => {
    router.push({ name: 'CreditBookings', query: { ...route.query, tab } });
  };

  // ── Booking status helpers ──

  const bookingStatus = booking => {
    const s = String(booking.credit_status ?? booking.status ?? '')
      .toLowerCase()
      .trim();
    return s;
  };

  const matchesTab = (booking, tab) => {
    const s = bookingStatus(booking);
    if (tab === 'rejected')
      return (
        s === 'cancelled' ||
        s === 'rejected' ||
        s === 'canceled' ||
        s.includes('ملغ') ||
        s.includes('مرفوض') ||
        s.includes('cancelled') ||
        s.includes('rejected')
      );
    if (tab === 'confirmed')
      return (
        s === 'confirmed' ||
        s.includes('مؤكد') ||
        s.includes('confirmed') ||
        s.includes('approved')
      );
    if (tab === 'negotiation')
      return s === 'negotiation' || s.includes('تفاوض') || s.includes('negotiation');
    if (tab === 'waiting')
      return s === 'waiting' || s.includes('انتظار') || s.includes('waiting') || s === 'pending';
    if (tab === 'sold') return s === 'sold' || s.includes('مباع') || s.includes('sold');
    if (tab === 'all') return true;
    return true;
  };

  const currentBookingsList = computed(() => {
    const tab = bookingsSubTab.value;
    let raw = [];
    if (tab === 'all') raw = allBookings.value;
    else if (tab === 'confirmed') raw = confirmedBookings.value;
    else if (tab === 'negotiation') raw = negotiationBookings.value;
    else if (tab === 'waiting') raw = waitingBookings.value;
    else if (tab === 'sold') raw = soldBookings.value;
    else if (tab === 'rejected') raw = rejectedBookings.value;
    if (tab === 'all') return raw.filter(b => matchesTab(b, tab));
    return raw;
  });

  const emptyBookingsMessage = computed(() => {
    const tab = bookingsSubTab.value;
    const messages = {
      all: 'لا توجد حجوزات',
      confirmed: 'لا توجد حجوزات مؤكدة',
      negotiation: 'لا توجد حجوزات قيد التفاوض',
      waiting: 'لا توجد حجوزات منتظرة',
      sold: 'لا توجد حجوزات مباعة',
      rejected: 'لا توجد حجوزات مرفوضة أو ملغاة',
    };
    return messages[tab] || 'لا توجد حجوزات';
  });

  const getBookingStatusClass = booking => {
    const s = (booking.credit_status ?? booking.status ?? '').toLowerCase();
    if (s.includes('confirmed') || s.includes('مؤكد') || s.includes('approved'))
      return 'excellent';
    if (s.includes('negotiation') || s.includes('تفاوض')) return 'good';
    if (s.includes('waiting') || s.includes('انتظار')) return 'good';
    if (s.includes('rejected') || s.includes('مرفوض') || s.includes('cancelled'))
      return 'warning';
    return 'good';
  };

  const getBookingStatusLabel = booking => {
    if (booking.credit_status_label_ar) return booking.credit_status_label_ar;
    const s = booking.credit_status ?? booking.status ?? '';
    const map = {
      confirmed: 'مؤكد',
      negotiation: 'قيد التفاوض',
      waiting: 'منتظر',
      sold: 'مباع',
      rejected: 'مرفوض',
      cancelled: 'ملغى',
    };
    return map[s] || s || 'مؤكد';
  };

  // ── Normalization ──

  const normalizeBookingListItem = r => {
    const id = r?.id ?? r?.reservation_id ?? r?.booking_id;
    return { ...r, id, reservation_id: r?.reservation_id ?? r?.id ?? r?.booking_id ?? id };
  };

  const normalizeBookingForModal = raw => {
    if (!raw) return null;
    const p = raw.project ?? {};
    const u = raw.unit ?? raw.contractUnit ?? {};
    const c = raw.client ?? {};
    const f = raw.financial ?? {};
    const m = raw.marketing ?? {};
    const bookingId = raw.id ?? raw.reservation_id;
    const fallback = 'غير محدد';
    const fallbackMarketing = 'غير معين';
    return {
      ...raw,
      id: bookingId ?? raw.id ?? raw.reservation_id,
      reservation_id: raw.reservation_id ?? bookingId,
      project_name: p && p.name != null && p.name !== '' ? p.name : raw.project_name || fallback,
      unit_number: u.number ?? raw.unit_number,
      district: p.district != null && p.district !== '' ? p.district : raw.district ?? '',
      city: p.city != null && p.city !== '' ? p.city : raw.city ?? '',
      area: u.area ?? raw.area,
      unit_type: u.type ?? raw.unit_type,
      property_type:
        p.property_type != null && p.property_type !== ''
          ? p.property_type
          : raw.property_type ?? '',
      property_value: p.unit_value ?? u.price ?? f?.unit_value ?? raw.property_value,
      customer_name:
        c && c.name != null && c.name !== ''
          ? c.name
          : raw.customer_name || raw.client_name || fallback,
      customer_phone: c.mobile ?? c.phone ?? raw.customer_phone,
      customer_email: c.email ?? raw.customer_email,
      nationality: c.nationality ?? raw.nationality,
      iban: c.iban ?? raw.iban,
      deposit_amount: f.down_payment_amount ?? raw.deposit_amount,
      deposit_date: f.down_payment_date ?? raw.deposit_date,
      commission_source: f.commission_payer ?? f.commission_source ?? raw.commission_source,
      payment_method: f.payment_method ?? raw.payment_method,
      purchase_mechanism: f.purchase_mechanism ?? m.purchase_mechanism ?? raw.purchase_mechanism,
      purchase_mechanism_label_ar:
        m.purchase_mechanism_label_ar != null && m.purchase_mechanism_label_ar !== ''
          ? m.purchase_mechanism_label_ar
          : raw.purchase_mechanism_label_ar ?? fallback,
      team_name:
        m.team_name != null && m.team_name !== ''
          ? m.team_name
          : raw.team_name ?? fallbackMarketing,
      project_team:
        m.project_team != null && m.project_team !== ''
          ? m.project_team
          : raw.project_team ?? m.team_name ?? fallbackMarketing,
      seller_team:
        m.seller_team != null && m.seller_team !== ''
          ? m.seller_team
          : raw.seller_team ?? m.team_name ?? fallbackMarketing,
      marketer_name:
        m.marketer_name != null && m.marketer_name !== ''
          ? m.marketer_name
          : raw.marketer_name ?? fallbackMarketing,
      credit_procedure_steps: raw.credit_procedure_steps ?? null,
      created_at: raw.created_at,
    };
  };

  // ── Tracker / advance stage ──

  const TRACKER_LABELS = [
    'رفع الطلب للبنك',
    'صدور التقييم',
    'زيارة المقيم للمشروع',
    'إجراءات بنكية وعقود',
    'تنفيذ العقود',
    'فتره التجهيز قبل الافراغ',
  ];

  const advanceCompletedCount = computed(() => {
    const steps = selectedBooking.value?.credit_procedure_steps;
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed)
        .length;
    }
    const t = selectedFinancingTracker.value;
    const stages = t?.stages ?? [];
    const completed = t?.completed_stages;
    if (typeof completed === 'number') return completed;
    return stages.filter(s => s?.completed || s?.done).length;
  });

  const nextStageLabel = computed(() => {
    const steps = selectedBooking.value?.credit_procedure_steps;
    const n = advanceCompletedCount.value;
    if (Array.isArray(steps) && steps[n])
      return steps[n].label_ar || steps[n].label || TRACKER_LABELS[n] || '';
    return TRACKER_LABELS[n] || '';
  });

  // ── Load functions ──

  const loadAllBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getAllBookings({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      allBookings.value = raw.map(normalizeBookingListItem);
      totalItems.value = data?.total ?? allBookings.value.length;
    } catch (error) {
      logger.error('Error loading all bookings:', error);
      allBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadConfirmedBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getConfirmedBookings({
        search: searchQuery.value,
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      confirmedBookings.value = raw.map(normalizeBookingListItem);
      totalItems.value = data?.total ?? confirmedBookings.value.length;
    } catch (error) {
      logger.error('Error loading confirmed bookings:', error);
      confirmedBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadNegotiationBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getNegotiationBookings({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      negotiationBookings.value = raw.map(normalizeBookingListItem);
      totalItems.value = data?.total ?? negotiationBookings.value.length;
    } catch (error) {
      logger.error('Error loading negotiation bookings:', error);
      negotiationBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadWaitingBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getWaitingBookings({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      waitingBookings.value = raw.map(normalizeBookingListItem);
      totalItems.value = data?.total ?? waitingBookings.value.length;
    } catch (error) {
      logger.error('Error loading waiting bookings:', error);
      waitingBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadSoldBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getSoldBookings({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      soldBookings.value = raw.map(r =>
        normalizeBookingListItem({
          ...r,
          customer_name: r.customer_name ?? r.client_name ?? 'غير محدد',
          project_name: r.project_name ?? 'غير محدد',
          unit_number: r.unit_number,
          created_at: r.created_at ?? r.completed_date,
          credit_status: 'sold',
        })
      );
      totalItems.value = data?.total ?? soldBookings.value.length;
    } catch (error) {
      logger.error('Error loading sold bookings:', error);
      soldBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadRejectedBookings = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getCancelledBookings({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      rejectedBookings.value = raw.map(normalizeBookingListItem);
      totalItems.value = data?.total ?? rejectedBookings.value.length;
    } catch (error) {
      logger.error('Error loading cancelled bookings:', error);
      rejectedBookings.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadBookingsForCurrentTab = async () => {
    const tab = bookingsSubTab.value;
    if (tab === 'all') { loadAllBookings(); return; }
    if (tab === 'confirmed') loadConfirmedBookings();
    else if (tab === 'negotiation') loadNegotiationBookings();
    else if (tab === 'waiting') loadWaitingBookings();
    else if (tab === 'sold') loadSoldBookings();
    else if (tab === 'rejected') loadRejectedBookings();
  };

  // ── Pagination ──

  const handlePageChange = page => {
    currentPage.value = page;
    loadBookingsForCurrentTab();
  };

  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadBookingsForCurrentTab();
  };

  // ── Booking detail ──

  const selectedBookingId = () =>
    selectedBooking.value?.id ?? selectedBooking.value?.reservation_id;

  const viewBookingDetail = async booking => {
    const bookingId = booking?.id ?? booking?.reservation_id ?? booking?.booking_id;
    if (!bookingId) {
      toast.warning('معرف الحجز غير متوفر. لا يمكن عرض التفاصيل.');
      return;
    }
    selectedFinancingTracker.value = null;
    try {
      const full = await creditService.getBookingById(bookingId);
      selectedBooking.value = normalizeBookingForModal(full) || { ...booking, id: bookingId };
      if (full && full.financing !== undefined) {
        selectedFinancingTracker.value = {
          financing: full.financing,
          progress_summary: full.progress_summary,
          current_stage: full.current_stage,
          remaining_days: full.remaining_days,
          all_completed: full.all_completed,
          booking_id: full.id ?? full.reservation_id,
        };
      } else {
        selectedFinancingTracker.value = null;
      }
    } catch {
      selectedBooking.value = { ...booking, id: bookingId, reservation_id: bookingId };
    }
  };

  const clearSelectedBooking = () => {
    selectedBooking.value = null;
    selectedFinancingTracker.value = null;
  };

  // ── Utility ──

  const getApiErrorMessage = (error, fallback) => {
    const msg = error?.response?.data?.message;
    if (msg && typeof msg === 'string') return msg;
    return fallback;
  };

  // ── Booking actions ──

  const onBookingEvacuation = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    try {
      const pending = await creditService.getPendingTitleTransfers();
      const items = pending?.items ?? (Array.isArray(pending) ? pending : []);
      const transfer =
        items.find(t => (t.booking_id ?? t.reservation_id) === bookingId) ?? items[0];
      if (transfer?.id) {
        await creditService.completeTitleTransfer(transfer.id, {});
        toast.success('تم تسجيل الإفراغ بنجاح');
      } else {
        await creditService.initializeTitleTransfer(bookingId);
        toast.success('تم بدء إجراء نقل الملكية. حدد موعد الإفراغ إن لزم.');
      }
      clearSelectedBooking();
      loadBookingsForCurrentTab();
    } catch (e) {
      logger.error('Evacuation error:', e);
      toast.error('حدث خطأ أثناء تنفيذ الإفراغ');
    }
  };

  const onBookingDelete = () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    confirmModalConfig.value = {
      title: 'حذف الحجز',
      message: 'هل أنت متأكد من حذف هذا الحجز؟',
      type: 'danger',
      confirmText: 'حذف',
      resolve: () => {
        creditService
          .cancelBooking(bookingId, {})
          .then(() => {
            toast.success('تم إلغاء الحجز');
            clearSelectedBooking();
            loadBookingsForCurrentTab();
          })
          .catch(e => {
            logger.error('Cancel booking error:', e);
            toast.error('حدث خطأ أثناء الإلغاء');
          });
      },
    };
    showConfirmModal.value = true;
  };

  const onBookingEdit = () => {
    openNegotiationUpdate(selectedBooking.value);
  };

  const onBookingSchedule = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    try {
      let transferId = selectedBooking.value?.title_transfer_id;
      if (!transferId) {
        const res = await creditService.initializeTitleTransfer(bookingId);
        transferId = res?.id ?? res?.data?.id;
      }
      if (transferId) {
        const date = prompt('أدخل تاريخ الإفراغ (YYYY-MM-DD):');
        if (date) {
          await creditService.scheduleTitleTransfer(transferId, { scheduled_date: date });
          toast.success('تم تحديد موعد الإفراغ');
          const tracker = await creditService.getFinancingTracker(bookingId);
          selectedFinancingTracker.value = tracker;
        }
      }
    } catch (e) {
      logger.error('Schedule title transfer error:', e);
      toast.error('حدث خطأ أثناء تحديد الموعد');
    }
  };

  const onBookingCancel = () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    confirmModalConfig.value = {
      title: 'إلغاء الحجز',
      message: 'هل أنت متأكد من إلغاء هذا الحجز؟',
      type: 'danger',
      confirmText: 'إلغاء الحجز',
      resolve: () => {
        creditService
          .cancelBooking(bookingId, {})
          .then(() => {
            toast.success('تم إلغاء الحجز');
            clearSelectedBooking();
            loadBookingsForCurrentTab();
          })
          .catch(e => {
            logger.error('Cancel booking error:', e);
            toast.error('حدث خطأ أثناء الإلغاء');
          });
      },
    };
    showConfirmModal.value = true;
  };

  const onConfirmModalConfirm = () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) fn();
    showConfirmModal.value = false;
  };

  const onBookingNextStage = () => {
    const bookingId = selectedBookingId();
    if (!bookingId) {
      toast.warning('لا يمكن تنفيذ العملية');
      return;
    }
    showAdvanceConfirmModal.value = true;
  };

  const onAdvanceConfirm = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    isAdvancing.value = true;
    try {
      await creditService.advanceFinancing(bookingId, {});
      const updated = await creditService.getFinancingTracker(bookingId);
      selectedFinancingTracker.value = updated;
      showAdvanceConfirmModal.value = false;
      toast.success('تمت المرحلة بنجاح');
    } catch (e) {
      logger.error('Advance financing error:', e);
      toast.error(getApiErrorMessage(e, 'حدث خطأ أثناء الانتقال للمرحلة التالية'));
    } finally {
      isAdvancing.value = false;
    }
  };

  const openRejectFinancingModal = () => {
    const bookingId = selectedBookingId();
    if (!bookingId) {
      toast.warning('لا يوجد حجز محدد');
      return;
    }
    rejectFinancingReason.value = '';
    rejectFinancingError.value = '';
    showRejectFinancingModal.value = true;
  };

  const closeRejectFinancingModal = () => {
    showRejectFinancingModal.value = false;
    rejectFinancingReason.value = '';
    rejectFinancingError.value = '';
  };

  const onRejectFinancingConfirm = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    const reason = rejectFinancingReason.value?.trim();
    if (!reason) {
      rejectFinancingError.value = 'يجب إدخال سبب الرفض';
      return;
    }
    rejectFinancingError.value = '';
    isRejectingFinancing.value = true;
    try {
      await creditService.rejectFinancing(bookingId, { reason });
      toast.success('تم رفض التمويل');
      const updated = await creditService.getFinancingTracker(bookingId);
      selectedFinancingTracker.value = updated;
      closeRejectFinancingModal();
    } catch (e) {
      logger.error('Reject financing error:', e);
      toast.error(getApiErrorMessage(e, 'حدث خطأ أثناء رفض التمويل'));
    } finally {
      isRejectingFinancing.value = false;
    }
  };

  const onBookingRejectFinancing = () => {
    openRejectFinancingModal();
  };

  // ── Negotiation ──

  const openNegotiationUpdate = booking => {
    if (!(booking?.id ?? booking?.reservation_id)) {
      toast.warning('معرف الحجز غير صالح');
      return;
    }
    selectedBooking.value = booking;
    showNegotiationModal.value = true;
  };

  const handleNegotiationUpdate = async data => {
    const bookingId = selectedBookingId();
    if (!bookingId) {
      toast.warning('معرف الحجز غير صالح');
      return;
    }
    isSavingNegotiation.value = true;
    try {
      await creditService.updateNegotiation(bookingId, data);
      toast.success('تم تحديث حالة التفاوض بنجاح');
      showNegotiationModal.value = false;
      loadNegotiationBookings();
    } catch (error) {
      logger.error('Error updating negotiation:', error);
      const msg =
        error?.code === 'INVALID_BOOKING_ID' ? error.message : 'حدث خطأ أثناء تحديث حالة التفاوض';
      toast.error(msg);
    } finally {
      isSavingNegotiation.value = false;
    }
  };

  // ── Process waiting ──

  const openProcessWaiting = booking => {
    if (!(booking?.id ?? booking?.reservation_id)) {
      toast.warning('معرف الحجز غير صالح');
      return;
    }
    selectedBooking.value = booking;
    showProcessModal.value = true;
  };

  const handleProcessWaiting = async data => {
    const bookingId = selectedBookingId();
    if (!bookingId) {
      toast.warning('معرف الحجز غير صالح');
      return;
    }
    isProcessing.value = true;
    try {
      await creditService.processWaitingBooking(bookingId, data);
      toast.success('تم معالجة الحجز بنجاح');
      showProcessModal.value = false;
      loadWaitingBookings();
    } catch (error) {
      logger.error('Error processing waiting booking:', error);
      const msg =
        error?.code === 'INVALID_BOOKING_ID'
          ? error.message
          : getApiErrorMessage(error, 'حدث خطأ أثناء معالجة الحجز');
      toast.error(msg);
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isLoading,
    searchQuery,
    currentPage,
    perPage,
    totalItems,
    bookingsSubTab,
    setBookingsSubTab,
    currentBookingsList,
    emptyBookingsMessage,
    selectedBooking,
    selectedFinancingTracker,
    selectedBookingId,
    showNegotiationModal,
    showProcessModal,
    showAdvanceConfirmModal,
    isAdvancing,
    nextStageLabel,
    showRejectFinancingModal,
    rejectFinancingReason,
    rejectFinancingError,
    isRejectingFinancing,
    isSavingNegotiation,
    isProcessing,
    showConfirmModal,
    confirmModalConfig,
    formatDate,
    getBookingStatusClass,
    getBookingStatusLabel,
    loadBookingsForCurrentTab,
    viewBookingDetail,
    clearSelectedBooking,
    onBookingEvacuation,
    onBookingDelete,
    onBookingEdit,
    onBookingSchedule,
    onBookingCancel,
    onBookingNextStage,
    onBookingRejectFinancing,
    onConfirmModalConfirm,
    onAdvanceConfirm,
    closeRejectFinancingModal,
    onRejectFinancingConfirm,
    openNegotiationUpdate,
    handleNegotiationUpdate,
    openProcessWaiting,
    handleProcessWaiting,
    handlePageChange,
    handlePerPageChange,
  };
}
