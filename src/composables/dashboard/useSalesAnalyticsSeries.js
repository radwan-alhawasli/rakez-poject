import { ref, computed } from 'vue';
import salesService from '@/services/salesService';
import { extractTimeSeriesFromUnknown } from '@/utils/dashboardData';
import logger from '@/utils/logger';

/**
 * Loads GET /sales/analytics/dashboard and exposes points for AreaTrendWidget.
 */
export function useSalesAnalyticsSeries(extraParams = {}) {
  const raw = ref(null);
  const loading = ref(false);

  const load = async () => {
    loading.value = true;
    try {
      raw.value = await salesService.getAnalyticsDashboard(extraParams);
    } catch (e) {
      logger.error('useSalesAnalyticsSeries', e);
      raw.value = null;
    } finally {
      loading.value = false;
    }
  };

  const areaPoints = computed(() => extractTimeSeriesFromUnknown(raw.value));

  return { raw, loading, load, areaPoints };
}
