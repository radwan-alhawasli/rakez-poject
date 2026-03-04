import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import logger from '@/utils/logger';

export const useSalesStore = defineStore('sales', () => {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  const dashboardData = ref(null);
  const isLoadingDashboard = ref(false);

  const confirmedVsNegotiationRatio = computed(() => {
    const d = dashboardData.value;
    if (!d) return 0;
    if (d.percent_confirmed != null) return Number(d.percent_confirmed);
    const confirmed = Number(d.confirmed_count ?? 0) || 0;
    const negotiation = Number(d.negotiation_count ?? 0) || 0;
    const total = confirmed + negotiation;
    return total ? Math.round((confirmed / total) * 100) : 0;
  });

  async function fetchDashboard(filters = {}) {
    isLoadingDashboard.value = true;
    try {
      const user = authService.getCurrentUser();
      const scope = user && isSalesLeader(user) ? 'all' : (filters.scope || 'me');
      const response = await salesService.getDashboard({ ...filters, scope });
      dashboardData.value = response?.data?.data || response?.data || response;
    } catch (error) {
      logger.error('salesStore: error fetching dashboard', error);
    } finally {
      isLoadingDashboard.value = false;
    }
  }

  // ─── Targets ──────────────────────────────────────────────────────────────
  const targets = shallowRef([]);
  const isLoadingTargets = ref(false);

  async function fetchTargets() {
    isLoadingTargets.value = true;
    try {
      const response = await salesService.getTargets();
      targets.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('salesStore: error fetching targets', error);
    } finally {
      isLoadingTargets.value = false;
    }
  }

  // ─── Reservations ─────────────────────────────────────────────────────────
  const reservations = shallowRef([]);
  const isLoadingReservations = ref(false);
  const reservationsTotal = ref(0);

  async function fetchReservations(params = {}) {
    isLoadingReservations.value = true;
    try {
      const response = await salesService.getReservations(params);
      const data = response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        reservations.value = data;
      } else if (data?.data) {
        reservations.value = data.data;
        reservationsTotal.value = data.total ?? data.data.length;
      }
    } catch (error) {
      logger.error('salesStore: error fetching reservations', error);
    } finally {
      isLoadingReservations.value = false;
    }
  }

  // ─── Sold Units ───────────────────────────────────────────────────────────
  const soldUnits = shallowRef([]);
  const isLoadingSoldUnits = ref(false);

  async function fetchSoldUnits(params = {}) {
    isLoadingSoldUnits.value = true;
    try {
      const response = await salesService.getSoldUnits(params);
      soldUnits.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('salesStore: error fetching sold units', error);
    } finally {
      isLoadingSoldUnits.value = false;
    }
  }

  // ─── Deposits ─────────────────────────────────────────────────────────────
  const deposits = shallowRef([]);
  const isLoadingDeposits = ref(false);

  async function fetchDeposits(params = {}) {
    isLoadingDeposits.value = true;
    try {
      const response = await salesService.getDeposits(params);
      deposits.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('salesStore: error fetching deposits', error);
    } finally {
      isLoadingDeposits.value = false;
    }
  }

  function $reset() {
    dashboardData.value = null;
    targets.value = [];
    reservations.value = [];
    soldUnits.value = [];
    deposits.value = [];
  }

  return {
    // Dashboard
    dashboardData,
    isLoadingDashboard,
    confirmedVsNegotiationRatio,
    fetchDashboard,
    // Targets
    targets,
    isLoadingTargets,
    fetchTargets,
    // Reservations
    reservations,
    isLoadingReservations,
    reservationsTotal,
    fetchReservations,
    // Sold Units
    soldUnits,
    isLoadingSoldUnits,
    fetchSoldUnits,
    // Deposits
    deposits,
    isLoadingDeposits,
    fetchDeposits,
    $reset,
  };
});
