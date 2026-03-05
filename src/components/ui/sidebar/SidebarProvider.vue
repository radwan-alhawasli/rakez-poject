<script setup>
import { provide, onMounted, onUnmounted, computed } from 'vue';
import { createSidebarContext } from './useSidebar';

const props = defineProps({
  defaultOpen: { type: Boolean, default: true },
  defaultOpenMobile: { type: Boolean, default: false },
  /** Controlled: pass openMobile from parent */
  openMobile: { type: Boolean, default: undefined },
});

const emit = defineEmits(['update:openMobile', 'update:hovered']);

const ctx = createSidebarContext();
ctx.open.value = props.defaultOpen;
if (props.openMobile !== undefined) {
  ctx.openMobile.value = props.openMobile;
} else {
  ctx.openMobile.value = props.defaultOpenMobile;
}

onMounted(() => {
  ctx.updateMobile();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', ctx.updateMobile);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', ctx.updateMobile);
  }
});

const setOpenMobile = (v) => {
  if (props.openMobile !== undefined) {
    emit('update:openMobile', v);
  } else {
    ctx.openMobile.value = v;
  }
};

const openMobileRef = computed(() => props.openMobile !== undefined ? props.openMobile : ctx.openMobile.value);

const toggleSidebar = () => {
  if (ctx.isMobile.value) {
    setOpenMobile(!openMobileRef.value);
  } else {
    ctx.open.value = !ctx.open.value;
  }
};

provide(ctx.key, {
  state: ctx.state,
  open: ctx.open,
  setOpen: ctx.setOpen,
  openMobile: openMobileRef,
  setOpenMobile,
  isMobile: ctx.isMobile,
  toggleSidebar,
  hovered: ctx.hovered,
  setHovered: (v) => {
    ctx.setHovered(v);
    emit('update:hovered', v);
  },
});
</script>

<template>
  <div class="sidebar-provider flex min-h-screen w-full">
    <slot />
  </div>
</template>
