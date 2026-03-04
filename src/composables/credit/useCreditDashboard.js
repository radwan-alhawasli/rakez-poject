import { ref, reactive, computed } from 'vue';
import creditService from '@/services/creditService';
import authService from '@/services/authService';
import logger from '@/utils/logger';

export function useCreditDashboard() {
  const user = ref(authService.getCurrentUser());
  const userName = computed(() => user.value?.name || 'قسم الائتمان');
  const isLoading = ref(false);

  const dashboardMetrics = reactive({
    confirmedBookings: 0,
    pendingNegotiations: 0,
    waitingBookings: 0,
    activeFinancing: 0,
    titleTransfers: 0,
    pendingClaims: 0,
    requiresReview: 0,
    rejectedWithDownPayment: 0,
    overdueStages: 0,
    soldProjectsCount: 0,
  });

  const loadDashboardMetrics = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getDashboard();
      const kpis = data.kpis ?? data;
      dashboardMetrics.confirmedBookings =
        kpis.confirmed_bookings_count ?? kpis.confirmed_bookings ?? data.confirmed_bookings ?? 0;
      dashboardMetrics.pendingNegotiations =
        kpis.negotiation_bookings_count ??
        kpis.pending_negotiations ??
        data.pending_negotiations ??
        0;
      dashboardMetrics.waitingBookings =
        kpis.waiting_bookings_count ?? kpis.waiting_bookings ?? data.waiting_bookings ?? 0;
      dashboardMetrics.activeFinancing =
        kpis.projects_in_progress_count ?? kpis.active_financing ?? data.active_financing ?? 0;
      dashboardMetrics.titleTransfers =
        kpis.in_title_transfer_count ?? kpis.title_transfers ?? data.title_transfers ?? 0;
      dashboardMetrics.pendingClaims =
        kpis.pending_accounting_confirmation ?? kpis.pending_claims ?? data.pending_claims ?? 0;
      dashboardMetrics.requiresReview = kpis.requires_review_count ?? 0;
      dashboardMetrics.rejectedWithDownPayment = kpis.rejected_with_paid_down_payment_count ?? 0;
      dashboardMetrics.overdueStages = kpis.overdue_stages ?? 0;
      dashboardMetrics.soldProjectsCount = kpis.sold_projects_count ?? 0;
    } catch (error) {
      logger.error('Error loading dashboard metrics:', error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    userName,
    isLoading,
    dashboardMetrics,
    loadDashboardMetrics,
  };
}
