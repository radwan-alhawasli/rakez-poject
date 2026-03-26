<template>
  <div class="management-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">تأكيد العربون وإرجاع العربون</h1>
        <p class="welcome-subtitle">إدارة تأكيد العربون والحالات القابلة لإرجاع العربون.</p>
      </div>
    </div>
    <MobileFilterSheet>
      <div class="deposits-sub-tabs">
        <button :class="['sub-tab-btn', { active: depositsSubTab === 'manage' }]" @click="setDepositsSubTab('manage')">تأكيد العربون</button>
        <button :class="['sub-tab-btn', { active: depositsSubTab === 'follow-up' }]" @click="setDepositsSubTab('follow-up')">إرجاع العربون</button>
      </div>
      <div class="project-filter-bar">
        <input
          v-model.trim="projectFilter"
          type="text"
          class="form-input project-filter-input"
          placeholder="فلترة حسب اسم المشروع"
        />
      </div>
    </MobileFilterSheet>
    <div v-if="depositsSubTab === 'manage'" class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم المشروع</th><th>نوع الوحدة</th><th>سعر الوحدة</th><th>سعر البيع النهائي</th><th>قيمة العربون</th><th>طريقة الدفع</th><th>اسم العميل</th><th>تاريخ الدفع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in filteredDeposits" :key="deposit.id">
            <td data-label="اسم المشروع">{{ deposit.project_name || 'غير محدد' }}</td>
            <td data-label="نوع الوحدة">{{ deposit.unit_type || '—' }}</td>
            <td data-label="سعر الوحدة">{{ formatCurrency(deposit.unit_price) }}</td>
            <td data-label="سعر البيع النهائي">{{ formatCurrency(deposit.final_price) }}</td>
            <td data-label="قيمة العربون">{{ formatCurrency(deposit.amount) }}</td>
            <td data-label="طريقة الدفع">{{ deposit.payment_method || '—' }}</td>
            <td data-label="اسم العميل">{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
            <td data-label="تاريخ الدفع">{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
            <td data-label="نسبة السعي">{{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }} {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}</td>
            <td data-label="الإجراءات">
              <button v-if="deposit.status === 'pending'" class="btn-action edit btn-confirm-deposit" @click="confirmDeposit(deposit)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span class="btn-confirm-deposit-text">تأكيد استلام العربون</span></button>
              <span v-else class="status-tag excellent">مؤكد</span>
            </td>
          </tr>
          <tr v-if="filteredDeposits.length === 0 && !isLoading"><td colspan="10" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد نتائج مطابقة</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="depositsSubTab === 'follow-up'" class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم المشروع</th><th>رقم الوحدة</th><th>اسم العميل</th><th>إجمالي قيمة البيع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in filteredDeposits" :key="deposit.id">
            <td data-label="اسم المشروع">{{ deposit.project_name || 'غير محدد' }}</td>
            <td data-label="رقم الوحدة">{{ deposit.unit_number || deposit.reservation_id || '—' }}</td>
            <td data-label="اسم العميل">{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
            <td data-label="إجمالي قيمة البيع">{{ formatCurrency(deposit.final_price || deposit.total_value) }}</td>
            <td data-label="نسبة السعي">{{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }} {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}</td>
            <td data-label="الإجراءات">
              <button class="btn-action delete" @click="processRefund(deposit)" title="إرجاع العربون">إرجاع العربون</button>
            </td>
          </tr>
          <tr v-if="filteredDeposits.length === 0 && !isLoading"><td colspan="6" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد نتائج مطابقة</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

    <DepositConfirmationModal
      v-if="showDepositModal"
      :deposit="selectedDeposit"
      :isLoading="isSavingDeposit"
      @close="showDepositModal = false"
      @submit="handleDepositSubmit"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import DepositConfirmationModal from '@/modules/accounting/components/DepositConfirmationModal.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import { useAccountingDeposits } from '@/composables/accounting/useAccountingDeposits';

const {
  isLoading,
  filteredDeposits,
  depositsSubTab,
  projectFilter,
  currentPage,
  perPage,
  totalItems,
  showDepositModal,
  selectedDeposit,
  isSavingDeposit,
  loadDeposits,
  setDepositsSubTab,
  confirmDeposit,
  processRefund,
  handleDepositSubmit,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
  formatDate,
} = useAccountingDeposits();

onMounted(() => {
  loadDeposits();
});
</script>

<style scoped>
.project-filter-bar {
  margin-top: 12px;
}

.project-filter-input {
  width: 100%;
  max-width: 320px;
}

@media (max-width: 768px) {
  .project-filter-input {
    max-width: 100%;
  }
}
</style>
