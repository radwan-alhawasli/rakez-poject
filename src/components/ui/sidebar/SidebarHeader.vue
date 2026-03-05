<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-header flex h-[70px] shrink-0 items-center border-b border-sidebar-border/10 bg-white/[0.02] px-4', props.class)">
    <slot />
  </div>
</template>
