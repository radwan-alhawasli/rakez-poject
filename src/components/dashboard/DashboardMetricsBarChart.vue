<template>
  <div
    class="dashboard-metrics-bar-chart"
    :style="{ minHeight: `${Math.max(height, 160)}px` }"
  >
    <VisXYContainer
      v-if="normalizedSeries.length > 0"
      :data="normalizedSeries"
      :height="height"
      :style="{ width: '100%' }"
    >
      <VisGroupedBar
        :x="(_, i) => i"
        :y="barAccessors"
        :color="barColorsResolved"
        :roundedCorners="4"
        :barPadding="0.2"
      />
      <VisAxis type="x" :tickFormat="xTickFormat" :gridLine="false" />
      <VisAxis type="y" :gridLine="true" />
      <VisTooltip />
    </VisXYContainer>
    <p v-else class="chart-empty">لا توجد بيانات للعرض</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue';

const props = defineProps({
  /** Array of { label: string, value: number } from API-driven metrics */
  series: {
    type: Array,
    default: () => [],
  },
  height: {
    type: Number,
    default: 240,
  },
  /** Single bar color or array per series index */
  barColor: {
    type: [String, Array],
    default: '#b1a28f',
  },
});

const normalizedSeries = computed(() =>
  (props.series || [])
    .filter((s) => s != null && s.label != null && s.label !== '')
    .map((s) => ({
      label: String(s.label ?? ''),
      value: Number(s.value) || 0,
    }))
);

const barAccessors = [(d) => d.value];

/** Match @unovis/vue VisGroupedBar :color — array of CSS colors */
const barColorsResolved = computed(() => {
  const c = props.barColor;
  const n = Math.max(normalizedSeries.value.length, 1);
  if (Array.isArray(c) && c.length) {
    return Array.from({ length: n }, (_, i) => c[i % c.length]);
  }
  const single = typeof c === 'string' ? c : '#b1a28f';
  return [single];
});

const xTickFormat = (i) => normalizedSeries.value[i]?.label ?? '';
</script>

<style scoped>
/* No global .chart-placeholder — keeps chart flush with dark/glass panels */
.dashboard-metrics-bar-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 12px;
  box-sizing: border-box;
}

.dashboard-metrics-bar-chart :deep(.vis-xy-container) {
  background: transparent;
}

.chart-empty {
  margin: 0;
  padding: 16px;
  font-size: 0.875rem;
  color: rgba(148, 163, 184, 0.95);
  text-align: center;
}
</style>
