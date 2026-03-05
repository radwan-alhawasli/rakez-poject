import { ref, reactive, computed, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesDashboard() {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const dashboardData = ref(null);
  const isLoadingDashboard = ref(false);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const dashboardFilters = reactive({
    scope: 'me',
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  });

  const projects = shallowRef([]);
  const isLoadingProjects = ref(false);

  const computedConfirmedVsNegotiationRatio = computed(() => {
    const d = dashboardData.value;
    if (!d) return 0;
    if (d.percent_confirmed != null && d.percent_confirmed !== '') return Number(d.percent_confirmed);
    const confirmed = Number(d.confirmed_count ?? d.confirmed_reservations ?? 0) || 0;
    const negotiation = Number(d.negotiation_count ?? d.negotiation_reservations ?? 0) || 0;
    const total = confirmed + negotiation;
    return total ? Math.round((confirmed / total) * 100) : 0;
  });

  const dashboardProjects = computed(() =>
    projects.value
      .filter(p => {
        const s = String(p.status || '').toLowerCase();
        return !(s === 'refused' || s === 'rejected' || s === 'archived');
      })
      .slice(0, 4)
  );

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const user = authService.getCurrentUser();
      const isLeader = user && isSalesLeader(user);
      const response = await salesService.getProjects({
        scope: isLeader ? 'team' : 'me',
        per_page: 100,
      });
      let rawData = response?.data?.data || response?.data || response;
      if (!Array.isArray(rawData) && rawData?.data) rawData = rawData.data;
      if (!Array.isArray(rawData)) rawData = [];
      projects.value = rawData;
    } catch (error) {
      logger.error('Error loading projects:', error);
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const loadDashboard = async () => {
    isLoadingDashboard.value = true;
    try {
      const user = authService.getCurrentUser();
      const scope = user && isSalesLeader(user) ? 'all' : dashboardFilters.scope;
      const response = await salesService.getDashboard({ ...dashboardFilters, scope });
      const raw = response?.data?.data || response?.data || response;
      const ind = raw?.indicators;
      if (ind) {
        const cvn = ind.confirmed_vs_negotiation;
        const dep = ind.deposits;
        dashboardData.value = {
          ...raw,
          reserved_units: ind.reserved_units?.value ?? raw.reserved_units,
          available_units: ind.available_units?.value ?? raw.available_units,
          projects_under_marketing: ind.projects_under_marketing?.value ?? raw.projects_under_marketing,
          confirmed_count: cvn?.confirmed_count ?? raw.confirmed_count ?? raw.confirmed_reservations,
          negotiation_count: cvn?.negotiation_count ?? raw.negotiation_count ?? raw.negotiation_reservations,
          percent_confirmed: cvn?.percent_confirmed ?? raw.percent_confirmed,
          total_received_deposits: dep?.total_received ?? raw.total_received_deposits,
          deposits_total: dep?.total_received ?? raw.deposits_total,
          deposits_count: dep?.count,
          deposits_pending_count: dep?.pending_count,
          deposits_total_refunded: dep?.total_refunded,
        };
      } else {
        dashboardData.value = raw;
      }
      if (projects.value.length === 0) {
        await loadProjects();
      }
    } catch (error) {
      logger.error('Error loading dashboard:', error);
    } finally {
      isLoadingDashboard.value = false;
    }
  };

  return {
    dashboardData,
    isLoadingDashboard,
    dashboardFilters,
    dashboardProjects,
    computedConfirmedVsNegotiationRatio,
    formatCurrency,
    loadDashboard,
  };
}
