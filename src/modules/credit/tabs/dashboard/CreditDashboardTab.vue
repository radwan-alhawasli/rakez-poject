<template>
  <div class="credit-dashboard rakez-erp-dashboard rakez-kpi-dashboard">
    <DashboardWelcomeHeader
      greeting-name="الائتمان"
      subtitle="المؤشرات الرئيسية لإدارة الائتمان والتمويل."
      english-title="Welcome Back, Credit"
      english-subtitle="Credit and financing management overview"
    />

    <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard label="الحجوزات المؤكدة" :value="formatCompact(dashboardMetrics.confirmedBookings || 0)" description="إجمالي الحجوزات المؤكدة">
        <template #icon>
          <DashboardStatIcon name="clipboard" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="المفاوضات المعلقة" :value="formatCompact(dashboardMetrics.pendingNegotiations || 0)" description="حجوزات قيد التفاوض">
        <template #icon>
          <DashboardStatIcon name="negotiation" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="الحجوزات المنتظرة" :value="formatCompact(dashboardMetrics.waitingBookings || 0)" description="منتظرة للمعالجة">
        <template #icon>
          <DashboardStatIcon name="clock" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="طلبات التمويل النشطة" :value="formatCompact(dashboardMetrics.activeFinancing || 0)" description="قيد المعالجة">
        <template #icon>
          <DashboardStatIcon name="dollar" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="نقل الملكية قيد التنفيذ" :value="formatCompact(dashboardMetrics.titleTransfers || 0)" description="طلبات نقل الملكية">
        <template #icon>
          <DashboardStatIcon name="file" />
        </template>
      </LuxuryStatCard>
      <LuxuryStatCard label="ملفات المطالبة المعلقة" :value="formatCompact(dashboardMetrics.pendingClaims || 0)" description="مطالبات معلقة">
        <template #icon>
          <DashboardStatIcon name="file" />
        </template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
    <div class="rakez-widget-grid">
      <DarkWidgetShell title="توزيع حالات الائتمان" subtitle="من لوحة الائتمان">
        <DonutKpiWidget :segments="creditKpiSeries" :height="200" central-sub-label="إجمالي الأعداد" />
      </DarkWidgetShell>
      <DarkWidgetShell class="rakez-widget-span-2" title="نظرة عامة على العمليات" subtitle="أعمدة من نفس المؤشرات">
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

/** مصدر واحد للدونات وللمخطط الأعمدة (نفس حقول لوحة الائتمان) */
const creditKpiSeries = computed(() => creditBookingSegments(dashboardMetrics));

onMounted(() => {
  loadDashboardMetrics();
});
</script>
