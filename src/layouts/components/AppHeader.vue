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
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          dropdownPositionStyle.value = {
            position: 'fixed',
            top: `${rect.bottom + 10}px`,
            right: `${window.innerWidth - rect.right}px`,
            zIndex: 9999,
          };
        });
      }
      setTimeout(() => document.addEventListener('click', handleClickOutside, { passive: true }), 0);
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

<style>
.top-header .mobile-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  cursor: pointer;
  padding: 5px;
  border-radius: 10px;
}
.top-header .mobile-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
}

.top-header .header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.top-header .back-btn,
.top-header .notification-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.top-header .back-btn svg,
.top-header .notification-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}
.top-header .back-btn::before,
.top-header .notification-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.top-header .back-btn:hover,
.top-header .notification-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
  transform: translateY(-4px) rotate(-3deg);
}
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
.top-header .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #B5A99A;
  min-width: 0;
  overflow: hidden;
}
.top-header .logo-ar,
.top-header .logo-en {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Arabic: خط الرقعة (Ruq'ah) - لون ذهبي */
.top-header .logo-ar {
  font-family: 'Aref Ruqaa', serif;
  font-weight: 700;
  font-size: 18px;
  color: #B5A99A;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.02em;
}
/* English: same size as Arabic, distinctive serif - لون ذهبي */
.top-header .logo-en {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 18px;
  opacity: 0.95;
  margin-right: 5px;
  color: #B5A99A;
  letter-spacing: 0.03em;
}
.top-header .logo-sep {
  color: rgba(181, 169, 154, 0.9);
}

.top-header .notification-wrapper {
  position: relative;
}

/* لوحة الإشعارات — متناسقة مع الهيدر والثيم (نيفي/ذهبي) */
.top-header .notifications-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  left: auto;
  width: 360px;
  max-width: min(360px, calc(100vw - 32px));
  background: linear-gradient(180deg, #ffffff 0%, var(--color-off-white, #f8fafc) 100%);
  border-radius: var(--radius-md, 14px);
  box-shadow: 0 12px 28px rgba(39, 55, 77, 0.14), 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(39, 55, 77, 0.1);
  z-index: 9999;
  overflow: hidden;
  animation: notifications-panel-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* نفس التنسيقات عند عرض اللوحة عبر Teleport (خارج الهيدر) */
.notifications-dropdown-teleport {
  width: 360px;
  max-width: min(360px, calc(100vw - 32px));
  background: linear-gradient(180deg, #ffffff 0%, var(--color-off-white, #f8fafc) 100%);
  border-radius: var(--radius-md, 14px);
  box-shadow: 0 12px 28px rgba(39, 55, 77, 0.14), 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(39, 55, 77, 0.1);
  overflow: hidden;
  animation: notifications-panel-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notifications-dropdown-teleport .notifications-panel-bar {
  height: 4px;
  background: var(--color-navy, #27374D);
  width: 100%;
}
.notifications-dropdown-teleport .notifications-header {
  padding: 14px 18px;
  background: rgba(248, 250, 252, 0.95);
  border-bottom: 1px solid rgba(39, 55, 77, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.notifications-dropdown-teleport .notifications-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0;
  letter-spacing: -0.02em;
}
.notifications-dropdown-teleport .mark-read-btn {
  font-size: 0.75rem;
  color: var(--color-gold);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.notifications-dropdown-teleport .mark-read-btn:hover {
  background: rgba(181, 169, 154, 0.12);
  color: var(--color-gold-dark, #9a8d7d);
}
.notifications-dropdown-teleport .notifications-list {
  max-height: 380px;
  overflow-y: auto;
}
.notifications-dropdown-teleport .notification-item {
  padding: 14px 18px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(39, 55, 77, 0.06);
  position: relative;
  align-items: flex-start;
}
.notifications-dropdown-teleport .notification-item:hover {
  background: rgba(39, 55, 77, 0.04);
}
.notifications-dropdown-teleport .notification-item.unread {
  background: rgba(181, 169, 154, 0.06);
}
.notifications-dropdown-teleport .notification-item:last-child {
  border-bottom: none;
}
.notifications-dropdown-teleport .notification-icon-bg {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notifications-dropdown-teleport .notification-icon-bg.info {
  background: rgba(181, 169, 154, 0.15);
  color: var(--color-gold);
}
.notifications-dropdown-teleport .notification-icon-bg.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.notifications-dropdown-teleport .notification-icon-bg.warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning, #f59e0b);
}
.notifications-dropdown-teleport .notification-content {
  flex: 1;
  min-width: 0;
}
.notifications-dropdown-teleport .notification-text {
  font-size: 0.8125rem;
  color: var(--color-charcoal);
  line-height: 1.45;
  margin-bottom: 4px;
}
.notifications-dropdown-teleport .notification-time {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}
.notifications-dropdown-teleport .unread-dot {
  width: 6px;
  height: 6px;
  background: var(--color-gold);
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 18px;
  left: auto;
  box-shadow: 0 0 10px rgba(181, 162, 143, 0.6);
}
.notifications-dropdown-teleport .no-notifications {
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.notifications-dropdown-teleport .no-notifications-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(39, 55, 77, 0.06);
  color: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
}
.notifications-dropdown-teleport .no-notifications-icon svg {
  width: 24px;
  height: 24px;
}
.notifications-dropdown-teleport .no-notifications p {
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
  color: var(--color-dark-gray);
}
@keyframes notifications-panel-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* شريط علوي بلون الهيدر */
.top-header .notifications-panel-bar {
  height: 4px;
  background: var(--color-navy, #27374D);
  width: 100%;
  flex-shrink: 0;
}

.top-header .notifications-header {
  padding: 14px 18px;
  background: rgba(248, 250, 252, 0.95);
  border-bottom: 1px solid rgba(39, 55, 77, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.top-header .notifications-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0;
  letter-spacing: -0.02em;
}
.top-header .mark-read-btn {
  font-size: 0.75rem;
  color: var(--color-gold);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.top-header .mark-read-btn:hover {
  background: rgba(181, 169, 154, 0.12);
  color: var(--color-gold-dark, #9a8d7d);
}

.top-header .notifications-list {
  max-height: 380px;
  overflow-y: auto;
}

.top-header .notification-item {
  padding: 14px 18px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(39, 55, 77, 0.06);
  position: relative;
  align-items: flex-start;
}
.top-header .notification-item:hover {
  background: rgba(39, 55, 77, 0.04);
}
.top-header .notification-item.unread {
  background: rgba(181, 169, 154, 0.06);
}
.top-header .notification-item:last-child {
  border-bottom: none;
}

.top-header .notification-icon-bg {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.top-header .notification-icon-bg.info {
  background: rgba(181, 169, 154, 0.15);
  color: var(--color-gold);
}
.top-header .notification-icon-bg.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.top-header .notification-icon-bg.warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning, #f59e0b);
}

.top-header .notification-content {
  flex: 1;
  min-width: 0;
}
.top-header .notification-text {
  font-size: 0.8125rem;
  color: var(--color-charcoal);
  line-height: 1.45;
  margin-bottom: 4px;
}
.top-header .notification-time {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}

.top-header .unread-dot {
  width: 6px;
  height: 6px;
  background: var(--color-gold);
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 18px;
  left: auto;
  box-shadow: 0 0 10px rgba(181, 162, 143, 0.6);
}

.top-header .no-notifications {
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.top-header .no-notifications-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(39, 55, 77, 0.06);
  color: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
}
.top-header .no-notifications-icon svg {
  width: 24px;
  height: 24px;
}
.top-header .no-notifications p {
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
  color: var(--color-dark-gray);
}

/* 4K (3840px+) */
@media (min-width: 3840px) {
  .top-header .notification-btn .bell-icon { width: 28px; height: 28px; }
  .top-header .notifications-dropdown { width: 400px; }
  .top-header .logo-ar { font-size: 22px; }
  .top-header .logo-en { font-size: 22px; }
}

/* 2K (2560px - 3839px) */
@media (min-width: 2560px) and (max-width: 3839px) {
  .top-header .notifications-dropdown { width: 380px; }
}

/* Tablet & Small Desktop (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .top-header .mobile-toggle { display: block; }
  .top-header .logo-ar { font-size: 16px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
}

/* Tablet Portrait (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .top-header .mobile-toggle { display: block; }
  .top-header .back-btn,
  .top-header .notification-btn { width: 40px; height: 40px; border-radius: 10px; }
  .top-header .logo-ar { font-size: 15px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
  .top-header .notifications-dropdown { width: 300px; right: 0; left: auto; }
}

/* Mobile Landscape (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .top-header .mobile-toggle { display: block; padding: 8px; }
  .top-header .header-right .logo-icon-bg { display: none; }
  .top-header .back-btn,
  .top-header .notification-btn { width: 38px; height: 38px; border-radius: 10px; }
  .top-header .back-btn svg,
  .top-header .notification-btn svg { width: 18px; height: 18px; }
  .top-header .logo-ar { font-size: 14px; }
  .top-header .logo-en,
  .top-header .logo-sep { display: none; }
  .top-header .notifications-dropdown { width: 280px; right: 0; left: auto; }
  .top-header .notification-item { padding: 12px 16px; }
}

/* Mobile Portrait (max-width: 575px) */
@media (max-width: 575px) {
  .top-header .mobile-toggle { display: block; padding: 6px; }
  .top-header .header-left { gap: 10px; }
  .top-header .header-right .logo-icon-bg,
  .top-header .header-right .logo-sep { display: none; }
  .top-header .back-btn,
  .top-header .notification-btn { width: 36px; height: 36px; border-radius: 8px; }
  .top-header .back-btn svg,
  .top-header .notification-btn svg { width: 16px; height: 16px; }
  .top-header .notification-badge { min-width: 16px; height: 16px; font-size: 9px; top: -6px; right: -6px; }
  .top-header .logo-ar { font-size: 13px; }
  .top-header .logo-en { display: none; }
  .top-header .notifications-dropdown {
    width: calc(100vw - 24px);
    max-width: 340px;
    right: 0;
    left: auto;
    top: calc(100% + 10px);
    border-radius: var(--radius-md, 14px);
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
  .top-header .back-btn,
  .top-header .notification-btn { width: 34px; height: 34px; }
  .top-header .logo-ar { font-size: 12px; }
}
</style>
