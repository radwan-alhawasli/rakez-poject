<template>
  <div class="hr-performance-view">
    <div class="hr-performance-shell">
      <header class="hr-performance-shell__head">
        <div class="hr-performance-shell__head-row">
          <div class="hr-performance-shell__brand">
            <span class="hr-performance-shell__kicker">الموارد البشرية</span>
            <h1 class="hr-performance-shell__title">أداء المسوقين</h1>
          </div>
          <div class="hr-performance-shell__controls">
            <label class="hr-performance-field">
              <span class="hr-performance-field__label">السنة (year)</span>
              <select v-model.number="periodYear" class="hr-performance-field__input">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </label>
            <label class="hr-performance-field">
              <span class="hr-performance-field__label">الشهر (month)</span>
              <select v-model.number="periodMonth" class="hr-performance-field__input">
                <option v-for="m in 12" :key="m" :value="m">{{ monthLabel(m) }}</option>
              </select>
            </label>
            <label class="hr-performance-field hr-performance-field--grow">
              <span class="hr-performance-field__label">بحث بالاسم (search)</span>
              <input
                v-model.trim="marketerSearchQuery"
                type="search"
                class="hr-performance-field__input hr-performance-field__input--text"
                placeholder="اسم الموظف…"
                autocomplete="off"
                @keydown.enter.prevent="loadMarketerPerformance"
              />
            </label>
            <button
              type="button"
              class="hr-performance-shell__cta"
              :disabled="isLoading"
              @click="loadMarketerPerformance"
            >
              <span v-if="isLoading" class="hr-performance-shell__cta-spin" aria-hidden="true" />
              <span>{{ isLoading ? 'جاري التحديث…' : 'تحديث البيانات' }}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="hr-performance-shell__body">
        <div class="hr-performance-query-summary" aria-live="polite">
          <span class="hr-performance-query-summary__label">معاملات الطلب المرسلة</span>
          <div class="hr-performance-query-summary__chips">
            <span class="hr-performance-chip"><em>year</em>={{ periodYear }}</span>
            <span class="hr-performance-chip"><em>month</em>={{ periodMonth }}</span>
            <span v-if="marketerSearchQuery.trim()" class="hr-performance-chip">
              <em>search</em>={{ marketerSearchQuery.trim() }}
            </span>
          </div>
          <span class="hr-performance-query-summary__hint">{{ periodReadable }}</span>
        </div>

        <div v-if="isLoading" class="hr-performance-loading">
          <div class="hr-performance-loading__spinner" />
          <p>جاري تحميل أداء المسوقين…</p>
        </div>
        <div v-else-if="loadError" class="hr-performance-empty hr-performance-empty--error">
          <div class="hr-performance-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" stroke-linecap="round" />
            </svg>
          </div>
          <p class="hr-performance-empty__title">{{ loadError }}</p>
          <p class="hr-performance-empty__desc">تحقق من الاتصال أو الصلاحيات ثم اضغط «تحديث البيانات».</p>
        </div>
        <div
          v-else-if="!marketerPerformanceData || marketerPerformanceData.length === 0"
          class="hr-performance-empty"
        >
          <div class="hr-performance-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 6-7" />
            </svg>
          </div>
          <p class="hr-performance-empty__title">لا توجد بيانات مسوقين</p>
          <p class="hr-performance-empty__desc">
            لا توجد صفوف للفترة المختارة، أو لا يوجد مسوقون مطابقون لمعايير البحث.
          </p>
        </div>
        <div v-else class="table-responsive hr-performance-table-wrap">
          <table class="hr-performance-table table-mobile-stacked">
            <thead>
              <tr>
                <th scope="col">اسم الموظف</th>
                <th scope="col">نسبة تحقيق الأهداف</th>
                <th scope="col">عدد الودائع</th>
                <th scope="col">عدد التحذيرات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(marketer, idx) in marketerPerformanceData" :key="marketer.id ?? `m-${idx}`">
                <td data-label="اسم الموظف">
                  <div class="hr-performance-table__user">
                    <div class="hr-performance-table__avatar" :title="marketer.name || ''">
                      {{ avatarLetter(marketer.name) }}
                    </div>
                    <div class="hr-performance-table__user-main">
                      <span class="hr-performance-table__name">{{ marketer.name || '—' }}</span>
                      <span
                        class="hr-performance-table__meta"
                        :class="{ 'hr-performance-table__meta--placeholder': !marketer.email }"
                      >
                        {{ marketer.email || 'البريد غير متوفر' }}
                      </span>
                      <span
                        v-if="marketer.phone"
                        class="hr-performance-table__meta hr-performance-table__meta--phone"
                        dir="ltr"
                      >
                        {{ marketer.phone }}
                      </span>
                      <div class="hr-performance-table__pills" aria-label="تفاصيل الموظف">
                        <span class="hr-performance-pill hr-performance-pill--team" :title="teamTitle(marketer)">
                          {{ teamDisplay(marketer) }}
                        </span>
                        <span
                          class="hr-performance-pill hr-performance-pill--role"
                          :title="roleTitle(marketer)"
                        >
                          {{ roleDisplay(marketer) }}
                        </span>
                        <span v-if="marketer.isManager" class="hr-performance-pill hr-performance-pill--mgr">
                          مدير
                        </span>
                        <span
                          v-if="marketer.isActive !== null"
                          class="hr-performance-pill"
                          :class="
                            marketer.isActive ? 'hr-performance-pill--on' : 'hr-performance-pill--off'
                          "
                        >
                          {{ marketer.isActive ? 'نشط' : 'غير نشط' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td data-label="نسبة تحقيق الأهداف">
                  <div class="hr-performance-goal">
                    <span class="hr-performance-goal__pct">{{ formatGoalPct(marketer.goalAchievement) }}%</span>
                    <div class="hr-performance-goal__track">
                      <div
                        class="hr-performance-goal__fill"
                        :style="{
                          width: Math.min(100, Math.max(0, Number(marketer.goalAchievement) || 0)) + '%',
                        }"
                      />
                    </div>
                  </div>
                </td>
                <td data-label="عدد الودائع">
                  <span
                    class="hr-performance-badge hr-performance-badge--deposits"
                    :title="depositsTooltip(marketer)"
                  >
                    {{ marketer.depositsCount ?? 0 }}
                  </span>
                </td>
                <td data-label="عدد التحذيرات">
                  <span
                    class="hr-performance-badge hr-performance-badge--warnings"
                    :title="warningsTooltip(marketer)"
                  >
                    {{ marketer.warningsCount ?? 0 }}
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
import { getRoleLabel } from '@/constants/roles';
import { useHRPerformance } from '@/composables/hr/useHRPerformance';

const {
  marketerPerformanceData,
  loadMarketerPerformance,
  error,
  isLoading,
  periodYear,
  periodMonth,
  marketerSearchQuery,
} = useHRPerformance();

const loadError = computed(() => error.value || '');

const yearOptions = computed(() => {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2];
});

