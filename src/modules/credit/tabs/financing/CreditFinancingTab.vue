<template>
  <div class="management-view">
    <div
      class="section-header-compact"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div>
        <h2 class="section-title">طلبات التمويل</h2>
        <p class="section-subtitle">إدارة طلبات التمويل وتتبع حالتها.</p>
      </div>
    </div>
    <div class="metrics-table-container">
      <div class="table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>اسم العميل</th>
            <th>المبلغ</th>
            <th>البنك</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="financing in financingList" :key="financing.id">
            <td data-label="رقم الطلب">{{ financing.id }}</td>
            <td data-label="اسم العميل">{{ financing.customer_name || 'غير محدد' }}</td>
            <td data-label="المبلغ">{{ formatCurrency(financing.amount) }}</td>
            <td data-label="البنك">{{ financing.bank_name || 'غير محدد' }}</td>
            <td data-label="الحالة">
              <span class="status-tag" :class="getStatusClass(financing.status)">{{
                financing.status || 'قيد المعالجة'
              }}</span>
            </td>
            <td data-label="الإجراءات">
              <button class="btn-action edit" @click="viewFinancingDetail(financing)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض
              </button>
            </td>
          </tr>
          <tr v-if="financingList.length === 0 && !isLoading">
            <td
              colspan="6"
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد طلبات تمويل
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <Pagination
      v-if="creditTotalItems > 0"
      :current-page="creditCurrentPage"
      :total-items="creditTotalItems"
      :per-page="creditPerPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />

    <FinancingDetailModal
      v-if="showFinancingModal"
      :financing="selectedFinancing"
      :isLoading="isSavingFinancing"
      @close="showFinancingModal = false"
      @submit="handleFinancingUpdate"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import FinancingDetailModal from '@/modules/credit/components/FinancingDetailModal.vue';
import { useCreditFinancing } from '@/composables/credit/useCreditFinancing';

const {
  isLoading,
  financingList,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  showFinancingModal,
  selectedFinancing,
  isSavingFinancing,
  formatCurrency,
  getStatusClass,
  loadFinancing,
  viewFinancingDetail,
  handleFinancingUpdate,
  handlePageChange,
  handlePerPageChange,
} = useCreditFinancing();

onMounted(() => {
  loadFinancing();
});
</script>

<style scoped>
@media (max-width: 768px) {
  .section-header-compact { padding: 16px; }
  .section-title { font-size: 18px; }
  .section-subtitle { font-size: 13px; }
}
@media (max-width: 576px) {
  .section-header-compact { padding: 12px; }
  .table-responsive { margin: 0 -12px; }
}
</style>
