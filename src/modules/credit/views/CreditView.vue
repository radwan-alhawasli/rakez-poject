<template>
  <div class="hr-view credit-view">
    <div class="tab-content custom-scrollbar">
      <CreditDashboardTab v-if="activeTab === 'dashboard'" />

      <CreditNotificationsTab v-else-if="activeTab === 'notifications'" />

      <CreditBookingsTab v-else-if="activeTab === 'bookings'" />

      <CreditFinancingTab v-else-if="activeTab === 'financing'" />

      <CreditTitleTransferTab v-else-if="activeTab === 'title-transfer'" />

      <CreditSoldProjectsTab v-else-if="activeTab === 'sold-projects'" />

      <CreditMarketingRequestsTab v-else-if="activeTab === 'marketing-requests'" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import '../styles/credit-shell.css';

const CreditDashboardTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/dashboard/CreditDashboardTab.vue')
);
const CreditNotificationsTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/notifications/CreditNotificationsTab.vue')
);
const CreditBookingsTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/bookings/CreditBookingsTab.vue')
);
const CreditFinancingTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/financing/CreditFinancingTab.vue')
);
const CreditTitleTransferTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/title-transfer/CreditTitleTransferTab.vue')
);
const CreditSoldProjectsTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/sold-projects/CreditSoldProjectsTab.vue')
);
const CreditMarketingRequestsTab = defineAsyncComponent(() =>
  import('@/modules/credit/tabs/marketing-requests/CreditMarketingRequestsTab.vue')
);

const route = useRoute();

const activeTab = computed(() => {
  const name = route.name;
  if (name === 'CreditDashboard') return 'dashboard';
  if (name === 'CreditNotifications') return 'notifications';
  if (name === 'CreditBookings') return 'bookings';
  if (name === 'CreditFinancing') return 'financing';
  if (name === 'CreditTitleTransfer') return 'title-transfer';
  if (name === 'CreditSoldProjects') return 'sold-projects';
  if (name === 'CreditMarketingRequests') return 'marketing-requests';
  return 'dashboard';
});
</script>

<style scoped>
.credit-view {
}
</style>
