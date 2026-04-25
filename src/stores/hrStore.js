import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';

export const useHRStore = defineStore('hr', () => {
  // ─── Employees ────────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const employees = shallowRef([]);
  const isLoadingEmployees = ref(false);
  const employeesTotal = ref(0);
  const employeesPage = ref(1);
  const employeesPerPage = ref(20);

  async function fetchEmployees(params = {}) {
    isLoadingEmployees.value = true;
    try {
      const response = await hrService.getEmployees({
        page: employeesPage.value,
        per_page: employeesPerPage.value,
        ...params,
      });
      // @ts-ignore - defensive check for various API response shapes
      const data = response?.items || response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        employees.value = data;
        employeesTotal.value = response?.total ?? data.length;
      } else if (data?.data) {
        employees.value = data.data;
        employeesTotal.value = data.total ?? data.data.length;
      }
    } catch (error) {
      logger.error('hrStore: error fetching employees', error);
    } finally {
      isLoadingEmployees.value = false;
    }
  }

  // ─── Teams ────────────────────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const teams = shallowRef([]);
  const isLoadingTeams = ref(false);

  async function fetchTeams() {
    isLoadingTeams.value = true;
    try {
      const response = await hrService.getTeams();
      // @ts-ignore - defensive check for various API response shapes
      const data = response?.items || response?.data?.data || response?.data || response || [];
      teams.value = Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('hrStore: error fetching teams', error);
    } finally {
      isLoadingTeams.value = false;
    }
  }

  // ─── Performance / Targets ────────────────────────────────────────────────
  /** @type {import('vue').ShallowRef<any[]>} */
  const performanceRecords = shallowRef([]);
  const isLoadingPerformance = ref(false);
  const performanceFilters = ref({ from: '', to: '', user_id: '' });

  async function fetchPerformance(params = {}) {
    isLoadingPerformance.value = true;
    try {
      const response = await hrService.getMarketerPerformance({ ...performanceFilters.value, ...params });
      // @ts-ignore - defensive check for various API response shapes
      const data = response?.items || response?.data?.data || response?.data || response || [];
      performanceRecords.value = Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('hrStore: error fetching performance', error);
    } finally {
      isLoadingPerformance.value = false;
    }
  }

  // ─── Reports ──────────────────────────────────────────────────────────────
  const reports = ref(null);
  const isLoadingReports = ref(false);

  const totalEmployees = computed(() => employeesTotal.value || employees.value.length);

  function $reset() {
    employees.value = [];
    teams.value = [];
    performanceRecords.value = [];
    reports.value = null;
  }

  return {
    // Employees
    employees,
    isLoadingEmployees,
    employeesTotal,
    employeesPage,
    employeesPerPage,
    fetchEmployees,
    totalEmployees,
    // Teams
    teams,
    isLoadingTeams,
    fetchTeams,
    // Performance
    performanceRecords,
    isLoadingPerformance,
    performanceFilters,
    fetchPerformance,
    // Reports
    reports,
    isLoadingReports,
    $reset,
  };
});
