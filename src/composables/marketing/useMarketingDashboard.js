import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useMarketingDashboard() {
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const userName = ref(localStorage.getItem('userName') || 'مستخدم');

  const dashboardMetrics = reactive({
    total_leads: 0,
    available_units_value: 0,
    available_units_count: 0,
    daily_task_achievement_rate: 0,
    daily_deposits_count: 0,
    deposit_cost: 0,
    total_expected_bookings: 0,
    total_expected_booking_value: 0,
    total_daily_spend: 0,
  });
  const isLoadingDashboard = ref(false);

  /** عدد العربون اليومي — من `number_of_deposits` / `daily_deposits_count` وغيرها بعد التطبيع */
  const numberOfDeposits = computed(() => Number(dashboardMetrics.daily_deposits_count) || 0);

  const depositCostDisplay = computed(() => {
    if (Number(dashboardMetrics.deposit_cost) > 0) return Number(dashboardMetrics.deposit_cost);
    const spend = Number(dashboardMetrics.total_daily_spend || 0);
    const deposits = numberOfDeposits.value;
    return deposits > 0 ? spend / deposits : 0;
  });

  const loadDashboard = async () => {
    isLoadingDashboard.value = true;
    try {
      logger.debug('Loading marketing dashboard...');
      const data = await marketingService.getDashboard();
      Object.assign(dashboardMetrics, {
        total_leads: Number(data.total_leads ?? 0) || 0,
        available_units_value: Number(data.available_units_value ?? 0) || 0,
        available_units_count:
          Number(
            data.available_units_count ??
              data.number_of_available_units ??
              data.units_available_count ??
              0
          ) || 0,
        daily_task_achievement_rate: Number(data.daily_task_achievement_rate ?? 0) || 0,
        daily_deposits_count:
          Number(
            data.number_of_deposits ??
              data.count_of_deposits ??
              data.number_of_daily_deposits ??
              data.daily_deposits_count ??
              data.deposits_count_daily ??
              data.deposits_count ??
              0
          ) || 0,
        deposit_cost: Number(data.deposit_cost ?? 0) || 0,
        total_expected_bookings: Number(data.total_expected_bookings ?? 0) || 0,
        total_expected_booking_value: Number(data.total_expected_booking_value ?? 0) || 0,
        total_daily_spend: Number(data.total_daily_spend ?? 0) || 0,
      });
      logger.debug('Dashboard loaded');
    } catch (error) {
      logger.error('Error loading dashboard:', error);
      Object.assign(dashboardMetrics, {
        total_leads: 0,
        available_units_value: 0,
        available_units_count: 0,
        daily_task_achievement_rate: 0,
        daily_deposits_count: 0,
        deposit_cost: 0,
        total_expected_bookings: 0,
        total_expected_booking_value: 0,
        total_daily_spend: 0,
      });
    } finally {
      isLoadingDashboard.value = false;
    }
  };

  onMounted(() => {
    loadDashboard();
  });

  return {
    dashboardMetrics,
    isLoadingDashboard,
    numberOfDeposits,
    depositCostDisplay,
    userName,
    formatCurrency,
    formatNumber,
    loadDashboard,
  };
}
