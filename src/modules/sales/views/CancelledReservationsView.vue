<template>
  <div class="cancelled-reservations-page">
    <!-- Page Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">الحجوزات الملغاة</h1>
      <p class="welcome-subtitle">عرض جميع الحجوزات التي تم إلغاؤها أو رفضها</p>
    </div>

    <!-- Reservations List -->
    <div class="reservations-list">
      <div
        v-for="reservation in cancelledReservations"
        :key="reservation.id"
        class="reservation-card"
      >
        <!-- Card Header -->
        <div class="card-header" @click="toggleExpand(reservation.id)">
          <div class="card-info">
            <div class="project-info">
              <span class="unit-number">وحدة: {{ reservation.unitNumber }} /</span>
              <span class="project-name">مشروع: {{ reservation.projectName }}</span>
            </div>
            <div class="client-info">
              العميل: {{ reservation.clientName }} | المسوق: {{ reservation.marketerName }}
            </div>
          </div>

          <div class="card-status">
            <span :class="['status-badge', reservation.status]">
              {{ reservation.status === 'cancelled' ? 'Cancelled' : 'Rejected' }}
            </span>
            <span class="date">{{ reservation.date }}</span>
            <svg
              class="chevron-icon"
              :class="{ expanded: expandedId === reservation.id }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expandedId === reservation.id" class="card-expanded">
          <!-- Rejection Reason -->
          <div class="rejection-section">
            <div class="rejection-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              سبب الإلغاء / الرفض
            </div>
            <p class="rejection-reason">{{ reservation.rejectionReason }}</p>
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <!-- Client Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                تفاصيل العميل
              </h4>
              <div class="detail-row">
                <span class="detail-label">الاسم:</span>
                <span class="detail-value">{{ reservation.clientName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الجوال:</span>
                <span class="detail-value">{{ reservation.clientPhone }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الجنسية:</span>
                <span class="detail-value">{{ reservation.clientNationality }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IBAN:</span>
                <span class="detail-value iban">{{ reservation.clientIBAN }}</span>
              </div>
            </div>

            <!-- Financial Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                التفاصيل المالية
              </h4>
              <div class="detail-row">
                <span class="detail-label">العربون:</span>
                <span class="detail-value"
                  >{{ formatCurrency(reservation.depositAmount) }} ريال</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">تاريخ العربون:</span>
                <span class="detail-value">{{ reservation.depositDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">طريقة الدفع:</span>
                <span class="detail-value">{{ reservation.paymentMethod }}</span>
              </div>
            </div>

            <!-- Property Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                تفاصيل العقار
              </h4>
              <div class="detail-row">
                <span class="detail-label">الحي:</span>
                <span class="detail-value">{{ reservation.neighborhood }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع العقار:</span>
                <span class="detail-value">{{ reservation.propertyType }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">قيمة العقار:</span>
                <span class="detail-value"
                  >{{ formatCurrency(reservation.propertyValue) }} ريال</span
                >
              </div>
            </div>

            <!-- Marketing Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                تفاصيل التسويق
              </h4>
              <div class="detail-row">
                <span class="detail-label">فريق المشروع:</span>
                <span class="detail-value">{{ reservation.projectTeam }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">فريق البائع:</span>
                <span class="detail-value">{{ reservation.sellerTeam }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">آلية الشراء:</span>
                <span class="detail-value">{{ reservation.purchaseMethod }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="cancelledReservations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        <p>لا توجد حجوزات ملغاة</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFormatters } from '@/composables/useFormatters';

const expandedId = ref(null);

const cancelledReservations = ref([
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
]);

const { formatNumber: formatCurrency } = useFormatters();

const toggleExpand = id => {
  expandedId.value = expandedId.value === id ? null : id;
};
</script>

<style scoped src="./styles/CancelledReservationsView.scoped.s1.css"></style>
