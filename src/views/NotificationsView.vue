<template>
  <div class="notifications-container">
    <div class="glass-header">
      <div class="header-content">
        <h1 class="premium-title">لوحة الإشعارات الذكية</h1>
        <p class="premium-subtitle">تابع آخر التحديثات والنشاطات في نظام راكز.</p>
      </div>
      <button v-if="notifications.length > 0" class="btn-mark-all" @click="markAllRead">
        <span class="icon"
          ><svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="18"
            height="18"
          >
            <polyline points="20 6 9 17 4 12"></polyline></svg
        ></span>
        تحديد الكل كمقروء
      </button>
    </div>

    <div class="notifications-grid">
      <transition-group name="list" tag="div" class="list-wrapper">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          :class="['premium-notif-item', { unread: !notif.read }]"
          @click="!notif.read && markAsRead(notif.id)"
        >
          <div class="item-glass-effect"></div>

          <div class="notif-icon-box" :class="notif.type">
            <span v-if="notif.type === 'success'"
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <polyline points="20 6 9 17 4 12"></polyline></svg
            ></span>
            <span v-else-if="notif.type === 'warning'"
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line></svg
            ></span>
            <span v-else
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="20"
                height="20"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg
            ></span>
          </div>

          <div class="notif-body">
            <p class="notif-text">{{ notif.title }}</p>
            <div class="notif-meta">
              <span class="notif-time">{{ formatTime(notif.time) }}</span>
              <span v-if="!notif.read" class="unread-dot"></span>
            </div>
          </div>

          <div class="notif-actions">
            <button v-if="!notif.read" class="btn-read-toggle" @click.stop="markAsRead(notif.id)">
              مقروء
            </button>
          </div>
        </div>
      </transition-group>

      <div v-if="notifications.length === 0" class="empty-glass-state">
        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="48"
            height="48"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            ></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
        <h3>لا توجد إشعارات حالياً</h3>
        <p>سنقوم بإخبارك فور حدوث أي نشاط جديد.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import notificationService from '../services/notificationService';

export default {
  name: 'NotificationsView',
  setup() {
    const notifications = computed(() => notificationService.state.value);

    const markAsRead = async id => {
      await notificationService.markAsRead(id);
    };

    const markAllRead = async () => {
      await notificationService.markAllAsRead();
    };

    const formatTime = timeStr => {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'long',
      }).format(date);
    };

    onMounted(() => {
      notificationService.init();
    });

    return {
      notifications,
      markAsRead,
      markAllRead,
      formatTime,
    };
  },
};
</script>

<style scoped>
.notifications-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  animation: fadeIn 0.6s ease-out;
}

.glass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.premium-title {
  font-size: 32px;
  color: var(--color-navy);
  margin: 0;
}

.premium-subtitle {
  color: var(--color-dark-gray);
  margin: 5px 0 0 0;
}

.btn-mark-all {
  background: var(--color-light-gray);
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  color: var(--color-navy);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-mark-all:hover {
  background: var(--color-navy);
  color: white;
  transform: translateY(-2px);
}

.notifications-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.premium-notif-item {
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.premium-notif-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.01);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
}

.premium-notif-item.unread {
  background: white;
  border-right: 6px solid var(--color-gold);
  box-shadow: 0 5px 15px rgba(177, 162, 143, 0.1);
}

.notif-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--color-light-gray);
}

.notif-icon-box.success {
  background: #ecfdf5;
  color: #10b981;
}
.notif-icon-box.warning {
  background: #fffbeb;
  color: var(--color-warning);
}

.notif-body {
  flex: 1;
}
.notif-text {
  font-weight: 600;
  color: var(--color-charcoal);
  margin: 0 0 5px 0;
  line-height: 1.6;
}
.notif-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.notif-time {
  font-size: 13px;
  color: var(--color-dark-gray);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--color-gold);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-gold);
}

.btn-read-toggle {
  background: var(--color-navy);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
}

.premium-notif-item:hover .btn-read-toggle {
  opacity: 1;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.empty-glass-state {
  text-align: center;
  padding: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  border: 1px dashed var(--color-medium-gray);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}
.empty-glass-state h3 {
  color: var(--color-navy);
  font-size: 24px;
}
.empty-glass-state p {
  color: var(--color-dark-gray);
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .notifications-container {
    padding: 16px;
  }
  .glass-header {
    padding: 24px;
  }
  .premium-title {
    font-size: 26px;
  }
  .premium-notif-item {
    padding: 20px;
    gap: 16px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .glass-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 20px;
  }
  .btn-mark-all {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
  .premium-title {
    font-size: 22px;
  }
  .premium-notif-item {
    padding: 16px;
    gap: 14px;
  }
  .notif-icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .btn-read-toggle {
    opacity: 1;
    min-height: 44px;
    padding: 10px 16px;
  }
  .empty-glass-state {
    padding: 50px 20px;
  }
  .empty-glass-state h3 {
    font-size: 20px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .notifications-container {
    padding: 12px;
  }
  .glass-header {
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }
  .premium-title {
    font-size: 20px;
  }
  .premium-subtitle {
    font-size: 13px;
  }
  .premium-notif-item {
    padding: 14px;
    gap: 12px;
    border-radius: 14px;
    flex-wrap: wrap;
  }
  .notif-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 16px;
  }
  .notif-text {
    font-size: 14px;
  }
  .notif-time {
    font-size: 12px;
  }
  .notif-actions {
    width: 100%;
  }
  .btn-read-toggle {
    width: 100%;
    text-align: center;
    opacity: 1;
  }
  .empty-glass-state {
    padding: 40px 16px;
    border-radius: 20px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .notifications-container {
    padding: 8px;
  }
  .glass-header {
    padding: 12px;
    border-radius: 12px;
  }
  .premium-title {
    font-size: 18px;
  }
  .premium-notif-item {
    padding: 12px;
    gap: 10px;
    border-radius: 10px;
  }
  .notif-icon-box {
    width: 36px;
    height: 36px;
  }
  .notif-text {
    font-size: 13px;
  }
  .btn-mark-all {
    padding: 10px 14px;
    font-size: 13px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .notifications-container {
    max-width: 1200px;
    padding: 32px;
  }
  .glass-header {
    padding: 40px;
    border-radius: 28px;
    margin-bottom: 40px;
  }
  .premium-title {
    font-size: 38px;
  }
  .premium-subtitle {
    font-size: 18px;
  }
  .btn-mark-all {
    padding: 14px 28px;
    font-size: 16px;
    border-radius: 14px;
  }
  .notifications-grid {
    gap: 24px;
  }
  .premium-notif-item {
    padding: 30px;
    gap: 24px;
    border-radius: 24px;
  }
  .notif-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }
  .notif-text {
    font-size: 17px;
  }
  .notif-time {
    font-size: 15px;
  }
  .btn-read-toggle {
    padding: 10px 22px;
    font-size: 15px;
  }
  .empty-glass-state {
    padding: 100px;
  }
  .empty-glass-state h3 {
    font-size: 28px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .notifications-container {
    max-width: 1400px;
  }
  .premium-title {
    font-size: 42px;
  }
  .premium-notif-item {
    padding: 36px;
  }
  .notif-text {
    font-size: 18px;
  }
}
</style>
