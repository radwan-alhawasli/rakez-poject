<template>
  <div v-if="show" class="notifications-dropdown" v-click-outside="() => $emit('close')">
    <div class="notifications-header">
      <h3 class="notifications-title">الإشعارات</h3>
      <button class="btn-mark-all" @click="$emit('mark-all-read')">تحديد الكل كمقروء</button>
    </div>
    <div class="notifications-list custom-scrollbar">
      <div v-if="notifications.length === 0" class="no-notifications">
        <p>لا توجد إشعارات جديدة</p>
      </div>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read }"
        @click="$emit('item-click', notification)"
      >
        <div class="notification-icon-bg" :class="notification.type">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-text">{{ notification.title }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] },
});

defineEmits(['close', 'mark-all-read', 'item-click']);
</script>
