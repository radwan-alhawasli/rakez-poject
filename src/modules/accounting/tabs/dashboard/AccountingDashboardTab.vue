<template>
  <div class="accounting-dashboard rakez-erp-dashboard">
    <DashboardWelcomeHeader greeting-name="المحاسبة" subtitle="المؤشرات الرئيسية للمحاسبة والمالية." />

    <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard
        label="الوحدات المباعة"
        :value="formatCompact(dashboardMetrics.totalUnitsSold || 0)"
        description="عدد الوحدات التي تم بيعها"
      >
        <template #icon>
          <DashboardStatIcon name="employees" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="العربون المستلم"
        :value="formatCompact(dashboardMetrics.totalDeposits)"
        description="إجمالي العربون المستلم"
      >
        <template #icon>
          <DashboardStatIcon name="check" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="العربون المسترد"
        :value="formatCompact(dashboardMetrics.totalDepositsRefunded)"
        description="إجمالي العربون المسترد"
      >
        <template #icon>
          <DashboardStatIcon name="arrowDown" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="قيمة المشاريع المستلمة"
        :value="formatCompact(dashboardMetrics.totalProjectsValue)"
        description="قيمة المشاريع المستلمة"
      >
        <template #icon>
          <DashboardStatIcon name="chartBars" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="قيمة المبيعات"
        :value="formatCompact(dashboardMetrics.totalSalesValue)"
        description="اعتمادًا على سعر البيع النهائي"
      >
        <template #icon>
          <DashboardStatIcon name="trendUp" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="العربون المعلقة"
        :value="formatCompact(dashboardMetrics.pendingDepositsCount || 0)"
        description="بانتظار تأكيد الاستلام"
      >
        <template #icon>
          <DashboardStatIcon name="clock" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="إجمالي العرابين"
        :value="formatCompact(dashboardMetrics.totalDepositsCount || 0)"
        description="إجمالي العرابين في النظام"
      >
        <template #icon>
          <DashboardStatIcon name="dollar" />
        </template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
    <div class="rakez-widget-grid">
      <DarkWidgetShell title="العربون: مستلم مقابل مسترد" subtitle="قيم من نفس فترة اللوحة">
        <DualTileKpiWidget
          left-label="مستلم"
          :left-value="formatCurrencyAr(dashboardMetrics.totalDeposits || 0)"
          right-label="مسترد"
          :right-value="formatCurrencyAr(dashboardMetrics.totalDepositsRefunded || 0)"
        />
      </DarkWidgetShell>

      <DarkWidgetShell class="rakez-widget-span-2" title="توزيع نسبي للمؤشرات" subtitle="حسب مجموع الصفوف المعروضة (للمقارنة النسبية فقط)">
        <ProgressBreakdownWidget :rows="accountingProgressRowsComputed" value-type="number" />
      </DarkWidgetShell>

      <DarkWidgetShell class="rakez-widget-span-2" title="نظرة عامة على العمليات المالية" subtitle="توزيع الوحدات المباعة والعمولات والودائع">
        <DashboardMetricsBarChart :series="chartData" :height="260" />
      </DarkWidgetShell>

      <DarkWidgetShell
        v-if="activityItems.length"
        class="rakez-widget-span-2"
        title="نشاط العربونات"
        subtitle="متابعة وعربون معلق — من /accounting/deposits/*"
      >
        <ActivityListWidget :items="activityItems" empty-message="لا توجد عمليات" />
      </DarkWidgetShell>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DualTileKpiWidget from '@/components/dashboard/widgets/DualTileKpiWidget.vue';
import ProgressBreakdownWidget from '@/components/dashboard/widgets/ProgressBreakdownWidget.vue';
import ActivityListWidget from '@/components/dashboard/widgets/ActivityListWidget.vue';
import { useAccountingDashboard } from '@/composables/accounting/useAccountingDashboard';
import { useAccountingRecentActivity } from '@/composables/dashboard/useRecentActivityFeed';
import { useFormatters } from '@/composables/useFormatters';
import { accountingProgressRows } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const { dashboardMetrics, loadDashboardMetrics } = useAccountingDashboard();
const { formatCompact, formatCurrencyAr } = useFormatters();

const chartLabels = ['الوحدات المباعة', 'الودائع', 'المسترد', 'قيمة المشاريع', 'قيمة المبيعات', 'العمولات'];

const chartData = computed(() => [
  { label: chartLabels[0], value: dashboardMetrics.totalUnitsSold || 0 },
  { label: chartLabels[1], value: dashboardMetrics.totalDeposits || 0 },
  { label: chartLabels[2], value: dashboardMetrics.totalDepositsRefunded || 0 },
  { label: chartLabels[3], value: dashboardMetrics.totalProjectsValue || 0 },
  { label: chartLabels[4], value: dashboardMetrics.totalSalesValue || 0 },
  { label: chartLabels[5], value: dashboardMetrics.totalCommissions || 0 },
]);

const accountingProgressRowsComputed = computed(() => accountingProgressRows(dashboardMetrics));

const { items: activityItems, load: loadActivityFeed } = useAccountingRecentActivity({ maxItems: 8 });

onMounted(() => {
  loadDashboardMetrics();
  loadActivityFeed();
});
</script>
