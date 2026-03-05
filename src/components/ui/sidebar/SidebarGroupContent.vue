<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-group-content flex flex-col gap-0.5', props.class)">
    <slot />
  </div>
</template>
