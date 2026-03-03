<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-group-label text-sidebar-foreground/70 px-2 text-xs font-medium', props.class)">
    <slot />
  </div>
</template>
