<template>
  <div class="dashboard-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">نظرة عامة على أدائك ونتائج المبيعات.</p>
    </div>

    <LoadingSpinner v-if="isLoadingDashboard" text="جاري تحميل البيانات..." />

    <div v-else-if="dashboardData" class="dashboard-kpis">
      <div class="kpi-section">
        <h3 class="kpi-section-title">المؤشرات الرئيسية</h3>
        <div class="stats-grid stats-grid-primary">
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد الوحدات المحجوزة</span>
                <span class="stat-value number" :title="formatNumber(dashboardData.reserved_units ?? 0)">{{ formatCompact(dashboardData.reserved_units ?? 0) }}</span>
              </div>
              <div class="stat-icon-bg reserved">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد الوحدات المتاحة</span>
                <span class="stat-value number" :title="formatNumber(dashboardData.available_units ?? 0)">{{ formatCompact(dashboardData.available_units ?? 0) }}</span>
              </div>
              <div class="stat-icon-bg available">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد المشاريع قيد التسويق</span>
                <span class="stat-value number" :title="formatNumber(dashboardData.projects_under_marketing ?? 0)">{{ formatCompact(dashboardData.projects_under_marketing ?? 0) }}</span>
              </div>
              <div class="stat-icon-bg marketing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">نسبة الحجوزات المؤكدة مقابل التفاوض</span>
                <span class="stat-value number">{{ confirmedVsNegotiationRatio }}%</span>
                <span class="stat-sublabel">مؤكدة: {{ dashboardData.confirmed_count ?? 0 }} — تفاوض: {{ dashboardData.negotiation_count ?? 0 }}</span>
              </div>
              <div class="stat-icon-bg ratio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">العرابين</span>
                <div class="stat-value stat-value-currency-block" :title="formatCurrency(dashboardData.total_received_deposits ?? 0)">
                  <span class="stat-value-main number">{{ depositParts.main }}</span>
                  <span class="stat-value-currency-label">{{ depositParts.currency }}</span>
                </div>
              </div>
              <div class="stat-icon-bg deposits">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Dashboard Projects Summary -->
    <div v-if="dashboardProjects.length > 0" class="dashboard-projects animate-fade-in-up">
      <div class="section-header">
        <h3>المشاريع النشطة</h3>
        <button class="btn-text-link" @click="switchTab('projects')">عرض الكل</button>
      </div>
      <div class="projects-mini-grid">
        <div
          v-for="project in dashboardProjects"
          :key="project.id"
          class="mini-project-card"
          @click="viewProjectDetails(project.id)"
        >
          <div class="p-image">
            <img :src="project.image || '/img/placeholder-project.jpg'" :alt="project.name || 'Project'" loading="lazy" />
          </div>
          <div class="p-info">
            <h4>{{ project.name }}</h4>
            <div class="p-stats">
              <span class="success">المتاحة: {{ project.available_units || 0 }}</span>
              <span class="warning">المحجوزة: {{ project.reserved_units || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { Card, CardContent } from '@/components/ui/card';
import { useSalesDashboard } from '@/composables/sales/useSalesDashboard';
import { useSalesRouting } from '@/composables/sales/useSalesRouting';
import { useSalesProjects } from '@/composables/sales/useSalesProjects';
import { useFormatters } from '@/composables/useFormatters';
import authService from '@/services/authService';
import { computed } from 'vue';

const { dashboardData, isLoadingDashboard, computedConfirmedVsNegotiationRatio: confirmedVsNegotiationRatio, formatCurrency, dashboardProjects, loadDashboard } = useSalesDashboard();
const { formatCompact, formatCurrencyCompact, formatCurrencyCompactParts, formatNumber } = useFormatters();
const { switchTab } = useSalesRouting();
const { viewProjectDetails } = useSalesProjects();

const user = authService.getCurrentUser();
const userName = computed(() => user?.name || 'مستخدم');

const depositParts = computed(() => formatCurrencyCompactParts(dashboardData.value?.total_received_deposits ?? 0));

loadDashboard();
</script>

<style scoped>
/* تنسيقات لوحة تحكم المبيعات — مؤشرات وبطاقات + استجابة كاملة */
.dashboard-tab {
  width: 100%;
  direction: rtl;
  min-height: 0;
}


.dashboard-kpis {
  margin-top: 8px;
}

.kpi-section {
  margin-bottom: 2rem;
}

.kpi-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
}

/* شبكة البطاقات — رسبونسف ونحيفة */
.stats-grid,
.stats-grid-primary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(10px, 2vw, 20px);
  margin-top: 16px;
  margin-bottom: 20px;
  overflow: visible;
}

