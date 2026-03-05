<template>
  <div class="management-view">
    <div class="section-header-compact"><div><h2 class="section-title">العمولات</h2><p class="section-subtitle">إدارة توزيعات العمولات والموافقات.</p></div></div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table">
        <thead><tr><th>رقم العمولة</th><th>رقم الحجز</th><th>المبلغ</th><th>التوزيعات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="commission in commissions" :key="commission.id">
            <td>{{ commission.id }}</td>
            <td>{{ commission.reservation_id || 'غير محدد' }}</td>
            <td>{{ formatCurrency(commission.total_amount) }}</td>
            <td>{{ commission.distributions_count || 0 }}</td>
            <td><span class="status-tag" :class="getStatusClass(commission.status)">{{ commission.status || 'قيد المعالجة' }}</span></td>
            <td><button class="btn-action edit" @click="viewCommissionDetail(commission)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>إدارة</button></td>
          </tr>
          <tr v-if="commissions.length === 0 && !isLoading"><td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد عمولات</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

    <CommissionDistributionModal
      v-if="showCommissionModal"
      :commission="selectedCommission"
      :isLoading="isSavingCommission"
      @close="showCommissionModal = false"
      @submit="handleCommissionUpdate"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import CommissionDistributionModal from '@/components/accounting/CommissionDistributionModal.vue';
import { useAccountingCommissions } from '@/composables/accounting/useAccountingCommissions';

const {
  isLoading,
  commissions,
  currentPage,
  perPage,
  totalItems,
  showCommissionModal,
  selectedCommission,
  isSavingCommission,
  loadCommissions,
  viewCommissionDetail,
  handleCommissionUpdate,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
  getStatusClass,
} = useAccountingCommissions();

onMounted(() => {
  loadCommissions();
});
</script>
