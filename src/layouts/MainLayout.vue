<template>
  <div class="app-container">
    <!-- الهيدر العلوي -->
    <header class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.back()">
          <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="notification-wrapper">
          <button class="notification-btn" @click="toggleNotifications">
            <svg class="bell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notifications-header">
              <h3 class="notifications-title">الإشعارات</h3>
              <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-read-btn">تعيين الكل كمقروء</button>
            </div>
            <div class="notifications-list custom-scrollbar">
              <div v-if="notifications.length === 0" class="no-notifications">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <p>لا يوجد إشعارات جديدة</p>
              </div>
              <div v-for="notification in notifications" :key="notification.id"
                :class="['notification-item', { unread: !notification.read }]" @click="markAsRead(notification.id)">
                <div class="notification-icon-bg" :class="notification.type">
                  <svg v-if="notification.type==='info'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div class="notification-content">
                  <div class="notification-text">{{ notification.text }}</div>
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

    <div class="main-wrapper">
      <!-- القائمة الجانبية -->
      <aside class="sidebar">
        <div class="sidebar-header">
           <div class="sidebar-logo-text">
             <span class="rakez-ar">راكز</span> | <span class="rakez-en">Rakez</span>
           </div>
        </div>
        
        <nav class="sidebar-nav">
          <!-- Admin Sidebar (Matches Image 1) -->
          <template v-if="userRole == 1">
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span class="nav-text">التحليلات</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </a>
            
            <router-link to="/contracts" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span class="nav-text">العقود</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="nav-text">المطورون</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                <span class="nav-text">إدارة الفرق</span>
              </div>
            </a>
            
            <router-link to="/users" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">إدارة المستخدمين</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span class="nav-text">إحضار المشاريع</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span class="nav-text">الوحدات المباعة</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span class="nav-text">الحسابات</span>
              </div>
            </a>
          </template>

          <!-- Marketer Sidebar (Matches Image 2) -->
          <template v-else>
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="9" y1="21" x2="9" y2="10"></line><line x1="13" y1="21" x2="13" y2="10"></line><line x1="17" y1="21" x2="17" y2="10"></line></svg>
                <span class="nav-text">مشاريع التسويق</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span class="nav-text">حجوزاتي</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </a>
            
            <router-link to="/my-requests" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>
            
            <router-link to="/exclusive-request" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                <span class="nav-text">أدائي</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                <span class="nav-text">الأهداف</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span class="nav-text">دوامي</span>
              </div>
            </a>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </a>
          </template>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-profile">
             <div class="avatar">
               <span class="avatar-text">{{ (user?.name || 'A').charAt(0).toUpperCase() }}</span>
             </div>
            <div class="user-info">
              <div class="user-name">{{ user?.name || 'Admin' }}</div>
              <div class="user-email">{{ user?.email || 'admin@rakez.com' }}</div>
            </div>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <!-- Watermark Background -->
      <div class="logo-container">
        <div class="rakez-logo">
          <div class="logo-text-main">راكز</div>
          <div class="logo-subtitle">RAKEZ</div>
          <div class="logo-tagline">محل الثقة</div>
        </div>
      </div>

      <!-- المحتوى المتغير -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <footer class="footer">
      <p class="copyright">جميع الحقوق محفوظة © شركة راكز العقارية 2025</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '../services/authService'

