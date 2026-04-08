/* eslint-disable max-lines -- Documented exception: credit bookings hub (tabs + financing/title flows); extract to sub-composables in a follow-up pass. */
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError, getApiErrorMessage } from '@/utils/errorHandler';
import { useFormatters } from '@/composables/useFormatters';
import {
  CREDIT_FINANCING_STAGE_LABELS,
  recordAfterAdvance,
} from '@/utils/creditFinancingStages';

function stripEmptyPayload(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = typeof v === 'string' ? v.trim() : v;
    if (s === '') return;
    out[k] = typeof v === 'string' ? v.trim() : v;
  });
  return out;
}

/** دمج استجابة GET /financing مع حقول العرض إن وُجدت في GET /bookings/:id */
function buildFinancingTrackerState(financingGet, bookingPayload, bookingId) {
  const fromFin = financingGet && typeof financingGet === 'object' ? financingGet : {};
  const fromBook = bookingPayload && typeof bookingPayload === 'object' ? bookingPayload : {};
  const financing = fromFin.financing ?? fromBook.financing;
  const stages = fromFin.stages ?? fromBook.stages ?? fromBook.financing?.stages;
  const merged = {
    ...fromFin,
    financing,
    stages,
    progress_summary: fromFin.progress_summary ?? fromBook.progress_summary,
    current_stage: fromFin.current_stage ?? fromBook.current_stage,
    remaining_days: fromFin.remaining_days ?? fromBook.remaining_days,
    all_completed: fromFin.all_completed ?? fromBook.all_completed,
    completed_stages: fromFin.completed_stages ?? fromBook.completed_stages,
    delay_days: fromFin.delay_days ?? fromBook.delay_days,
    booking_id: fromFin.booking_id ?? fromBook.id ?? fromBook.reservation_id ?? bookingId,
  };
  const hasSignal =
    merged.financing != null ||
    merged.all_completed === true ||
    (Array.isArray(merged.stages) && merged.stages.length > 0) ||
    typeof merged.current_stage === 'number' ||
    (typeof merged.completed_stages === 'number' && merged.completed_stages > 0);
  return hasSignal ? merged : null;
}

function countCompletedStages(tracker, booking) {
  const t = tracker;
  const b = booking;
  if (t?.all_completed) return 6;
  if (typeof t?.completed_stages === 'number') return Math.min(6, t.completed_stages);
  const steps = b?.credit_procedure_steps;
  if (Array.isArray(steps) && steps.length > 0) {
    return steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed).length;
  }
  const stages = t?.stages ?? [];
  if (Array.isArray(stages) && stages.length > 0) {
    return stages.filter(s => s?.completed || s?.done || s?.status === 'completed').length;
  }
  return 0;
}

