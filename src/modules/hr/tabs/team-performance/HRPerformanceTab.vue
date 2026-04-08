<template>
  <div class="hr-performance-view">
    <div class="hr-performance-shell">
      <header class="hr-performance-shell__head">
        <div class="hr-performance-shell__head-row">
          <div class="hr-performance-shell__brand">
            <span class="hr-performance-shell__kicker">الموارد البشرية</span>
            <h1 class="hr-performance-shell__title">أداء الفرق</h1>
            <p class="hr-performance-shell__subtitle">
              متابعة تحقيق الأهداف ومتوسط أداء المبيعات للفترة المختارة — بيانات متصلة بخدمات الفرق والمبيعات.
            </p>
          </div>
          <div class="hr-performance-shell__controls">
            <label class="hr-performance-field">
              <span class="hr-performance-field__label">السنة</span>
              <select v-model.number="periodYear" class="hr-performance-field__input">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </label>
            <label class="hr-performance-field">
              <span class="hr-performance-field__label">الشهر</span>
              <select v-model.number="periodMonth" class="hr-performance-field__input">
                <option v-for="m in 12" :key="m" :value="m">{{ monthLabel(m) }}</option>
              </select>
            </label>
            <button
              type="button"
              class="hr-performance-shell__cta"
              :disabled="isLoading"
              @click="loadTeamPerformance"
            >
              <span v-if="isLoading" class="hr-performance-shell__cta-spin" aria-hidden="true" />
              <span>{{ isLoading ? 'جاري التحديث…' : 'تحديث البيانات' }}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="hr-performance-shell__body">
        <p v-if="hasAnyMissingGoal" class="hr-performance-legend">
          <span class="hr-performance-legend__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
            </svg>
          </span>
          عندما لا تظهر نسبة الهدف، يعني أن النظام لم يستلم حقل هدف لهذا الفريق بعد.
        </p>

        <div v-if="isLoading && (!performanceData.teams || performanceData.teams.length === 0)" class="hr-performance-loading">
          <div class="hr-performance-loading__spinner" />
          <p>جاري تحميل بيانات الفرق…</p>
        </div>
        <div v-else-if="!performanceData.teams || performanceData.teams.length === 0" class="hr-performance-empty">
          <div class="hr-performance-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 6-7" />
            </svg>
          </div>
          <p class="hr-performance-empty__title">لا توجد فرق</p>
          <p class="hr-performance-empty__desc">جرّب تغيير الفترة أو التحقق من اتصال الخادم.</p>
        </div>
        <div v-else class="table-responsive hr-performance-table-wrap">
          <table class="hr-performance-table table-mobile-stacked">
            <thead>
              <tr>
                <th scope="col">الفريق</th>
                <th scope="col">تحقيق الهدف</th>
                <th scope="col">متوسط مبيعات الموظف</th>
                <th scope="col">المشاريع</th>
                <th scope="col">الأعضاء</th>
                <th scope="col">التقييم</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in performanceData.teams" :key="team.id != null ? String(team.id) : team.name">
                <td data-label="الفريق">
                  <span class="hr-performance-table__team">{{ team.name }}</span>
                </td>
                <td data-label="تحقيق الهدف">
                  <div v-if="team.hasGoalData" class="hr-performance-goal">
                    <span class="hr-performance-goal__pct">{{ formatPct(team.goalProgress) }}%</span>
                    <div class="hr-performance-goal__track">
                      <div class="hr-performance-goal__fill" :style="{ width: team.goalProgress + '%' }" />
                    </div>
                  </div>
                  <span v-else class="hr-performance-goal--empty" title="لا يوجد هدف مسجّل لهذا الفريق">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" stroke-linecap="round" />
                    </svg>
                    غير متوفر
                  </span>
                </td>
                <td data-label="متوسط المبيعات">
                  <span class="hr-performance-table__num">{{ formatSales(team.salesAverage) }}</span>
                  <span class="hr-performance-table__unit">وحدة</span>
                </td>
                <td data-label="المشاريع">
                  <span class="hr-performance-table__num hr-performance-table__num--soft">{{ team.projectsCount }}</span>
                </td>
                <td data-label="الأعضاء">
                  <span class="hr-performance-table__num hr-performance-table__num--soft">{{ team.membersCount }}</span>
                </td>
                <td data-label="التقييم">
                  <span
                    class="hr-performance-eval"
                    :class="{
                      'hr-performance-eval--excellent': team.status === 'excellent',
                      'hr-performance-eval--good': team.status === 'good',
                      'hr-performance-eval--warn': team.status === 'needs_improvement',
                      'hr-performance-eval--muted': team.status === 'neutral',
                    }"
                    :title="evalTitle(team)"
                  >
                    <template v-if="team.status === 'neutral'">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" stroke-linecap="round" />
                      </svg>
                      <span>لم يُحدد</span>
                    </template>
                    <template v-else>
                      {{ team.statusLabel }}
                    </template>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useHRPerformance } from '@/composables/hr/useHRPerformance';

const {
  performanceData,
  loadTeamPerformance,
  isLoading,
  periodYear,
  periodMonth,
} = useHRPerformance();

const yearOptions = computed(() => {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2];
});

const hasAnyMissingGoal = computed(() => {
  const teams = performanceData.teams;
  if (!Array.isArray(teams) || teams.length === 0) return false;
  return teams.some(t => t && !t.hasGoalData);
});

function monthLabel(m) {
  const names = [
    '',
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
  return names[m] ?? m;
}

function formatPct(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '0';
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, '');
}

function formatSales(n) {
  const v = Number(n);
  if (Number.isNaN(v) || v === 0) return '0';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2).replace(/\.?0+$/, '');
}

function evalTitle(team) {
  if (team.status === 'neutral') return 'لم يُضف هدف للفريق في النظام';
  return team.statusLabel;
}

onMounted(() => {
  loadTeamPerformance();
});
</script>

<style scoped src="./styles/HRPerformanceTab.scoped.css"></style>
