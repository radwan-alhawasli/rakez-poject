<script setup>
/**
 * منطقة تمرير للوحة الجانبية: شريط تمرير مخصص فوق المحتوى (overlay)
 * لا يأخذ مساحة من التخطيط → لا حركة أفقية أبداً. قفل التمرير الأفقي.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

const scrollEl = ref(null);
const trackEl = ref(null);
const scrollTop = ref(0);
const scrollHeight = ref(0);
const clientHeight = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartScrollTop = ref(0);

const thumbRatio = computed(() => {
  if (clientHeight.value <= 0 || scrollHeight.value <= 0) return 1;
  return Math.min(1, clientHeight.value / scrollHeight.value);
});
const thumbHeight = computed(() => {
  const r = thumbRatio.value;
  const min = 40;
  return Math.max(min, Math.round(clientHeight.value * r));
});
const thumbTop = computed(() => {
  if (scrollHeight.value <= clientHeight.value) return 0;
  const range = scrollHeight.value - clientHeight.value;
  const trackH = clientHeight.value - thumbHeight.value;
  if (trackH <= 0) return 0;
  return (scrollTop.value / range) * trackH;
});

function updateScrollState() {
  if (!scrollEl.value) return;
  scrollTop.value = scrollEl.value.scrollTop;
  scrollHeight.value = scrollEl.value.scrollHeight;
  clientHeight.value = scrollEl.value.clientHeight;
}

function onScroll() {
  if (!scrollEl.value) return;
  scrollEl.value.scrollLeft = 0;
  scrollTop.value = scrollEl.value.scrollTop;
  scrollHeight.value = scrollEl.value.scrollHeight;
  clientHeight.value = scrollEl.value.clientHeight;
}

function onTrackClick(e) {
  if (!scrollEl.value || !trackEl.value) return;
  const rect = trackEl.value.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const pct = y / rect.height;
  const target = (scrollHeight.value - clientHeight.value) * pct;
  scrollEl.value.scrollTop = Math.max(0, target);
}

function startDrag(e) {
  e.preventDefault();
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartScrollTop.value = scrollEl.value?.scrollTop ?? 0;
}

function onMouseMove(e) {
  if (!isDragging.value || !scrollEl.value) return;
  const dy = e.clientY - dragStartY.value;
  const range = scrollHeight.value - clientHeight.value;
  if (range <= 0) return;
  const trackH = clientHeight.value - thumbHeight.value;
  const ratio = trackH > 0 ? dy / trackH : 0;
  const newTop = dragStartScrollTop.value + ratio * range;
  scrollEl.value.scrollTop = Math.max(0, Math.min(range, newTop));
}

function onMouseUp() {
  isDragging.value = false;
}

let resizeObserver = null;
onMounted(() => {
  updateScrollState();
  nextTick(updateScrollState);
  if (scrollEl.value) {
    resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scrollEl.value);
  }
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

onBeforeUnmount(() => {
  if (resizeObserver && scrollEl.value) resizeObserver.disconnect();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});
</script>

<template>
  <div class="sidebar-scroll-area">
    <div
      ref="scrollEl"
      class="sidebar-scroll-area-inner"
      @scroll="onScroll"
    >
      <slot />
    </div>
    <div
      v-if="scrollHeight > clientHeight"
      ref="trackEl"
      class="sidebar-scroll-track"
      @click="onTrackClick"
    >
      <div
        class="sidebar-scroll-thumb"
        :style="{ height: thumbHeight + 'px', transform: `translateY(${thumbTop}px)` }"
        @mousedown.prevent="startDrag"
      />
    </div>
  </div>
</template>

<style scoped>
.sidebar-scroll-area {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.sidebar-scroll-area-inner {
  flex: 1;
  min-height: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  overflow-x: clip;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 18px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-scroll-area-inner::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.sidebar-scroll-track {
  position: absolute;
  top: 18px;
  bottom: 18px;
  right: 4px;
  width: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  z-index: 2;
}
.sidebar-scroll-thumb {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  min-height: 40px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  cursor: grab;
  transition: background 0.2s;
}
.sidebar-scroll-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
.sidebar-scroll-thumb:active {
  cursor: grabbing;
}
</style>
