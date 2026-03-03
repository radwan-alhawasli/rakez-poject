<script setup>
import { ContextMenuRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  dir: { type: String, required: false },
  modal: { type: Boolean, required: false },
});
var emits = defineEmits(['update:open']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ContextMenuRoot v-bind="forwarded">
    <slot />
  </ContextMenuRoot>
</template>
