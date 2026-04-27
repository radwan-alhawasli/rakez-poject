<template>
  <div class="hr-view accounting-view">
    <div class="tab-content custom-scrollbar">
      <AccountingDashboardTab v-if="activeTab === 'dashboard'" />
      <AccountingNotificationsTab v-else-if="activeTab === 'notifications'" />
      <AccountingSoldUnitsTab v-else-if="activeTab === 'sold-units'" />
      <AccountingProjectsTab v-else-if="activeTab === 'projects'" />
      <AccountingDepositsTab v-else-if="activeTab === 'deposits'" />

      <AccountingSalariesTab v-else-if="activeTab === 'salaries'" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import '../styles/accounting-shell.css';

const AccountingDashboardTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/dashboard/AccountingDashboardTab.vue')
);
const AccountingNotificationsTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/notifications/AccountingNotificationsTab.vue')
);
const AccountingSoldUnitsTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/sold-units/AccountingSoldUnitsTab.vue')
);
const AccountingProjectsTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/projects/AccountingProjectsTab.vue')
);

const AccountingDepositsTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/deposits/AccountingDepositsTab.vue')
);
const AccountingSalariesTab = defineAsyncComponent(() =>
  import('@/modules/accounting/tabs/salaries/AccountingSalariesTab.vue')
);

const route = useRoute();

const activeTab = computed(() => {
  const name = route.name;
  if (name === 'AccountingDashboard') return 'dashboard';
  if (name === 'AccountingNotifications') return 'notifications';
  if (name === 'AccountingSoldUnits') return 'sold-units';
  if (name === 'AccountingProjects') return 'projects';
  if (name === 'AccountingDeposits') return 'deposits';

  if (name === 'AccountingSalaries') return 'salaries';
  return 'dashboard';
});
</script>

<style scoped>
.accounting-view {
}
</style>
