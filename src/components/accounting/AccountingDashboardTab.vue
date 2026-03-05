<template>
  <div class="hr-dashboard-grid-view">
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">المؤشرات الرئيسية للمحاسبة والمالية.</p>
    </div>
    <div class="stats-grid stats-grid-three">
      <div class="stat-card kpi-list-card animate-fade-in-up animate-stagger-1 hover-lift">
        <h3 class="kpi-card-title">مؤشرات الأداء</h3>
        <ul class="kpi-list">
          <li class="kpi-line kpi-line-1"><span class="kpi-bullet"></span><span class="kpi-label-wrap"><span class="kpi-label">عدد الوحدات المباعة</span></span><span class="kpi-value number">{{ dashboardMetrics.totalUnitsSold || '0' }}</span></li>
          <li class="kpi-line kpi-line-2"><span class="kpi-bullet"></span><span class="kpi-label-wrap"><span class="kpi-label">إجمالي العربون المستلم</span></span><span class="kpi-value number">{{ formatCurrency(dashboardMetrics.totalDeposits) }}</span></li>
          <li class="kpi-line kpi-line-3"><span class="kpi-bullet"></span><span class="kpi-label-wrap"><span class="kpi-label">إجمالي العربون المسترد</span></span><span class="kpi-value number">{{ formatCurrency(dashboardMetrics.totalDepositsRefunded) }}</span></li>
          <li class="kpi-line kpi-line-4"><span class="kpi-bullet"></span><span class="kpi-label-wrap"><span class="kpi-label">إجمالي قيمة المشاريع المستلمة</span></span><span class="kpi-value number">{{ formatCurrency(dashboardMetrics.totalProjectsValue) }}</span></li>
          <li class="kpi-line kpi-line-5"><span class="kpi-bullet"></span><span class="kpi-label-wrap"><span class="kpi-label">إجمالي قيمة المبيعات</span><span class="kpi-desc">اعتمادًا على سعر البيع النهائي</span></span><span class="kpi-value number">{{ formatCurrency(dashboardMetrics.totalSalesValue) }}</span></li>
        </ul>
      </div>
      <div class="stat-card stat-card-pending animate-fade-in-up animate-stagger-2 hover-lift">
        <div class="stat-content">
          <span class="stat-label">الودائع والرواتب المعلقة</span>
          <span class="stat-value number">{{ (dashboardMetrics.pendingDeposits || 0) + (dashboardMetrics.pendingSalaries || 0) }}</span>
          <span class="stat-desc">ودائع: {{ dashboardMetrics.pendingDeposits || '0' }} – رواتب: {{ dashboardMetrics.pendingSalaries || '0' }}</span>
        </div>
        <div class="stat-icon-bg orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>
      <div class="stat-card stat-card-notifications animate-fade-in-up animate-stagger-3 hover-lift">
        <div class="stat-content">
          <span class="stat-label">الإشعارات غير المقروءة</span>
          <span class="stat-value number">{{ dashboardMetrics.unreadNotifications || '0' }}</span>
          <span class="stat-desc">عدد الإشعارات غير المقروءة</span>
        </div>
        <div class="stat-icon-bg green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
      </div>
    </div>
    <div class="dashboard-date-range">
      <label>الفترة:</label>
      <input v-model="dashboardFromDate" type="date" class="form-input" style="width: 160px" @change="loadDashboardMetrics" />
      <span>إلى</span>
      <input v-model="dashboardToDate" type="date" class="form-input" style="width: 160px" @change="loadDashboardMetrics" />
    </div>
    <div class="overview-section">
      <div class="section-header">
        <h3 class="section-title-chart">نظرة عامة على العمليات المالية</h3>
        <p class="section-desc">توزيع الوحدات المباعة والعمولات والودائع.</p>
      </div>
      <div class="chart-placeholder" style="min-height: 260px; display: flex; align-items: center; justify-content: center;">
        <VisXYContainer :data="chartData" :height="240" :style="{ width: '100%' }">
          <VisGroupedBar :x="(d, i) => i" :y="barAccessors" :color="barColors" :roundedCorners="4" :barPadding="0.2" />
          <VisAxis type="x" :tickFormat="xTickFormat" :gridLine="false" />
          <VisAxis type="y" :gridLine="true" />
          <VisTooltip />
        </VisXYContainer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue';
import { useAccountingDashboard } from '@/composables/accounting/useAccountingDashboard';

const props = defineProps({
  userName: { type: String, default: 'قسم المحاسبة' },
});

const {
  dashboardMetrics,
  dashboardFromDate,
  dashboardToDate,
  loadDashboardMetrics,
  formatCurrency,
} = useAccountingDashboard();

const chartLabels = ['الوحدات المباعة', 'الودائع', 'المسترد', 'قيمة المشاريع', 'قيمة المبيعات', 'العمولات'];

const chartData = computed(() => [
  { label: chartLabels[0], value: dashboardMetrics.totalUnitsSold || 0 },
  { label: chartLabels[1], value: dashboardMetrics.totalDeposits || 0 },
  { label: chartLabels[2], value: dashboardMetrics.totalDepositsRefunded || 0 },
  { label: chartLabels[3], value: dashboardMetrics.totalProjectsValue || 0 },
  { label: chartLabels[4], value: dashboardMetrics.totalSalesValue || 0 },
  { label: chartLabels[5], value: dashboardMetrics.totalCommissions || 0 },
]);

const barAccessors = [(d) => d.value];
const barColors = ['#b1a28f'];
const xTickFormat = (i) => chartLabels[i] ?? '';

onMounted(() => {
  loadDashboardMetrics();
});
</script>

<style scoped>
@media (max-width: 768px) {
  .chart-placeholder, .chart-container, [class*="chart"] { height: 240px; }
}
@media (max-width: 576px) {
  .chart-placeholder, .chart-container, [class*="chart"] { height: 200px; }
}
</style>
