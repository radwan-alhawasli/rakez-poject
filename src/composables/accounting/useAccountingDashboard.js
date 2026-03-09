import { ref, reactive, computed } from 'vue';
import accountingService from '@/services/accountingService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingDashboard() {
  const user = ref(authService.getCurrentUser());
  const userName = computed(() => user.value?.name || 'قسم المحاسبة');
  const isLoading = ref(false);

  const now = new Date();
  const dashboardFromDate = ref(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  );
  const dashboardToDate = ref(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  );

  const dashboardMetrics = reactive({
    totalUnitsSold: 0,
    totalDeposits: 0,
    totalDepositsCount: 0,
    totalDepositsRefunded: 0,
    totalProjectsValue: 0,
    totalSalesValue: 0,
    totalCommissions: 0,
    pendingDeposits: 0,
    pendingDepositsCount: 0,
    pendingSalaries: 0,
    unreadNotifications: 0,
  });

  const loadDashboardMetrics = async () => {
    isLoading.value = true;
    try {
      const params = {};
      if (dashboardFromDate.value) params.from_date = dashboardFromDate.value;
      if (dashboardToDate.value) params.to_date = dashboardToDate.value;
      const [data, pendingDepositsData, followUpDepositsData] = await Promise.all([
        accountingService.getDashboard(params),
        accountingService.getPendingDeposits({ page: 1, per_page: 1 }),
        accountingService.getDepositsFollowUp({ page: 1, per_page: 1 }),
      ]);
      dashboardMetrics.totalUnitsSold = data.total_units_sold || 0;
      dashboardMetrics.totalDeposits = data.total_deposits || 0;
      dashboardMetrics.totalDepositsCount =
        Number(pendingDepositsData?.total ?? 0) + Number(followUpDepositsData?.total ?? 0);
      dashboardMetrics.totalDepositsRefunded = data.total_deposits_refunded || 0;
      dashboardMetrics.totalProjectsValue = data.total_projects_value || 0;
      dashboardMetrics.totalSalesValue = data.total_sales_value || 0;
      dashboardMetrics.totalCommissions = data.total_commissions || 0;
      dashboardMetrics.pendingDeposits = data.pending_deposits || 0;
      dashboardMetrics.pendingDepositsCount = Number(pendingDepositsData?.total ?? 0);
      dashboardMetrics.pendingSalaries = data.pending_salaries || 0;
      dashboardMetrics.unreadNotifications = data.unread_notifications || 0;
    } catch (error) {
      logger.error('Error loading dashboard metrics:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const { formatCurrency } = useFormatters();

  return {
    userName,
    isLoading,
    dashboardMetrics,
    dashboardFromDate,
    dashboardToDate,
    loadDashboardMetrics,
    formatCurrency,
  };
}
