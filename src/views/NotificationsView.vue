<template>
  <div class="notifications-view">
    <div class="page-header">
      <h1 class="page-title">لوحة الإشعارات</h1>
      <p class="page-subtitle">جميع إشعاراتك في مكان واحد.</p>
    </div>

    <div class="notifications-list">
      <div v-for="notif in notifications" :key="notif.id" :class="['notif-item', { read: notif.read }]">
        <div class="notif-content">
          <p class="notif-text">{{ notif.title }}</p>
          <span class="notif-time">{{ notif.time }}</span>
        </div>
        
        <div class="notif-actions">
           <button v-if="notif.actionRequired" class="action-btn" @click="markAsDone(notif)">
             <span>تحديد كمقروء</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </button>
           <div v-else class="done-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
        </div>
      </div>

      <div v-if="notifications.length === 0" class="empty-state">
        <p>لا توجد إشعارات حالياً.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import notificationService from '../services/notificationService'

export default {
  name: 'NotificationsView',
  setup() {
    const notifications = computed(() => notificationService.getAll().value)

    const markAsDone = (notif) => {
      notificationService.markAsRead(notif.id)
    }

    onMounted(() => {
        // Refresh or init
        notificationService.getAll()
    })

    return {
      notifications,
      markAsDone
    }
  }
}
</script>

<style scoped>
.notifications-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
  max-width: 900px;
  margin: 0 auto;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  text-align: right; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;
}
.page-title {
  font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif;
}
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.notifications-list { display: flex; flex-direction: column; gap: 15px; }

.notif-item {
  background: white; border-radius: 12px; padding: 20px;
  display: flex; justify-content: space-between; align-items: flex-start;
  border: 1px solid #e2e8f0; transition: all 0.2s;
  background: #f8fafc; /* Unread Styles */
  border-right: 4px solid #B1A28F;
}

.notif-item.read {
  background: white;
  border-right-color: #e2e8f0;
  opacity: 0.8;
}

.notif-content { flex: 1; margin-left: 20px; }
.notif-text { font-size: 15px; color: #1e293b; font-weight: 600; margin: 0 0 8px 0; line-height: 1.5; }
.notif-time { font-size: 12px; color: #94a3b8; }

.notif-actions { display: flex; align-items: center; }

.action-btn {
  background: none; border: none; color: #1e3a5f; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px; transition: background 0.2s;
}
.action-btn:hover { background: #f1f5f9; }

.done-badge {
    color: #10b981;
}

.empty-state { text-align: center; color: #94a3b8; padding: 40px; }
</style>
