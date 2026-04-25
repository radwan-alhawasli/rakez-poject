import { ref, reactive, computed } from 'vue';
import creditService from '@/services/creditService';
import authService from '@/services/authService';
import logger from '@/utils/logger';

export function useCreditDashboard() {
  const user = ref(authService.getCurrentUser());
  const userName = computed(() => user.value?.name || 'قسم الائتمان');
  const isLoading = ref(false);

  /** فقط أعداد GET /credit/dashboard كما يعيدها الـ API */
  const dashboardMetrics = reactive({
    confirmedBookings: 0,
    pendingNegotiations: 0,
    waitingBookings: 0,
    requiresReview: 0,
    rejectedWithDownPayment: 0,
  });

  const loadDashboardMetrics = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getDashboard();
      const root = data && typeof data === 'object' ? (/** @type {any} */ (data)) : {};
      const nested = root.kpis && typeof root.kpis === 'object' ? root.kpis : {};
      const kpis = { ...root, ...nested };
      /** @param {any} v */
      const num = v => (v == null || v === '' ? 0 : Number(v)) || 0;

      dashboardMetrics.confirmedBookings = num(
        kpis.confirmed_bookings_count ?? kpis.confirmed_bookings,
      );
      dashboardMetrics.pendingNegotiations = num(
        kpis.negotiation_bookings_count ?? kpis.pending_negotiations,
      );
      dashboardMetrics.waitingBookings = num(
        kpis.waiting_bookings_count ?? kpis.waiting_bookings,
      );
      dashboardMetrics.requiresReview = num(kpis.requires_review_count);
      dashboardMetrics.rejectedWithDownPayment = num(
        kpis.rejected_with_paid_down_payment_count,
      );
    } catch (error) {
      logger.error('Error loading dashboard metrics:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} v */
  const formatValue = v => {
    if (v === null || v === undefined) return '0';
    if (typeof v === 'number') return v.toLocaleString();
    return String(v);
  };

  return {
    userName,
    isLoading,
    dashboardMetrics,
    loadDashboardMetrics,
    formatValue,
  };
}
