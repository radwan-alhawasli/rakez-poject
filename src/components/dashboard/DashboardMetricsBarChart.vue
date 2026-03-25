<template>
  <div
    class="dashboard-metrics-bar-chart chart-placeholder"
    :style="{ minHeight: `${Math.max(height, 200)}px` }"
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
.dashboard-metrics-bar-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.chart-empty {
  margin: 0;
  padding: 24px;
  font-size: 14px;
  color: var(--color-dark-gray, #64748b);
  text-align: center;
}
</style>
