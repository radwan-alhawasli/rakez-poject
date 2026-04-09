<template>
  <div class="management-view accounting-deposits-tab">
    <header class="welcome-header deposits-hero" aria-labelledby="acct-deposits-title">
      <div class="deposits-hero-inner">
        <span class="title-icon-wrap" aria-hidden="true">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2"></rect>
            <path d="M12 10v4M8 12h8"></path>
          </svg>
        </span>
        <div class="deposits-hero-text">
          <h1 id="acct-deposits-title" class="welcome-title">تأكيد العربون وإرجاع العربون</h1>
          <p class="welcome-subtitle">إدارة تأكيد استلام العربون والحالات المؤهّلة لإرجاع العربون.</p>
        </div>
      </div>
      <div class="deposits-hero-actions">
        <button type="button" class="btn-refresh-deposits" :disabled="isLoading" @click="refreshDeposits">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          تحديث
        </button>
      </div>
    </header>

    <div class="deposits-toolbar-card">
      <MobileFilterSheet>
        <div class="deposits-sub-tabs">
          <button type="button" :class="['sub-tab-btn', { active: depositsSubTab === 'manage' }]" @click="setDepositsSubTab('manage')">تأكيد العربون</button>
          <button type="button" :class="['sub-tab-btn', { active: depositsSubTab === 'follow-up' }]" @click="setDepositsSubTab('follow-up')">إرجاع العربون</button>
        </div>
        <div class="project-filter-bar">
          <input
            v-model.trim="projectFilter"
            type="search"
            class="form-input project-filter-input"
            placeholder="فلترة حسب اسم المشروع"
            autocomplete="off"
          />
        </div>
      </MobileFilterSheet>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <template v-else>
      <div v-if="depositsSubTab === 'manage'">
        <div v-if="filteredDeposits.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="6" width="20" height="14" rx="2"></rect>
            <path d="M12 10v4M8 12h8"></path>
          </svg>
          <p>{{ emptyPrimaryText }}</p>
          <p v-if="emptyHintText" class="empty-hint">{{ emptyHintText }}</p>
        </div>
        <div v-else class="deposits-table-wrap">
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table table-mobile-stacked">
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>نوع الوحدة</th>
                  <th>سعر الوحدة</th>
                  <th>سعر البيع النهائي</th>
                  <th>قيمة العربون</th>
                  <th>طريقة الدفع</th>
                  <th>اسم العميل</th>
                  <th>تاريخ الدفع</th>
                  <th>نسبة السعي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="deposit in filteredDeposits" :key="deposit.id">
                  <td data-label="اسم المشروع">{{ deposit.project_name || 'غير محدد' }}</td>
                  <td data-label="نوع الوحدة">
                    <span v-if="deposit.unit_type">{{ deposit.unit_type }}</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="سعر الوحدة">{{ formatCurrency(deposit.unit_price) }}</td>
                  <td data-label="سعر البيع النهائي">{{ formatCurrency(deposit.final_price) }}</td>
                  <td data-label="قيمة العربون">{{ formatCurrency(deposit.amount) }}</td>
                  <td data-label="طريقة الدفع">
                    <span v-if="deposit.payment_method">{{ deposit.payment_method }}</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="اسم العميل">{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
                  <td data-label="تاريخ الدفع">{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
                  <td data-label="نسبة السعي">
                    <template v-if="deposit.commission_percentage">{{ deposit.commission_percentage }}%</template>
                    <span v-else class="cell-placeholder">—</span>
                    {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}
                  </td>
                  <td data-label="الإجراءات">
                    <button v-if="deposit.status === 'pending'" type="button" class="btn-action edit btn-confirm-deposit" @click="confirmDeposit(deposit)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span class="btn-confirm-deposit-text">تأكيد استلام العربون</span>
                    </button>
                    <span v-else class="status-tag excellent">مؤكد</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="depositsSubTab === 'follow-up'">
        <div v-if="filteredDeposits.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="6" width="20" height="14" rx="2"></rect>
            <path d="M12 10v4M8 12h8"></path>
          </svg>
          <p>{{ emptyPrimaryText }}</p>
          <p v-if="emptyHintText" class="empty-hint">{{ emptyHintText }}</p>
        </div>
        <div v-else class="deposits-table-wrap">
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table table-mobile-stacked">
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>رقم الوحدة</th>
                  <th>اسم العميل</th>
                  <th>إجمالي قيمة البيع</th>
                  <th>نسبة السعي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="deposit in filteredDeposits" :key="deposit.id">
                  <td data-label="اسم المشروع">{{ deposit.project_name || 'غير محدد' }}</td>
                  <td data-label="رقم الوحدة">
                    <span v-if="deposit.unit_number || deposit.reservation_id">{{ deposit.unit_number || deposit.reservation_id }}</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="اسم العميل">{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
                  <td data-label="إجمالي قيمة البيع">{{ formatCurrency(deposit.final_price || deposit.total_value) }}</td>
                  <td data-label="نسبة السعي">
                    <template v-if="deposit.commission_percentage">{{ deposit.commission_percentage }}%</template>
                    <span v-else class="cell-placeholder">—</span>
                    {{ deposit.commission_source === 'owner' ? '(من المالك)' : deposit.commission_source === 'buyer' ? '(من المشتري)' : '' }}
                  </td>
                  <td data-label="الإجراءات">
                    <button type="button" class="btn-action delete" title="إرجاع العربون" @click="processRefund(deposit)">إرجاع العربون</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <Pagination v-if="totalItems > 0 && !isLoading" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

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
import { computed, onMounted } from 'vue';
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
  loadDepositsFollowUp,
  setDepositsSubTab,
  confirmDeposit,
  processRefund,
  handleDepositSubmit,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
  formatDate,
} = useAccountingDeposits();

const emptyPrimaryText = computed(() =>
  String(projectFilter.value ?? '').trim()
    ? 'لا توجد نتائج مطابقة لاسم المشروع.'
    : 'لا توجد بيانات في هذه القائمة.'
);

const emptyHintText = computed(() =>
  String(projectFilter.value ?? '').trim() ? 'جرّب مسح الفلتر أو تعديل البحث.' : null
);

function refreshDeposits() {
  if (depositsSubTab.value === 'manage') loadDeposits();
  else loadDepositsFollowUp();
}

onMounted(() => {
  loadDeposits();
});
</script>

<style scoped src="./styles/AccountingDepositsTab.scoped.s1.css"></style>
