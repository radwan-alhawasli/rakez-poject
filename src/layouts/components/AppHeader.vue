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
    <button class="dark-mode-btn" :title="isDark ? 'الوضع الفاتح' : 'الوضع الداكن'" @click="toggleDarkMode">
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
    <div class="notification-wrapper">
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
  
      <div v-if="showNotifications" class="notifications-dropdown">
        <div class="notifications-header">
          <h3 class="notifications-title">الإشعارات</h3>
          <button v-if="unreadCount > 0" @click="$emit('mark-all-read')" class="mark-read-btn">
            تعيين الكل كمقروء
          </button>
        </div>
        <div class="notifications-list custom-scrollbar">
          <div v-if="notifications.length === 0" class="no-notifications">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.3"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <p>لا يوجد إشعارات جديدة</p>
          </div>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification-item', { unread: !notification.read }]"
            @click="$emit('mark-as-read', notification.id)"
          >
            <div class="notification-icon-bg" :class="notification.type">
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
    </div>
  </div>
  <div class="header-right">
    <div class="update-info">
      <div class="update-row">
        <span class="update-label">تاريخ التحديث:</span>
        <span class="update-value">2025-12-13</span>
      </div>
      <div class="update-row">
        <span class="update-label">توقيت التحديث:</span>
        <span class="update-value">09:08:14 PM</span>
      </div>
    </div>
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useDarkMode } from '@/composables/useDarkMode';

const { isDark, toggle: toggleDarkMode } = useDarkMode();

defineProps({
  notifications: { type: Array, default: () => [] },
  showNotifications: { type: Boolean, default: false },
  unreadCount: { type: Number, default: 0 },
});

defineEmits(['toggle-notifications', 'mark-as-read', 'mark-all-read']);
</script>

<style>
.top-header .mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-charcoal);
  cursor: pointer;
  padding: 5px;
}

.top-header .header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.top-header .dark-mode-btn,
.top-header .back-btn,
.top-header .notification-btn {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border: 1.5px solid var(--color-medium-gray);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  color: var(--color-dark-gray);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.top-header .dark-mode-btn svg,
.top-header .back-btn svg,
.top-header .notification-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}
.top-header .dark-mode-btn::before,
.top-header .back-btn::before,
.top-header .notification-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.top-header .dark-mode-btn:hover,
.top-header .back-btn:hover,
.top-header .notification-btn:hover {
  background: linear-gradient(135deg, var(--color-off-white) 0%, var(--color-white) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.25);
  transform: translateY(-4px) rotate(-3deg);
}
.top-header .dark-mode-btn:hover::before,
.top-header .back-btn:hover::before,
.top-header .notification-btn:hover::before {
  opacity: 1;
}
.top-header .notification-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.top-header .notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-error);
  color: white;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  animation: header-badge-pulse 2s infinite;
}

@keyframes header-badge-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.top-header .header-right {
  display: flex;
  align-items: center;
  gap: 30px;
  min-width: 0;
  flex-shrink: 1;
}
.top-header .update-info {
  text-align: left;
  font-size: 11px;
  color: var(--color-dark-gray);
  flex-shrink: 0;
}
.top-header .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-navy);
  min-width: 0;
  overflow: hidden;
}
.top-header .logo-ar,
.top-header .logo-en {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.top-header .logo-ar {
  font-weight: 700;
  font-size: 16px;
}
.top-header .logo-en {
  font-size: 12px;
  opacity: 0.7;
  margin-right: 5px;
  color: var(--color-light-gray);
}

.top-header .notification-wrapper {
  position: relative;
}

.top-header .notifications-dropdown {
  position: absolute;
  top: 50px;
  left: 0;
  width: 320px;
  max-width: none;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-medium-gray);
  z-index: var(--z-modal);
  overflow: hidden;
  animation: header-slideDown 0.3s ease-out;
}
@keyframes header-slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.top-header .notifications-header {
  padding: 12px 16px;
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top-header .notifications-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
}
.top-header .mark-read-btn {
  font-size: 11px;
  color: var(--color-gold);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.top-header .mark-read-btn:hover {
  text-decoration: underline;
}

.top-header .notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.top-header .notification-item {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--color-light-gray);
  position: relative;
}
.top-header .notification-item:hover {
  background: var(--color-off-white);
}
.top-header .notification-item.unread {
  background: rgba(161, 139, 92, 0.03);
}

