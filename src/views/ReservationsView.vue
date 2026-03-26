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

<style scoped>
.my-reservations {
  padding: 0;
  direction: rtl;
}

.reservations-page {
  background: transparent;
  border-radius: 0;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 6px;
  margin-bottom: var(--space-md, 24px);
  padding: 8px;
  border-radius: 16px;
  /* تبريد محايد — بدون درجات كريم/بيج */
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(248, 250, 252, 0.32) 50%,
    rgba(255, 255, 255, 0.34) 100%
  );
  backdrop-filter: blur(10px) saturate(1.02);
  -webkit-backdrop-filter: blur(10px) saturate(1.02);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.55) inset,
    0 8px 28px -12px rgba(15, 23, 42, 0.12);
}

.tab-btn {
  flex: 1 1 auto;
  justify-content: center;
  min-width: min(100%, 7.5rem);
  padding: 11px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover:not(.active) {
  color: var(--color-navy, #27374d);
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(226, 232, 240, 0.5);
}

.tab-btn.active {
  color: var(--color-navy, #27374d);
  font-weight: 800;
  background: rgba(255, 255, 255, 0.38);
  border-color: rgba(39, 55, 77, 0.12);
  box-shadow: none;
}

.tab-btn:focus-visible {
  outline: 2px solid var(--color-gold, #b5a99a);
  outline-offset: 2px;
}

.tab-count {
  min-width: 1.35rem;
  padding: 2px 7px;
  text-align: center;
  background: rgba(241, 245, 249, 0.75);
  color: var(--color-charcoal, #1e293b);
  border-radius: var(--radius-full, 9999px);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: none;
}

.tab-btn.active .tab-count {
  background: linear-gradient(145deg, var(--color-navy-dark, #1a2636) 0%, var(--color-navy, #27374d) 100%);
  color: var(--color-white, #fff);
  border-color: rgba(26, 38, 54, 0.5);
  box-shadow: 0 2px 8px rgba(39, 55, 77, 0.28);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-dark-gray, #64748b);
  background: transparent;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-light-gray, #f8fafc);
  border-top-color: var(--color-gold, #b5a99a);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reservations-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(14px, 2vw, 20px);
}

.reservation-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-md, 14px);
  box-shadow: none;
  border: 1px solid rgba(39, 55, 77, 0.14);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.reservation-card::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 3px;
  background: linear-gradient(to left, var(--color-navy, #27374d), var(--color-gold, #b5a99a));
  opacity: 0.92;
  pointer-events: none;
}

.reservation-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.34);
  box-shadow: 0 8px 28px -12px rgba(15, 23, 42, 0.14);
  border-color: rgba(39, 55, 77, 0.2);
}

.card-status-badge {
  position: absolute;
  top: 16px;
  inset-inline-end: 16px;
  z-index: 1;
  padding: 6px 14px;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}

.card-status-badge.confirmed,
.card-status-badge.approved {
  background: linear-gradient(135deg, var(--color-navy, #27374d), var(--color-navy-dark, #1a2636));
  color: var(--color-white, #fff);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 10px rgba(39, 55, 77, 0.25);
}

.card-status-badge.pending,
.card-status-badge.waiting,
.card-status-badge.under_negotiation {
  background: var(--status-pending-bg, #fefce8);
  color: var(--status-pending-text, #5c3d1a);
  border-color: var(--status-pending-border, #d4a84b);
}

.card-status-badge.sold {
  background: rgba(39, 55, 77, 0.08);
  color: var(--color-navy, #27374d);
  border-color: rgba(39, 55, 77, 0.15);
}

.card-status-badge.cancelled,
.card-status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error, #ef4444);
  border-color: rgba(239, 68, 68, 0.35);
}

.card-status-badge.negotiation {
  background: rgba(181, 169, 154, 0.25);
  color: var(--color-navy, #27374d);
  border-color: rgba(181, 169, 154, 0.55);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px 20px 20px;
  padding-inline-end: clamp(72px, 18vw, 120px);
  gap: 0;
  min-height: 0;
}

.card-meta-block {
  flex: 1 1 auto;
}

.res-line {
  display: grid;
  grid-template-columns: minmax(5.5rem, 32%) 1fr;
  gap: 10px 14px;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-light-gray, #f8fafc);
  font-size: 14px;
}

.card-meta-block > .res-line:last-of-type {
  border-bottom: none;
}

.res-line--title {
  padding-top: 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(181, 169, 154, 0.35);
  margin-bottom: 4px;
}

.res-line--title .card-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gold-dark, #9a8d7d);
  text-transform: none;
}

.res-line--title .card-value {
  font-size: clamp(17px, 2.2vw, 19px);
  font-weight: 800;
  color: var(--color-navy, #27374d);
  letter-spacing: -0.02em;
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
}

.card-value {
  font-weight: 600;
  color: var(--color-charcoal, #1e293b);
  word-break: break-word;
}

.res-line--payment .card-value--money {
  color: var(--color-success, #16a34a);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.card-notes {
  font-size: 13px;
  color: var(--color-dark-gray, #64748b);
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(248, 250, 252, 0.55);
  border-radius: var(--radius-sm, 8px);
  border: 1px solid rgba(226, 232, 240, 0.7);
  line-height: 1.5;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-light-gray, #f8fafc);
}

.card-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--transition-fast, 0.15s ease),
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.card-actions button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-details,
.btn-edit {
  flex: 1 1 auto;
  min-width: 0;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(39, 55, 77, 0.16);
  color: var(--color-navy, #27374d);
}

.btn-details:hover,
.btn-edit:hover {
  background: rgba(255, 255, 255, 0.65);
  border-color: var(--color-gold, #b5a99a);
  box-shadow: none;
}

.btn-confirm {
  flex: 1 1 auto;
  background: linear-gradient(135deg, var(--color-navy, #27374d), var(--color-navy-dark, #1a2636));
  border: none;
  color: var(--color-white, #fff);
  box-shadow: 0 4px 14px rgba(39, 55, 77, 0.22);
}

.btn-confirm:hover {
  box-shadow: 0 6px 18px rgba(39, 55, 77, 0.3);
}

.btn-cancel {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  color: var(--color-error, #ef4444);
}

.btn-cancel:hover {
  color: var(--color-navy-dark, #1a2636);
  text-decoration: underline;
}

/* Detail Modal */
.detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 38, 54, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.detail-modal {
  background: var(--color-white, #fff);
  border-radius: var(--radius-lg, 20px);
  box-shadow: var(--shadow-xl, 0 20px 60px rgba(0, 0, 0, 0.15));
  border: 1px solid rgba(181, 169, 154, 0.35);
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.detail-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-medium-gray, #e2e8f0);
  background: linear-gradient(180deg, var(--color-cream-gold-light, #f8f4ec) 0%, var(--color-white, #fff) 100%);
}

.detail-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-navy, #27374d);
}

.detail-modal-close {
  background: var(--color-light-gray, #f8fafc);
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  font-size: 22px;
  line-height: 1;
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-modal-close:hover {
  color: var(--color-navy, #27374d);
  border-color: var(--color-gold, #b5a99a);
}

.detail-modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy, #27374d);
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(181, 169, 154, 0.45);
}

.detail-section p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--color-charcoal, #1e293b);
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: clamp(48px, 8vw, 72px) 24px;
  background: transparent;
  border-radius: var(--radius-md, 14px);
  border: 1px dashed rgba(39, 55, 77, 0.22);
  box-shadow: none;
}

.empty-state svg {
  width: 60px;
  height: 60px;
  color: var(--color-gold, #b5a99a);
  opacity: 0.65;
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--color-dark-gray, #64748b);
  font-size: 15px;
  margin: 0;
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .reservations-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .reservations-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .reservations-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .page-title {
    font-size: 24px;
  }
}

/* ── Responsive: Tablet Portrait ── */
@media (max-width: 768px) {
  .filter-tabs {
    gap: 6px;
    padding: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
    scrollbar-width: thin;
  }
  .tab-btn {
    flex: 0 0 auto;
    min-width: max-content;
    white-space: nowrap;
    font-size: 14px;
  }
  .reservations-list {
    grid-template-columns: 1fr;
  }
  .card-body {
    padding: 18px;
    padding-inline-end: 18px;
  }
  .card-status-badge {
    position: static;
    display: inline-flex;
    align-self: flex-start;
    margin: 16px 18px 0;
  }
  .card-actions {
    flex-direction: column;
  }
  .card-actions button {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
  .detail-modal {
    max-width: 100%;
    border-radius: 12px;
  }
  .detail-modal-body {
    padding: 16px;
  }
}

/* ── Responsive: Mobile ── */
@media (max-width: 576px) {
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .filter-tabs {
    gap: 6px;
    padding: 6px;
    margin-bottom: 16px;
  }
  .tab-btn {
    font-size: 13px;
    padding: 10px 12px;
  }
  .reservation-card {
    border-radius: 10px;
  }
  .card-body {
    padding: 16px;
    padding-inline-end: 16px;
  }
  .res-line {
    grid-template-columns: minmax(4.5rem, 36%) 1fr;
    font-size: 13px;
    padding: 6px 0;
  }
  .res-line--title .card-value {
    font-size: 16px;
  }
  .card-actions button {
    padding: 10px 14px;
    font-size: 13px;
    min-height: 44px;
  }
  .detail-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .detail-modal {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 90vh;
  }
  .detail-modal-header {
    padding: 16px;
  }
  .detail-modal-body {
    padding: 16px;
  }
  .detail-section h4 {
    font-size: 13px;
  }
  .detail-section p {
    font-size: 13px;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .tab-btn {
    font-size: 12px;
    padding: 8px 10px;
  }
  .tab-count {
    font-size: 10px;
    padding: 1px 6px;
  }
  .card-body {
    padding: 12px;
    padding-inline-end: 12px;
  }
  .res-line--title .card-value {
    font-size: 15px;
  }
  .card-actions button {
    padding: 8px 10px;
    font-size: 12px;
  }
  .detail-modal-header h3 {
    font-size: 16px;
  }
}

/* ── Responsive: Full HD ── */
@media (min-width: 1920px) {
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 17px;
  }
  .reservations-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .res-line--title .card-value {
    font-size: 20px;
  }
  .res-line {
    font-size: 15px;
  }
  .card-actions button {
    font-size: 15px;
  }
  .detail-modal {
    max-width: 600px;
  }
}

/* ── Responsive: QHD ── */
@media (min-width: 2560px) {
  .page-title {
    font-size: 38px;
  }
  .reservations-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
  .reservation-card {
    border-radius: 16px;
  }
  .card-body {
    padding: 24px;
    padding-inline-end: clamp(100px, 12vw, 140px);
  }
  .res-line--title .card-value {
    font-size: 22px;
  }
  .tab-btn {
    font-size: 17px;
  }
}

/* ── Responsive: 4K ── */
@media (min-width: 3840px) {
  .page-title {
    font-size: 48px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .reservations-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }
  .reservation-card {
    border-radius: 20px;
  }
  .card-body {
    padding: 28px;
    padding-inline-end: clamp(120px, 10vw, 160px);
  }
  .res-line--title .card-value {
    font-size: 24px;
  }
  .res-line {
    font-size: 18px;
  }
  .card-actions button {
    font-size: 18px;
    padding: 14px 24px;
  }
  .tab-btn {
    font-size: 20px;
  }
  .detail-modal {
    max-width: 720px;
  }
  .detail-section h4 {
    font-size: 18px;
  }
  .detail-section p {
    font-size: 17px;
  }
}
</style>
