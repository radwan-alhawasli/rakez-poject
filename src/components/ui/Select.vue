<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="selectClasses"
    v-bind="$attrs"
    @change="onChange"
  >
    <slot />
  </select>
</template>

<script>
import { cn } from '@/lib/utils';

export default {
  name: 'UiSelect',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: '' },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Object, Array], default: '' },
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    selectClasses() {
      return cn('form-input', 'input-luxury', this.class);
    },
  },
  methods: {
    onChange(e) {
      const val = e.target.value;
      this.$emit('update:modelValue', val);
      this.$emit('change', e);
    },
  },
};
</script>
