<template>
  <div class="management-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة العربون والمتابعة</h1>
        <p class="welcome-subtitle">إدارة الودائع والتأكيدات والاستردادات والمتابعة.</p>
      </div>
    </div>
    <MobileFilterSheet>
      <div class="deposits-sub-tabs">
        <button :class="['sub-tab-btn', { active: depositsSubTab === 'manage' }]" @click="setDepositsSubTab('manage')">إدارة العربون</button>
        <button :class="['sub-tab-btn', { active: depositsSubTab === 'follow-up' }]" @click="setDepositsSubTab('follow-up')">المتابعة</button>
      </div>
    </MobileFilterSheet>
    <div v-if="depositsSubTab === 'manage'" class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم المشروع</th><th>نوع الوحدة</th><th>سعر الوحدة</th><th>سعر البيع النهائي</th><th>قيمة العربون</th><th>طريقة الدفع</th><th>اسم العميل</th><th>تاريخ الدفع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in deposits" :key="deposit.id">
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
          <tr v-if="deposits.length === 0 && !isLoading"><td colspan="10" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد ودائع</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="depositsSubTab === 'follow-up'" class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم المشروع</th><th>رقم الوحدة</th><th>اسم العميل</th><th>إجمالي قيمة البيع</th><th>نسبة السعي</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="deposit in deposits" :key="deposit.id">
            <td data-label="اسم المشروع">{{ deposit.project_name || 'غير محدد' }}</td>
            <td data-label="رقم الوحدة">{{ deposit.unit_number || deposit.reservation_id || '—' }}</td>
            <td data-label="اسم العميل">{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
            <td data-label="إجمالي قيمة البيع">{{ formatCurrency(deposit.final_price || deposit.total_value) }}</td>
            <td data-label="نسبة السعي">{{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }} {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}</td>
            <td data-label="الإجراءات">
              <RowActions>
                <button v-if="deposit.commission_source === 'owner' && deposit.unit_emptied !== false" class="btn-action delete" @click="processRefund(deposit)" title="إرجاع العربون (من المالك - يظهر عند إفراغ الوحدة من قسم الكريدت)">إرجاع العربون</button>
                <button v-if="deposit.commission_source === 'owner'" class="btn-action edit" @click="generateClaimFile(deposit)" :disabled="isGeneratingClaimFile">إصدار ملف مطالبة</button>
                <button class="btn-action edit" @click="confirmCommissionReceived(deposit)">تأكيد وصول العمولة</button>
                <template #menu>
                  <DropdownMenuItem v-if="deposit.commission_source === 'owner' && deposit.unit_emptied !== false" @click="processRefund(deposit)">إرجاع العربون</DropdownMenuItem>
                  <DropdownMenuItem v-if="deposit.commission_source === 'owner'" @click="generateClaimFile(deposit)" :disabled="isGeneratingClaimFile">إصدار ملف مطالبة</DropdownMenuItem>
                  <DropdownMenuItem @click="confirmCommissionReceived(deposit)">تأكيد وصول العمولة</DropdownMenuItem>
                </template>
              </RowActions>
              <span v-if="deposit.commission_source === 'buyer'" class="deposit-note">لا يمكن إرجاع العربون (من المشتري)</span>
            </td>
          </tr>
          <tr v-if="deposits.length === 0 && !isLoading"><td colspan="6" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد عناصر للمتابعة</td></tr>
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
import RowActions from '@/components/RowActions.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
