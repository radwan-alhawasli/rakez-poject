<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-footer shrink-0 border-t border-sidebar-border/10 p-4', props.class)">
    <slot />
  </div>
</template>