export default {
  name: 'MainLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const user = computed(() => {
        // Accessing route.path makes this computed property reactive to route changes
        route.path
        return authService.getCurrentUser()
    })
    const showNotifications = ref(false)
    
    // Check auth status on setup
    if (!authService.isAuthenticated()) {
      router.push('/login')
    }
    
    const notifications = ref([
      { id: 1, text: 'تم إنشاء عقد جديد من شركة سكف العقارية', time: 'منذ 5 دقائق', read: false, type: 'info' },
      { id: 2, text: 'عقد رقم 1512DC يحتاج إلى مراجعة', time: 'منذ 15 دقيقة', read: false, type: 'warning' }
    ])
    
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
    
    const toggleNotifications = () => { showNotifications.value = !showNotifications.value }
    const markAsRead = (id) => { 
      const n = notifications.value.find(notif => notif.id === id)
      if (n) n.read = true
    }
    const markAllAsRead = () => { notifications.value.forEach(n => n.read = true) }

    const userRole = computed(() => {
      const type = user.value?.type
      // If type is 1 or string 'admin', it's an Admin
      if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1
      return 0
    })

    const handleLogout = async () => {
      await authService.logout()
      router.push('/login')
    }

    return {
      user,
      userRole,
      showNotifications,
      notifications,
      unreadCount,
      toggleNotifications,
      markAsRead,
      markAllAsRead,
      handleLogout
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap');

.app-container {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
}

/* Header */
.top-header {
  height: 70px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-bottom: 2px solid #a18b5c;
  position: fixed;
  top: 0;
  left: 0;
  right: 260px;
  z-index: 100;
}

.header-left { display: flex; align-items: center; gap: 20px; }

.back-btn, .notification-btn {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: #64748b;
}

.notification-btn:hover {
  background: #fdfbf7;
  border-color: #a18b5c;
  color: #a18b5c;
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.15);
  transform: translateY(-2px);
}
.back-btn:hover, .notification-btn:hover { border-color: #a18b5c; background: white; }

.notification-badge {
    position: absolute; top: -5px; right: -5px;
    background: #ef4444; color: white; border-radius: 50%;
    min-width: 18px; height: 18px; font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.header-right { display: flex; align-items: center; gap: 30px; }
.update-info { text-align: left; font-size: 11px; color: #64748b; }
.logo { display: flex; align-items: center; gap: 10px; color: #1e3a5f; }
.logo-ar { font-weight: 700; font-size: 18px; font-family: 'Amiri', serif; }

/* Notifications Dropdown */
.notifications-dropdown {
    position: absolute; top: 60px; left: 0;
    width: 320px; background: white;
    border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
    border: 1px solid #e2e8f0; z-index: 1000; overflow: hidden;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.notifications-header {
    padding: 15px 20px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
}

.notifications-title { font-size: 16px; font-weight: 700; color: #1e3a5f; margin: 0; }
.mark-read-btn { font-size: 12px; color: #a18b5c; background: none; border: none; cursor: pointer; font-weight: 600; }
.mark-read-btn:hover { text-decoration: underline; }

.notifications-list { max-height: 400px; overflow-y: auto; }

.notification-item {
    padding: 15px 20px; display: flex; gap: 15px;
    cursor: pointer; transition: background 0.2s;
    border-bottom: 1px solid #f1f5f9; position: relative;
}
.notification-item:hover { background: #fdfbf7; }
.notification-item.unread { background: rgba(161, 139, 92, 0.03); }

.notification-icon-bg {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.notification-icon-bg.info { background: rgba(161, 139, 92, 0.1); color: #a18b5c; }
.notification-icon-bg.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.notification-content { flex: 1; }
.notification-text { font-size: 13px; color: #1e293b; line-height: 1.4; margin-bottom: 4px; }
.notification-time { font-size: 11px; color: #94a3b8; }

.unread-dot {
    width: 6px; height: 6px; background: #a18b5c; border-radius: 50%;
    position: absolute; top: 20px; left: 10px;
}

.no-notifications {
    padding: 40px 20px; text-align: center; color: #94a3b8;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.no-notifications p { font-size: 14px; margin: 0; }

/* Sidebar */
.sidebar {
  position: fixed; top: 0; right: 0; width: 260px; height: 100vh;
  background: #1e293b; color: white; z-index: 200;
  display: flex; flex-direction: column;
}

.sidebar-header {
  height: 80px; display: flex; align-items: center; padding: 0 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-logo-text { font-size: 20px; font-weight: 700; font-family: 'Amiri', serif; }
.rakez-ar { color: #fbbf24; }
.rakez-en { font-size: 14px; opacity: 0.7; margin-right: 5px; }

.sidebar-nav { flex: 1; padding: 15px 10px; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 15px; color: #94a3b8; text-decoration: none;
  font-size: 14px; transition: all 0.2s; border-radius: 8px; margin-bottom: 2px;
}

.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: linear-gradient(90deg, #334155 0%, #1e293b 100%); color: #fbbf24; font-weight: 700; border-left: 3px solid #fbbf24; }

.nav-content { display: flex; align-items: center; gap: 12px; }
.nav-icon-svg { width: 20px; height: 20px; color: currentColor; stroke-width: 2; }

.sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); }

.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.user-info { flex: 1; text-align: right; }
.user-name { font-weight: 600; font-size: 14px; color: white; display: block; }
.user-email { font-size: 11px; color: #94a3b8; display: block; }

.avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #475569; display: flex; align-items: center;
    justify-content: center; color: white; font-weight: 700;
    border: 1.5px solid rgba(255,255,255,0.1);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444; width: 100%; padding: 8px; border-radius: 6px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; font-size: 13px; transition: all 0.2s;
}
.logout-btn:hover { background: #ef4444; color: white; }

/* Main Wrapper */
.main-wrapper { margin-right: 260px; padding-top: 70px; min-height: 100vh; position: relative; }
.main-content { padding: 30px; position: relative; z-index: 5; }

/* Watermark */
.logo-container {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 0; pointer-events: none; opacity: 0.05; text-align: center; width: 100%;
}
.logo-text-main { font-size: 100px; font-weight: 900; color: #a18b5c; font-family: 'Amiri', serif; }

.footer { height: 50px; background: white; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-right: 260px; }
.copyright { color: #94a3b8; font-size: 12px; }

/* Custom Scrollbar */
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
