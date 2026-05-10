<template>
  <section class="sales-my-rating" dir="rtl" lang="ar">
    <header class="rating-header">
      <h2 class="rating-title">تقييمي</h2>
      <p class="rating-subtitle">
        {{ isGroupLeaderMode ? 'ملخص أداء قائد المجموعة وترتيبه' : 'ملخص أدائك وترتيبك بين فريق المبيعات' }}
      </p>
    </header>

    <div v-if="isLoading" class="rating-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات التقييم...</p>
    </div>

    <div v-else-if="loadError" class="rating-state rating-state--error">
      <p>{{ loadError }}</p>
      <button type="button" class="btn-retry" @click="loadMyRating">إعادة المحاولة</button>
    </div>

    <div v-else-if="!hasOverviewData" class="rating-state">
      <p>لا توجد بيانات تقييم متاحة حالياً.</p>
    </div>

    <div v-else class="rating-content">
      <div class="rating-top-grid">
        <article class="rating-card rating-card--highlight">
          <span class="rating-label">ترتيبي</span>
          <strong class="rating-value">{{ formatNumber(ranking.position) }}</strong>
        </article>

        <article class="rating-card rating-card--highlight">
          <span class="rating-label">إجمالي موظفي المبيعات</span>
          <strong class="rating-value">{{ formatNumber(ranking.total_sales_staff) }}</strong>
        </article>
      </div>

      <div class="rating-grid">
        <article class="rating-card">
          <span class="rating-label">عدد الأهداف المخصصة</span>
          <strong class="rating-value">{{ formatNumber(overview.assigned_lines_count) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">الأهداف قيد التنفيذ</span>
          <strong class="rating-value">{{ formatNumber(overview.in_progress_lines_count) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">الأهداف المكتملة</span>
          <strong class="rating-value">{{ formatNumber(overview.completed_lines_count) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">نسبة الإنجاز</span>
          <strong class="rating-value">{{ formatPercent(overview.completion_rate_percent) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">إجمالي قيمة الأهداف</span>
          <strong class="rating-value">{{ formatNumber(overview.target_total_value) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">إجمالي القيمة المحققة</span>
          <strong class="rating-value">{{ formatNumber(overview.achieved_total_value) }}</strong>
        </article>

        <article class="rating-card">
          <span class="rating-label">نسبة تحقيق القيمة</span>
          <strong class="rating-value">{{ formatPercent(overview.value_achievement_rate_percent) }}</strong>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import salesService from '@/services/salesService';

const isLoading = ref(false);
const loadError = ref('');
const isGroupLeaderMode = ref(false);

const overview = reactive({
  assigned_lines_count: 0,
  in_progress_lines_count: 0,
  completed_lines_count: 0,
  completion_rate_percent: 0,
  target_total_value: 0,
  achieved_total_value: 0,
  value_achievement_rate_percent: 0,
});

const ranking = reactive({
  position: null,
  total_sales_staff: null,
});

const hasOverviewData = computed(() => {
  const overviewValues = Object.values(overview).some(value => Number(value || 0) > 0);
  return overviewValues || Number(ranking.position || 0) > 0 || Number(ranking.total_sales_staff || 0) > 0;
});

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
  return asNumber(value).toLocaleString('en-US');
}

function formatPercent(value) {
  return `${asNumber(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

async function loadMyRating() {
  isLoading.value = true;
  loadError.value = '';
  try {
    const ledGroups = await salesService.getGroupLeaderLedGroups();
    isGroupLeaderMode.value = Array.isArray(ledGroups) && ledGroups.length > 0;

    const response = isGroupLeaderMode.value
      ? await salesService.getGroupLeaderTargets({ page: 1, per_page: 1 })
      : await salesService.getMemberTargets({ page: 1, per_page: 1 });

    const meta = response?.meta && typeof response.meta === 'object' ? response.meta : {};
    const memberOverview =
      meta.member_overview && typeof meta.member_overview === 'object' ? meta.member_overview : {};
    const memberRanking = meta.ranking && typeof meta.ranking === 'object' ? meta.ranking : {};

    overview.assigned_lines_count = asNumber(memberOverview.assigned_lines_count);
    overview.in_progress_lines_count = asNumber(memberOverview.in_progress_lines_count);
    overview.completed_lines_count = asNumber(memberOverview.completed_lines_count);
    overview.completion_rate_percent = asNumber(memberOverview.completion_rate_percent);
    overview.target_total_value = asNumber(memberOverview.target_total_value);
    overview.achieved_total_value = asNumber(memberOverview.achieved_total_value);
    overview.value_achievement_rate_percent = asNumber(memberOverview.value_achievement_rate_percent);

    ranking.position = memberRanking.position ?? null;
    ranking.total_sales_staff = memberRanking.total_sales_staff ?? null;
  } catch (error) {
    loadError.value = error?.response?.data?.message || error?.message || 'تعذر تحميل بيانات التقييم.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadMyRating();
});
</script>

<style scoped>
.sales-my-rating {
  padding: 10px 0 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.78));
  backdrop-filter: blur(5px);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
}

.rating-header {
  margin-bottom: 18px;
  padding: 0 14px;
}

.rating-title {
  margin: 0;
  font-size: 1.52rem;
  color: var(--color-navy, #27374d);
  font-weight: 800;
}

.rating-subtitle {
  margin: 6px 0 0;
  color: #5b6982;
  font-size: 0.98rem;
}

.rating-content {
  padding: 0 12px 12px;
}

.rating-top-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.rating-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  padding: 14px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.rating-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.rating-card--highlight {
  background: linear-gradient(180deg, rgba(39, 55, 77, 0.95), rgba(51, 65, 85, 0.95));
  border-color: rgba(39, 55, 77, 0.85);
}

.rating-card--highlight .rating-label {
  color: rgba(255, 255, 255, 0.82);
}

.rating-card--highlight .rating-value {
  color: #ffffff;
  font-size: 1.45rem;
}

.rating-label {
  color: #5e6c83;
  font-size: 0.85rem;
  font-weight: 700;
}

.rating-value {
  color: var(--color-navy, #27374d);
  font-size: 1.16rem;
  font-weight: 800;
  direction: ltr;
  text-align: right;
}

.rating-state {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  padding: 20px 16px;
  text-align: center;
  color: #475569;
  margin: 0 12px 12px;
}

.rating-state--error {
  border-color: rgba(185, 28, 28, 0.3);
  color: #991b1b;
}

.btn-retry {
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  background: var(--color-navy, #27374d);
  color: #fff;
  padding: 8px 14px;
  cursor: pointer;
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid rgba(39, 55, 77, 0.2);
  border-top-color: var(--color-navy, #27374d);
  margin: 0 auto 10px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .sales-my-rating {
    border-radius: 12px;
  }

  .rating-header {
    padding: 0 10px;
  }

  .rating-content {
    padding: 0 8px 10px;
  }

  .rating-grid,
  .rating-top-grid {
    grid-template-columns: 1fr;
  }
}
</style>
