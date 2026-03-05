<script setup>
import { PopoverRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  defaultOpen: { type: Boolean, required: false },
  open: { type: Boolean, required: false },
  modal: { type: Boolean, required: false },
});
var emits = defineEmits(['update:open']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <PopoverRoot v-bind="forwarded">
    <slot />
  </PopoverRoot>
</template>
