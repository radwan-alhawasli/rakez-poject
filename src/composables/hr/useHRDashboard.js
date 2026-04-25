import { ref, reactive, computed } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/** @param {any[]} candidates */
function firstNumeric(...candidates) {
  for (const v of candidates) {
    if (v == null || v === '') continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export function useHRDashboard() {
  const isLoading = ref(false);
  const error = ref((/** @type {string|null} */ (null)));
  /** نسبة التغيير الشهري لمتوسط بيع الفريق (من الـ API إن وُجدت) */
  const avgTeamMonthlySalesTrendPercent = ref((/** @type {number|null} */ (null)));
  /** نسبة التغيير الشهري لعدد الموظفين (من الـ API إن وُجدت) */
  const currentEmployeesTrendPercent = ref((/** @type {number|null} */ (null)));

  const dashboardMetrics = reactive({
    totalEmployees: 0,
    totalUnits: 0,
    salesEmployeesCount: 0,
    soldUnits: 0,
    avgEmployeeSales: 0,
    /** متوسط بيع الفريق شهرياً — من حقول dashboard متعددة الأسماء */
    avgTeamMonthlySales: 0,
    /** عدد الموظفين الحاليين (نشط/حالي من الـ API، أو الإجمالي كاحتياطي) */
    currentEmployeesCount: 0,
  });

  const teamMonthlySalesDescription = computed(() => {
    const p = avgTeamMonthlySalesTrendPercent.value;
    if (p == null || Number.isNaN(Number(p))) return '';
    const n = Number(p);
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}% من الشهر الماضي`;
  });

  const currentEmployeesDescription = computed(() => {
    const p = currentEmployeesTrendPercent.value;
    if (p == null || Number.isNaN(Number(p))) return '';
    const n = Number(p);
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}% من الشهر الماضي`;
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
        const sales = data.sales || {};
        const units = data.units || {};
        const teamSales = data.team_sales || data.teamSales || {};
        const dash = data.dashboard || {};

        const emp = data.employees || {};
        dashboardMetrics.totalEmployees = Number(emp.total_employees) || 0;
        dashboardMetrics.totalUnits = units.total_all_units || 0;
        dashboardMetrics.salesEmployeesCount = units.sales_employees_count || 0;
        dashboardMetrics.soldUnits = units.sold_units || 0;
        dashboardMetrics.avgEmployeeSales = units.sold_units_per_sales_employee || 0;

        const currentExplicit = firstNumeric(
          emp.current_employees,
          emp.current_count,
          emp.active_employees,
          emp.active_count,
          emp.total_active_employees,
          emp.active_users_count,
          emp.hr_users_active_count
        );
        dashboardMetrics.currentEmployeesCount =
          currentExplicit != null ? currentExplicit : dashboardMetrics.totalEmployees;

        currentEmployeesTrendPercent.value = firstNumeric(
          emp.current_employees_change_percent,
          emp.employees_change_percent,
          emp.active_employees_change_percent,
          emp.vs_last_month_percent,
          emp.month_over_month_percent,
          data.employees_change_percent
        );

        if (
          dashboardMetrics.currentEmployeesCount === 0 &&
          (!data.employees || Object.keys(data.employees).length === 0)
        ) {
          try {
            const { total } = await hrService.getEmployees({ page: 1, per_page: 1 });
            const t = Number(total);
            if (!Number.isNaN(t)) dashboardMetrics.currentEmployeesCount = t;
          } catch {
            /* لوحة التحكم فقط */
          }
        }

        const teamMonthly = firstNumeric(
          sales.average_team_monthly_sales,
          sales.team_monthly_sales_average,
          sales.avg_team_monthly_sales,
          units.average_team_monthly_sales,
          units.team_monthly_sales_average,
          units.avg_team_monthly_sales,
          teamSales.monthly_average,
          teamSales.average_monthly_sales,
          dash.average_team_monthly_sales,
          data.average_team_monthly_sales
        );
        dashboardMetrics.avgTeamMonthlySales = teamMonthly ?? 0;

        avgTeamMonthlySalesTrendPercent.value = firstNumeric(
          sales.average_team_monthly_sales_change_percent,
          sales.team_monthly_sales_change_percent,
          sales.vs_last_month_percent,
          units.average_team_monthly_sales_change_percent,
          units.team_monthly_sales_change_percent,
          teamSales.vs_last_month_percent,
          dash.average_team_monthly_sales_change_percent,
          data.average_team_monthly_sales_change_percent
        );
      } else {
        avgTeamMonthlySalesTrendPercent.value = null;
        currentEmployeesTrendPercent.value = null;
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
    teamMonthlySalesDescription,
    currentEmployeesDescription,
    performanceTrend,
    performanceProfile,
    monthlySummary,
    loadDashboardMetrics,
  };
}
