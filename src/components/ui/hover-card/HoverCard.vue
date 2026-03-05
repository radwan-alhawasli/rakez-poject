<script setup>
import { HoverCardRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  defaultOpen: { type: Boolean, required: false },
  open: { type: Boolean, required: false },
  openDelay: { type: Number, required: false },
  closeDelay: { type: Number, required: false },
});
var emits = defineEmits(['update:open']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <HoverCardRoot v-bind="forwarded">
    <slot />
  </HoverCardRoot>
</template>
