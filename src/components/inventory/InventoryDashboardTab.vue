<template>
  <div class="inventory-dashboard-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">لوحة تحكم المخزون</h1>
      <p class="welcome-subtitle">نظرة عامة على المشاريع والعقود والوحدات.</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button type="button" @click="fetchData">إعادة المحاولة</button>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card animate-fade-in-up">
          <div class="stat-content">
            <span class="stat-label">الوحدات المتاحة</span>
            <span class="stat-value number" :title="formatNumber(availableUnits)">{{ formatCompact(availableUnits) }}</span>
            <span class="stat-desc">وحدة سكنية جاهزة للبيع</span>
          </div>
          <div class="stat-icon-bg units">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
        </div>

        <div
          class="stat-card clickable animate-fade-in-up"
          @click="$router.push('/inventory/projects')"
        >
          <div class="stat-content">
            <span class="stat-label">مشاريع التسويق</span>
            <span class="stat-value number" :title="formatNumber(totalProjects)">{{ formatCompact(totalProjects) }}</span>
            <span class="stat-desc">مشروع جاهز للتسويق - اضغط للعرض</span>
          </div>
          <div class="stat-icon-bg projects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up">
          <div class="stat-content">
            <span class="stat-label">المشاريع الجاهزة</span>
            <span class="stat-value number" :title="formatNumber(readyProjects)">{{ formatCompact(readyProjects) }}</span>
            <span class="stat-desc">مشاريع مكتملة تحتوي على وحدات</span>
          </div>
          <div class="stat-icon-bg ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up">
          <div class="stat-content">
            <span class="stat-label">المشاريع غير الجاهزة</span>
            <span class="stat-value number" :title="formatNumber(notReadyProjects)">{{ formatCompact(notReadyProjects) }}</span>
            <span class="stat-desc">لم يكتمل المتتبع (Tracker)</span>
          </div>
          <div class="stat-icon-bg not-ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
      </div>

      <div class="overview-section">
        <div class="section-header">
          <h3 class="section-title">نظرة عامة على المشاريع</h3>
          <p class="section-desc">توزيع المشاريع حسب حالتها الحالية.</p>
        </div>
        <div class="chart-placeholder">
          <p style="color: var(--color-dark-gray); margin-top: 40px">مخطط بياني لتوزيع المشاريع</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import inventoryService from '@/services/inventoryService';
import { useFormatters } from '@/composables/useFormatters';

const { formatCompact, formatNumber } = useFormatters();

const isLoading = ref(true);
const error = ref(null);

const availableUnits = ref(0);
const totalProjects = ref(0);
const readyProjects = ref(0);
const notReadyProjects = ref(0);

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

.welcome-header {
  margin-bottom: 40px;
  text-align: right;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-charcoal);
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--color-dark-gray);
  margin: 0;
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
