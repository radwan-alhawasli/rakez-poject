<template>
  <div class="credit-dashboard rakez-erp-dashboard">
    <DashboardWelcomeHeader greeting-name="الائتمان" subtitle="أعداد الحجوزات من لوحة الائتمان (GET /credit/dashboard)." />

    <h3 class="rakez-dashboard-section-title">أعداد الحجوزات</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard
        label="حجوزات مؤكدة"
        :value="formatCompact(dashboardMetrics.confirmedBookings || 0)"
        description="من GET /credit/dashboard"
      >
        <template #icon>
          <DashboardStatIcon name="clipboard" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="حجوزات التفاوض"
        :value="formatCompact(dashboardMetrics.pendingNegotiations || 0)"
        description="من GET /credit/dashboard"
      >
        <template #icon>
          <DashboardStatIcon name="negotiation" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="حجوزات الانتظار"
        :value="formatCompact(dashboardMetrics.waitingBookings || 0)"
        description="من GET /credit/dashboard"
      >
        <template #icon>
          <DashboardStatIcon name="clock" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="تحتاج مراجعة"
        :value="formatCompact(dashboardMetrics.requiresReview || 0)"
        description="من GET /credit/dashboard"
      >
        <template #icon>
          <DashboardStatIcon name="file" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="مرفوضة مع عربون مدفوع"
        :value="formatCompact(dashboardMetrics.rejectedWithDownPayment || 0)"
        description="من GET /credit/dashboard"
      >
        <template #icon>
          <DashboardStatIcon name="file" />
        </template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
    <div class="rakez-widget-grid">
      <DarkWidgetShell title="توزيع حجوزات الائتمان" subtitle="نفس أعداد /credit/dashboard">
        <DonutKpiWidget :segments="creditKpiSeries" :height="200" central-sub-label="إجمالي الأعداد" />
      </DarkWidgetShell>
      <DarkWidgetShell
        class="rakez-widget-span-2"
        title="مقارنة أعداد الحجوزات"
        subtitle="المؤكدة، التفاوض، الانتظار، المراجعة، المرفوضة مع عربون"
      >
        <DashboardMetricsBarChart :series="creditKpiSeries" :height="260" />
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
import { useCreditDashboard } from '@/composables/credit/useCreditDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { creditBookingSegments } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const { dashboardMetrics, loadDashboardMetrics } = useCreditDashboard();
const { formatCompact } = useFormatters();

const creditKpiSeries = computed(() => creditBookingSegments(dashboardMetrics));

onMounted(() => {
  loadDashboardMetrics();
});
</script>
