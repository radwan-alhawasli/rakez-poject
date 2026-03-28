<template>
  <div class="inventory-dashboard-tab rakez-erp-dashboard">
    <DashboardWelcomeHeader greeting-name="المخزون" subtitle="نظرة عامة على المشاريع والعقود والوحدات." />

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button type="button" @click="fetchData">إعادة المحاولة</button>
    </div>

    <template v-else>
      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense">
        <LuxuryStatCard
          label="الوحدات المتاحة"
          :value="formatCompact(availableUnits)"
          :title="formatNumber(availableUnits)"
          description="وحدة سكنية جاهزة للبيع"
        >
          <template #icon>
            <DashboardStatIcon name="units" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          clickable
          label="مشاريع التسويق"
          :value="formatCompact(totalProjects)"
          :title="formatNumber(totalProjects)"
          description="اضغط للعرض"
          @click="goProjects"
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
      <div class="rakez-widget-grid">
        <DarkWidgetShell title="توزيع المخزون والمشاريع" subtitle="من نظرة الوكالة">
          <DonutKpiWidget :segments="inventoryDonutSegments" :height="200" central-sub-label="إجمالي الأعداد" />
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="نظرة عامة على المشاريع" subtitle="مؤشرات من نظرة الوكالة وفهرس العقود">
          <DashboardMetricsBarChart :series="inventoryChartSeries" :height="260" />
        </DarkWidgetShell>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import inventoryService from '@/services/inventoryService';
import { useFormatters } from '@/composables/useFormatters';
import { inventoryProjectSegments } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const router = useRouter();
const { formatCompact, formatNumber } = useFormatters();

function goProjects() {
  router.push('/inventory/projects');
}

const isLoading = ref(true);
const error = ref(null);

const availableUnits = ref(0);
const totalProjects = ref(0);
const readyProjects = ref(0);
const notReadyProjects = ref(0);

const inventoryChartSeries = computed(() => [
  { label: 'وحدات متاحة', value: Number(availableUnits.value) || 0 },
  { label: 'مشاريع', value: Number(totalProjects.value) || 0 },
  { label: 'جاهزة', value: Number(readyProjects.value) || 0 },
  { label: 'غير جاهزة', value: Number(notReadyProjects.value) || 0 },
]);

const inventoryDonutSegments = computed(() =>
  inventoryProjectSegments(
    availableUnits.value,
    totalProjects.value,
    readyProjects.value,
    notReadyProjects.value
  )
);

async function fetchData() {
  isLoading.value = true;
  error.value = null;
  try {
    const [overviewRes, indexRes] = await Promise.all([
      inventoryService.getAgencyOverview(),
      inventoryService.getContractsAdminIndex({ page: 1, per_page: 500 }),
    ]);

    const overview = overviewRes || {};
    const items = indexRes?.items ?? [];
    const projects = Array.isArray(items) ? items : [];

    totalProjects.value = overview.total_projects ?? projects.length ?? 0;
    availableUnits.value = overview.available_units ?? 0;
    readyProjects.value = overview.ready_projects ?? projects.filter(p => p.status === 'Approved' || (p.contract_units && p.contract_units.length > 0)).length;
    notReadyProjects.value = overview.not_ready_projects ?? projects.filter(p => p.status !== 'Approved').length;

    if (availableUnits.value === 0 && projects.length > 0) {
      let sum = 0;
      projects.forEach(p => {
        const units = p.contract_units ?? p.units ?? [];
        units.forEach(u => { sum += parseInt(u.count) || 1; });
      });
      availableUnits.value = sum;
    }
  } catch (e) {
    error.value = e?.message ?? 'حدث خطأ في تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.inventory-dashboard-tab {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

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
}

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
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25);
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: var(--color-charcoal);
}

.stat-desc {
  font-size: 12px;
  color: var(--color-dark-gray);
}

.stat-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
}

.stat-icon-bg.units { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.stat-icon-bg.projects { background: linear-gradient(135deg, var(--color-gold) 0%, #b8860b 100%); }
.stat-icon-bg.ready { background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); }
.stat-icon-bg.not-ready { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.stat-icon-bg svg {
  width: 32px;
  height: 32px;
  color: white;
}

.overview-section {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  min-height: 450px;
}

.section-header {
  margin-bottom: 35px;
  text-align: right;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 10px 0;
}

.section-desc {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

.chart-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-white) 100%);
  border-radius: 20px;
  border: 2px dashed rgba(177, 162, 143, 0.25);
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gold);
  background: var(--color-gold);
  color: white;
  cursor: pointer;
}
</style>
