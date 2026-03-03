<script setup>
import { DialogRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  open: { type: Boolean, required: false },
  defaultOpen: { type: Boolean, required: false },
  modal: { type: Boolean, required: false },
});
var emits = defineEmits(['update:open']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
