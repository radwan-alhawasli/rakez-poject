<template>
  <div class="progress-breakdown">
    <p v-if="!rows.length" class="progress-breakdown__empty">لا توجد بيانات</p>
    <ul v-else class="progress-breakdown__list">
      <li v-for="(row, i) in rowsNormalized" :key="i">
        <div class="progress-breakdown__row-head">
          <span class="progress-breakdown__label">{{ row.label }}</span>
          <span class="progress-breakdown__value">{{ formatDisplay(row) }}</span>
        </div>
        <div class="progress-breakdown__track" role="presentation">
          <div
            class="progress-breakdown__fill"
            :style="{ width: row.pct + '%', background: row.color }"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import { defaultWidgetColors } from '@/utils/dashboardData';

const props = defineProps({
  /** { label, value, color? }[] */
  rows: {
    type: Array,
    default: () => [],
  },
  valueType: {
    type: String,
    default: 'number',
    validator: (v) => ['number', 'currency'].includes(v),
  },
});

const { formatNumber, formatCurrencyAr } = useFormatters();

const totalPositive = computed(() =>
  (props.rows || []).reduce((a, r) => a + Math.max(0, Number(r?.value) || 0), 0)
);

const rowsNormalized = computed(() => {
  const t = totalPositive.value || 1;
  return (props.rows || []).map((r, i) => {
    const v = Math.max(0, Number(r?.value) || 0);
    return {
      label: String(r?.label ?? ''),
      value: v,
      pct: Math.min(100, (v / t) * 100),
      color: r?.color || defaultWidgetColors[i % defaultWidgetColors.length],
    };
  });
});

function formatDisplay(row) {
  if (props.valueType === 'currency') return formatCurrencyAr(row.value);
  return formatNumber(row.value);
}
</script>

<style scoped>
.progress-breakdown__empty {
  margin: 0;
  padding: 16px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.progress-breakdown__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.progress-breakdown__row-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}

.progress-breakdown__label {
  font-size: 0.8125rem;
  color: rgba(241, 245, 249, 0.9);
  text-align: right;
}

.progress-breakdown__value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-gold-light, #c5baad);
  direction: ltr;
  unicode-bidi: embed;
}

.progress-breakdown__track {
  height: 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.5);
  overflow: hidden;
}

.progress-breakdown__fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}
</style>
