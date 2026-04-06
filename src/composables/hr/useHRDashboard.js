import { ref, reactive, computed } from 'vue';
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

  // Simulated trend data for "Monthly Performance Trend"
  const performanceTrend = ref([
    { x: 0, y: 400, label: 'يناير' },
    { x: 1, y: 300, label: 'فبراير' },
    { x: 2, y: 550, label: 'مارس' },
    { x: 3, y: 420, label: 'أبريل' },
    { x: 4, y: 600, label: 'مايو' },
    { x: 5, y: 500, label: 'يونيو' },
  ]);

  // Simulated data for "Performance Profile" (Radar chart simulation)
  const performanceProfile = ref([
    { label: 'الإنتاجية', value: 85 },
    { label: 'الجودة', value: 90 },
    { label: 'الالتزام', value: 75 },
    { label: 'التعاون', value: 88 },
    { label: 'الإبداع', value: 70 },
  ]);

  // Simulated data for "Monthly Summary"
  const monthlySummary = ref([
    { label: 'يناير', value: 65 },
    { label: 'فبراير', value: 72 },
    { label: 'مارس', value: 85 },
    { label: 'أبريل', value: 78 },
    { label: 'مايو', value: 92 },
    { label: 'يونيو', value: 88 },
  ]);

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
    performanceTrend,
    performanceProfile,
    monthlySummary,
    loadDashboardMetrics,
  };
}
