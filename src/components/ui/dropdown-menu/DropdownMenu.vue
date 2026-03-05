<script setup>
import { DropdownMenuRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  defaultOpen: { type: Boolean, required: false },
  open: { type: Boolean, required: false },
  dir: { type: String, required: false },
  modal: { type: Boolean, required: false },
});
var emits = defineEmits(['update:open']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DropdownMenuRoot v-bind="forwarded">
    <slot />
  </DropdownMenuRoot>
</template>
