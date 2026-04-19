<template>
  <div class="management-view accounting-deposits-tab">
    <header class="welcome-header deposits-hero" aria-labelledby="acct-deposits-title">
      <div class="deposits-hero-inner">
        <div class="header-icon-box" aria-hidden="true">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2"></rect>
            <path d="M12 10v4M8 12h8"></path>
          </svg>
        </div>
        <div class="deposits-hero-text">
          <h1 id="acct-deposits-title" class="welcome-title">تأكيد وإرجاع العربون</h1>
          <p class="welcome-subtitle">إدارة ومراقبة تدفقات العربون (الإيداع والاسترداد) بدقة واحترافية.</p>
        </div>
      </div>
      <div class="deposits-hero-actions">
        <button type="button" class="btn-refresh-luxury" :disabled="isLoading" @click="refreshDeposits">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          تحديث البيانات
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
          <div class="metrics-table-container table-responsive desktop-only">
            <table class="metrics-table luxury-table">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>الوحدة</th>
                  <th>اسم العميل</th>
                  <th>قيمة العربون</th>
                  <th>تاريخ الدفع</th>
                  <th class="actions-col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="deposit in filteredDeposits" :key="deposit.id" class="deposit-row-fade">
                  <td class="project-name-cell">
                    <span class="project-indicator"></span>
                    {{ deposit.project_name || 'غير محدد' }}
                  </td>
                  <td>{{ deposit.unit_number || deposit.reservation_id || deposit.unit_type || '\u2014' }}</td>
                  <td>{{ deposit.client_name || deposit.customer_name || '\u063a\u064a\u0631 \u0645\u062d\u062f\u062f' }}</td>
                  <td class="amount-cell">{{ formatCurrency(deposit.amount || deposit.deposit_amount || 0) }}</td>
                  <td class="date-cell">{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
                  <td>
                    <button v-if="deposit.status === 'pending'" type="button" class="btn-luxury-confirm" @click="confirmDeposit(deposit)">
                      تأكيد الاستلام
                    </button>
                    <span v-else class="status-glass excellent">مؤكد</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="mobile-cards-view mobile-only">
            <div v-for="deposit in filteredDeposits" :key="deposit.id" class="deposit-mobile-card">
              <div class="card-header">
                <span class="card-project">{{ deposit.project_name || 'مشروع غير محدد' }}</span>
                <span :class="['card-status', deposit.status === 'pending' ? 'pending' : 'confirmed']">
                  {{ deposit.status === 'pending' ? 'بانتظار التأكيد' : 'مؤكد' }}
                </span>
              </div>
              <div class="card-body">
                <div class="card-info-item">
                  <span class="label">العميل</span>
                  <span class="value">{{ deposit.client_name || deposit.customer_name || '—' }}</span>
                </div>
                <div class="card-info-item">
                  <span class="label">رقم الوحدة</span>
                  <span class="value">{{ deposit.unit_number || deposit.reservation_id || '\u2014' }}</span>
                </div>
                <div class="card-info-item">
                  <span class="label">قيمة العربون</span>
                  <span class="value highlight">{{ formatCurrency(deposit.amount || deposit.deposit_amount || 0) }}</span>
                </div>
                <div class="card-info-item">
                  <span class="label">تاريخ الدفع</span>
                  <span class="value">{{ formatDate(deposit.payment_date || deposit.created_at) }}</span>
                </div>
              </div>
              <div class="card-footer" v-if="deposit.status === 'pending'">
                <button type="button" class="btn-luxury-confirm-wide" @click="confirmDeposit(deposit)">تأكيد استلام العربون</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="depositsSubTab === 'follow-up'">
        <div v-if="filteredDeposits.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <p>{{ emptyPrimaryText }}</p>
          <p v-if="emptyHintText" class="empty-hint">{{ emptyHintText }}</p>
        </div>
        <div v-else class="deposits-table-wrap">
          <div class="metrics-table-container table-responsive desktop-only">
            <table class="metrics-table luxury-table luxury-table--refund">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>الوحدة</th>
                  <th>اسم العميل</th>
                  <th>قيمة العربون</th>
                  <th>تاريخ الدفع</th>
                  <th class="actions-col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="deposit in filteredDeposits" :key="deposit.id" class="deposit-row-fade">
                  <td class="project-name-cell">
                    <span class="project-indicator refund"></span>
                    {{ deposit.project_name || 'غير محدد' }}
                  </td>
                  <td>{{ deposit.unit_number || deposit.reservation_id || deposit.unit_type || '—' }}</td>
                  <td>{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
                  <td class="amount-cell">{{ formatCurrency(deposit.amount || deposit.deposit_amount || 0) }}</td>
                  <td class="date-cell">{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
                  <td>
                    <button type="button" class="btn-luxury-refund" @click="processRefund(deposit)">
                      إرجاع العربون
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View for Refund -->
          <div class="mobile-cards-view mobile-only">
            <div v-for="deposit in filteredDeposits" :key="deposit.id" class="deposit-mobile-card refund-card">
              <div class="card-header">
                <span class="card-project">{{ deposit.project_name || 'مشروح غير محدد' }}</span>
                <span class="card-status status-refund">جاهز للإرجاع</span>
              </div>
              <div class="card-body">
                <div class="card-info-item">
                  <span class="label">العميل</span>
                  <span class="value">{{ deposit.client_name || deposit.customer_name || '—' }}</span>
                </div>
                <div class="card-info-item">
                  <span class="label">قيمة العربون</span>
                  <span class="value highlight">{{ formatCurrency(deposit.amount || deposit.deposit_amount || 0) }}</span>
                </div>
                <div class="card-info-item">
                  <span class="label">تاريخ الدفع</span>
                  <span class="value">{{ formatDate(deposit.payment_date || deposit.created_at) }}</span>
                </div>
              </div>
              <div class="card-footer">
                <button type="button" class="btn-luxury-refund-wide" @click="processRefund(deposit)">بدء عملية الإرجاع</button>
              </div>
            </div>
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
  deposits,
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
    : 'لا توجد بيانات حالياً في هذه القائمة.'
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