.stats-grid-primary {
  margin-bottom: 8px;
}

.stats-grid {
  margin-bottom: 40px;
}

.stat-sublabel {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary, #64748b);
  margin-top: 2px;
}

/* بطاقة نحيفة — padding وارتفاع أقل */
:deep(.stat-card) {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 14px;
  padding: 0;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.06);
  position: relative;
  overflow: visible;
  min-height: 0;
}

:deep(.stat-card:hover) {
  border-color: rgba(177, 162, 143, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 58, 95, 0.1);
}

:deep(.stat-card-inner) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px !important;
  min-height: 0;
  min-width: 0;
}

:deep(.stat-icon-bg) {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

:deep(.stat-card:hover .stat-icon-bg) {
  transform: scale(1.05);
}

:deep(.stat-icon-bg svg) {
  width: 22px;
  height: 22px;
  position: relative;
  z-index: 1;
  color: #B5A99A;
  filter: drop-shadow(0 0 8px rgba(181, 169, 154, 0.6)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

:deep(.stat-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 2px;
  min-width: 0;
}

:deep(.stat-label) {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dark-gray);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.stat-value) {
  font-size: clamp(1.55rem, 3.2vw, 2.05rem);
  font-weight: 800;
  color: var(--color-charcoal);
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
  direction: ltr;
  unicode-bidi: embed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.stat-card:hover .stat-value) {
  color: var(--color-gold);
}

/* عرض العملة: الرقم بنفس حجم باقي اللوحات + اسم العملة أصغر أسفل */
.stat-value-currency-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.stat-value-currency-block .stat-value-main {
  font-size: clamp(1.55rem, 3.2vw, 2.05rem);
  font-weight: 800;
  color: var(--color-charcoal);
  line-height: 1.2;
  letter-spacing: -0.02em;
  direction: ltr;
  unicode-bidi: embed;
}
.stat-value-currency-block .stat-value-currency-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
:deep(.stat-card:hover .stat-value-currency-block .stat-value-main) {
  color: var(--color-gold);
}

/* المشاريع النشطة */
.dashboard-projects {
  margin-top: 40px;
  background: var(--color-white);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(30, 58, 95, 0.05);
  border: 1px solid rgba(177, 162, 143, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
}

.section-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0;
}

.btn-text-link {
  background: none;
  border: none;
  color: var(--color-gold);
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-text-link:hover {
  color: var(--color-navy);
  text-decoration: underline;
}

.projects-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.mini-project-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--color-off-white);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(177, 162, 143, 0.05);
}

.mini-project-card:hover {
  background: var(--color-white);
  border-color: rgba(177, 162, 143, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(177, 162, 143, 0.15);
}

.mini-project-card .p-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mini-project-card .p-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-project-card .p-info {
  flex: 1;
}

.mini-project-card .p-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
}

.p-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  font-weight: 600;
}

.p-stats .success {
  color: #10b981;
}
.p-stats .warning {
  color: #f59e0b;
}

/* رسبونسف: 5 أعمدة كبير، 3 متوسط، 2 تابلت، 1 موبايل */
@media (max-width: 1200px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
}
@media (max-width: 768px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  :deep(.stat-card-inner) {
    padding: 12px 14px !important;
  }
  :deep(.stat-icon-bg) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 10px;
  }
  :deep(.stat-icon-bg svg) {
    width: 20px;
    height: 20px;
  }
  :deep(.stat-label) {
    font-size: 0.75rem;
  }
  :deep(.stat-value) {
    font-size: 1.4rem;
  }
  .stat-value-currency-block .stat-value-main {
    font-size: 1.4rem;
  }
  .projects-mini-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 24px;
  }
  .dashboard-projects {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .dashboard-tab {
    padding: 0 4px;
  }
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  :deep(.stat-card-inner) {
    padding: 10px 12px !important;
  }
  :deep(.stat-icon-bg) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }
  :deep(.stat-icon-bg svg) {
    width: 18px;
    height: 18px;
  }
  :deep(.stat-value) {
    font-size: 1.25rem;
  }
  .stat-value-currency-block .stat-value-main {
    font-size: 1.25rem;
  }
  .mini-project-card {
    padding: 12px;
    gap: 12px;
  }
  .mini-project-card .p-image {
    width: 56px;
    height: 56px;
  }
  .mini-project-card .p-info h4 {
    font-size: 14px;
  }
}
</style>
