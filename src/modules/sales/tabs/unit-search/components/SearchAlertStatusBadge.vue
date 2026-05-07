<template>
  <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, default: '' },
});

const statusLabel = computed(() => {
  const s = String(props.status || '').toLowerCase();
  if (s === 'active') return 'نشط';
  if (s === 'paused') return 'متوقف مؤقتاً';
  if (s === 'matched') return 'تم التطابق ✓';
  if (s === 'cancelled') return 'ملغى';
  return props.status || '—';
});

const statusClass = computed(() => {
  const s = String(props.status || '').toLowerCase();
  if (s === 'active') return 'is-active';
  if (s === 'paused') return 'is-paused';
  if (s === 'matched') return 'is-matched';
  if (s === 'cancelled') return 'is-cancelled';
  return 'is-unknown';
});
</script>

