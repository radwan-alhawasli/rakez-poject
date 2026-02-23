<template>
  <div class="hr-view commission-deposits-view">
    <div class="tab-content custom-scrollbar">
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية للعمولات والودائع.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي العمولات</span>
              <span class="stat-value number">{{
                formatCurrency(dashboardMetrics.totalCommissions)
              }}</span>
              <span class="stat-desc">القيمة الإجمالية للعمولات</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي الودائع</span>
              <span class="stat-value number">{{
                formatCurrency(dashboardMetrics.totalDeposits)
              }}</span>
              <span class="stat-desc">القيمة الإجمالية للودائع</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'commissions'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">قائمة العمولات</h2>
            <p class="section-subtitle">إدارة وحساب العمولات.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم العمولة</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="commission in commissions" :key="commission.id">
                <td>{{ commission.id }}</td>
                <td>{{ formatCurrency(commission.amount || commission.total_amount) }}</td>
                <td>
                  <span class="status-tag good">{{ commission.status || 'قيد المعالجة' }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewCommissionDetail(commission)">
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="commissions.length === 0 && !isLoading">
                <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد عمولات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="totalItems > 0"
          :current-page="currentPage"
          :total-items="totalItems"
          :per-page="perPage"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>

      <div v-else-if="activeTab === 'deposits'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">تتبع الودائع</h2>
            <p class="section-subtitle">إدارة الودائع والتأكيدات.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الوديعة</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deposit in deposits" :key="deposit.id">
                <td>{{ deposit.id }}</td>
                <td>{{ formatCurrency(deposit.amount) }}</td>
                <td>
                  <span class="status-tag good">{{ deposit.status || 'معلق' }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewDepositDetail(deposit)">عرض</button>
                </td>
              </tr>
              <tr v-if="deposits.length === 0 && !isLoading">
                <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد ودائع
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="depositsTotalItems > 0"
          :current-page="depositsPage"
          :total-items="depositsTotalItems"
          :per-page="depositsPerPage"
          @page-change="handleDepositsPageChange"
          @per-page-change="handleDepositsPerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import commissionService from '../services/commissionService';
import authService from '../services/authService';
import Pagination from '../components/Pagination.vue';
import logger from '../utils/logger';

export default {
  name: 'CommissionDepositsView',
  components: { Pagination },
  setup() {
    const route = useRoute();
    const user = ref(authService.getCurrentUser());
    const userName = computed(() => user.value?.name || 'قسم العمولات');
    const isLoading = ref(false);
    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'CommissionsDashboard') return 'dashboard';
      if (name === 'CommissionsList') return 'commissions';
      if (name === 'DepositsTracking') return 'deposits';
      return 'dashboard';
    });

    const dashboardMetrics = reactive({
      totalCommissions: 0,
      totalDeposits: 0,
    });

    const commissions = ref([]);
    const deposits = ref([]);
    const currentPage = ref(1);
    const perPage = ref(25);
    const totalItems = ref(0);
    const depositsPage = ref(1);
    const depositsPerPage = ref(25);
    const depositsTotalItems = ref(0);

    const loadCommissions = async () => {
      isLoading.value = true;
      try {
        const data = await commissionService.getCommissions({
          page: currentPage.value,
          per_page: perPage.value,
        });
        commissions.value = Array.isArray(data) ? data : data?.items || [];
        totalItems.value = data?.total ?? commissions.value.length;
      } catch (error) {
        logger.error('Error loading commissions:', error);
        commissions.value = [];
        totalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadDeposits = async () => {
      isLoading.value = true;
      try {
        const data = await commissionService.getDeposits({
          page: depositsPage.value,
          per_page: depositsPerPage.value,
        });
        deposits.value = Array.isArray(data) ? data : data?.items || [];
        depositsTotalItems.value = data?.total ?? deposits.value.length;
      } catch (error) {
        logger.error('Error loading deposits:', error);
        deposits.value = [];
        depositsTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const handlePageChange = page => {
      currentPage.value = page;
      loadCommissions();
    };

    const handlePerPageChange = val => {
      perPage.value = val;
      currentPage.value = 1;
      loadCommissions();
    };

    const handleDepositsPageChange = page => {
      depositsPage.value = page;
      loadDeposits();
    };

    const handleDepositsPerPageChange = val => {
      depositsPerPage.value = val;
      depositsPage.value = 1;
      loadDeposits();
    };

    const viewCommissionDetail = () => {};
    const viewDepositDetail = () => {};

    const formatCurrency = val => {
      if (!val) return '0 ر.س';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(val);
    };

    watch(
      activeTab,
      newTab => {
        if (newTab === 'commissions') loadCommissions();
        if (newTab === 'deposits') loadDeposits();
      },
      { immediate: true }
    );

    return {
      activeTab,
      userName,
      isLoading,
      dashboardMetrics,
      commissions,
      deposits,
      currentPage,
      perPage,
      totalItems,
      depositsPage,
      depositsPerPage,
      depositsTotalItems,
      handlePageChange,
      handlePerPageChange,
      handleDepositsPageChange,
      handleDepositsPerPageChange,
      viewCommissionDetail,
      viewDepositDetail,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.commission-deposits-view {
  /* Inherit from hr-view */
}
</style>
