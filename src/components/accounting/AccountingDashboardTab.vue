<template>
  <div class="hr-dashboard-grid-view">
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">المؤشرات الرئيسية للمحاسبة والمالية.</p>
    </div>
    <div class="stats-grid stats-grid-three accounting-dashboard-grid">
      <div class="stat-card accounting-metric-card animate-fade-in-up animate-stagger-1 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد الوحدات المباعة</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalUnitsSold || 0)">{{ formatCompact(dashboardMetrics.totalUnitsSold || 0) }}</span>
          <span class="stat-desc">عدد الوحدات التي تم بيعها</span>
        </div>
        <div class="stat-icon-bg units">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card animate-fade-in-up animate-stagger-2 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد العربون المستلم</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalDeposits)">{{ formatCompact(dashboardMetrics.totalDeposits) }}</span>
          <span class="stat-desc">إجمالي العربون المستلم</span>
        </div>
        <div class="stat-icon-bg green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card animate-fade-in-up animate-stagger-3 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد العربون المسترد</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalDepositsRefunded)">{{ formatCompact(dashboardMetrics.totalDepositsRefunded) }}</span>
          <span class="stat-desc">إجمالي العربون المسترد</span>
        </div>
        <div class="stat-icon-bg red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card animate-fade-in-up animate-stagger-4 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد قيمة المشاريع المستلمة</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalProjectsValue)">{{ formatCompact(dashboardMetrics.totalProjectsValue) }}</span>
          <span class="stat-desc">قيمة المشاريع المستلمة</span>
        </div>
        <div class="stat-icon-bg projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card animate-fade-in-up animate-stagger-1 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد قيمة المبيعات</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalSalesValue)">{{ formatCompact(dashboardMetrics.totalSalesValue) }}</span>
          <span class="stat-desc">اعتمادًا على سعر البيع النهائي</span>
        </div>
        <div class="stat-icon-bg blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M7 14l4-4 3 3 5-6"></path></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card stat-card-pending animate-fade-in-up animate-stagger-2 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد العرابين المعلقة</span>
          <span class="stat-value number">{{ dashboardMetrics.pendingDepositsCount || 0 }}</span>
          <span class="stat-desc">بانتظار تأكيد الاستلام</span>
        </div>
        <div class="stat-icon-bg orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>
      <div class="stat-card accounting-metric-card stat-card-notifications animate-fade-in-up animate-stagger-3 hover-lift">
        <div class="stat-content">
          <span class="stat-label">عدد العرابين</span>
          <span class="stat-value number">{{ dashboardMetrics.totalDepositsCount || 0 }}</span>
          <span class="stat-desc">إجمالي العرابين في النظام</span>
        </div>
        <div class="stat-icon-bg dollar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
import { useFormatters } from '@/composables/useFormatters';

defineProps({
  userName: { type: String, default: 'قسم المحاسبة' },
});

const {
  dashboardMetrics,
  dashboardFromDate,
  dashboardToDate,
  loadDashboardMetrics,
} = useAccountingDashboard();
const { formatCompact, formatNumber } = useFormatters();

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
.accounting-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
  align-items: stretch;
}

.accounting-dashboard-grid .stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  min-height: 160px;
}

.accounting-dashboard-grid .stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 90px;
  height: 90px;
  background: radial-gradient(circle at top right, rgba(177, 162, 143, 0.06) 0%, transparent 60%);
  border-radius: 0 24px 0 100%;
  opacity: 0.55;
  pointer-events: none;
}

.accounting-dashboard-grid .stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-4px);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.22), 0 8px 20px rgba(30, 58, 95, 0.12);
}

.accounting-metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 26px;
}

.accounting-dashboard-grid .stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
  min-width: 0;
  z-index: 1;
}

.accounting-dashboard-grid .stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  line-height: 1.4;
}

.accounting-dashboard-grid .stat-value {
  font-size: 42px !important;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  margin: 8px 0 !important;
  letter-spacing: -0.03em;
  transition: all 0.3s ease;
}

.accounting-dashboard-grid .stat-card:hover .stat-value {
  color: #b1a28f;
}

.accounting-dashboard-grid .stat-desc {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  line-height: 1.5;
}

.accounting-dashboard-grid .stat-icon-bg {
  width: 70px !important;
  height: 70px !important;
  min-width: 70px !important;
  min-height: 70px !important;
  border-radius: 50% !important;
  flex-shrink: 0;
  z-index: 1;
}

.accounting-dashboard-grid .stat-icon-bg svg {
  width: 32px !important;
  height: 32px !important;
}

@media (max-width: 768px) {
  .accounting-dashboard-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .accounting-dashboard-grid .stat-card {
    min-height: auto;
  }

  .accounting-metric-card {
    padding: 22px 20px;
  }

  .accounting-dashboard-grid .stat-value {
    font-size: 32px !important;
  }

  .accounting-dashboard-grid .stat-icon-bg {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px !important;
    min-height: 56px !important;
  }

  .accounting-dashboard-grid .stat-icon-bg svg {
    width: 24px !important;
    height: 24px !important;
  }

  .chart-placeholder, .chart-container, [class*="chart"] { height: 240px; }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .accounting-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .chart-placeholder, .chart-container, [class*="chart"] { height: 200px; }
}
</style>
