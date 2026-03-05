<template>
  <div class="management-view">
    <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center">
      <div><h2 class="section-title">إدارة العربون والمتابعة</h2><p class="section-subtitle">إدارة الودائع والتأكيدات والاستردادات والمتابعة.</p></div>
    </div>
    <div class="deposits-sub-tabs">
      <button :class="['sub-tab-btn', { active: depositsSubTab === 'manage' }]" @click="setDepositsSubTab('manage')">إدارة العربون</button>
      <button :class="['sub-tab-btn', { active: depositsSubTab === 'follow-up' }]" @click="setDepositsSubTab('follow-up')">المتابعة</button>
    </div>
    <div v-if="depositsSubTab === 'manage'" class="metrics-table-container table-responsive">
      <table class="metrics-table">
        <thead><tr><th>اسم المشروع</th><th>نوع الوحدة</th><th>سعر الوحدة</th><th>سعر البيع النهائي</th><th>قيمة العربون</th><th>طريقة الدفع</th><th>اسم العميل</th><th>تاريخ الدفع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in deposits" :key="deposit.id">
            <td>{{ deposit.project_name || 'غير محدد' }}</td>
            <td>{{ deposit.unit_type || '—' }}</td>
            <td>{{ formatCurrency(deposit.unit_price) }}</td>
            <td>{{ formatCurrency(deposit.final_price) }}</td>
            <td>{{ formatCurrency(deposit.amount) }}</td>
            <td>{{ deposit.payment_method || '—' }}</td>
            <td>{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
            <td>{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
            <td>{{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }} {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}</td>
            <td>
              <button v-if="deposit.status === 'pending'" class="btn-action edit" @click="confirmDeposit(deposit)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>تأكيد استلام العربون</button>
              <span v-else class="status-tag excellent">مؤكد</span>
            </td>
          </tr>
          <tr v-if="deposits.length === 0 && !isLoading"><td colspan="10" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد ودائع</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="depositsSubTab === 'follow-up'" class="metrics-table-container table-responsive">
      <table class="metrics-table">
        <thead><tr><th>اسم المشروع</th><th>رقم الوحدة</th><th>اسم العميل</th><th>إجمالي قيمة البيع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in deposits" :key="deposit.id">
            <td>{{ deposit.project_name || 'غير محدد' }}</td>
            <td>{{ deposit.unit_number || deposit.reservation_id || '—' }}</td>
            <td>{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
            <td>{{ formatCurrency(deposit.final_price || deposit.total_value) }}</td>
            <td>{{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }} {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}</td>
            <td>
              <div style="display: flex; gap: 8px; flex-wrap: wrap">
                <button v-if="deposit.commission_source === 'owner' && deposit.unit_emptied !== false" class="btn-action delete" @click="processRefund(deposit)" title="إرجاع العربون (من المالك - يظهر عند إفراغ الوحدة من قسم الكريدت)">إرجاع العربون</button>
                <button v-if="deposit.commission_source === 'owner'" class="btn-action edit" @click="generateClaimFile(deposit)" :disabled="isGeneratingClaimFile">إصدار ملف مطالبة</button>
                <button class="btn-action edit" @click="confirmCommissionReceived(deposit)">تأكيد وصول العمولة</button>
              </div>
              <span v-if="deposit.commission_source === 'buyer'" class="deposit-note">لا يمكن إرجاع العربون (من المشتري)</span>
            </td>
          </tr>
          <tr v-if="deposits.length === 0 && !isLoading"><td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد عناصر للمتابعة</td></tr>
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
import DepositConfirmationModal from '@/components/accounting/DepositConfirmationModal.vue';
import { useAccountingDeposits } from '@/composables/accounting/useAccountingDeposits';

const {
  isLoading,
  deposits,
  depositsSubTab,
  isGeneratingClaimFile,
  currentPage,
  perPage,
  totalItems,
  showDepositModal,
  selectedDeposit,
  isSavingDeposit,
  loadDeposits,
  setDepositsSubTab,
  generateClaimFile,
  confirmCommissionReceived,
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
