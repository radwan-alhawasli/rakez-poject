<template>
  <div class="management-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">التأكيدات</h1>
        <p class="welcome-subtitle">تأكيدات الدفعات المقدمة (Legacy).</p>
      </div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>رقم الحجز</th><th>المبلغ</th><th>تاريخ التأكيد</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="confirmation in confirmations" :key="confirmation.id">
            <td data-label="رقم الحجز">{{ confirmation.booking_number ?? confirmation.reservation_id ?? 'غير محدد' }}</td>
            <td data-label="المبلغ">{{ formatCurrency(confirmation.amount ?? 0) }}</td>
            <td data-label="تاريخ التأكيد">{{ formatDate(confirmation.confirmed_at) }}</td>
            <td data-label="الإجراءات"><button class="btn-action edit" @click="viewConfirmationHistory(confirmation)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>عرض التاريخ</button></td>
          </tr>
          <tr v-if="confirmations.length === 0 && !isLoading"><td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد تأكيدات</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

    <ConfirmationHistoryModal
      v-if="showConfirmationHistoryModal"
      :reservationId="selectedReservationId"
      @close="showConfirmationHistoryModal = false"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import ConfirmationHistoryModal from '@/modules/accounting/components/ConfirmationHistoryModal.vue';
import { useAccountingConfirmations } from '@/composables/accounting/useAccountingConfirmations';

const {
  isLoading,
  confirmations,
  currentPage,
  perPage,
  totalItems,
  showConfirmationHistoryModal,
  selectedReservationId,
  loadConfirmations,
  viewConfirmationHistory,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
  formatDate,
} = useAccountingConfirmations();

onMounted(() => {
  loadConfirmations();
});
</script>

<style scoped>
@media (max-width: 576px) {
  .table-responsive { margin: 0 -12px; }
}
</style>
