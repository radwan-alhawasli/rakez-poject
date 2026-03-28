<template>
  <div class="cancelled-reservations-page">
    <div class="welcome-header">
      <h1 class="welcome-title">الحجوزات الملغاة</h1>
      <p class="welcome-subtitle">عرض جميع الحجوزات التي تم إلغاؤها أو رفضها</p>
    </div>

    <div class="reservations-list">
      <CancelledReservationCard
        v-for="reservation in cancelledReservations"
        :key="reservation.id"
        :reservation="reservation"
        :is-expanded="expandedId === reservation.id"
        :format-currency="formatCurrency"
        @toggle-expand="toggleExpand"
      />

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
import CancelledReservationCard from './reservations/components/CancelledReservationCard.vue';

const expandedId = ref(null);
const { formatNumber: formatCurrency } = useFormatters();

const cancelledReservations = ref([
  {
    id: 1, unitNumber: 'a2231', projectName: 'الامبراطور', clientName: 'محمد الشامي', marketerName: 'نوره الشويني',
    date: '2025-10-15', status: 'cancelled', rejectionReason: 'غلاء',
    clientPhone: '6519908191', clientNationality: 'Saudi', clientIBAN: 'lk',
    depositAmount: 7500, depositDate: '2025-10-15', paymentMethod: 'كاش',
    neighborhood: 'الروشه', propertyType: 'Apartment', propertyValue: 3000000,
    projectTeam: 'Team B', sellerTeam: 'Team B', purchaseMethod: 'Cash',
  },
  {
    id: 2, unitNumber: 'b70750', projectName: 'برج الشام 5', clientName: 'SAAD6', marketerName: 'Aboshama',
    date: '2025-10-05', status: 'cancelled', rejectionReason: 'تم إلغاء الحجز بناء على طلب العميل',
    clientPhone: '6519908191', clientNationality: 'Saudi', clientIBAN: 'xxx',
    depositAmount: 7500, depositDate: '2025-10-05', paymentMethod: 'تحويل بنكي',
    neighborhood: 'ع_ب المرابط', propertyType: 'Apartment', propertyValue: 2000000,
    projectTeam: 'Team B', sellerTeam: 'غير معين', purchaseMethod: 'Cash',
  },
  {
    id: 3, unitNumber: 'b22', projectName: 'عين أوسس', clientName: 'محمد العربي', marketerName: 'مسوق 3',
    date: '2025-10-02', status: 'rejected', rejectionReason: 'عدم توفر المستندات المطلوبة',
    clientPhone: '6519908191', clientNationality: 'Saudi', clientIBAN: '999888',
    depositAmount: 10000, depositDate: '2025-10-02', paymentMethod: 'كاش',
    neighborhood: 'القريه', propertyType: 'Villa', propertyValue: 1800000,
    projectTeam: 'team-a', sellerTeam: 'team-b', purchaseMethod: 'Cash',
  },
]);

const toggleExpand = id => { expandedId.value = expandedId.value === id ? null : id; };
</script>

<style scoped>
.cancelled-reservations-page { padding: 0; direction: rtl; }
.reservations-list { display: flex; flex-direction: column; gap: 12px; }
.empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px dashed #fecaca; }
.empty-state svg { width: 60px; height: 60px; color: #fca5a5; margin-bottom: 16px; }
.empty-state p { color: #94a3b8; font-size: 15px; margin: 0; }
</style>
