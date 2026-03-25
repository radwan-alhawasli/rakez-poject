<template>
  <div class="area-trend-widget">
    <p v-if="!hasEnoughPoints" class="area-trend-widget__empty">{{ emptyMessage }}</p>
    <VisXYContainer
      v-else
      :data="normalized"
      :height="height"
      :style="{ width: '100%' }"
      class="area-trend-widget__chart"
    >
      <VisArea
        :x="(d) => d.x"
        :y="(d) => d.y"
        color="var(--color-gold, #b5a99a)"
        :opacity="0.35"
        curve-type="MonotoneX"
      />
      <VisLine
        :x="(d) => d.x"
        :y="(d) => d.y"
        color="var(--color-navy-light, #364a62)"
        curve-type="MonotoneX"
      />
      <VisAxis type="x" :tick-format="xTickFormat" :grid-line="false" />
      <VisAxis type="y" :grid-line="true" />
      <VisTooltip />
    </VisXYContainer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { VisXYContainer, VisArea, VisLine, VisAxis, VisTooltip } from '@unovis/vue';

const props = defineProps({
  /** Points from API: { x?: number, y: number, label?: string }[] — x optional (uses index) */
  points: {
    type: Array,
    default: () => [],
  },
  height: { type: Number, default: 220 },
  emptyMessage: { type: String, default: 'لا تتوفر سلسلة زمنية من الـ API' },
});

const normalized = computed(() => {
  const raw = props.points || [];
  return raw
    .map((p, i) => {
      const y = Number(p?.y ?? p?.value);
      if (Number.isNaN(y)) return null;
      const x = p?.x != null && !Number.isNaN(Number(p.x)) ? Number(p.x) : i;
      return {
        x,
        y,
        label: p?.label != null ? String(p.label) : String(i),
      };
    })
    .filter(Boolean);
});

const hasEnoughPoints = computed(() => normalized.value.length >= 2);

const labelByX = computed(() => {
  const m = new Map();
  normalized.value.forEach((d) => m.set(d.x, d.label));
  return m;
});

const xTickFormat = (x) => labelByX.value.get(x) ?? String(x);
</script>

<style scoped>
.area-trend-widget__empty {
  margin: 0;
  padding: 24px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.area-trend-widget__chart {
  display: block;
}
</style>
