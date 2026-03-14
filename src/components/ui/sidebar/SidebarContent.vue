<script setup>
import { cn } from '@/lib/utils';
import SidebarScrollArea from './SidebarScrollArea.vue';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <!-- حل نهائي: تمرير مخصص overlay + إخفاء الشريط الأصلي → لا حركة أفقية -->
  <div :class="cn('sidebar-nav-outer flex-1 min-h-0 relative', props.class)">
    <SidebarScrollArea>
      <div class="sidebar-content sidebar-nav">
        <slot />
      </div>
    </SidebarScrollArea>
  </div>
</template>
