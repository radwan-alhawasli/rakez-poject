<template>
  <div :class="wrapperClass" role="status" :aria-label="text || 'جاري التحميل'">
    <div :class="spinnerClass"></div>
    <span v-if="text" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'gold', 'inline'].includes(v),
  },
  text: {
    type: String,
    default: '',
  },
  fullPage: {
    type: Boolean,
    default: false,
  },
});

const wrapperClass = computed(() => {
  if (props.variant === 'inline') {
    return 'loading-state-inline';
  }
  return props.fullPage ? 'loading-state loading-state--full' : 'loading-state';
});

const spinnerClass = computed(() => {
  const base = 'spinner';
  const sizeMap = { sm: 'spinner--sm', md: '', lg: 'spinner--lg' };
  const variantMap = { gold: 'spinner-gold', default: '', inline: 'spinner-small' };
  return [base, sizeMap[props.size], variantMap[props.variant]].filter(Boolean).join(' ');
});

const textClass = computed(() => 'loading-text');
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.75rem;
}

.loading-state--full {
  min-height: 300px;
}

.loading-state-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold, #b1a28f);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner--sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner--lg {
  width: 56px;
  height: 56px;
  border-width: 4px;
}

.spinner-gold {
  border-color: rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold, #b1a28f);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
}

.loading-text {
  font-size: 0.875rem;
  color: var(--color-medium-gray, #888);
  font-family: 'Cairo', sans-serif;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
