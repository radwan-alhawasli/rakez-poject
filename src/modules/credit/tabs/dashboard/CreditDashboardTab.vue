<template>
  <div class="rakez-kpi-dashboard rakez-erp-dashboard">
    <DashboardWelcomeHeader
      greeting-name="الائتمان"
      subtitle="مؤشرات حجوزات الائتمان والمتابعة — بيانات من لوحة الائتمان."
      english-title="Welcome Back, Credit"
      english-subtitle="Booking Pipeline & Credit Operations Overview"
    />

    <div class="kpi-dashboard-grid">
      <div class="kpi-top-row">
        <LuxuryStatCard
          label="حجوزات مؤكدة"
          :value="formatCompact(dashboardMetrics.confirmedBookings || 0)"
          description="حجوزات مكتملة ومؤكدة"
        >
          <template #icon>
            <DashboardStatIcon name="clipboard" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="حجوزات التفاوض"
          :value="formatCompact(dashboardMetrics.pendingNegotiations || 0)"
          description="قيد التفاوض"
        >
          <template #icon>
            <DashboardStatIcon name="negotiation" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="حجوزات الانتظار"
          :value="formatCompact(dashboardMetrics.waitingBookings || 0)"
          description="في قائمة الانتظار"
        >
          <template #icon>
            <DashboardStatIcon name="clock" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="تحتاج مراجعة"
          :value="formatCompact(dashboardMetrics.requiresReview || 0)"
          description="تتطلب مراجعة ائتمان"
        >
          <template #icon>
            <DashboardStatIcon name="file" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="مرفوضة مع عربون مدفوع"
          :value="formatCompact(dashboardMetrics.rejectedWithDownPayment || 0)"
          description="مرفوضة مع عربون محصّل"
        >
          <template #icon>
            <DashboardStatIcon name="file" />
          </template>
        </LuxuryStatCard>
      </div>

      <h3 class="rakez-dashboard-section-title">تحليلات الحجوزات</h3>

      <div class="kpi-main-grid">
        <DarkWidgetShell class="kpi-span-4" title="توزيع حجوزات الائتمان" subtitle="حسب الحالة">
          <DonutKpiWidget :segments="creditKpiSeries" :height="200" central-sub-label="إجمالي الأعداد" />
        </DarkWidgetShell>
        <DarkWidgetShell
          class="kpi-span-8"
          title="مقارنة أعداد الحجوزات"
          subtitle="المؤكدة، التفاوض، الانتظار، المراجعة، المرفوضة مع عربون"
        >
          <DashboardMetricsBarChart :series="creditKpiSeries" :height="260" />
        </DarkWidgetShell>

        <DarkWidgetShell class="kpi-span-6" title="تفصيل الأعداد" subtitle="نسبة كل حالة من الإجمالي">
          <ProgressBreakdownWidget :rows="creditKpiSeries" value-type="number" />
        </DarkWidgetShell>
        <DarkWidgetShell class="kpi-span-6" title="اتجاه الحالات" subtitle="مقارنة الأعداد حسب الحالة">
          <AreaTrendWidget :points="creditTrendPoints" :height="200" />
        </DarkWidgetShell>
      </div>
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
import AreaTrendWidget from '@/components/dashboard/widgets/AreaTrendWidget.vue';
import { useCreditDashboard } from '@/composables/credit/useCreditDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { creditBookingSegments } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const { dashboardMetrics, loadDashboardMetrics } = useCreditDashboard();
const { formatCompact } = useFormatters();

const creditKpiSeries = computed(() => creditBookingSegments(dashboardMetrics));

const creditTrendPoints = computed(() =>
  creditKpiSeries.value.map((s, i) => ({
    x: i,
    y: Number(s.value) || 0,
    label: s.label,
  }))
);

onMounted(() => {
  loadDashboardMetrics();
});
</script>
