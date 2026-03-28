<template>
  <div class="donut-kpi-widget">
    <p v-if="!hasRenderableData" class="donut-kpi-widget__empty">لا توجد بيانات للعرض</p>
    <div v-else class="donut-kpi-widget__layout">
      <VisSingleContainer :data="chartSegments" :height="height" class="donut-kpi-widget__vis">
        <VisDonut
          :value="(d) => d.value"
          :color="segmentColors"
          :arc-width="arcWidth"
          :central-label="centralLabelResolved"
          :central-sub-label="centralSubLabelResolved"
        />
      </VisSingleContainer>
      <ul class="donut-kpi-widget__legend" aria-label="أسطورة المخطط">
        <li v-for="(row, i) in legendRows" :key="i">
          <span class="donut-kpi-widget__dot" :style="{ background: row.color }" />
          <span class="donut-kpi-widget__legend-label">{{ row.label }}</span>
          <span class="donut-kpi-widget__legend-val">{{ formatNumber(row.value) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { VisSingleContainer, VisDonut } from '@unovis/vue';
import { useFormatters } from '@/composables/useFormatters';
import { defaultWidgetColors } from '@/utils/dashboardData';

const props = defineProps({
  /** { label, value, color? }[] — values must be >= 0 */
  segments: {
    type: Array,
    default: () => [],
  },
  height: { type: Number, default: 200 },
  arcWidth: { type: Number, default: 20 },
  /** Override center label (default: sum of values as integer) */
  centralLabel: { type: String, default: '' },
  centralSubLabel: { type: String, default: '' },
});

const { formatNumber } = useFormatters();

const chartSegments = computed(() => {
  const list = (props.segments || [])
    .filter((s) => s && (Number(s.value) > 0 || s.value === 0))
    .map((s, i) => ({
      label: String(s.label ?? ''),
      value: Math.max(0, Number(s.value) || 0),
      color: s.color || defaultWidgetColors[i % defaultWidgetColors.length],
    }));
  return list.filter((s) => s.value > 0);
});

const hasRenderableData = computed(() => chartSegments.value.length > 0);

const total = computed(() => chartSegments.value.reduce((a, s) => a + s.value, 0));

const centralLabelResolved = computed(() =>
  props.centralLabel || (total.value ? formatNumber(Math.round(total.value)) : '')
);

const centralSubLabelResolved = computed(() => props.centralSubLabel || '');

const segmentColors = computed(() =>
  chartSegments.value.map((s, i) => s.color || defaultWidgetColors[i % defaultWidgetColors.length])
);

const legendRows = computed(() => chartSegments.value);
</script>

<style scoped>
.donut-kpi-widget__empty {
  margin: 0;
  padding: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.donut-kpi-widget__layout {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(120px, 1.1fr);
  gap: 12px;
  align-items: center;
}

@media (max-width: 520px) {
  .donut-kpi-widget__layout {
    grid-template-columns: 1fr;
  }
}

.donut-kpi-widget__vis {
  min-height: 160px;
}

.donut-kpi-widget__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.donut-kpi-widget__legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: rgba(241, 245, 249, 0.92);
}

.donut-kpi-widget__dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.donut-kpi-widget__legend-label {
  flex: 1;
  text-align: right;
  min-width: 0;
}

.donut-kpi-widget__legend-val {
  direction: ltr;
  unicode-bidi: embed;
  font-weight: 700;
  color: var(--color-gold-light, #c5baad);
}
</style>
