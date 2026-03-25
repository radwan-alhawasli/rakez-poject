<template>
  <div class="hr-view">
    <div class="tab-content custom-scrollbar">
      <HRDashboardTab v-if="activeTab === 'dashboard'" :user-name="userName" />

      <HRTeamsTab v-else-if="activeTab === 'teams'" :is-h-r="isHR" />

      <HRPerformanceTab v-else-if="activeTab === 'team-performance'" />

      <HREmployeePerformanceTab v-else-if="activeTab === 'employee-performance'" />

      <HRUsersTab v-else-if="activeTab === 'users'" />

      <HRReportsTab v-else-if="activeTab === 'reports'" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import authService from '@/services/authService';
import '../styles/hr-shell.css';

const HRDashboardTab = defineAsyncComponent(() => import('@/modules/hr/tabs/dashboard/HRDashboardTab.vue'));
const HRTeamsTab = defineAsyncComponent(() => import('@/modules/hr/tabs/teams/HRTeamsTab.vue'));
const HRPerformanceTab = defineAsyncComponent(() =>
  import('@/modules/hr/tabs/team-performance/HRPerformanceTab.vue')
);
const HREmployeePerformanceTab = defineAsyncComponent(() =>
  import('@/modules/hr/tabs/employee-performance/HREmployeePerformanceTab.vue')
);
const HRUsersTab = defineAsyncComponent(() => import('@/modules/hr/tabs/users/HRUsersTab.vue'));
const HRReportsTab = defineAsyncComponent(() => import('@/modules/hr/tabs/reports/HRReportsTab.vue'));

const route = useRoute();
const user = authService.getCurrentUser();
const userName = computed(() => user?.name || 'الموارد البشرية');
const isHR = computed(() => {
  const type = String(user?.type || '').toLowerCase();
  return type === 'hr' || type === '8' || Number(user?.type) === 8;
});

const activeTab = computed(() => {
  const name = route.name;
  if (name === 'HRDashboard') return 'dashboard';
  if (name === 'HRTeams') return 'teams';
  if (name === 'HRTeamPerformance') return 'team-performance';
  if (name === 'HREmployeePerformance') return 'employee-performance';
  if (name === 'HRUsers') return 'users';
  if (name === 'HRReports') return 'reports';
  return 'dashboard';
});
</script>

<style scoped>
/* Shell-specific layout lives in hr-shell.css; shared .hr-view tokens may live in global-luxury-styles.css */
</style>
