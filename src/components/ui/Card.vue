<template>
  <div :class="cardClasses" v-bind="$attrs">
    <slot />
  </div>
</template>

<script>
import { cn } from '@/lib/utils';

export default {
  name: 'UiCard',
  inheritAttrs: false,
  props: {
    class: { type: [String, Object, Array], default: '' },
  },
  computed: {
    cardClasses() {
      return cn('card-luxury', this.class);
    },
  },
};
</script>
