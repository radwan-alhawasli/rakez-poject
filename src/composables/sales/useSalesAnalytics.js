import { ref, reactive } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesAnalytics() {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const analyticsDashboard = ref(null);
  const now = new Date();
  const analyticsFilters = reactive({
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  });
  const isLoadingAnalytics = ref(false);
  const analyticsSubTab = ref('overview');
  const analyticsMonthlyReport = ref(null);
  const isLoadingMonthlyReport = ref(false);

  const loadAnalyticsDashboard = async () => {
    isLoadingAnalytics.value = true;
    try {
      analyticsDashboard.value = await salesService.getAnalyticsDashboard(analyticsFilters);
    } catch (e) {
      logger.error('loadAnalyticsDashboard', e);
    } finally {
      isLoadingAnalytics.value = false;
    }
  };

  const loadAnalyticsMonthlyReport = async () => {
    isLoadingMonthlyReport.value = true;
    try {
      analyticsMonthlyReport.value = await salesService.getAnalyticsMonthlyCommissionReport(
        analyticsFilters
      );
    } catch (e) {
      logger.error('loadAnalyticsMonthlyReport', e);
    } finally {
      isLoadingMonthlyReport.value = false;
    }
  };

  return {
    analyticsDashboard,
    analyticsFilters,
    isLoadingAnalytics,
    analyticsSubTab,
    analyticsMonthlyReport,
    isLoadingMonthlyReport,
    loadAnalyticsDashboard,
    loadAnalyticsMonthlyReport,
    formatCurrency,
  };
}
