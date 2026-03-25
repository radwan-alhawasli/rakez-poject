<template>
  <div class="dashboard-tab">
    <DashboardWelcomeHeader :user-name="userName" />
    <DashboardPrimaryKpis
      :dashboard-data="dashboardData"
      :is-loading="isLoadingDashboard"
      :confirmed-bookings-count="confirmedBookingsCount"
      :under-negotiation-count="underNegotiationCount"
    />
    <DashboardProjectsMini
      v-if="dashboardProjects.length > 0"
      :projects="dashboardProjects"
      @view-all="switchTab('projects')"
      @open-project="viewProjectDetails"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import authService from '@/services/authService';
import { useSalesDashboard } from '@/composables/sales/useSalesDashboard';
import { useSalesRouting } from '@/composables/sales/useSalesRouting';
import { useSalesProjects } from '@/composables/sales/useSalesProjects';
import DashboardWelcomeHeader from './sections/DashboardWelcomeHeader.vue';
import DashboardPrimaryKpis from './sections/DashboardPrimaryKpis.vue';
import DashboardProjectsMini from './sections/DashboardProjectsMini.vue';

const { dashboardData, isLoadingDashboard, dashboardProjects, loadDashboard } = useSalesDashboard();
const { switchTab } = useSalesRouting();
const { viewProjectDetails } = useSalesProjects();

const user = authService.getCurrentUser();
const userName = computed(() => user?.name || 'مستخدم');

const confirmedBookingsCount = 12;
const underNegotiationCount = 8;

loadDashboard();
</script>

<style scoped>
.dashboard-tab {
  width: 100%;
  direction: rtl;
  min-height: 0;
}

@media (max-width: 480px) {
  .dashboard-tab {
    padding: 0 4px;
  }
}
</style>
