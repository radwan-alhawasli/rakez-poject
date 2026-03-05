<script setup>
import { useSidebar } from './useSidebar';
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});

const { toggleSidebar, openMobile, isMobile } = useSidebar();
</script>

<template>
  <button
    type="button"
    aria-label="فتح أو إغلاق القائمة الجانبية"
    :aria-expanded="isMobile ? openMobile : undefined"
    :class="cn('mobile-toggle inline-flex items-center justify-center rounded-md p-2 min-w-[44px] min-h-[44px] hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring', props.class)"
    @click="toggleSidebar"
  >
    <slot>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </slot>
  </button>
</template>
