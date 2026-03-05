import { ref, reactive } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesAnalytics() {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const analyticsDashboard = ref(null);
  const analyticsFilters = reactive({ from: '', to: '' });
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
