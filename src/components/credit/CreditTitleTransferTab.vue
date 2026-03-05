<template>
  <div class="management-view">
    <div
      class="section-header-compact"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div>
        <h2 class="section-title">نقل الملكية</h2>
        <p class="section-subtitle">إدارة طلبات نقل الملكية.</p>
      </div>
      <button class="btn-primary" @click="openTitleTransferForm">
        <span class="plus-icon">+</span> إنشاء طلب نقل ملكية
      </button>
    </div>
    <div class="metrics-table-container">
      <div class="table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>رقم العقد</th>
            <th>تاريخ الطلب</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transfer in titleTransfers" :key="transfer.id">
            <td data-label="رقم الطلب">{{ transfer.id }}</td>
            <td data-label="رقم العقد">{{ transfer.contract_id || 'غير محدد' }}</td>
            <td data-label="تاريخ الطلب">{{ formatDate(transfer.created_at) }}</td>
            <td>
              <span class="status-tag" :class="getStatusClass(transfer.status)">{{
                transfer.status || 'قيد المعالجة'
              }}</span>
            </td>
            <td>
              <button
                v-if="transfer.status !== 'completed'"
                class="btn-action edit"
                @click="completeTitleTransfer(transfer)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                إكمال
              </button>
              <span v-else style="color: var(--color-dark-gray)">مكتمل</span>
            </td>
          </tr>
          <tr v-if="titleTransfers.length === 0 && !isLoading">
            <td
              colspan="5"
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد طلبات نقل ملكية
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

    <TitleTransferForm
      v-if="showTitleTransferModal"
      :transfer="selectedTransfer"
      :isLoading="isSavingTransfer"
      @close="showTitleTransferModal = false"
      @submit="handleTitleTransferSubmit"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import TitleTransferForm from '@/components/credit/TitleTransferForm.vue';
import { useCreditTitleTransfer } from '@/composables/credit/useCreditTitleTransfer';

const {
  isLoading,
  titleTransfers,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  showTitleTransferModal,
  selectedTransfer,
  isSavingTransfer,
  formatDate,
  getStatusClass,
  loadTitleTransfers,
  openTitleTransferForm,
  completeTitleTransfer,
  handleTitleTransferSubmit,
  handlePageChange,
  handlePerPageChange,
} = useCreditTitleTransfer();

onMounted(() => {
  loadTitleTransfers();
});
</script>
