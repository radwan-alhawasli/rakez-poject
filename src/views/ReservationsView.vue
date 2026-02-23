<template>
  <div class="reservations-page my-reservations">
    <!-- Page Header - same as reference -->
    <div class="page-header">
      <h1 class="page-title">حجوزاتي</h1>
      <p class="page-subtitle">عرض جميع الوحدات التي قمت بحجزها وتتبع حالتها.</p>
    </div>

    <!-- Tabs: حجوزات | حجوزات ملغاه -->
    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'reservations' }]"
        @click="activeTab = 'reservations'"
      >
        حجوزات
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'cancelled' }]"
        @click="activeTab = 'cancelled'"
      >
        حجوزات ملغاه
      </button>
    </div>

    <!-- Reservations List - cards like reference -->
    <div class="reservations-list">
      <div
        v-for="reservation in filteredReservations"
        :key="reservation.id"
        class="reservation-card"
      >
        <div class="card-status-badge" :class="reservation.status">
          {{ getStatusLabel(reservation.status) }}
        </div>
        <div class="card-body">
          <div class="card-unit">وحدة: {{ reservation.unitNumber }}</div>
          <div class="card-project">مشروع: {{ reservation.projectName }}</div>
          <div class="card-date">تاريخ الحجز: {{ formatReservationDate(reservation.date) }}</div>
          <div class="card-actions">
            <button type="button" class="btn-details" @click="openDetails(reservation)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              عرض التفاصيل
            </button>
            <button type="button" class="btn-edit" @click="editReservation(reservation)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              تعديل
            </button>
            <button
              v-if="reservation.status !== 'cancelled' && reservation.status !== 'rejected'"
              type="button"
              class="btn-cancel"
              @click="cancelReservation(reservation)"
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

      <!-- Empty State -->
      <div v-if="filteredReservations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          ></path>
        </svg>
        <p>لا توجد حجوزات في هذا القسم</p>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="detailReservation"
      class="detail-modal-overlay"
      @click.self="detailReservation = null"
    >
      <div class="detail-modal">
        <div class="detail-modal-header">
          <h3>تفاصيل الحجز</h3>
          <button type="button" class="detail-modal-close" @click="detailReservation = null">
            &times;
          </button>
        </div>
        <div class="detail-modal-body" v-if="detailReservation">
          <div class="detail-section">
            <h4>الوحدة والمشروع</h4>
            <p><strong>وحدة:</strong> {{ detailReservation.unitNumber }}</p>
            <p><strong>مشروع:</strong> {{ detailReservation.projectName }}</p>
            <p><strong>تاريخ الحجز:</strong> {{ formatReservationDate(detailReservation.date) }}</p>
          </div>
          <div class="detail-section">
            <h4>تفاصيل العميل</h4>
            <p><strong>الاسم:</strong> {{ detailReservation.clientName }}</p>
            <p><strong>الجوال:</strong> {{ detailReservation.clientPhone }}</p>
            <p><strong>الجنسية:</strong> {{ detailReservation.clientNationality }}</p>
          </div>
          <div class="detail-section">
            <h4>التفاصيل المالية</h4>
            <p>
              <strong>العربون:</strong> {{ formatCurrency(detailReservation.depositAmount) }} ريال
            </p>
            <p><strong>طريقة الدفع:</strong> {{ detailReservation.paymentMethod }}</p>
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

<script>
import { ref, computed } from 'vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { toast } from '../composables/useToast';