const periodReadable = computed(() => {
  const m = periodMonth.value;
  const y = periodYear.value;
  return `عرض تقويمي: ${monthLabel(m)} ${y}`;
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

function formatGoalPct(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return '0';
  return (Math.round(n * 100) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function avatarLetter(name) {
  const s = (name || '').trim();
  if (!s) return '؟';
  return s.charAt(0);
}

function teamDisplay(m) {
  const t = m.teamName?.trim();
  if (t) return t;
  return 'بدون فريق';
}

function teamTitle(m) {
  return m.teamName?.trim() ? `الفريق: ${m.teamName}` : 'لم يُعيَّن لفريق في البيانات';
}

function roleDisplay(m) {
  const t = m.roleType;
  if (t != null && String(t).trim() !== '') {
    return getRoleLabel(t, m.isManager);
  }
  if (m.jobTitle?.trim()) return m.jobTitle.trim();
  return 'الدور غير محدد';
}

function roleTitle(m) {
  if (m.roleType) return `نوع الحساب (type): ${m.roleType}`;
  if (m.jobTitle?.trim()) return `المسمى الوظيفي: ${m.jobTitle}`;
  return 'لم تُرسل حقول النوع أو المسمى الوظيفي';
}

function depositsTooltip(m) {
  const n = m.depositsCount ?? 0;
  return n === 0
    ? 'لا توجد ودائع مسجّلة لهذه الفترة في الاستجابة'
    : `عدد الودائع (deposits_count): ${n}`;
}

function warningsTooltip(m) {
  const n = m.warningsCount ?? 0;
  if (n === 0) {
    return 'لا توجد تحذيرات (warnings_count = 0)';
  }
  const list = Array.isArray(m.warningsList) ? m.warningsList : [];
  const bits = list
    .slice(0, 8)
    .map(w => {
      if (w == null || typeof w !== 'object') return null;
      const t = w.reason ?? w.message ?? w.title ?? w.note ?? w.description;
      if (t != null && String(t).trim() !== '') return String(t).trim();
      if (w.id != null) return `#${w.id}`;
      return null;
    })
    .filter(Boolean);
  if (bits.length) return bits.join(' — ');
  return `عدد التحذيرات: ${n}${list.length ? '' : ' (تفاصيل غير مرفقة في الاستجابة)'}`;
}

onMounted(() => {
  loadMarketerPerformance();
});
</script>

<style scoped src="./styles/HREmployeePerformanceTab.scoped.css"></style>
