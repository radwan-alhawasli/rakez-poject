<template>
  <div class="dashboard-view rakez-erp-dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button type="button" @click="fetchData">إعادة المحاولة</button>
    </div>

    <template v-else>
      <DashboardWelcomeHeader :user-name="userName" subtitle="إدارة المشاريع والموافقات." />

      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense dashboard-main-grid">
        <LuxuryStatCard
          label="الوحدات المتاحة"
          :value="formatCompact(availableUnits)"
          :title="formatNumber(availableUnits)"
          description="وحدة سكنية جاهزة للبيع (تقديري من العقود)"
        >
          <template #icon>
            <DashboardStatIcon name="units" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          clickable
          label="مشاريع التسويق (إجمالي)"
          :value="formatCompact(totalProjects)"
          :title="formatNumber(totalProjects)"
          description="اضغط للعرض"
          @click="$router.push('/project-management')"
        >
          <template #icon>
            <DashboardStatIcon name="clipboard" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="المشاريع الجاهزة"
          :value="formatCompact(readyProjects)"
          :title="formatNumber(readyProjects)"
          description="مشاريع مكتملة تحتوي على وحدات"
        >
          <template #icon>
            <DashboardStatIcon name="successCircle" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="المشاريع غير الجاهزة"
          :value="formatCompact(notReadyProjects)"
          :title="formatNumber(notReadyProjects)"
          description="لم يكتمل المتتبع (Tracker)"
        >
          <template #icon>
            <DashboardStatIcon name="warningCircle" />
          </template>
        </LuxuryStatCard>
      </div>

      <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
      <div class="rakez-widget-grid dashboard-widgets-bottom">
        <DarkWidgetShell title="توزيع المشاريع" :subtitle="`جاهز للتسويق ${readinessPct}%`">
          <DonutKpiWidget
            :segments="projectReadinessSplit"
            :height="200"
            :central-label="readinessPct + '%'"
            central-sub-label="جاهز للتسويق"
          />
        </DarkWidgetShell>
        <DarkWidgetShell title="تفصيل الجاهزية" subtitle="عدد المشاريع حسب الحالة">
          <ProgressBreakdownWidget :rows="projectReadinessSplit" value-type="number" />
          <p class="dashboard-portfolio-note">إجمالي قيمة الوحدات (تقديري): {{ formatCurrencyAr(totalPortfolioValue) }}</p>
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="مؤشرات سريعة" subtitle="وحدات ومشاريع">
          <DashboardMetricsBarChart :series="mainBarSeries" :height="240" />
        </DarkWidgetShell>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/authService';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import ProgressBreakdownWidget from '@/components/dashboard/widgets/ProgressBreakdownWidget.vue';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const router = useRouter();
const user = ref(authService.getCurrentUser());
const userName = computed(() => user.value?.name || 'مستخدم');
const { formatCompact, formatNumber, formatCurrencyAr } = useFormatters();

const isLoading = ref(true);
const error = ref(null);

const totalPortfolioValue = ref(0);
const availableUnits = ref(0);
const totalProjects = ref(0);
const readyProjects = ref(0);
const notReadyProjects = ref(0);

const readinessPct = computed(() => {
  const t = totalProjects.value;
  if (!t) return 0;
  return Math.round((readyProjects.value / t) * 100);
});

/** دونات + شريط تقدم: نفس قيمة جاهز / غير جاهز */
const projectReadinessSplit = computed(() => [
  { label: 'جاهز للتسويق', value: Number(readyProjects.value) || 0 },
  { label: 'تحت الإعداد', value: Number(notReadyProjects.value) || 0 },
]);

const mainBarSeries = computed(() => [
  { label: 'وحدات (تقدير)', value: Number(availableUnits.value) || 0 },
  { label: 'مشاريع', value: Number(totalProjects.value) || 0 },
  { label: 'جاهزة', value: Number(readyProjects.value) || 0 },
  { label: 'غير جاهزة', value: Number(notReadyProjects.value) || 0 },
]);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    let apps = [];
    const isUserAdmin = user.value && (user.value.type === 1 || user.value.type === 'admin');
    const isUserEditor = user.value && user.value.type === 3;

    if (isUserAdmin) {
      const adminRes = await contractService.getAllContracts({ page: 1, per_page: 500 });
      apps = adminRes.items ?? [];
    } else if (isUserEditor) {
      apps = await contractService.getEditorContracts();
    } else {
      const res = await contractService.getContracts({ page: 1, per_page: 500 });
      apps = res.items ?? [];
    }

    const projects = Array.isArray(apps) ? apps : [];

    totalProjects.value = projects.length;

    const readyCount = projects.filter(
      p => p.status === 'Approved' || (p.units && p.units.length > 0)
    ).length;
    readyProjects.value = readyCount;
    notReadyProjects.value = Math.max(0, projects.length - readyCount);

    let valueSum = 0;
    let unitsSum = 0;

    projects.forEach(p => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach(u => {
          const count = parseInt(u.count) || 1;
          const price = parseFloat(u.price) || 0;
          unitsSum += count;
          valueSum += price * count;
        });
      }
    });

    availableUnits.value = unitsSum;
    totalPortfolioValue.value = valueSum;
  } catch (e) {
    logger.error('Error fetching dashboard data', e);
    error.value = 'حدث خطأ في تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const currentUser = authService.getCurrentUser();
  if (currentUser?.type == 8) {
    router.push('/hr/dashboard');
    return;
  }
  fetchData();
});
</script>

