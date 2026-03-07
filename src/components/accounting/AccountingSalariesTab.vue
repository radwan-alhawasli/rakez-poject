<template>
  <div class="management-view">
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">الرواتب وتوزيع العمولات</h1>
        <p class="welcome-subtitle">إدارة رواتب الموظفين والعمولات.</p>
      </div>
      <div style="display: flex; gap: 10px"><input v-model="salaryMonth" type="month" class="form-input" style="width: 200px" @change="loadSalaries" /></div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم الموظف</th><th>الراتب حسب العقد</th><th>المسمى الوظيفي</th><th>نسبة العمولة</th><th>العمولات</th><th>الإجمالي</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="salary in salaries" :key="salary.employee_id">
            <td data-label="اسم الموظف">{{ salary.employee_name || 'غير محدد' }}</td>
            <td data-label="الراتب حسب العقد">{{ formatCurrency(salary.contract_salary || salary.base_salary) }}</td>
            <td data-label="المسمى الوظيفي">{{ salary.job_title || salary.title || '—' }}</td>
            <td data-label="نسبة العمولة">{{ salary.commission_percentage ? salary.commission_percentage + '%' : '—' }}</td>
            <td data-label="العمولات">{{ formatCurrency(salary.total_commissions) }}</td>
            <td data-label="الإجمالي">{{ formatCurrency(salary.total_amount) }}</td>
            <td data-label="الحالة"><span class="status-tag" :class="getStatusClass(salary.status)">{{ salary.status || 'معلق' }}</span></td>
            <td data-label="الإجراءات"><button class="btn-action edit" @click="viewSalaryDetail(salary)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>عرض</button></td>
          </tr>
          <tr v-if="salaries.length === 0 && !isLoading"><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد رواتب</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

    <SalaryDistributionModal
      v-if="showSalaryModal"
      :salary="selectedSalary"
      :isLoading="isSavingSalary"
      @close="showSalaryModal = false"
      @submit="handleSalarySubmit"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SalaryDistributionModal from '@/components/accounting/SalaryDistributionModal.vue';
import { useAccountingSalaries } from '@/composables/accounting/useAccountingSalaries';

const {
  isLoading,
  salaries,
  salaryMonth,
  currentPage,
  perPage,
  totalItems,
  showSalaryModal,
  selectedSalary,
  isSavingSalary,
  loadSalaries,
  viewSalaryDetail,
  handleSalarySubmit,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
  getStatusClass,
} = useAccountingSalaries();

onMounted(() => {
  loadSalaries();
});
</script>

<style scoped>
@media (max-width: 576px) {
  .table-responsive { margin: 0 -12px; }
}
</style>
