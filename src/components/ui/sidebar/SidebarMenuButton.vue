<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  asChild: { type: Boolean, default: false },
  isActive: { type: Boolean, default: undefined },
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <div
    :class="
      cn(
        'nav-item sidebar-menu-button flex items-center justify-center rounded-full w-11 h-11 mx-auto my-2 text-sm text-sidebar-foreground no-underline transition-all duration-400 border border-transparent',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        props.isActive && 'active',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
