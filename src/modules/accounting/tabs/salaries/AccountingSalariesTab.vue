<template>
  <div class="management-view accounting-salaries-tab">
    <header class="welcome-header salaries-hero" aria-labelledby="salaries-tab-title">
      <div class="salaries-hero-inner">
        <span class="title-icon-wrap" aria-hidden="true">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </span>
        <div class="salaries-hero-text">
          <h1 id="salaries-tab-title" class="welcome-title">الرواتب وتوزيع العمولات والمكافآت</h1>
          <p class="welcome-subtitle">إدارة رواتب الموظفين وصافي العمولات والمكافآت لكل فترة.</p>
          <span class="salaries-hero-meta" title="الفترة المعروضة">{{ monthLabelAr }}</span>
        </div>
      </div>
      <div class="salaries-hero-actions">
        <button type="button" class="btn-refresh-salaries" :disabled="isLoading" @click="loadSalaries">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          تحديث
        </button>
      </div>
    </header>

    <div class="salaries-sub-tabs">
      <button type="button" class="sub-tab-btn" :class="{ active: subTab === 'salaries' }" @click="subTab = 'salaries'">الرواتب</button>
    </div>

    <template v-if="subTab === 'salaries'">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner" aria-hidden="true"></div>
        <p>جاري تحميل الرواتب...</p>
      </div>

      <div v-else-if="salaries.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
        <p>لا توجد بيانات رواتب لهذه الفترة.</p>
      </div>

      <template v-else>
        <div class="salaries-table-wrap">
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table table-mobile-stacked">
              <thead>
                <tr>
                  <th>اسم الموظف</th>
                  <th>المسمى الوظيفي</th>
                  <th>القسم/الفريق</th>
                  <th>الراتب حسب العقد</th>
                  <th>العمولات</th>
                  <th>المكافآت</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(salary, idx) in salaries" :key="salary.employee_id ?? salary.user_id ?? salary.id ?? idx">
                  <td data-label="اسم الموظف">{{ salary.employee_name || salary.name || salary.user_name || 'غير محدد' }}</td>
                  <td data-label="المسمى الوظيفي">{{ salary.job_title || salary.title || salary.position || '—' }}</td>
                  <td data-label="القسم/الفريق">{{ salary.department || salary.team_name || '—' }}</td>
                  <td data-label="الراتب حسب العقد">{{ formatCurrency(salary.distribution?.base_salary ?? salary.contract_salary ?? salary.base_salary ?? salary.salary ?? 0) }}</td>
                  <td data-label="العمولات">{{ formatCurrency(salary.distribution?.total_commissions ?? salary.total_commissions ?? salary.net_monthly_commission ?? 0) }}</td>
                  <td data-label="المكافآت">{{ formatCurrency(salary.distribution?.total_rewards ?? salary.total_rewards ?? salary.rewards_total ?? salary.summary?.total_rewards ?? 0) }}</td>
                  <td data-label="الإجمالي">{{ formatCurrency(salary.distribution?.total_amount ?? salary.total_amount ?? (Number(salary.contract_salary ?? salary.base_salary ?? 0) + Number(salary.total_commissions ?? 0) + Number(salary.total_rewards ?? salary.rewards_total ?? salary.summary?.total_rewards ?? 0))) }}</td>
                  <td data-label="الحالة">
                    <span class="status-tag" :class="getStatusClass(salary.distribution?.status ?? salary.status)">{{ statusLabelAr(salary.distribution?.status ?? salary.distribution_status ?? salary.status) }}</span>
                  </td>
                  <td data-label="الإجراءات">
                    <button type="button" class="btn-action edit" @click="viewSalaryDetail(salary)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      عرض
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />
      </template>
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
import { computed, onMounted, ref } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SalaryDistributionModal from '@/modules/accounting/components/SalaryDistributionModal.vue';
import { useFormatters } from '@/composables/useFormatters';
import { useAccountingSalaries } from '@/composables/accounting/useAccountingSalaries';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

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

const monthLabelAr = computed(() => {
  const parts = salaryMonth.value.split('-').map(Number);
  const y = parts[0] || new Date().getFullYear();
  const m = parts[1] >= 1 && parts[1] <= 12 ? parts[1] : new Date().getMonth() + 1;
  return `${MONTHS_AR[m - 1]} ${y}`;
});

onMounted(() => {
  loadSalaries();
});
</script>

<style scoped src="./styles/AccountingSalariesTab.scoped.s1.css"></style>
