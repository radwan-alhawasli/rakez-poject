import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';

export const useCreditStore = defineStore('credit', () => {
  // ─── Dashboard / Summary ──────────────────────────────────────────────────
  const summary = ref(null);
  const isLoadingSummary = ref(false);

  // ─── Credit Requests ──────────────────────────────────────────────────────
  const creditRequests = shallowRef([]);
  const isLoadingCreditRequests = ref(false);
  const creditRequestsTotal = ref(0);
  const creditRequestsFilters = ref({ status: '', page: 1, per_page: 20 });

  // ─── Clients ──────────────────────────────────────────────────────────────
  const clients = shallowRef([]);
  const isLoadingClients = ref(false);
  const selectedClient = ref(null);

  // ─── Financial Reports ────────────────────────────────────────────────────
  const financialReport = ref(null);
  const isLoadingFinancialReport = ref(false);

  const pendingCount = computed(() =>
    creditRequests.value.filter(r => r.status === 'pending').length
  );

  const approvedCount = computed(() =>
    creditRequests.value.filter(r => r.status === 'approved').length
  );

  async function fetchSummary() {
    isLoadingSummary.value = true;
    try {
      const response = await creditService.getSummary();
      summary.value = response?.data?.data || response?.data || response;
    } catch (error) {
      logger.error('creditStore: error fetching summary', error);
    } finally {
      isLoadingSummary.value = false;
    }
  }

  async function fetchCreditRequests(params = {}) {
    isLoadingCreditRequests.value = true;
    try {
      const response = await creditService.getCreditRequests({
        ...creditRequestsFilters.value,
        ...params,
      });
      const data = response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        creditRequests.value = data;
      } else if (data?.data) {
        creditRequests.value = data.data;
        creditRequestsTotal.value = data.total ?? data.data.length;
      }
    } catch (error) {
      logger.error('creditStore: error fetching credit requests', error);
    } finally {
      isLoadingCreditRequests.value = false;
    }
  }

  async function fetchClients(params = {}) {
    isLoadingClients.value = true;
    try {
      const response = await creditService.getClients(params);
      clients.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('creditStore: error fetching clients', error);
    } finally {
      isLoadingClients.value = false;
    }
  }

  function $reset() {
    summary.value = null;
    creditRequests.value = [];
    clients.value = [];
    selectedClient.value = null;
    financialReport.value = null;
  }

  return {
    summary,
    isLoadingSummary,
    creditRequests,
    isLoadingCreditRequests,
    creditRequestsTotal,
    creditRequestsFilters,
    clients,
    isLoadingClients,
    selectedClient,
    financialReport,
    isLoadingFinancialReport,
    pendingCount,
    approvedCount,
    fetchSummary,
    fetchCreditRequests,
    fetchClients,
    $reset,
  };
});
