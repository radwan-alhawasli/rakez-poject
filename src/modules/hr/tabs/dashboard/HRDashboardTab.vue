<template>
  <div class="hr-dashboard rakez-erp-dashboard">
    <DashboardWelcomeHeader greeting-name="الموارد البشرية" subtitle="المؤشرات الرئيسية للأداء وإدارة القوى العاملة." />

    <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard label="إجمالي الموظفين" :value="formatCompact(dashboardMetrics.totalEmployees || 0)" description="العدد الإجمالي للموظفين">
        <template #icon>
          <DashboardStatIcon name="employees" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="إجمالي الوحدات" :value="formatCompact(dashboardMetrics.totalUnits || 0)" description="الوحدات السكنية المتاحة">
        <template #icon>
          <DashboardStatIcon name="building" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="الوحدات المباعة" :value="formatCompact(dashboardMetrics.soldUnits || 0)" description="وحدات تم بيعها">
        <template #icon>
          <DashboardStatIcon name="check" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="متوسط مبيع الموظف"
        :value="formatCompact(dashboardMetrics.avgEmployeeSales || 0)"
        :description="`الوحدات ÷ موظفي المبيعات (${dashboardMetrics.salesEmployeesCount ?? 0})`"
      >
        <template #icon>
          <DashboardStatIcon name="dollar" />
        </template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
    <div class="rakez-widget-grid">
      <DarkWidgetShell title="توزيع مؤشرات الموارد البشرية" subtitle="نسب من مجموع الصفوف">
        <DonutKpiWidget :segments="hrKpiSeries" :height="200" central-sub-label="إجمالي نسبي" />
      </DarkWidgetShell>
      <DarkWidgetShell class="rakez-widget-span-2" title="تفصيل نسبي" subtitle="مقارنة الحصص بين المؤشرات">
        <ProgressBreakdownWidget :rows="hrKpiSeries" value-type="number" />
      </DarkWidgetShell>
      <DarkWidgetShell class="rakez-widget-span-2" title="نظرة عامة على الأداء" subtitle="من لوحة الموارد البشرية">
        <DashboardMetricsBarChart :series="hrKpiSeries" :height="280" />
      </DarkWidgetShell>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import ProgressBreakdownWidget from '@/components/dashboard/widgets/ProgressBreakdownWidget.vue';
import { useHRDashboard } from '@/composables/hr/useHRDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { hrProgressRows } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const { dashboardMetrics, loadDashboardMetrics } = useHRDashboard();
const { formatCompact } = useFormatters();

/** مصدر واحد للدونات والأعمدة وشريط التقدم (نفس حقول HR) */
const hrKpiSeries = computed(() => hrProgressRows(dashboardMetrics));

onMounted(() => {
  loadDashboardMetrics();
});
</script>