<style scoped>
.dashboard-view {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats Grid - Luxury Layout */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Stat Cards - Premium Luxury Design */
.stat-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
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

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25), 0 8px 20px rgba(30, 58, 95, 0.12);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover::after {
  opacity: 0.8;
}

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
  color: var(--color-dark-gray);
  font-weight: 600;
  margin-bottom: 0;
  order: 1;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: var(--color-charcoal);
  line-height: 1;
  margin: 8px 0;
  order: 2;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-value {
  color: var(--color-gold);
  transform: scale(1.05);
}

.stat-desc {
  font-size: 12px;
  color: var(--color-dark-gray);
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

.stat-card:hover .stat-icon-bg {
  transform: scale(1.12) rotate(-8deg);
}

.stat-card:hover .stat-icon-bg::before {
  opacity: 1;
}

.stat-icon-bg svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Overview Section - Luxury Enhanced */
.overview-section {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  min-height: 450px;
  box-shadow: 0 12px 40px -10px rgba(30, 58, 95, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.overview-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.08) 0%, transparent 70%);
  border-radius: 0 28px 0 100%;
  opacity: 0.6;
}

.section-header {
  margin-bottom: 35px;
  text-align: right;
  position: relative;
  z-index: 1;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.section-desc {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.chart-placeholder {
  min-height: 280px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-white) 100%);
  border-radius: 20px;
  border: 2px dashed rgba(177, 162, 143, 0.25);
  margin-top: 25px;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.4s ease;
  padding: 24px 16px;
}

.chart-placeholder:hover {
  border-color: rgba(177, 162, 143, 0.4);
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
}

/* مخطط داخل الهوية الفاتحة */
.luxury-overview-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  width: 100%;
}

.luxury-donut {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 8px 28px rgba(39, 55, 77, 0.12);
}

.luxury-donut-center {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(177, 162, 143, 0.35);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.luxury-donut-center strong {
  font-size: 1.35rem;
  color: var(--color-navy);
  font-weight: 800;
}

.luxury-donut-center span {
  font-size: 11px;
  color: var(--color-dark-gray);
}

.luxury-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 200px;
  max-width: 420px;
}

.luxury-bar-row {
  display: grid;
  grid-template-columns: minmax(80px, 140px) 1fr minmax(48px, 72px);
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-dark-gray);
}

.luxury-bar-track {
  height: 10px;
  border-radius: 999px;
  background: var(--color-medium-gray);
  overflow: hidden;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.luxury-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.luxury-bar-value {
  text-align: left;
  direction: ltr;
  font-weight: 700;
  color: var(--color-charcoal);
  font-variant-numeric: tabular-nums;
}

.luxury-portfolio-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--color-dark-gray);
}

.dashboard-portfolio-note {
  margin: 14px 0 0;
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.82);
  line-height: 1.45;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 3px solid var(--color-light-gray);
  border-top-color: var(--color-gold);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
}

.error-state button {
  margin-top: 15px;
  padding: 10px 24px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.error-state button:hover {
  opacity: 0.9;
}

@media (max-width: 576px) {
  .dashboard-view {
    padding: 10px 12px;
  }
  .page-title,
  :deep(.rakez-dashboard-welcome__title) {
    font-size: 20px;
  }
  .stat-card {
    padding: 14px;
  }
}

@media (min-width: 1920px) {
  .dashboard-view {
    padding: 28px 40px;
  }
  .page-title,
  :deep(.rakez-dashboard-welcome__title) {
    font-size: 34px;
  }
  .stat-value {
    font-size: 32px;
  }
  .chart-placeholder {
    padding: 40px 32px;
  }
}

@media (min-width: 2560px) {
  .dashboard-view {
    padding: 36px 52px;
  }
  .page-title,
  :deep(.rakez-dashboard-welcome__title) {
    font-size: 40px;
  }
  .stat-value {
    font-size: 38px;
  }
  .stat-card {
    padding: 28px;
    border-radius: 20px;
  }
}

@media (min-width: 3840px) {
  .dashboard-view {
    padding: 48px 60px;
  }
  .page-title,
  :deep(.rakez-dashboard-welcome__title) {
    font-size: 52px;
  }
  .stat-value {
    font-size: 48px;
  }
  .stat-card {
    padding: 36px;
    border-radius: 24px;
  }
  .chart-placeholder {
    padding: 48px 40px;
    border-radius: 24px;
  }
}

@media (max-width: 768px) {
  .chart-placeholder {
    min-height: 240px;
  }
}
@media (max-width: 576px) {
  .chart-placeholder {
    min-height: 200px;
  }
}
</style>
