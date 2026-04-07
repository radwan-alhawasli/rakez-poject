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
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px) saturate(170%);
  -webkit-backdrop-filter: blur(20px) saturate(170%);
  border-radius: 24px;
  border: 1px solid rgba(181, 169, 154, 0.15);
  box-shadow: 0 15px 45px -10px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  min-height: 120px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.luxury-stat-card--clickable {
  cursor: pointer;
}

.luxury-stat-card:hover {
  background: rgba(181, 169, 154, 0.08);
  transform: translateY(-8px) scale(1.02);
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 20px 60px rgba(181, 169, 154, 0.15);
}

.luxury-stat-card__accent {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--color-gold, #b5a99a), transparent);
  opacity: 0.6;
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
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.luxury-stat-card__value {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 900;
  color: var(--color-gold, #b5a99a);
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;
  direction: ltr;
  unicode-bidi: embed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.luxury-stat-card__desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  line-height: 1.35;
}

.luxury-stat-card__icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(181, 169, 154, 0.15) 0%, transparent 70%);
  border: 1px solid rgba(181, 169, 154, 0.1);
  color: var(--color-gold, #b5a99a);
  flex-shrink: 0;
  filter: drop-shadow(0 0 10px rgba(181, 169, 154, 0.3));
}

.luxury-stat-card__icon :deep(svg) {
  width: 28px;
  height: 28px;
}
</style>
