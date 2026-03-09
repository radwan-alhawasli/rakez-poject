<template>
  <div class="management-view">
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">الرواتب وتوزيع العمولات</h1>
        <p class="welcome-subtitle">إدارة رواتب الموظفين والعمولات.</p>
      </div>
    </div>
    <div class="salaries-sub-tabs">
      <button type="button" class="sub-tab-btn" :class="{ active: subTab === 'salaries' }" @click="subTab = 'salaries'">الرواتب</button>
    </div>

    <!-- الرواتب -->
    <template v-if="subTab === 'salaries'">
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>اسم الموظف</th><th>المسمى الوظيفي</th><th>القسم/الفريق</th><th>الراتب حسب العقد</th><th>العمولات</th><th>الإجمالي</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="(salary, idx) in salaries" :key="salary.employee_id ?? salary.user_id ?? salary.id ?? idx">
            <td data-label="اسم الموظف">{{ salary.employee_name || salary.name || salary.user_name || 'غير محدد' }}</td>
            <td data-label="المسمى الوظيفي">{{ salary.job_title || salary.title || salary.position || '—' }}</td>
            <td data-label="القسم/الفريق">{{ salary.department || salary.team_name || '—' }}</td>
            <td data-label="الراتب حسب العقد">{{ formatCurrency(salary.distribution?.base_salary ?? salary.contract_salary ?? salary.base_salary ?? salary.salary ?? 0) }}</td>
            <td data-label="العمولات">{{ formatCurrency(salary.distribution?.total_commissions ?? salary.total_commissions ?? salary.net_monthly_commission ?? 0) }}</td>
            <td data-label="الإجمالي">{{ formatCurrency(salary.distribution?.total_amount ?? salary.total_amount ?? (Number(salary.contract_salary ?? salary.base_salary ?? 0) + Number(salary.total_commissions ?? 0))) }}</td>
            <td data-label="الحالة"><span class="status-tag" :class="getStatusClass(salary.distribution?.status ?? salary.status)">{{ statusLabelAr(salary.distribution?.status ?? salary.distribution_status ?? salary.status) }}</span></td>
            <td data-label="الإجراءات"><button class="btn-action edit" @click="viewSalaryDetail(salary)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>عرض</button></td>
          </tr>
          <tr v-if="salaries.length === 0 && !isLoading"><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد رواتب</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />
    </template>

    <SalaryDistributionModal
      v-if="showSalaryModal"
      :salary="selectedSalary"
      :salary-month="salaryMonth"
      :isLoading="isSavingSalary"
      :isLoadingDetail="isLoadingDetail"
      @close="showSalaryModal = false"
      @submit="handleSalarySubmit"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SalaryDistributionModal from '@/components/accounting/SalaryDistributionModal.vue';
import { useFormatters } from '@/composables/useFormatters';
import { useAccountingSalaries } from '@/composables/accounting/useAccountingSalaries';

const subTab = ref('salaries');

const {
  isLoading,
  isLoadingDetail,
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

const { statusLabelAr } = useFormatters();

onMounted(() => {
  loadSalaries();
});
</script>

<style scoped>
.salaries-sub-tabs { display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
.salaries-sub-tabs .sub-tab-btn { padding: 10px 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.salaries-sub-tabs .sub-tab-btn:hover { border-color: #b1a28f; color: #b1a28f; }
.salaries-sub-tabs .sub-tab-btn.active { background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%); border-color: #b1a28f; color: white; }
@media (max-width: 576px) {
  .table-responsive { margin: 0 -12px; }
}
</style>
