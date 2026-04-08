<template>
  <div class="hr-dashboard rakez-erp-dashboard">
    <div class="welcome-header-container">
      <DashboardWelcomeHeader 
        greeting-name="الموارد البشرية" 
        subtitle="المؤشرات الرئيسية للأداء وإدارة القوى العاملة."
        english-title="Welcome Back, Human Resources"
        english-subtitle="Key Performance Indicators & Workforce Management Overview"
      />
      <div class="kpi-label-wrapper">
        <span class="kpi-label-text">KPI</span>
        <div class="kpi-label-line"></div>
      </div>
    </div>

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
.hr-dashboard {
  padding: 32px;
  max-width: 1700px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.welcome-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 10;
}

.kpi-label-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
  padding-right: 12px;
  margin-top: 10px;
}

.kpi-label-text {
  font-size: 3.8rem;
  font-weight: 950;
  background: linear-gradient(135deg, #d4c9bc 0%, var(--color-gold, #b5a99a) 50%, #8e8274 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.01em;
  line-height: 0.85;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3));
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  position: relative;
}

.kpi-label-wrapper::before {
  content: "مؤشرات الأداء";
  position: absolute;
  top: -18px;
  right: 14px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-gold, #b5a99a);
  letter-spacing: 0.15em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(26, 35, 50, 0.6);
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  border-right: 2px solid var(--color-gold, #b5a99a);
}

.kpi-label-line {
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-gold, #b5a99a));
  margin-top: 4px;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(181, 169, 154, 0.4);
}

/* Adjusting the banner to fit text size as requested */
:deep(.rakez-dashboard-welcome--banner) {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 450px;
  max-width: fit-content;
  margin-bottom: 0 !important;
  text-align: right;
}

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

.kpi-top-row :deep(.luxury-stat-card) {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(181, 169, 154, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.kpi-top-row :deep(.luxury-stat-card:hover) {
  background: rgba(181, 169, 154, 0.08);
  transform: translateY(-8px) scale(1.02);
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 20px 60px rgba(181, 169, 154, 0.15);
}

.kpi-top-row :deep(.luxury-stat-card__accent) {
  background: linear-gradient(90deg, transparent, var(--color-gold, #b5a99a), transparent);
  height: 2px;
  opacity: 0.6;
}

.kpi-main-grid :deep(.dark-widget-shell) {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(181, 169, 154, 0.12);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

/* Add a subtle glow to widget corners */
.kpi-main-grid :deep(.dark-widget-shell)::before {
  content: "";
  position: absolute;
  top: -20%;
  right: -20%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(181, 169, 154, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.kpi-main-grid :deep(.dark-widget-shell__title) {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.02em;
  color: var(--color-gold, #b5a99a);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Custom styling for charts inside widgets */
.kpi-main-grid :deep(.vis-single-container),
.kpi-main-grid :deep(.vis-xy-container) {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
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
