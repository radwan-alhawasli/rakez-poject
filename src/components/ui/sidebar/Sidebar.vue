<script setup>
import { useSidebar } from './useSidebar';
import { cn } from '@/lib/utils';

const props = defineProps({
  side: { type: String, default: 'right' },
  collapsible: { type: String, default: 'icon' },
  class: { type: [String, Object, Array], default: '' },
});

const { openMobile, isMobile, hovered, setHovered } = useSidebar();

const isOpen = () => {
  if (isMobile.value) return openMobile.value;
  return true;
};
</script>

<template>
  <aside
    :class="
      cn(
        'sidebar sidebar-component fixed top-0 z-[var(--z-sidebar)] flex h-full flex-col overflow-hidden transition-[width,margin,opacity,transform] duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
        side === 'right' ? 'right-0' : 'left-0',
        isMobile && !openMobile && 'sidebar-closed-mobile',
        isMobile && openMobile && 'sidebar-open-mobile open',
        !isMobile && 'sidebar-desktop',
        props.class
      )
    "
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <slot />
  </aside>
</template>
