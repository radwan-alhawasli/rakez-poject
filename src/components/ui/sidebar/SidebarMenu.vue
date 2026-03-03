<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <ul :class="cn('sidebar-menu flex flex-col gap-1.5', props.class)">
    <slot />
  </ul>
</template>
