<template>
  <div class="dual-tile-kpi">
    <div class="dual-tile-kpi__tile dual-tile-kpi__tile--a">
      <span class="dual-tile-kpi__label">{{ leftLabel }}</span>
      <span class="dual-tile-kpi__value" :title="String(leftValue)">{{ leftValue }}</span>
      <span v-if="leftHint" class="dual-tile-kpi__hint">{{ leftHint }}</span>
    </div>
    <div class="dual-tile-kpi__tile dual-tile-kpi__tile--b">
      <span class="dual-tile-kpi__label">{{ rightLabel }}</span>
      <span class="dual-tile-kpi__value" :title="String(rightValue)">{{ rightValue }}</span>
      <span v-if="rightHint" class="dual-tile-kpi__hint">{{ rightHint }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  leftLabel: { type: String, required: true },
  leftValue: { type: [String, Number], required: true },
  leftHint: { type: String, default: '' },
  rightLabel: { type: String, required: true },
  rightValue: { type: [String, Number], required: true },
  rightHint: { type: String, default: '' },
});
</script>

<style scoped>
.dual-tile-kpi {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dual-tile-kpi__tile {
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: right;
  min-height: 100px;
}

.dual-tile-kpi__tile--a {
  background: linear-gradient(145deg, rgba(39, 55, 77, 0.55), rgba(26, 38, 54, 0.9));
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.dual-tile-kpi__tile--b {
  background: linear-gradient(145deg, rgba(181, 169, 154, 0.2), rgba(39, 55, 77, 0.35));
  border: 1px solid rgba(177, 162, 143, 0.18);
}

.dual-tile-kpi__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.75);
}

.dual-tile-kpi__value {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 800;
  color: #f8fafc;
  direction: ltr;
  unicode-bidi: embed;
  text-align: left;
}

.dual-tile-kpi__hint {
  font-size: 0.72rem;
  color: rgba(148, 163, 184, 0.85);
  line-height: 1.35;
}
</style>
