<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-group flex flex-col gap-1', props.class)">
    <slot />
  </div>
</template>
