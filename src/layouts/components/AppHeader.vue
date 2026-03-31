<template>
  <header class="top-header">
    <div class="header-left">
      <SidebarTrigger />
    <button class="back-btn" @click="$router.back()">
      <svg
        class="arrow-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
    <div ref="notificationWrapperRef" class="notification-wrapper">
      <button class="notification-btn" @click="$emit('toggle-notifications')">
        <svg
          class="bell-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>
  
      <Teleport to="body">
        <div
          v-if="showNotifications"
          ref="dropdownRef"
          class="notifications-dropdown notifications-dropdown-teleport"
          :style="dropdownPositionStyle"
        >
          <div class="notifications-panel-bar"></div>
          <div class="notifications-header">
            <h3 class="notifications-title">الإشعارات</h3>
            <button v-if="unreadCount > 0" type="button" @click="$emit('mark-all-read')" class="mark-read-btn">
              تعيين الكل كمقروء
            </button>
          </div>
          <div class="notifications-list custom-scrollbar">
            <div v-if="notifications.length === 0" class="no-notifications">
              <div class="no-notifications-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <p>لا يوجد إشعارات جديدة</p>
            </div>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="['notification-item', { unread: !notification.read }]"
              @click="$emit('mark-as-read', notification.id)"
            >
              <div class="notification-icon-bg" :class="notification.type || 'info'">
                <svg
                  v-if="notification.type === 'success'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg
                  v-else-if="notification.type === 'warning'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  ></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div class="notification-content">
                <div class="notification-text">{{ notification.title }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
              <div v-if="!notification.read" class="unread-dot"></div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
  <div class="header-right">
    <div class="logo">
      <span class="logo-ar">راكز العقارية</span>
      <span class="logo-sep">|</span>
      <span class="logo-en">Rakez Real Estate</span>
      <div class="logo-icon-bg"></div>
    </div>
  </div>
  </header>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { SidebarTrigger } from '@/components/ui/sidebar';

const props = defineProps({
  notifications: { type: Array, default: () => [] },
  showNotifications: { type: Boolean, default: false },
  unreadCount: { type: Number, default: 0 },
});

const emit = defineEmits(['toggle-notifications', 'mark-as-read', 'mark-all-read']);

const notificationWrapperRef = ref(null);
const dropdownRef = ref(null);
const dropdownPositionStyle = ref({ position: 'fixed', top: '70px', right: '24px', zIndex: 9999 });

function handleClickOutside(e) {
  const wrapper = notificationWrapperRef.value;
  const dropdown = dropdownRef.value;
  if (!wrapper || !dropdown) return;
  if (wrapper.contains(e.target) || dropdown.contains(e.target)) return;
  emit('toggle-notifications');
}

watch(
  () => props.showNotifications,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      const el = notificationWrapperRef.value;
      if (el) {
        const rect = el.getBoundingClientRect();
        dropdownPositionStyle.value = {
          position: 'fixed',
          top: `${rect.bottom + 10}px`,
          right: `${window.innerWidth - rect.right}px`,
          zIndex: 9999,
        };
      }
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style src="./styles/AppHeader.global.s1.css"></style>
<style src="./styles/AppHeader.global.s2.css"></style>
