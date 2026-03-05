import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';

export const useHRStore = defineStore('hr', () => {
  // ─── Employees ────────────────────────────────────────────────────────────
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
      const data = response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        employees.value = data;
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
  const teams = shallowRef([]);
  const isLoadingTeams = ref(false);

  async function fetchTeams() {
    isLoadingTeams.value = true;
    try {
      const response = await hrService.getTeams();
      teams.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('hrStore: error fetching teams', error);
    } finally {
      isLoadingTeams.value = false;
    }
  }

  // ─── Performance / Targets ────────────────────────────────────────────────
  const performanceRecords = shallowRef([]);
  const isLoadingPerformance = ref(false);
  const performanceFilters = ref({ from: '', to: '', user_id: '' });

  async function fetchPerformance(params = {}) {
    isLoadingPerformance.value = true;
    try {
      const response = await hrService.getPerformance({ ...performanceFilters.value, ...params });
      performanceRecords.value = response?.data?.data || response?.data || response || [];
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