export function useCreditBookings() {
  const route = useRoute();
  const router = useRouter();
  const isLoading = ref(false);
  const searchQuery = ref('');

  const showScheduleDateModal = ref(false);
  const scheduleDateInput = ref('');
  const pendingScheduleTransferId = ref(null);
  const pendingScheduleBookingId = ref(null);

  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const confirmedBookings = ref([]);
  const negotiationBookings = ref([]);
  const waitingBookings = ref([]);
  const soldBookings = ref([]);
  const rejectedBookings = ref([]);

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
  const showEditFinancingStageModal = ref(false);
  const editFinancingStageNumber = ref(1);
  const editFinancingForm = ref({
    bank_name: '',
    client_salary: '',
    employment_type: '',
    appraiser_name: '',
    notes: '',
  });
  const isSavingFinancingStage = ref(false);
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

  /** تواريخ الجدول: YYYY-MM-DD بدون انحراف تقويم/منطقة زمنية */
  const formatBookingListDate = dateStr => {
    if (dateStr == null || dateStr === '') return 'غير محدد';
    const s = String(dateStr).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return _fmtDate(dateStr);
  };

  // ── Sub-tab routing ──

  const bookingsSubTab = computed(() => {
    if (route.name !== 'CreditBookings') return 'confirmed';
    let t = route.query.tab || 'confirmed';
    if (t === 'all') t = 'confirmed';
    const allowed = ['confirmed', 'negotiation', 'waiting', 'sold', 'rejected'];
    return allowed.includes(t) ? t : 'confirmed';
  });

  watch(
    () => [route.name, route.query.tab],
    () => {
      if (route.name === 'CreditBookings' && route.query.tab === 'all') {
        router.replace({ name: 'CreditBookings', query: { ...route.query, tab: 'confirmed' } });
      }
    },
    { immediate: true },
  );

  const hasBookingRowActions = computed(() =>
    ['confirmed', 'negotiation', 'waiting'].includes(bookingsSubTab.value),
  );

  const setBookingsSubTab = tab => {
    router.push({ name: 'CreditBookings', query: { ...route.query, tab } });
  };

  const currentBookingsList = computed(() => {
    const tab = bookingsSubTab.value;
    if (tab === 'confirmed') return confirmedBookings.value;
    if (tab === 'negotiation') return negotiationBookings.value;
    if (tab === 'waiting') return waitingBookings.value;
    if (tab === 'sold') return soldBookings.value;
    if (tab === 'rejected') return rejectedBookings.value;
    return confirmedBookings.value;
  });

  const emptyBookingsMessage = computed(() => {
    const tab = bookingsSubTab.value;
    const messages = {
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
    const snap = raw.snapshot && typeof raw.snapshot === 'object' ? raw.snapshot : {};
    const sp = snap.project && typeof snap.project === 'object' ? snap.project : {};
    const su = snap.unit && typeof snap.unit === 'object' ? snap.unit : {};
    const sc = snap.client && typeof snap.client === 'object' ? snap.client : {};
    const spay = snap.payment && typeof snap.payment === 'object' ? snap.payment : {};
    const sem = snap.employee && typeof snap.employee === 'object' ? snap.employee : {};
    const p = raw.project ?? {};
    const u = raw.unit ?? raw.contractUnit ?? {};
    const c = raw.client ?? {};
    const f = raw.financial ?? {};
    const m = raw.marketing ?? {};
    const cu = raw.contract_unit && typeof raw.contract_unit === 'object' ? raw.contract_unit : {};
    const mk = raw.marketing_employee && typeof raw.marketing_employee === 'object' ? raw.marketing_employee : {};
    const ct = raw.contract && typeof raw.contract === 'object' ? raw.contract : {};
    const bookingId = raw.id ?? raw.reservation_id;
    const fallback = 'غير محدد';
    const fallbackMarketing = 'غير معين';
    return {
      ...raw,
      id: bookingId ?? raw.id ?? raw.reservation_id,
      reservation_id: raw.reservation_id ?? bookingId,
      project_name:
        raw.project_name ||
        (sp.name != null && sp.name !== '' ? sp.name : null) ||
        ct.project_name ||
        (p.name != null && p.name !== '' ? p.name : null) ||
        fallback,
      unit_number:
        su.number ??
        u.number ??
        cu.unit_number ??
        raw.unit_number,
      district:
        (sp.district != null && sp.district !== '' ? sp.district : null) ??
        (p.district != null && p.district !== '' ? p.district : raw.district ?? ''),
      city:
        (sp.city != null && sp.city !== '' ? sp.city : null) ??
        (p.city != null && p.city !== '' ? p.city : raw.city ?? ''),
      area: su.area ?? u.area ?? cu.area ?? raw.area,
      unit_type: su.type ?? u.type ?? cu.unit_type ?? raw.unit_type,
      property_type:
        p.property_type != null && p.property_type !== ''
          ? p.property_type
          : raw.property_type ?? '',
      property_value:
        su.price ??
        p.unit_value ??
        u.price ??
        cu.price ??
        f?.unit_value ??
        raw.property_value,
      customer_name:
        raw.client_name ||
        (sc.name != null && sc.name !== '' ? sc.name : null) ||
        (c.name != null && c.name !== '' ? c.name : null) ||
        raw.customer_name ||
        fallback,
      customer_phone: sc.mobile ?? c.mobile ?? c.phone ?? raw.customer_phone,
      customer_email: c.email ?? raw.customer_email,
      nationality: sc.nationality ?? c.nationality ?? raw.nationality ?? raw.client_nationality,
      iban: sc.iban ?? c.iban ?? raw.client_iban ?? raw.iban,
      deposit_amount:
        raw.down_payment_amount ?? spay.amount ?? f.down_payment_amount ?? raw.deposit_amount,
      deposit_date: raw.booking_date ?? f.down_payment_date ?? raw.deposit_date ?? raw.contract_date,
      commission_source:
        raw.commission_payer ?? f.commission_payer ?? f.commission_source ?? raw.commission_source,
      payment_method: raw.payment_method ?? spay.method ?? f.payment_method,
      purchase_mechanism:
        raw.purchase_mechanism ?? spay.mechanism ?? f.purchase_mechanism ?? m.purchase_mechanism,
      purchase_mechanism_label_ar:
        m.purchase_mechanism_label_ar != null && m.purchase_mechanism_label_ar !== ''
          ? m.purchase_mechanism_label_ar
          : raw.purchase_mechanism_label_ar ?? fallback,
      team_name:
        (mk.team && typeof mk.team === 'object' && mk.team.name) ||
        (sem.team && typeof sem.team === 'object' && sem.team.name) ||
        (typeof sem.team === 'string' && sem.team.trim() ? sem.team : null) ||
        (m.team_name != null && m.team_name !== '' ? m.team_name : null) ||
        raw.team_name ||
        fallbackMarketing,
      project_team:
        m.project_team != null && m.project_team !== ''
          ? m.project_team
          : raw.project_team ??
            (mk.team && typeof mk.team === 'object' ? mk.team.name : null) ??
            fallbackMarketing,
      seller_team:
        m.seller_team != null && m.seller_team !== ''
          ? m.seller_team
          : raw.seller_team ??
            (mk.team && typeof mk.team === 'object' ? mk.team.name : null) ??
            fallbackMarketing,
      marketer_name:
        mk.name ||
        sem.name ||
        (m.marketer_name != null && m.marketer_name !== '' ? m.marketer_name : null) ||
        raw.marketer_name ||
        fallbackMarketing,
      credit_procedure_steps: raw.credit_procedure_steps ?? null,
      created_at: raw.created_at,
      confirmed_at: raw.confirmed_at ?? raw.booking_date ?? null,
      credit_status_label_ar: raw.credit_status_label_ar ?? null,
      title_transfer: raw.title_transfer && typeof raw.title_transfer === 'object' ? raw.title_transfer : null,
      title_transfer_id: raw.title_transfer?.id ?? raw.title_transfer_id ?? null,
    };
  };

  // ── Tracker / advance stage ──

  const advanceCompletedCount = computed(() => {
    const t = selectedFinancingTracker.value;
    if (t?.all_completed) return 6;
    const steps = selectedBooking.value?.credit_procedure_steps;
    if (Array.isArray(steps) && steps.length > 0) {
      return Math.min(
        6,
        steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed).length
      );
    }
    const stages = t?.stages ?? [];
    const completed = t?.completed_stages;
    if (typeof completed === 'number') return Math.min(6, completed);
    return Math.min(6, stages.filter(s => s?.completed || s?.done).length);
  });

  const nextStageLabel = computed(() => {
    const steps = selectedBooking.value?.credit_procedure_steps;
    const n = advanceCompletedCount.value;
    if (Array.isArray(steps) && steps[n])
      return steps[n].label_ar || steps[n].label || CREDIT_FINANCING_STAGE_LABELS[n] || '';
    return CREDIT_FINANCING_STAGE_LABELS[n] || '';
  });

  // ── Load functions ──

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
    if (tab === 'confirmed') loadConfirmedBookings();
    else if (tab === 'negotiation') loadNegotiationBookings();
    else if (tab === 'waiting') loadWaitingBookings();
    else if (tab === 'sold') loadSoldBookings();
    else if (tab === 'rejected') loadRejectedBookings();
  };

  /**
   * تبويبات الحجوزات تغيّر فقط ?tab= مع بقاء المسار /credit/bookings؛ MainLayout يستخدم key=route.path
   * فلا يتغيّر المسار ولا يُعاد إنشاء التبويب — يجب جلب القائمة عند تغيير ?tab=.
   * immediate: أول تحميل بدل onMounted في التبويب فقط (تجنّب جلب مزدوج).
   */
  watch(
    () => (route.name === 'CreditBookings' ? bookingsSubTab.value : null),
    (tab, prevTab) => {
      if (tab == null) return;
      if (prevTab === tab) return;
      currentPage.value = 1;
      loadBookingsForCurrentTab();
    },
    { immediate: true },
  );

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

  const refreshBookingDetail = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    try {
      const [full, financingTracker] = await Promise.all([
        creditService.getBookingById(bookingId),
        creditService.getFinancingTracker(bookingId).catch(() => null),
      ]);
      const payload = full?.data && typeof full.data === 'object' ? full.data : full;
      selectedBooking.value = normalizeBookingForModal(payload) || selectedBooking.value;
      selectedFinancingTracker.value = buildFinancingTrackerState(financingTracker, payload, bookingId);
    } catch (e) {
      logger.error('refreshBookingDetail:', e);
    }
  };

  const viewBookingDetail = async booking => {
    const bookingId = booking?.id ?? booking?.reservation_id ?? booking?.booking_id;
    if (!bookingId) {
      toast.warning('معرف الحجز غير متوفر. لا يمكن عرض التفاصيل.');
      return;
    }
    selectedFinancingTracker.value = null;
    try {
      const [full, financingTracker] = await Promise.all([
        creditService.getBookingById(bookingId),
        creditService.getFinancingTracker(bookingId).catch(() => null),
      ]);
      const payload = full?.data && typeof full.data === 'object' ? full.data : full;
      selectedBooking.value = normalizeBookingForModal(payload) || { ...booking, id: bookingId };
      selectedFinancingTracker.value = buildFinancingTrackerState(financingTracker, payload, bookingId);
    } catch {
      selectedBooking.value = { ...booking, id: bookingId, reservation_id: bookingId };
      selectedFinancingTracker.value = null;
    }
  };

  const clearSelectedBooking = () => {
    selectedBooking.value = null;
    selectedFinancingTracker.value = null;
  };

  // ── Booking actions ──

  const onBookingEvacuation = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    const tid =
      selectedBooking.value?.title_transfer?.id ?? selectedBooking.value?.title_transfer_id;
    if (!tid) {
      toast.warning('لا يوجد طلب نقل ملكية. ابدأ إجراءات نقل الملكية أولاً.');
      return;
    }
    try {
      await creditService.completeTitleTransfer(tid, {});
      toast.success('تم تسجيل الإفراغ بنجاح');
      clearSelectedBooking();
      loadBookingsForCurrentTab();
    } catch (e) {
      logger.error('Evacuation error:', e);
      showApiError(e, 'حدث خطأ أثناء تنفيذ الإفراغ');
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

  const closeEditFinancingStageModal = () => {
    showEditFinancingStageModal.value = false;
    isSavingFinancingStage.value = false;
  };

  const onSubmitEditFinancingStage = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    const n = Number(editFinancingStageNumber.value);
    if (n < 1 || n > 6) {
      toast.warning('اختر مرحلة بين 1 و 6');
      return;
    }
    const f = editFinancingForm.value;
    let payload = {};
    if (n === 1) {
      const bank_name = f.bank_name?.trim();
      if (!bank_name) {
        toast.warning('اسم البنك مطلوب للمرحلة الأولى');
        return;
      }
      payload = {
        bank_name,
        client_salary: f.client_salary,
        employment_type: f.employment_type,
      };
    } else if (n === 4) {
      payload = { appraiser_name: f.appraiser_name, notes: f.notes };
    } else {
      payload = { notes: f.notes };
    }
    const body = stripEmptyPayload(payload);
    if (Object.keys(body).length === 0) {
      toast.warning('أدخل بيانات لتحديث هذه المرحلة');
      return;
    }
    isSavingFinancingStage.value = true;
    try {
      await creditService.completeFinancingStage(bookingId, n, body);
      toast.success('تم حفظ تعديل المرحلة');
      closeEditFinancingStageModal();
      await refreshBookingDetail();
    } catch (e) {
      logger.error('Edit financing stage error:', e);
      showApiError(e, 'حدث خطأ أثناء حفظ المرحلة');
    } finally {
      isSavingFinancingStage.value = false;
    }
  };

  const onBookingEdit = () => {
    if (!selectedBookingId()) {
      toast.warning('لا يوجد حجز للتعديل');
      return;
    }
    editFinancingStageNumber.value = 1;
    editFinancingForm.value = {
      bank_name: '',
      client_salary: '',
      employment_type: '',
      appraiser_name: '',
      notes: '',
    };
    showEditFinancingStageModal.value = true;
  };

  const onBookingSchedule = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    try {
      let transferId =
        selectedBooking.value?.title_transfer?.id ?? selectedBooking.value?.title_transfer_id;
      if (!transferId) {
        const res = await creditService.initializeTitleTransfer(bookingId);
        const tt = res?.title_transfer ?? res?.data?.title_transfer ?? res;
        transferId = tt?.id ?? res?.id ?? res?.data?.id;
        if (tt?.id || transferId) {
          selectedBooking.value = {
            ...selectedBooking.value,
            title_transfer: tt || { id: transferId },
            title_transfer_id: transferId,
          };
        }
      }
      if (transferId) {
        pendingScheduleTransferId.value = transferId;
        pendingScheduleBookingId.value = bookingId;
        scheduleDateInput.value = '';
        showScheduleDateModal.value = true;
      }
    } catch (e) {
      logger.error('Schedule title transfer error:', e);
      toast.error('حدث خطأ أثناء تحديد الموعد');
    }
  };

  const onStartTitleTransfer = async () => {
    const bookingId = selectedBookingId();
    if (!bookingId) return;
    try {
      const res = await creditService.initializeTitleTransfer(bookingId);
      const tt = res?.title_transfer ?? res?.data?.title_transfer ?? res;
      const id = tt?.id ?? res?.id ?? res?.data?.id;
      selectedBooking.value = {
        ...selectedBooking.value,
        title_transfer: tt || (id ? { id } : null),
        title_transfer_id: id ?? selectedBooking.value?.title_transfer_id,
      };
      toast.success('تم بدء إجراءات نقل الملكية');
      await refreshBookingDetail();
    } catch (e) {
      logger.error('Start title transfer error:', e);
      showApiError(e, 'حدث خطأ أثناء بدء نقل الملكية');
    }
  };

  const onUnscheduleTitleTransfer = async () => {
    const tid =
      selectedBooking.value?.title_transfer?.id ?? selectedBooking.value?.title_transfer_id;
    if (!tid) {
      toast.warning('لا يوجد طلب نقل ملكية');
      return;
    }
    try {
      await creditService.unscheduleTitleTransfer(tid);
      toast.success('تم إلغاء موعد الإفراغ');
      await refreshBookingDetail();
    } catch (e) {
      logger.error('Unschedule title transfer error:', e);
      showApiError(e, 'حدث خطأ أثناء إلغاء الموعد');
    }
  };

  const confirmScheduleDate = async () => {
    const date = scheduleDateInput.value;
    if (!date) {
      toast.warning('الرجاء إدخال التاريخ');
      return;
    }
    try {
      await creditService.scheduleTitleTransfer(pendingScheduleTransferId.value, { scheduled_date: date });
      toast.success('تم تحديد موعد الإفراغ');
      await refreshBookingDetail();
    } catch (e) {
      logger.error('Confirm schedule date error:', e);
      toast.error('حدث خطأ أثناء تحديد الموعد');
    } finally {
      showScheduleDateModal.value = false;
      pendingScheduleTransferId.value = null;
      pendingScheduleBookingId.value = null;
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
      await refreshBookingDetail();
      const done = countCompletedStages(selectedFinancingTracker.value, selectedBooking.value);
      recordAfterAdvance(bookingId, done, selectedBooking.value);
      showAdvanceConfirmModal.value = false;
      toast.success('تمت المرحلة بنجاح');
    } catch (e) {
      logger.error('Advance financing error:', e);
      showApiError(e, 'حدث خطأ أثناء الانتقال للمرحلة التالية');
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
      if (selectedBooking.value) {
        selectedBooking.value = {
          ...selectedBooking.value,
          credit_status: 'rejected',
          credit_status_label_ar: 'مرفوض التمويل',
        };
      }
      await refreshBookingDetail();
      closeRejectFinancingModal();
    } catch (e) {
      logger.error('Reject financing error:', e);
      showApiError(e, 'حدث خطأ أثناء رفض التمويل');
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
    showEditFinancingStageModal,
    editFinancingStageNumber,
    editFinancingForm,
    isSavingFinancingStage,
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
    hasBookingRowActions,
    formatBookingListDate,
    loadBookingsForCurrentTab,
    viewBookingDetail,
    clearSelectedBooking,
    onBookingEvacuation,
    onBookingDelete,
    onBookingEdit,
    onSubmitEditFinancingStage,
    closeEditFinancingStageModal,
    onBookingSchedule,
    onStartTitleTransfer,
    onUnscheduleTitleTransfer,
    refreshBookingDetail,
    showScheduleDateModal,
    scheduleDateInput,
    confirmScheduleDate,
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
