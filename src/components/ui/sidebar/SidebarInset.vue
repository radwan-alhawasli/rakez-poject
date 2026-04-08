<script setup>
import { useSidebar } from './useSidebar';
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});

const { isMobile, openMobile, hovered } = useSidebar();
</script>

<template>
  <div
    :class="
      cn(
        'main-wrapper flex min-h-0 flex-1 flex-col transition-[margin] duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
        !isMobile && hovered && 'sidebar-inset-expanded',
        isMobile && openMobile && 'sidebar-inset-mobile-open sidebar-open',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
