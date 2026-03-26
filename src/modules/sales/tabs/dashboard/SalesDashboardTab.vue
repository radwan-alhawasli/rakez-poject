<template>
  <div class="dashboard-tab rakez-erp-dashboard">
    <DashboardWelcomeHeader />
    <DashboardPrimaryKpis
      :dashboard-data="dashboardData"
      :is-loading="isLoadingDashboard"
    />

    <template v-if="dashboardData && !isLoadingDashboard">
      <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
      <div class="rakez-widget-grid">
        <DarkWidgetShell title="توزيع الوحدات والحجوزات" subtitle="من لوحة المبيعات الحالية">
          <DonutKpiWidget :segments="salesDonutSegments" :height="200" central-sub-label="إجمالي الأعداد" />
        </DarkWidgetShell>

        <DarkWidgetShell
          v-if="areaPoints.length >= 2"
          title="اتجاه (تحليلات المبيعات)"
          subtitle="من /sales/analytics/dashboard عند توفر سلسلة"
        >
          <AreaTrendWidget :points="areaPoints" :height="220" />
        </DarkWidgetShell>

        <DarkWidgetShell
          v-if="taskItems.length"
          class="rakez-widget-span-2"
          title="مهام قادمة"
          subtitle="للمديرين — من /manager/tasks"
          :show-decorative-controls="true"
        >
          <TaskListWidget :items="taskItems" empty-message="لا توجد مهام" />
        </DarkWidgetShell>

        <DarkWidgetShell class="rakez-widget-span-2" title="مخطط المؤشرات" subtitle="أعمدة مجمّعة من نفس بيانات اللوحة">
          <DashboardMetricsBarChart :series="salesChartSeries" :height="260" />
        </DarkWidgetShell>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSalesDashboard } from '@/composables/sales/useSalesDashboard';
import { useSalesAnalyticsSeries } from '@/composables/dashboard/useSalesAnalyticsSeries';
import { useManagerTasksPreview } from '@/composables/dashboard/useManagerTasksPreview';
import { salesInventorySegments } from '@/utils/dashboardData';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import AreaTrendWidget from '@/components/dashboard/widgets/AreaTrendWidget.vue';
import TaskListWidget from '@/components/dashboard/widgets/TaskListWidget.vue';
import DashboardWelcomeHeader from './sections/DashboardWelcomeHeader.vue';
import DashboardPrimaryKpis from './sections/DashboardPrimaryKpis.vue';

const { dashboardData, isLoadingDashboard, loadDashboard } = useSalesDashboard();

const { areaPoints, load: loadAnalytics } = useSalesAnalyticsSeries();
const { items: taskItems, load: loadTasks } = useManagerTasksPreview();

const salesChartSeries = computed(() => {
  const d = dashboardData.value;
  if (!d) return [];
  return [
    { label: 'محجوزة', value: Number(d.reserved_units ?? 0) || 0 },
    { label: 'متاحة', value: Number(d.available_units ?? 0) || 0 },
    { label: 'تسويق', value: Number(d.projects_under_marketing ?? 0) || 0 },
    { label: 'مؤكدة', value: Number(d.confirmed_count ?? d.confirmed_reservations ?? 0) || 0 },
    { label: 'تفاوض', value: Number(d.negotiation_count ?? d.negotiation_reservations ?? 0) || 0 },
  ];
});

const salesDonutSegments = computed(() => salesInventorySegments(dashboardData.value));

onMounted(() => {
  loadDashboard();
  loadAnalytics();
  loadTasks();
});
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
