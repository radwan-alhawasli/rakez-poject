<template>
  <div class="marketing-view">
    <div class="tab-content custom-scrollbar">
      <MarketingDashboardTab v-if="activeTab === 'dashboard'" />
      <MarketingProjectsTab v-else-if="activeTab === 'projects'" />
      <MarketingDeveloperPlanTab v-else-if="activeTab === 'developer-plan' || activeTab === 'plans'" />
      <MarketingEmployeePlansTab v-else-if="activeTab === 'employee-plans'" />
      <MarketingTasksTab v-else-if="activeTab === 'tasks'" />
      <MarketingLeadsTab v-else-if="activeTab === 'leads'" />
      <MarketingExpectedSalesTab v-else-if="activeTab === 'expected-sales'" />
      <MarketingReportsTab v-else-if="activeTab === 'reports'" />
      <MarketingAiAssistantTab v-else-if="activeTab === 'ai-assistant'" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import '../styles/marketing-shell.css';

const MarketingDashboardTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/dashboard/MarketingDashboardTab.vue')
);
const MarketingProjectsTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/projects/MarketingProjectsTab.vue')
);
const MarketingDeveloperPlanTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/developer-plan/MarketingDeveloperPlanTab.vue')
);
const MarketingEmployeePlansTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/employee-plans/MarketingEmployeePlansTab.vue')
);
const MarketingTasksTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/tasks/MarketingTasksTab.vue')
);
const MarketingLeadsTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/leads/MarketingLeadsTab.vue')
);
const MarketingExpectedSalesTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/expected-sales/MarketingExpectedSalesTab.vue')
);
const MarketingReportsTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/reports/MarketingReportsTab.vue')
);
const MarketingAiAssistantTab = defineAsyncComponent(() =>
  import('@/modules/marketing/tabs/ai-assistant/MarketingAiAssistantTab.vue')
);

const route = useRoute();

const VALID_TABS = [
  'dashboard',
  'projects',
  'tasks',
  'leads',
  'expected-sales',
  'reports',
  'plans',
  'developer-plan',
  'employee-plans',
  'ai-assistant',
];

const activeTab = computed(() => {
  const path = String(route.path || '').replace(/\/$/, '');
  const parts = path.split('/').filter(Boolean);
  const tab = parts[1] || 'dashboard';
  return VALID_TABS.includes(tab) ? tab : 'dashboard';
});
</script>

<style scoped>
.marketing-view {
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  padding: 30px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100dvh - 160px);
  min-height: 0;
  padding-bottom: 2rem;
}

@media (max-width: 768px) {
  .tab-content {
    padding: 16px;
    padding-bottom: 2rem;
  }
}

@media (max-width: 390px) {
  .tab-content {
    padding: 12px;
    padding-bottom: 1.5rem;
  }
}

</style>
