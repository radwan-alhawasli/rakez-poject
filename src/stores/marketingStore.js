import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import marketingService from '@/services/marketingService';
import logger from '@/utils/logger';

export const useMarketingStore = defineStore('marketing', () => {
  // ─── Dashboard ────────────────────────────────────────────────────────────
  const dashboardData = ref(null);
  const isLoadingDashboard = ref(false);

  // ─── Projects ─────────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const projects = shallowRef([]);
  const isLoadingProjects = ref(false);

  // ─── Leads ────────────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const leads = shallowRef([]);
  const isLoadingLeads = ref(false);
  const leadsTotal = ref(0);

  // ─── Plans ────────────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const developerPlans = shallowRef([]);
  const isLoadingDeveloperPlans = ref(false);
  /** @type {import('vue').ShallowRef<any[]>} */
  const employeePlans = shallowRef([]);
  const isLoadingEmployeePlans = ref(false);

  // ─── Expected Sales ───────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const expectedSales = shallowRef([]);
  const isLoadingExpectedSales = ref(false);

  async function fetchDashboard() {
    isLoadingDashboard.value = true;
    try {
      const response = await marketingService.getDashboard();
      dashboardData.value = response?.data?.data || response?.data || response;
    } catch (error) {
      logger.error('marketingStore: error fetching dashboard', error);
    } finally {
      isLoadingDashboard.value = false;
    }
  }

  async function fetchProjects(params = {}) {
    isLoadingProjects.value = true;
    try {
      const response = await marketingService.getProjects(params);
      projects.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('marketingStore: error fetching projects', error);
    } finally {
      isLoadingProjects.value = false;
    }
  }

  async function fetchLeads(params = {}) {
    isLoadingLeads.value = true;
    try {
      const response = await marketingService.getLeads(params);
      const data = response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        leads.value = data;
      } else if (data?.data) {
        leads.value = data.data;
        leadsTotal.value = data.total ?? data.data.length;
      }
    } catch (error) {
      logger.error('marketingStore: error fetching leads', error);
    } finally {
      isLoadingLeads.value = false;
    }
  }

  function $reset() {
    dashboardData.value = null;
    projects.value = [];
    leads.value = [];
    developerPlans.value = [];
    employeePlans.value = [];
    expectedSales.value = [];
  }

  return {
    dashboardData,
    isLoadingDashboard,
    projects,
    isLoadingProjects,
    leads,
    isLoadingLeads,
    leadsTotal,
    developerPlans,
    isLoadingDeveloperPlans,
    employeePlans,
    isLoadingEmployeePlans,
    expectedSales,
    isLoadingExpectedSales,
    fetchDashboard,
    fetchProjects,
    fetchLeads,
    $reset,
  };
});
