<template>
  <button
    type="button"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <slot v-else />
  </button>
</template>

<script>
import { cn } from '@/lib/utils';

export default {
  name: 'UiButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (v) =>
        ['primary', 'secondary', 'outline', 'navy', 'action'].includes(v),
    },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    class: { type: [String, Object, Array], default: '' },
  },
  computed: {
    buttonClasses() {
      const base =
        this.variant === 'primary'
          ? 'btn-primary'
          : this.variant === 'secondary'
            ? 'btn-secondary'
            : this.variant === 'outline'
              ? 'btn-luxury-outline'
              : this.variant === 'navy'
                ? 'btn-luxury-navy'
                : 'btn-action';
      return cn(base, this.class);
    },
  },
};
</script>

<style scoped>
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
