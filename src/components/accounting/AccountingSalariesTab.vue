<template>
  <div class="management-view">
    <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center">
      <div><h2 class="section-title">الرواتب وتوزيع العمولات</h2><p class="section-subtitle">إدارة رواتب الموظفين والعمولات.</p></div>
      <div style="display: flex; gap: 10px"><input v-model="salaryMonth" type="month" class="form-input" style="width: 200px" @change="loadSalaries" /></div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table">
        <thead><tr><th>اسم الموظف</th><th>الراتب حسب العقد</th><th>المسمى الوظيفي</th><th>نسبة العمولة</th><th>العمولات</th><th>الإجمالي</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="salary in salaries" :key="salary.employee_id">
            <td>{{ salary.employee_name || 'غير محدد' }}</td>
            <td>{{ formatCurrency(salary.contract_salary || salary.base_salary) }}</td>
            <td>{{ salary.job_title || salary.title || '—' }}</td>
            <td>{{ salary.commission_percentage ? salary.commission_percentage + '%' : '—' }}</td>
            <td>{{ formatCurrency(salary.total_commissions) }}</td>
            <td>{{ formatCurrency(salary.total_amount) }}</td>
            <td><span class="status-tag" :class="getStatusClass(salary.status)">{{ salary.status || 'معلق' }}</span></td>
            <td><button class="btn-action edit" @click="viewSalaryDetail(salary)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>عرض</button></td>
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
