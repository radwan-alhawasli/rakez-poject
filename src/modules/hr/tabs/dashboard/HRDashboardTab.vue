<template>
  <div class="rakez-kpi-dashboard rakez-erp-dashboard">
    <DashboardWelcomeHeader 
      greeting-name="الموارد البشرية" 
      subtitle="المؤشرات الرئيسية للأداء وإدارة القوى العاملة."
      english-title="Welcome Back, Human Resources"
      english-subtitle="Key Performance Indicators & Workforce Management Overview"
    />

    <div class="kpi-dashboard-grid">
      <!-- Top Row: 4 Dense Stat Cards -->
      <div class="kpi-top-row">
        <LuxuryStatCard label="إجمالي الموظفين" :value="formatCompact(dashboardMetrics.totalEmployees || 0)" description="+5.6% من الشهر الماضي">
          <template #icon>
            <DashboardStatIcon name="employees" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard label="إجمالي الوحدات" :value="formatCompact(dashboardMetrics.totalUnits || 0)" description="+3.1% من الشهر الماضي">
          <template #icon>
            <DashboardStatIcon name="building" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard label="الوحدات المباعة" :value="formatCompact(dashboardMetrics.soldUnits || 0)" description="+2.1% من الشهر الماضي">
          <template #icon>
            <DashboardStatIcon name="check" />
          </template>
        </LuxuryStatCard>
        <LuxuryStatCard
          label="متوسط مبيع الموظف"
          :value="formatCompact(dashboardMetrics.avgEmployeeSales || 0)"
          description="+6.9% من الشهر الماضي"
        >
          <template #icon>
            <DashboardStatIcon name="dollar" />
          </template>
        </LuxuryStatCard>
      </div>

      <!-- Main Content Grid -->
      <div class="kpi-main-grid">
        <!-- Goal Progress (Large Donut) -->
        <DarkWidgetShell class="kpi-goal-progress" title="تقدم الأهداف" subtitle="هدف 18,000 وحدة">
          <DonutKpiWidget :segments="hrKpiSeries" :height="220" central-sub-label="مكتمل" />
          <div class="goal-footer">
            <div class="goal-stat">
              <span class="goal-label">شهري</span>
              <span class="goal-value">$9,451</span>
              <span class="goal-change positive">+12.6%</span>
            </div>
            <div class="goal-stat">
              <span class="goal-label">سنوي</span>
              <span class="goal-value">$326,987</span>
              <span class="goal-change positive">+3.2%</span>
            </div>
          </div>
        </DarkWidgetShell>

        <!-- Global Distribution (Simulated Map or Placeholder) -->
        <DarkWidgetShell class="kpi-distribution" title="توزيع المبيعات العالمي" subtitle="الإيرادات حسب المنطقة">
          <div class="distribution-placeholder">
            <DonutKpiWidget :segments="hrKpiSeries" :height="180" />
          </div>
        </DarkWidgetShell>

        <!-- Monthly Performance Trend (Area Chart) -->
        <DarkWidgetShell class="kpi-trend" title="اتجاه الأداء الشهري" subtitle="نظرة عامة على الـ 6 أشهر الماضية">
          <AreaTrendWidget :points="performanceTrend" :height="200" />
        </DarkWidgetShell>

        <!-- Performance Profile (Radar Simulation) -->
        <DarkWidgetShell class="kpi-profile" title="ملف الأداء" subtitle="تحليل الكفاءة والجودة">
          <ProgressBreakdownWidget :rows="performanceProfile" value-type="number" />
        </DarkWidgetShell>

        <!-- Monthly Summary (Bar Chart) -->
        <DarkWidgetShell class="kpi-summary" title="ملخص شهري" subtitle="مقارنة الأداء">
          <DashboardMetricsBarChart :series="monthlySummary" :height="200" />
        </DarkWidgetShell>

        <!-- Top Performers (Horizontal List) -->
        <DarkWidgetShell class="kpi-top-performers" title="أعلى 6 منتجات حسب الإيرادات" subtitle="أداء المنتجات">
          <ProgressBreakdownWidget :rows="hrKpiSeries" value-type="number" />
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
import { useHRDashboard } from '@/composables/hr/useHRDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { hrProgressRows } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const { dashboardMetrics, performanceTrend, performanceProfile, monthlySummary, loadDashboardMetrics } = useHRDashboard();
const { formatCompact } = useFormatters();

/** مصدر واحد للدونات والأعمدة وشريط التقدم (نفس حقول HR) */
const hrKpiSeries = computed(() => hrProgressRows(dashboardMetrics));

onMounted(() => {
  loadDashboardMetrics();
});
</script>

<style scoped>
/* Shell + cards + widgets: global .rakez-kpi-dashboard in erp-dashboard-theme.css */
.kpi-dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.kpi-top-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.kpi-main-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
}

.kpi-goal-progress {
  grid-column: span 3;
}

.kpi-distribution {
  grid-column: span 6;
}

.kpi-trend {
  grid-column: span 3;
}

.kpi-profile {
  grid-column: span 3;
}

.kpi-summary {
  grid-column: span 6;
}

.kpi-top-performers {
  grid-column: span 3;
}

.goal-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.goal-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.goal-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.distribution-placeholder {
  background: radial-gradient(circle at center, rgba(181, 169, 154, 0.03) 0%, transparent 70%);
  border-radius: 16px;
  margin: 10px;
}

.goal-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.goal-change.positive {
  color: #4ade80;
}

.distribution-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

@media (max-width: 1200px) {
  .kpi-goal-progress, .kpi-trend, .kpi-profile, .kpi-top-performers {
    grid-column: span 6;
  }
  .kpi-distribution, .kpi-summary {
    grid-column: span 12;
  }
}

@media (max-width: 768px) {
  .kpi-goal-progress, .kpi-trend, .kpi-profile, .kpi-top-performers, .kpi-distribution, .kpi-summary {
    grid-column: span 12;
  }
}
</style>
