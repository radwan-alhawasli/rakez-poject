<template>
  <div class="sales-view">
    <div class="tab-content">
      <SalesDashboardTab v-if="activeTab === 'dashboard'" />
      <SalesTargetsTab v-else-if="activeTab === 'targets'" />
      <SalesProjectsTab v-else-if="activeTab === 'projects'" />
      <SalesUnitSearchTab v-else-if="activeTab === 'unit-search'" />

      <div v-else-if="activeTab === 'reservations' || activeTab === 'negotiations' || activeTab === 'waiting-list'">
        <ReservationsView />
      </div>

      <SalesAttendanceTab v-else-if="activeTab === 'attendance'" />
      <SalesTeamTab v-else-if="activeTab === 'team'" />
      <SalesTasksTab v-else-if="activeTab === 'tasks'" />
      <SalesAssignmentsTab v-else-if="activeTab === 'assignments'" />
      <SalesPaymentPlansTab v-else-if="activeTab === 'payment-plans'" />
      <SalesProjectSchedulesTab v-else-if="activeTab === 'project-schedules'" />
      <SalesSoldUnitsTab v-else-if="activeTab === 'sold-units'" />
      <SalesDepositsTab v-else-if="activeTab === 'deposits'" />
      <SalesAnalyticsTab v-else-if="activeTab === 'analytics'" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { useSalesRouting } from '@/composables/sales/useSalesRouting';
import '../styles/sales-shell.css';

const ReservationsView = defineAsyncComponent(() => import('@/modules/sales/views/ReservationsView.vue'));
const SalesDashboardTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/dashboard/SalesDashboardTab.vue')
);
const SalesTargetsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/targets/SalesTargetsTab.vue')
);
const SalesProjectsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/projects/SalesProjectsTab.vue')
);
const SalesAttendanceTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/attendance/SalesAttendanceTab.vue')
);
const SalesTeamTab = defineAsyncComponent(() => import('@/modules/sales/tabs/team/SalesTeamTab.vue'));
const SalesTasksTab = defineAsyncComponent(() => import('@/modules/sales/tabs/tasks/SalesTasksTab.vue'));
const SalesAssignmentsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/assignments/SalesAssignmentsTab.vue')
);
const SalesPaymentPlansTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/payment-plans/SalesPaymentPlansTab.vue')
);
const SalesProjectSchedulesTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/project-schedules/SalesProjectSchedulesTab.vue')
);
const SalesSoldUnitsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/sold-units/SalesSoldUnitsTab.vue')
);
const SalesDepositsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/deposits/SalesDepositsTab.vue')
);
const SalesAnalyticsTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/analytics/SalesAnalyticsTab.vue')
);
const SalesUnitSearchTab = defineAsyncComponent(() =>
  import('@/modules/sales/tabs/unit-search/SalesUnitSearchTab.vue')
);

export default {
  name: 'SalesViewExtended',
  components: {
    ReservationsView,
    SalesDashboardTab,
    SalesTargetsTab,
    SalesProjectsTab,
    SalesAttendanceTab,
    SalesTeamTab,
    SalesTasksTab,
    SalesAssignmentsTab,
    SalesPaymentPlansTab,
    SalesProjectSchedulesTab,
    SalesSoldUnitsTab,
    SalesDepositsTab,
    SalesAnalyticsTab,
    SalesUnitSearchTab,
  },
  setup() {
    const { activeTab, visibleTabs, switchTab } = useSalesRouting();

    return {
      activeTab,
      visibleTabs,
      switchTab,
    };
  },
};
</script>

<style scoped>
.sales-view {
  direction: rtl;
  min-height: 100vh;
  background: transparent;
  padding: 20px 30px;
}

.tab-content {
  background: transparent;
  min-height: auto;
}

@media (max-width: 768px) {
  .sales-view {
    padding: 12px 16px;
  }
}

@media (max-width: 576px) {
  .sales-view {
    padding: 10px 10px;
  }
}

@media (min-width: 1920px) {
  .sales-view {
    padding: 28px 40px;
  }
}

@media (min-width: 2560px) {
  .sales-view {
    padding: 36px 52px;
  }
}

@media (min-width: 3840px) {
  .sales-view {
    padding: 48px 60px;
  }
}
</style>
