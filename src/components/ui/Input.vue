<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="inputClasses"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
import { cn } from '@/lib/utils';

export default {
  name: 'UiInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Object, Array], default: '' },
  },
  emits: ['update:modelValue'],
  computed: {
    inputClasses() {
      return cn('form-input', 'input-luxury', this.class);
    },
  },
};
</script>
