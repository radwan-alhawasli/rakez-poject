<script setup>
import { DialogClose } from 'radix-vue';

var props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
});
</script>

<template>
  <DialogClose v-bind="props">
    <slot />
  </DialogClose>
</template>
