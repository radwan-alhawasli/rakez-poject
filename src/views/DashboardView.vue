<template>
  <div class="dashboard-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchData">إعادة المحاولة</button>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">إدارة المشاريع والموافقات.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Available Units -->
      <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
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

      <!-- Marketing Projects (Now Total Projects) -->
      <div
        class="stat-card clickable animate-fade-in-up animate-stagger-2 hover-lift hover-shine"
        @click="$router.push('/project-management')"
      >
        <div class="stat-content">
          <span class="stat-label">مشاريع التسويق (إجمالي المشاريع)</span>
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

      <!-- Ready Projects -->
      <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
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

      <!-- Not Ready Projects -->
      <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
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

    <!-- Overview (Placeholder for Chart) -->
    <div class="overview-section">
      <div class="section-header">
        <h3 class="section-title">نظرة عامة على المشاريع</h3>
        <p class="section-desc">توزيع المشاريع حسب حالتها الحالية.</p>
      </div>
      <div class="chart-placeholder">
        <!-- Add Chart here later if needed -->
        <p style="color: var(--color-dark-gray); margin-top: 40px">مخطط بياني لتوزيع المشاريع</p>
      </div>
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

const router = useRouter();
const user = ref(authService.getCurrentUser());
const userName = computed(() => user.value?.name || 'مستخدم');
const { formatCompact, formatNumber } = useFormatters();

const isLoading = ref(true);
const error = ref(null);

// Stats
const totalProjectValue = ref(0);
const availableUnits = ref(0);
const totalProjects = ref(0);
const readyProjects = ref(0);
const notReadyProjects = ref(0);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    let apps = [];
    // Check if user is admin (type 1)
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

    // Logic for Ready/Not Ready
    readyProjects.value = projects.filter(
      p => p.status === 'Approved' || (p.units && p.units.length > 0)
    ).length;
    notReadyProjects.value = projects.filter(p => p.status !== 'Approved').length;

    // Calculate Total Value and Available Units
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
    // Format to Millions if large enough, else keep as is
    totalProjectValue.value = (valueSum / 1000000).toFixed(2);
  } catch (e) {
    logger.error('Error fetching dashboard data', e);
    error.value = 'حدث خطأ في تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Redirect HR users to their specialized dashboard
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

/* Welcome Header - Luxury Enhanced */
.welcome-header {
  margin-bottom: 40px;
  text-align: right;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
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

/* Stat Content - Elegant Typography */
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

/* Stat Icons - Luxury Glass-morphism */
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
  height: 320px;
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
}

.chart-placeholder:hover {
  border-color: rgba(177, 162, 143, 0.4);
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
}

.chart-placeholder p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-dark-gray);
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

/* ============================
   DASHBOARD RESPONSIVE
   ============================ */
@media (max-width: 576px) {
  .dashboard-view {
    padding: 10px 12px;
  }
  .page-title,
  .welcome-title {
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
  .welcome-title {
    font-size: 34px;
  }
  .stat-value {
    font-size: 32px;
  }
  .chart-placeholder {
    padding: 60px 40px;
  }
}

@media (min-width: 2560px) {
  .dashboard-view {
    padding: 36px 52px;
  }
  .page-title,
  .welcome-title {
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
  .welcome-title {
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
    padding: 80px 60px;
    border-radius: 24px;
  }
}

@media (max-width: 768px) {
  .chart-placeholder, .chart-container, [class*="chart"] { height: 240px; }
}
@media (max-width: 576px) {
  .chart-placeholder, .chart-container, [class*="chart"] { height: 200px; }
}
</style>