.top-header .notification-icon-bg {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.top-header .notification-icon-bg.info {
  background: rgba(161, 139, 92, 0.1);
  color: var(--color-gold);
}
.top-header .notification-icon-bg.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.top-header .notification-icon-bg.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.top-header .notification-content {
  flex: 1;
}
.top-header .notification-text {
  font-size: 12px;
  color: var(--color-charcoal);
  line-height: 1.4;
  margin-bottom: 3px;
}
.top-header .notification-time {
  font-size: 10px;
  color: var(--color-dark-gray);
}

.top-header .unread-dot {
  width: 5px;
  height: 5px;
  background: var(--color-gold);
  border-radius: 50%;
  position: absolute;
  top: 12px;
  left: 12px;
  box-shadow: 0 0 8px rgba(177, 162, 143, 0.8);
}

.top-header .no-notifications {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-dark-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.top-header .no-notifications p {
  font-size: 14px;
  margin: 0;
}

/* 4K (3840px+) */
@media (min-width: 3840px) {
  .top-header .notification-btn .bell-icon { width: 28px; height: 28px; }
  .top-header .notifications-dropdown { width: 420px; }
  .top-header .logo-ar { font-size: 22px; }
  .top-header .logo-en { font-size: 16px; }
}

/* 2K (2560px - 3839px) */
@media (min-width: 2560px) and (max-width: 3839px) {
  .top-header .notifications-dropdown { width: 380px; }
}

/* Tablet & Small Desktop (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .top-header .mobile-toggle { display: block; }
  .top-header .header-right .update-info { display: none; }
  .top-header .logo-ar { font-size: 16px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
}

/* Tablet Portrait (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .top-header .mobile-toggle { display: block; }
  .top-header .header-right .update-info { display: none; }
  .top-header .dark-mode-btn,
  .top-header .back-btn,
  .top-header .notification-btn { width: 40px; height: 40px; border-radius: 10px; }
  .top-header .logo-ar { font-size: 15px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
  .top-header .notifications-dropdown { width: 300px; left: auto; right: 0; }
}

/* Mobile Landscape (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .top-header .mobile-toggle { display: block; padding: 8px; }
  .top-header .header-right .update-info,
  .top-header .header-right .logo-icon-bg { display: none; }
  .top-header .dark-mode-btn,
  .top-header .back-btn,
  .top-header .notification-btn { width: 38px; height: 38px; border-radius: 10px; }
  .top-header .dark-mode-btn svg,
  .top-header .back-btn svg,
  .top-header .notification-btn svg { width: 18px; height: 18px; }
  .top-header .logo-ar { font-size: 14px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
  .top-header .notifications-dropdown { width: 280px; left: auto; right: 0; }
  .top-header .notification-item { padding: 12px 16px; }
}

/* Mobile Portrait (max-width: 575px) */
@media (max-width: 575px) {
  .top-header .mobile-toggle { display: block; padding: 6px; }
  .top-header .header-left { gap: 10px; }
  .top-header .header-right .update-info,
  .top-header .header-right .logo-icon-bg,
  .top-header .header-right .logo-sep { display: none; }
  .top-header .dark-mode-btn,
  .top-header .back-btn,
  .top-header .notification-btn { width: 36px; height: 36px; border-radius: 8px; }
  .top-header .dark-mode-btn svg,
  .top-header .back-btn svg,
  .top-header .notification-btn svg { width: 16px; height: 16px; }
  .top-header .notification-badge { min-width: 16px; height: 16px; font-size: 9px; top: -6px; right: -6px; }
  .top-header .logo-ar { font-size: 13px; }
  .top-header .logo-en { display: none; }
  .top-header .notifications-dropdown {
    width: calc(100vw - 24px);
    max-width: 340px;
    left: 12px;
    right: auto;
    top: 65px;
    border-radius: 14px;
  }
  .top-header .notifications-header { padding: 12px 16px; }
  .top-header .notifications-title { font-size: 15px; }
  .top-header .mark-read-btn { font-size: 11px; }
  .top-header .notification-item { padding: 12px 16px; }
  .top-header .notification-icon-bg { width: 32px; height: 32px; border-radius: 8px; }
  .top-header .notification-icon-bg svg { width: 14px; height: 14px; }
  .top-header .notification-text { font-size: 12px; }
  .top-header .notification-time { font-size: 10px; }
}

/* Extra Small (< 320px) */
@media (max-width: 319px) {
  .top-header .dark-mode-btn,
  .top-header .back-btn,
  .top-header .notification-btn { width: 34px; height: 34px; }
  .top-header .logo-ar { font-size: 12px; }
}
</style>
