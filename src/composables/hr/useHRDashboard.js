import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useHRDashboard() {
  const isLoading = ref(false);
  const error = ref(null);

  const dashboardMetrics = reactive({
    totalEmployees: 0,
    totalUnits: 0,
    salesEmployeesCount: 0,
    soldUnits: 0,
    avgEmployeeSales: 0,
  });

  const loadDashboardMetrics = async () => {
    isLoading.value = true;
    error.value = null;
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
    } catch (err) {
      logger.error('Error loading dashboard metrics:', err);
      error.value = 'حدث خطأ أثناء تحميل بيانات لوحة التحكم';
      toast.error('حدث خطأ أثناء تحميل بيانات لوحة التحكم');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    dashboardMetrics,
    loadDashboardMetrics,
  };
}
