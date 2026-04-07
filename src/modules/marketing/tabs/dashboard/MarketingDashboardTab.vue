<template>
  <div class="marketing-dashboard rakez-erp-dashboard rakez-kpi-dashboard">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل لوحة المعلومات...</p>
    </div>
    <div v-else>
      <DashboardWelcomeHeader
        greeting-name="التسويق"
        subtitle="إليك ملخص أداء التسويق اليوم"
        english-title="Welcome Back, Marketing"
        english-subtitle="Today’s marketing performance summary"
      />

      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense">
        <LuxuryStatCard
          label="عدد lead"
          :value="formatCompact(dashboardMetrics.total_leads)"
          description="إجمالي العملاء المحتملين"
        >
          <template #icon>
            <DashboardStatIcon name="leads" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="عدد الوحدات المتاحة"
          :value="formatCompact(dashboardMetrics.available_units_count)"
          :description="`القيمة الإجمالية: ${formatCurrencyCompact(dashboardMetrics.available_units_value)}`"
        >
          <template #icon>
            <DashboardStatIcon name="grid" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="عدد العربون"
          :value="formatCompact(numberOfDeposits)"
          description="عربونات اليوم"
        >
          <template #icon>
            <DashboardStatIcon name="chartBars" />
          </template>
        </LuxuryStatCard>
      </div>

      <h3 class="rakez-dashboard-section-title">مؤشرات إضافية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense">
        <LuxuryStatCard
          label="الحجوزات المتوقعة"
          :value="formatCompact(dashboardMetrics.total_expected_bookings)"
          description="عدد الحجوزات المتوقعة"
        />
        <LuxuryStatCard
          label="قيمة الحجوزات المتوقعة"
          :value="formatCurrencyCompact(dashboardMetrics.total_expected_booking_value)"
          description="من بيانات التسويق"
        />
        <LuxuryStatCard
          label="الإنفاق اليومي"
          :value="formatCurrencyCompact(dashboardMetrics.total_daily_spend)"
          description="إنفاق اليوم"
        />
      </div>

      <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
      <div class="rakez-widget-grid">
        <DarkWidgetShell title="توزيع أعداد التسويق" subtitle="عملاء، حجوزات، عربونات">
          <DonutKpiWidget :segments="marketingDonutSegments" :height="200" central-sub-label="أعداد" />
        </DarkWidgetShell>
        <DarkWidgetShell title="قيم متوقعة مقابل إنفاق" subtitle="من نفس واجهة الـ API">
          <DualTileKpiWidget
            left-label="قيمة حجوزات متوقعة"
            :left-value="formatCurrencyCompact(dashboardMetrics.total_expected_booking_value)"
            right-label="إنفاق يومي"
            :right-value="formatCurrencyCompact(dashboardMetrics.total_daily_spend)"
          />
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="أعداد ونِسَب" subtitle="مخطط أعمدة">
          <DashboardMetricsBarChart :series="marketingCountsSeries" :height="240" />
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="قيم مالية" subtitle="نفس مقياس المحور الرأسي">
          <DashboardMetricsBarChart :series="marketingValuesSeries" :height="240" />
        </DarkWidgetShell>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import DualTileKpiWidget from '@/components/dashboard/widgets/DualTileKpiWidget.vue';
import { useMarketingDashboard } from '@/composables/marketing/useMarketingDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { marketingCountSegments } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const {
  dashboardMetrics,
  isLoadingDashboard: isLoading,
  numberOfDeposits,
  depositCostDisplay,
} = useMarketingDashboard();
const { formatCompact, formatCurrencyCompact } = useFormatters();

const marketingCountsSeries = computed(() => {
  const m = dashboardMetrics;
  return [
    { label: 'عملاء محتملون', value: Number(m.total_leads) || 0 },
    { label: 'عدد الوحدات المتاحة', value: Number(m.available_units_count) || 0 },
    { label: 'عدد العربون', value: numberOfDeposits.value },
    { label: 'حجوزات متوقعة', value: Number(m.total_expected_bookings) || 0 },
  ];
});

const marketingValuesSeries = computed(() => {
  const m = dashboardMetrics;
  const dep = Number(depositCostDisplay.value) || 0;
  return [
    { label: 'قيمة وحدات', value: Number(m.available_units_value) || 0 },
    { label: 'حجوزات متوقعة', value: Number(m.total_expected_booking_value) || 0 },
    { label: 'إنفاق يومي', value: Number(m.total_daily_spend) || 0 },
    { label: 'متوسط تكلفة العربون', value: dep },
  ];
});

const marketingDonutSegments = computed(() => marketingCountSegments(dashboardMetrics));
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 12px;
  color: var(--color-dark-gray);
}
</style>
