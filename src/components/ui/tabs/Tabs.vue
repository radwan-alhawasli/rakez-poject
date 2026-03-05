<script setup>
import { TabsRoot, useForwardPropsEmits } from 'radix-vue';

var props = defineProps({
  defaultValue: { type: null, required: false },
  orientation: { type: String, required: false },
  dir: { type: String, required: false },
  activationMode: { type: String, required: false },
  modelValue: { type: null, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
});
var emits = defineEmits(['update:modelValue']);

var forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
