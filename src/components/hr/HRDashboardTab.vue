<template>
  <div class="hr-dashboard-grid-view">
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">المؤشرات الرئيسية للأداء وإدارة القوى العاملة.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
        <div class="stat-content">
          <span class="stat-label">إجمالي الموظفين</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalEmployees || 0)">{{ formatCompact(dashboardMetrics.totalEmployees || 0) }}</span>
          <span class="stat-desc">العدد الإجمالي للموظفين في الشركة</span>
        </div>
        <div class="stat-icon-bg units">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      </div>

      <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
        <div class="stat-content">
          <span class="stat-label">إجمالي الوحدات</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.totalUnits || 0)">{{ formatCompact(dashboardMetrics.totalUnits || 0) }}</span>
          <span class="stat-desc">إجمالي الوحدات السكنية المتاحة</span>
        </div>
        <div class="stat-icon-bg projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>

      <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
        <div class="stat-content">
          <span class="stat-label">الوحدات المباعة</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.soldUnits || 0)">{{ formatCompact(dashboardMetrics.soldUnits || 0) }}</span>
          <span class="stat-desc">عدد الوحدات التي تم بيعها بنجاح</span>
        </div>
        <div class="stat-icon-bg ready">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
        <div class="stat-content">
          <span class="stat-label">متوسط مبيع الموظف</span>
          <span class="stat-value number" :title="formatNumber(dashboardMetrics.avgEmployeeSales || 0)">{{ formatCompact(dashboardMetrics.avgEmployeeSales || 0) }}</span>
          <span class="stat-desc">الوحدات المباعة ÷ عدد موظفي المبيعات ({{ dashboardMetrics.salesEmployeesCount }})</span>
        </div>
        <div class="stat-icon-bg dollar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      </div>
    </div>

    <div class="overview-section">
      <div class="section-header">
        <h3 class="section-title-chart">نظرة عامة على أداء الموظفين</h3>
        <p class="section-desc">توزيع الموظفين حسب حالتهم الحالية.</p>
      </div>
      <div class="chart-placeholder">
        <p style="color: #94a3b8">مخطط بياني لتوزيع الموظفين</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHRDashboard } from '@/composables/hr/useHRDashboard';
import { useFormatters } from '@/composables/useFormatters';

defineProps({
  userName: { type: String, default: 'الموارد البشرية' },
});

const { dashboardMetrics, loadDashboardMetrics } = useHRDashboard();
const { formatCompact, formatNumber } = useFormatters();

onMounted(() => {
  loadDashboardMetrics();
});
</script>

<style scoped>


.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .welcome-title { font-size: 26px; }
  .welcome-subtitle { font-size: 14px; }
  .stat-card { padding: 24px 20px; }
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 24px;
  padding: 32px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: default;
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at top right, rgba(177, 162, 143, 0.06) 0%, transparent 60%);
  border-radius: 0 24px 0 100%;
  opacity: 0.5;
  transition: opacity 0.5s ease;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25), 0 8px 20px rgba(30, 58, 95, 0.12);
}

.stat-card:hover::before { opacity: 1; }
.stat-card:hover::after { opacity: 0.8; }

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0;
  order: 1;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  margin: 8px 0;
  order: 2;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-value {
  color: #b1a28f;
  transform: scale(1.05);
}

.stat-desc {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  order: 3;
  letter-spacing: 0.01em;
  opacity: 0.85;
}

.stat-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  order: 3;
  position: relative;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.stat-icon-bg::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-card:hover .stat-icon-bg { transform: scale(1.12) rotate(-8deg); }
.stat-card:hover .stat-icon-bg::before { opacity: 1; }

.stat-icon-bg svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-icon-bg.dollar { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; }
.stat-icon-bg.units { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; }
.stat-icon-bg.projects { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; }
.stat-icon-bg.ready { background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%); color: white; }

.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-stagger-1 { animation-delay: 0.05s; }
.animate-stagger-2 { animation-delay: 0.1s; }
.animate-stagger-3 { animation-delay: 0.15s; }
.animate-stagger-4 { animation-delay: 0.2s; }

.overview-section { background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%); border-radius: var(--radius-xl, 20px); padding: 40px; border: 1px solid rgba(177, 162, 143, 0.15); min-height: 450px; box-shadow: 0 12px 40px -10px rgba(30, 58, 95, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06); position: relative; overflow: hidden; backdrop-filter: blur(10px); }
.overview-section::before { content: ''; position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: radial-gradient(circle, rgba(177, 162, 143, 0.08) 0%, transparent 70%); border-radius: 0 28px 0 100%; opacity: 0.6; }
.section-header { margin-bottom: 35px; text-align: right; position: relative; z-index: 1; padding-bottom: 20px; border-bottom: 1px solid rgba(177, 162, 143, 0.12); }
.section-title-chart { font-size: 24px; font-weight: 800; color: #1e3a5f; margin: 0 0 10px 0; letter-spacing: -0.02em; line-height: 1.3; }
.section-desc { color: #64748b; font-size: 15px; margin: 0; font-weight: 500; letter-spacing: 0.01em; }
.chart-placeholder { height: 320px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: var(--radius-lg, 16px); border: 2px dashed rgba(177, 162, 143, 0.25); margin-top: 25px; position: relative; z-index: 1; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02); transition: all 0.4s ease; }
.chart-placeholder:hover { border-color: rgba(177, 162, 143, 0.4); background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); }
.chart-placeholder p { margin: 0; font-size: 16px; font-weight: 600; color: #94a3b8; }
</style>
