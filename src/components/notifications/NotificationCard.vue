<template>
  <div
    class="rakez-notification-card"
    :class="{ 'rakez-notification-card--unread': !notification.read }"
    @click="$emit('view', notification)"
  >
    <div class="rakez-notification-card__icon" :class="iconClass">
      <svg v-if="iconType === 'success'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      <svg v-else-if="iconType === 'warning'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <svg v-else-if="iconType === 'error'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
    </div>

    <div class="rakez-notification-card__body">
      <span class="rakez-notification-card__title">{{ notification.title || 'إشعار' }}</span>
      <div class="rakez-notification-card__meta">
        <span class="rakez-notification-card__type-badge">{{ typeLabel }}</span>
        <span class="rakez-notification-card__date">{{ dateFormatted }}</span>
        <span
          class="rakez-notification-card__status"
          :class="notification.read ? 'rakez-notification-card__status--read' : 'rakez-notification-card__status--unread'"
        >
          {{ notification.read ? 'مقروء' : 'غير مقروء' }}
        </span>
      </div>
    </div>

    <div class="rakez-notification-card__actions" @click.stop>
      <button type="button" @click="$emit('view', notification)" title="عرض التفاصيل">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        عرض
      </button>
      <button v-if="!notification.read" type="button" @click="$emit('mark-read', notification.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        مقروء
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  notification: { type: Object, required: true },
  typeLabel: { type: String, default: 'عام' },
  dateFormatted: { type: String, default: '' },
});

defineEmits(['view', 'mark-read']);

const ICON_TYPES = ['success', 'warning', 'error', 'info'];

const iconType = computed(() => {
  const t = props.notification.type;
  if (ICON_TYPES.includes(t)) return t;
  if (t?.includes('cancel') || t?.includes('error')) return 'error';
  if (t?.includes('confirm') || t?.includes('received') || t?.includes('vacated')) return 'success';
  if (t?.includes('reserved') || t?.includes('commission')) return 'warning';
  return 'info';
});

const iconClass = computed(() => `rakez-notification-card__icon--${iconType.value}`);
</script>
