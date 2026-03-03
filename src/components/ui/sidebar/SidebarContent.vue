<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div :class="cn('sidebar-content sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-[18px] px-2.5', props.class)">
    <slot />
  </div>
</template>
