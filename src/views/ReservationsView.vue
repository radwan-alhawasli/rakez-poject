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
            <div class="card-unit">وحدة: {{ reservation.unit_number || reservation.unitNumber || '—' }}</div>
            <div class="card-project">مشروع: {{ reservation.project_name || reservation.projectName || '—' }}</div>
            <div class="card-client">العميل: {{ reservation.client_name || reservation.clientName || '—' }}</div>
            <div class="card-date">تاريخ الحجز: {{ formatDate(reservation.contract_date || reservation.created_at || reservation.date) }}</div>
            <div v-if="reservation.down_payment_amount" class="card-payment">
              العربون: {{ formatCurrency(reservation.down_payment_amount) }} ريال
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
                v-if="reservation.voucher_url"
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
            <div class="card-unit">وحدة: {{ item.unit_number || item.contract_unit_id || '—' }}</div>
            <div class="card-project">مشروع: {{ item.project_name || '—' }}</div>
            <div class="card-client">العميل: {{ item.client_name || '—' }}</div>
            <div class="card-date">الجوال: {{ item.client_mobile || '—' }}</div>
            <div v-if="item.priority" class="card-payment">الأولوية: {{ item.priority }}</div>
            <div v-if="item.notes" class="card-notes">{{ item.notes }}</div>
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
            <div class="card-unit">وحدة: {{ neg.unit_number || '—' }}</div>
            <div class="card-project">مشروع: {{ neg.project_name || '—' }}</div>
            <div class="card-client">العميل: {{ neg.client_name || '—' }}</div>
            <div v-if="neg.proposed_price" class="card-payment">
              السعر المقترح: {{ formatCurrency(neg.proposed_price) }} ريال
            </div>
            <div v-if="neg.negotiation_notes" class="card-notes">{{ neg.negotiation_notes }}</div>
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
    const blob = await salesService.downloadVoucher(id);
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


.filter-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 12px 0;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: #1e3a5f;
}

.tab-btn.active {
  color: #1e3a5f;
  border-bottom-color: #1e3a5f;
}

.tab-count {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-btn.active .tab-count {
  background: #1e3a5f;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #1e3a5f;
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
  gap: 16px;
}

.reservation-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}

.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.card-status-badge.confirmed,
.card-status-badge.approved {
  background: #a68b5b;
}

.card-status-badge.pending,
.card-status-badge.waiting,
.card-status-badge.under_negotiation {
  background: #d97706;
}

.card-status-badge.sold {
  background: #2563eb;
}

.card-status-badge.cancelled,
.card-status-badge.rejected {
  background: #dc2626;
}

.card-status-badge.negotiation {
  background: #7c3aed;
}

.card-body {
  padding: 20px 20px 20px 56px;
}

.card-unit {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.card-project,
.card-client,
.card-date,
.card-payment {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.card-payment {
  color: #059669;
  font-weight: 600;
}

.card-notes {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 6px;
  font-style: italic;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.card-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.card-actions button svg {
  width: 18px;
  height: 18px;
}

.btn-details,
.btn-edit {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-details:hover,
.btn-edit:hover {
  border-color: #b1a28f;
  color: #b1a28f;
}

.btn-confirm {
  background: #059669;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #047857;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #ea580c;
}

.btn-cancel:hover {
  color: #c2410c;
  text-decoration: underline;
}

/* Detail Modal */
.detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.detail-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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
  border-bottom: 1px solid #e2e8f0;
}

.detail-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
}

.detail-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.detail-modal-close:hover {
  color: #1e293b;
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
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-section p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #1e293b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.empty-state svg {
  width: 60px;
  height: 60px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  color: #94a3b8;
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
    gap: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .tab-btn {
    white-space: nowrap;
    font-size: 14px;
  }
  .reservations-list {
    grid-template-columns: 1fr;
  }
  .card-body {
    padding-left: 20px;
  }
  .card-status-badge {
    position: static;
    display: inline-block;
    margin-bottom: 12px;
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
    gap: 8px;
    margin-bottom: 16px;
  }
  .tab-btn {
    font-size: 13px;
    padding: 10px 0;
  }
  .reservation-card {
    border-radius: 10px;
  }
  .card-body {
    padding: 16px;
  }
  .card-unit {
    font-size: 16px;
  }
  .card-project,
  .card-client,
  .card-date,
  .card-payment {
    font-size: 13px;
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
    padding: 8px 0;
  }
  .tab-count {
    font-size: 10px;
    padding: 1px 6px;
  }
  .card-body {
    padding: 12px;
  }
  .card-unit {
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
  .card-unit {
    font-size: 20px;
  }
  .card-project,
  .card-client,
  .card-date,
  .card-payment {
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
    padding: 24px 24px 24px 60px;
  }
  .card-unit {
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
    padding: 28px 28px 28px 68px;
  }
  .card-unit {
    font-size: 24px;
  }
  .card-project,
  .card-client,
  .card-date,
  .card-payment {
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
