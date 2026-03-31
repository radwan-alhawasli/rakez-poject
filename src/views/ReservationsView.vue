<template>
  <div class="reservations-page my-reservations">
    <div class="welcome-header">
      <h1 class="welcome-title">حجوزاتي</h1>
      <p class="welcome-subtitle">عرض جميع الوحدات التي قمت بحجزها وتتبع حالتها.</p>
    </div>

    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'active' }]"
        @click="switchTab('active')"
      >
        حجوزات
        <span v-if="activeCounts.active" class="tab-count">{{ activeCounts.active }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'cancelled' }]"
        @click="switchTab('cancelled')"
      >
        حجوزات ملغاة
        <span v-if="activeCounts.cancelled" class="tab-count">{{ activeCounts.cancelled }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'waiting' }]"
        @click="switchTab('waiting')"
      >
        انتظار
        <span v-if="activeCounts.waiting" class="tab-count">{{ activeCounts.waiting }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'negotiations' }]"
        @click="switchTab('negotiations')"
      >
        تفاوضات
        <span v-if="activeCounts.negotiations" class="tab-count">{{ activeCounts.negotiations }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <!-- ACTIVE / CANCELLED RESERVATIONS -->
    <template v-else-if="activeTab === 'active' || activeTab === 'cancelled'">
      <div v-if="filteredReservations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p>لا توجد حجوزات في هذا القسم</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="reservation in filteredReservations"
          :key="reservation.reservation_id || reservation.id"
          class="reservation-card"
        >
          <div class="card-status-badge" :class="reservation.status">
            {{ getStatusLabel(reservation.status) }}
          </div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ reservation.unit_number || reservation.unitNumber || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ reservation.project_name || reservation.projectName || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ reservation.client_name || reservation.clientName || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">تاريخ الحجز</span>
                <span class="card-value">{{ formatDate(reservation.contract_date || reservation.created_at || reservation.date) }}</span>
              </div>
              <div v-if="reservation.down_payment_amount" class="res-line res-line--payment">
                <span class="card-label">العربون</span>
                <span class="card-value card-value--money">{{ formatCurrency(reservation.down_payment_amount) }} ريال</span>
              </div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn-details" @click="openDetails(reservation)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض التفاصيل
              </button>
              <button
                type="button"
                class="btn-edit"
                @click="downloadVoucher(reservation)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                تحميل السند
              </button>
              <button
                v-if="reservation.status === 'under_negotiation' && canConfirm"
                type="button"
                class="btn-confirm"
                @click="confirmRes(reservation)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                تأكيد
              </button>
              <button
                v-if="reservation.status !== 'cancelled' && reservation.status !== 'rejected'"
                type="button"
                class="btn-cancel"
                @click="cancelRes(reservation)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- WAITING LIST TAB -->
    <template v-else-if="activeTab === 'waiting'">
      <div v-if="waitingList.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <p>لا توجد عناصر في قائمة الانتظار</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="item in waitingList"
          :key="item.id"
          class="reservation-card"
        >
          <div class="card-status-badge waiting">انتظار</div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ item.unit_number || item.contract_unit_id || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ item.project_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ item.client_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">الجوال</span>
                <span class="card-value">{{ item.client_mobile || '—' }}</span>
              </div>
              <div v-if="item.priority" class="res-line">
                <span class="card-label">الأولوية</span>
                <span class="card-value">{{ item.priority }}</span>
              </div>
              <div v-if="item.notes" class="card-notes">{{ item.notes }}</div>
            </div>
            <div class="card-actions">
              <button
                v-if="canConvert"
                type="button"
                class="btn-confirm"
                @click="convertWaiting(item)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                تحويل لحجز
              </button>
              <button type="button" class="btn-cancel" @click="cancelWaiting(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- NEGOTIATIONS TAB -->
    <template v-else-if="activeTab === 'negotiations'">
      <div v-if="negotiations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>لا توجد تفاوضات حالياً</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="neg in negotiations"
          :key="neg.reservation_id || neg.id"
          class="reservation-card"
        >
          <div class="card-status-badge negotiation">تفاوض</div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ neg.unit_number || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ neg.project_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ neg.client_name || '—' }}</span>
              </div>
              <div v-if="neg.proposed_price" class="res-line res-line--payment">
                <span class="card-label">السعر المقترح</span>
                <span class="card-value card-value--money">{{ formatCurrency(neg.proposed_price) }} ريال</span>
              </div>
              <div v-if="neg.negotiation_notes" class="card-notes">{{ neg.negotiation_notes }}</div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn-details" @click="openDetails(neg)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض التفاصيل
              </button>
              <button
                v-if="canApproveNeg"
                type="button"
                class="btn-confirm"
                @click="approveNeg(neg)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                قبول
              </button>
              <button
                v-if="canApproveNeg"
                type="button"
                class="btn-cancel"
                @click="rejectNeg(neg)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                رفض
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <div
      v-if="detailItem"
      class="detail-modal-overlay"
      @click.self="detailItem = null"
    >
      <div class="detail-modal">
        <div class="detail-modal-header">
          <h3>تفاصيل الحجز</h3>
          <button type="button" class="detail-modal-close" @click="detailItem = null">&times;</button>
        </div>
        <div class="detail-modal-body">
          <div class="detail-section">
            <h4>الوحدة والمشروع</h4>
            <p><strong>وحدة:</strong> {{ detailItem.unit_number || detailItem.unitNumber || '—' }}</p>
            <p><strong>مشروع:</strong> {{ detailItem.project_name || detailItem.projectName || '—' }}</p>
            <p><strong>نوع الحجز:</strong> {{ detailItem.reservation_type === 'negotiation' ? 'تفاوض' : 'حجز مؤكد' }}</p>
            <p><strong>التاريخ:</strong> {{ formatDate(detailItem.contract_date || detailItem.created_at || detailItem.date) }}</p>
          </div>
          <div class="detail-section">
            <h4>تفاصيل العميل</h4>
            <p><strong>الاسم:</strong> {{ detailItem.client_name || detailItem.clientName || '—' }}</p>
            <p><strong>الجوال:</strong> {{ detailItem.client_mobile || detailItem.clientPhone || '—' }}</p>
            <p><strong>الجنسية:</strong> {{ detailItem.client_nationality || detailItem.clientNationality || '—' }}</p>
          </div>
          <div class="detail-section">
            <h4>التفاصيل المالية</h4>
            <p><strong>العربون:</strong> {{ formatCurrency(detailItem.down_payment_amount || detailItem.depositAmount || 0) }} ريال</p>
            <p><strong>حالة العربون:</strong> {{ detailItem.down_payment_status === 'refundable' ? 'قابل للاسترداد' : 'غير قابل للاسترداد' }}</p>
            <p><strong>طريقة الدفع:</strong> {{ detailItem.payment_method || detailItem.paymentMethod || '—' }}</p>
            <p><strong>آلية الشراء:</strong> {{ detailItem.purchase_mechanism || detailItem.purchaseMethod || '—' }}</p>
          </div>
          <div class="detail-section">
            <h4>المسوق</h4>
            <p><strong>الاسم:</strong> {{ detailItem.marketing_employee_name || detailItem.marketerName || '—' }}</p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import salesService from '@/services/salesService';
import { usePermissions } from '@/composables/usePermissions';
import logger from '@/utils/logger';

const { hasPermission } = usePermissions();

const activeTab = ref('active');
const isLoading = ref(false);
const detailItem = ref(null);
const showConfirmModal = ref(false);
const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });

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
    const result = await salesService.getReservations({ mine: true, include_cancelled: true, per_page: 100 });
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
      // Fallback to existing reservation endpoints when helper endpoint is unavailable.
    }
    if (reservationData == null) {
      let detail = reservation;
      try {
        const full = await salesService.getReservation(id);
        if (full && typeof full === 'object') detail = full;
      } catch (_) {
        // Keep current reservation payload when detail fetch fails.
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
      employee = detail.employee ?? { name: detail.employee_name ?? detail.employeeName, team: detail.employee_team ?? detail.team };
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
        await salesService.cancelReservation(id, { cancellation_reason: 'تم الإلغاء من قبل المستخدم' });
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
</script>

<style scoped src="./styles/ReservationsView.scoped.s1.css"></style>
<style scoped src="./styles/ReservationsView.scoped.s2.css"></style>
