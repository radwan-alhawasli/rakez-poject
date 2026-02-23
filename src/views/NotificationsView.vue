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
  font-family: 'Amiri', serif;
  font-size: 32px;
  color: #1e3a5f;
  margin: 0;
}

.premium-subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
}

.btn-mark-all {
  background: #f1f5f9;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  color: #1e3a5f;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-mark-all:hover {
  background: #1e3a5f;
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
  border-right: 6px solid #b1a28f;
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
  background: #f1f5f9;
}

.notif-icon-box.success {
  background: #ecfdf5;
  color: #10b981;
}
.notif-icon-box.warning {
  background: #fffbeb;
  color: #f59e0b;
}

.notif-body {
  flex: 1;
}
.notif-text {
  font-weight: 600;
  color: #1e293b;
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
  color: #94a3b8;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #b1a28f;
  border-radius: 50%;
  box-shadow: 0 0 10px #b1a28f;
}

.btn-read-toggle {
  background: #1e3a5f;
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
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}
.empty-glass-state h3 {
  color: #1e3a5f;
  font-family: 'Amiri', serif;
  font-size: 24px;
}
.empty-glass-state p {
  color: #64748b;
}

@media (max-width: 768px) {
  .glass-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .premium-notif-item {
    padding: 15px;
  }
}
</style>
