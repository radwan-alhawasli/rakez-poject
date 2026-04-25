import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';

export const useAccountingStore = defineStore('accounting', () => {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  const dashboardData = ref(null);
  const isLoadingDashboard = ref(false);

  // ─── Transactions ─────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const transactions = shallowRef([]);
  const isLoadingTransactions = ref(false);
  const transactionsTotal = ref(0);
  const transactionsFilters = ref({
    type: '',
    status: '',
    from: '',
    to: '',
    page: 1,
    per_page: 20,
  });

  // ─── Sold Unit Confirmations ──────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const confirmations = shallowRef([]);
  const isLoadingConfirmations = ref(false);
  const selectedConfirmation = ref(null);

  // ─── Notifications ────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const accountingNotifications = shallowRef([]);
  const isLoadingAccountingNotifications = ref(false);
  const unreadAccountingNotifications = computed(
    () => (accountingNotifications.value || []).filter((/** @type {any} */ n) => !n.read_at).length
  );

  // ─── Reports ──────────────────────────────────────────────────────────────
  const report = ref(null);
  const isLoadingReport = ref(false);

  async function fetchDashboard() {
    isLoadingDashboard.value = true;
    try {
      const response = await accountingService.getDashboard();
      dashboardData.value = response?.data?.data || response?.data || response;
    } catch (error) {
      logger.error('accountingStore: error fetching dashboard', error);
    } finally {
      isLoadingDashboard.value = false;
    }
  }

  async function fetchConfirmations(params = {}) {
    isLoadingConfirmations.value = true;
    try {
      const response = await accountingService.getPendingConfirmations(params);
      // @ts-ignore - defensive check for various API response shapes
      const data = response?.items || response?.data || response;
      confirmations.value = Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('accountingStore: error fetching confirmations', error);
    } finally {
      isLoadingConfirmations.value = false;
    }
  }

  async function fetchNotifications(params = {}) {
    isLoadingAccountingNotifications.value = true;
    try {
      const response = await accountingService.getNotifications(params);
      // @ts-ignore - defensive check for various API response shapes
      const data = response?.items || response?.data || response;
      accountingNotifications.value = Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('accountingStore: error fetching notifications', error);
    } finally {
      isLoadingAccountingNotifications.value = false;
    }
  }

  function $reset() {
    dashboardData.value = null;
    transactions.value = [];
    confirmations.value = [];
    selectedConfirmation.value = null;
    accountingNotifications.value = [];
    report.value = null;
  }

  return {
    dashboardData,
    isLoadingDashboard,
    transactions,
    isLoadingTransactions,
    transactionsTotal,
    transactionsFilters,
    confirmations,
    isLoadingConfirmations,
    selectedConfirmation,
    accountingNotifications,
    isLoadingAccountingNotifications,
    unreadAccountingNotifications,
    report,
    isLoadingReport,
    fetchDashboard,
    fetchConfirmations,
    fetchNotifications,
    $reset,
  };
});
