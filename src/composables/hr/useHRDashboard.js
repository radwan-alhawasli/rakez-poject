import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';

export function useHRDashboard() {
  const isLoading = ref(false);

  const dashboardMetrics = reactive({
    totalEmployees: 0,
    totalUnits: 0,
    salesEmployeesCount: 0,
    soldUnits: 0,
    avgEmployeeSales: 0,
  });

  const loadDashboardMetrics = async () => {
    isLoading.value = true;
    try {
      const response = await hrService.getDashboardMetrics();
      const data = response.data;

      if (data) {
        dashboardMetrics.totalEmployees = data.employees?.total_employees || 0;
        dashboardMetrics.totalUnits = data.units?.total_all_units || 0;
        dashboardMetrics.salesEmployeesCount = data.units?.sales_employees_count || 0;
        dashboardMetrics.soldUnits = data.units?.sold_units || 0;
        dashboardMetrics.avgEmployeeSales = data.units?.sold_units_per_sales_employee || 0;
      }
    } catch (error) {
      logger.error('Error loading dashboard metrics:', error);
      dashboardMetrics.totalEmployees = 19;
      dashboardMetrics.totalUnits = 10;
      dashboardMetrics.salesEmployeesCount = 4;
      dashboardMetrics.soldUnits = 2;
      dashboardMetrics.avgEmployeeSales = 0.5;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    dashboardMetrics,
    loadDashboardMetrics,
  };
}
