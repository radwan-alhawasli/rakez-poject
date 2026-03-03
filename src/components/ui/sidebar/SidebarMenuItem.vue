<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <li :class="cn('sidebar-menu-item list-none', props.class)">
    <slot />
  </li>
</template>