export default {
  name: 'ReservationsView',
  components: { ConfirmModal },
  setup() {
    const activeTab = ref('reservations');
    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    });
    const detailReservation = ref(null);

    // Mock data
    const reservations = ref([
      {
        id: 1,
        unitNumber: 'a77744',
        projectName: 'دوم 12',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 1',
        date: '2025-12-08',
        status: 'approved',
        readyForEvacuation: true,
        currentStep: 5,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '984940990997',
        depositAmount: 7500,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 2,
        unitNumber: 'a22377',
        projectName: 'دوم 12',
        clientName: 'khaled',
        marketerName: 'مسوق 1',
        date: '2025-11-16',
        status: 'approved',
        daysLate: 43,
        assessorVisit: true,
        currentStep: 2,
        stepDays: 43,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '777',
        depositAmount: 7500,
        depositDate: '2025-11-16',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الشرقية',
        propertyType: 'Apartment',
        propertyValue: 100000,
        projectTeam: 'team-a, Team B',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 3,
        unitNumber: '99999',
        projectName: 'دوم 12',
        clientName: 'radwan alhwasly',
        marketerName: 'نوره الشويني',
        date: '2025-10-23',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '2333443',
        depositAmount: 0,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 4,
        unitNumber: 'g-hvh',
        projectName: 'وشاح الصفا 2',
        clientName: 'saudSAAD',
        marketerName: 'نوره الشويني',
        date: '2025-10-20',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '123456',
        depositAmount: 5000,
        depositDate: '2025-10-20',
        paymentMethod: 'كاش',
        neighborhood: 'الصفا',
        propertyType: 'Villa',
        propertyValue: 2500000,
        projectTeam: 'team-b',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash',
      },
      {
        id: 5,
        unitNumber: 'a77789',
        projectName: 'دوم 12',
        clientName: 'محمد الحجي',
        marketerName: 'مسوق 3',
        date: '2025-10-19',
        status: 'approved',
        currentStep: 1,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '555666',
        depositAmount: 10000,
        depositDate: '2025-10-19',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'النرجس',
        propertyType: 'Apartment',
        propertyValue: 800000,
        projectTeam: 'team-a',
        sellerTeam: 'team-b',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 6,
        unitNumber: 'a2231',
        projectName: 'الامبراطور',
        clientName: 'محمد الشامي',
        marketerName: 'نوره الشويني',
        date: '2025-10-15',
        status: 'cancelled',
        rejectionReason: 'غلاء',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'lk',
        depositAmount: 7500,
        depositDate: '2025-10-15',
        paymentMethod: 'كاش',
        neighborhood: 'الروشه',
        propertyType: 'Apartment',
        propertyValue: 3000000,
        projectTeam: 'Team B',
        sellerTeam: 'Team B',
        purchaseMethod: 'Cash',
      },
      {
        id: 7,
        unitNumber: 'a2231',
        projectName: 'عين أوسس',
        clientName: 'radwan alhwasly',
        marketerName: 'مسوق 1',
        date: '2025-10-15',
        status: 'approved',
        readyForEvacuation: true,
        currentStep: 6,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '2333443',
        depositAmount: 0,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 8,
        unitNumber: '9999',
        projectName: 'برج الشام 4',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 2',
        date: '2025-10-08',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '984940990997',
        depositAmount: 7500,
        depositDate: '2025-10-08',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'حي المرابط',
        propertyType: 'Apartment',
        propertyValue: 10000,
        projectTeam: 'team-a',
        sellerTeam: 'Team B',
        purchaseMethod: 'Cash',
      },
      {
        id: 9,
        unitNumber: 'c-2456',
        projectName: 'برج الشام 4',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 3',
        date: '2025-10-03',
        status: 'approved',
        currentStep: 2,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '111222',
        depositAmount: 15000,
        depositDate: '2025-10-03',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الورود',
        propertyType: 'Apartment',
        propertyValue: 1500000,
        projectTeam: 'team-b',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
      {
        id: 10,
        unitNumber: 'b22',
        projectName: 'عين أوسس',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 1',
        date: '2025-10-03',
        status: 'pending',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '333444',
        depositAmount: 5000,
        depositDate: '2025-10-03',
        paymentMethod: 'كاش',
        neighborhood: 'القريه',
        propertyType: 'Villa',
        propertyValue: 2000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash',
      },
      {
        id: 11,
        unitNumber: 'b70750',
        projectName: 'برج الشام 5',
        clientName: 'zmc',
        marketerName: 'Aboshama',
        date: '2025-10-05',
        status: 'waiting',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'mz',
        depositAmount: 7500,
        depositDate: '2025-10-05',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'ع_ب المرابط',
        propertyType: 'Apartment',
        propertyValue: 2000000,
        projectTeam: 'Team B',
        sellerTeam: 'غير معين',
        purchaseMethod: 'Cash',
      },
      {
        id: 12,
        unitNumber: 'b70750',
        projectName: 'برج الشام 5',
        clientName: 'SAAD6',
        marketerName: 'Aboshama',
        date: '2025-10-05',
        status: 'cancelled',
        rejectionReason: 'تم إلغاء الحجز بناء على طلب العميل',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'xxx',
        depositAmount: 7500,
        depositDate: '2025-10-05',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'ع_ب المرابط',
        propertyType: 'Apartment',
        propertyValue: 2000000,
        projectTeam: 'Team B',
        sellerTeam: 'غير معين',
        purchaseMethod: 'Cash',
      },
      {
        id: 13,
        unitNumber: 'b22',
        projectName: 'عين أوسس',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 3',
        date: '2025-10-02',
        status: 'rejected',
        rejectionReason: 'عدم توفر المستندات المطلوبة',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '999888',
        depositAmount: 10000,
        depositDate: '2025-10-02',
        paymentMethod: 'كاش',
        neighborhood: 'القريه',
        propertyType: 'Villa',
        propertyValue: 1800000,
        projectTeam: 'team-a',
        sellerTeam: 'team-b',
        purchaseMethod: 'Cash',
      },
      {
        id: 14,
        unitNumber: 'c-2456',
        projectName: 'برج الشام 2',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 1',
        date: '2025-09-18',
        status: 'sold',
        currentStep: 0,
        stepDays: 5,
        clientPhone: '65199081914',
        clientNationality: 'Saudi',
        clientIBAN: '984964990997',
        depositAmount: 50000,
        depositDate: '2026-01-01',
        paymentMethod: '',
        neighborhood: 'حي الحرابط',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'Team B',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash',
      },
      {
        id: 15,
        unitNumber: 'c-244',
        projectName: 'برج الشام 1',
        clientName: 'محمد الشامي',
        marketerName: 'Aboshama',
        date: '2025-09-16',
        status: 'sold',
        currentStep: 6,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '123789',
        depositAmount: 25000,
        depositDate: '2025-09-16',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الياسمين',
        propertyType: 'Apartment',
        propertyValue: 1200000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank',
      },
    ]);

    const filteredReservations = computed(() => {
      const list = reservations.value;
      const cancelledStatuses = ['cancelled', 'rejected'];
      if (activeTab.value === 'cancelled') {
        return [...list]
          .filter(r => cancelledStatuses.includes(r.status))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return [...list]
        .filter(r => !cancelledStatuses.includes(r.status))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const formatReservationDate = dateStr => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const openDetails = reservation => {
      detailReservation.value = reservation;
    };

    const editReservation = () => {
      detailReservation.value = null;
      // TODO: navigate to edit or open edit modal
    };

    const cancelReservation = reservation => {
      confirmModalConfig.value = {
        title: 'تأكيد الإلغاء',
        message: 'هل أنت متأكد من إلغاء هذا الحجز؟',
        type: 'warning',
        confirmText: 'إلغاء الحجز',
        resolve: () => {
          reservation.status = 'cancelled';
          toast.success('تم إلغاء الحجز');
        },
      };
      showConfirmModal.value = true;
    };

    const getStatusLabel = status => {
      const labels = {
        approved: 'Approved',
        pending: 'Pending',
        waiting: 'Waiting',
        cancelled: 'Cancelled',
        rejected: 'Rejected',
        sold: 'Sold',
        negotiation: 'Negotiation',
      };
      return labels[status] || status;
    };

    const formatCurrency = amount => {
      return new Intl.NumberFormat('en-US').format(amount);
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    return {
      activeTab,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      detailReservation,
      reservations,
      filteredReservations,
      getStatusLabel,
      formatCurrency,
      formatReservationDate,
      openDetails,
      editReservation,
      cancelReservation,
    };
  },
};
</script>

<style scoped>
.my-reservations {
  padding: 0;
  direction: rtl;
  font-family: 'Tajawal', sans-serif;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Cairo', sans-serif;
}

.page-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
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
  font-family: 'Tajawal', sans-serif;
}

.tab-btn:hover {
  color: #1e3a5f;
}

.tab-btn.active {
  color: #1e3a5f;
  border-bottom-color: #1e3a5f;
}

/* Reservations List */
.reservations-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Reservation Card - same as reference */
.reservation-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
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

.card-status-badge.approved {
  background: #a68b5b;
}

.card-status-badge.pending,
.card-status-badge.waiting {
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

.card-project {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.card-date {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  font-family: 'Tajawal', sans-serif;
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
  max-width: 480px;
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

/* Empty State */
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

@media (max-width: 1024px) {
  .reservations-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
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
  }
}
</style>
