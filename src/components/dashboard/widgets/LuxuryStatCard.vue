<template>
  <article
    class="luxury-stat-card"
    :class="{ 'luxury-stat-card--clickable': clickable }"
    role="article"
    @click="clickable && $emit('click')"
  >
    <div class="luxury-stat-card__accent" aria-hidden="true" />
    <div class="luxury-stat-card__inner">
      <div class="luxury-stat-card__text">
        <span class="luxury-stat-card__label">{{ label }}</span>
        <span class="luxury-stat-card__value" :title="String(displayValue)">{{ displayValue }}</span>
        <span v-if="description" class="luxury-stat-card__desc">{{ description }}</span>
      </div>
      <div v-if="$slots.icon" class="luxury-stat-card__icon">
        <slot name="icon" />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  /** Shown as main figure — string or number */
  value: { type: [String, Number], default: '' },
  description: { type: String, default: '' },
  clickable: { type: Boolean, default: false },
});

defineEmits(['click']);

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '—';
  return props.value;
});
</script>

<style scoped>
.luxury-stat-card {
  position: relative;
  background: linear-gradient(135deg, var(--color-white, #fff) 0%, var(--color-off-white, #fdfbf7) 100%);
  border-radius: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  min-height: 120px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.2s ease;
}

.luxury-stat-card--clickable {
  cursor: pointer;
}

.luxury-stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 16px 40px -12px rgba(177, 162, 143, 0.18), 0 6px 16px rgba(30, 58, 95, 0.08);
}

.luxury-stat-card__accent {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, var(--color-navy-dark, #1a2636), var(--color-navy, #27374d));
}

.luxury-stat-card__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 22px;
}

.luxury-stat-card__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  min-width: 0;
  flex: 1;
}

.luxury-stat-card__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  line-height: 1.35;
}

.luxury-stat-card__value {
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-weight: 800;
  color: var(--color-charcoal, #1e293b);
  line-height: 1.15;
  letter-spacing: -0.02em;
  direction: ltr;
  unicode-bidi: embed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.luxury-stat-card__desc {
  font-size: 0.75rem;
  color: var(--color-dark-gray, #64748b);
  line-height: 1.35;
}

.luxury-stat-card__icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 30%, rgba(177, 162, 143, 0.2), rgba(39, 55, 77, 0.06));
  color: var(--color-gold, #b5a99a);
  flex-shrink: 0;
}

.luxury-stat-card__icon :deep(svg) {
  width: 26px;
  height: 26px;
}
</style>
