<template>
  <SidebarProvider
    v-model:open-mobile="isSidebarOpen"
    @update:hovered="isSidebarHovered = $event"
  >
    <!-- Overlay: click to close sidebar on mobile (only when open and below 992px) -->
    <div
      v-if="isSidebarOpen && isMobile"
      class="sidebar-overlay"
      role="button"
      tabindex="-1"
      aria-label="إغلاق القائمة"
      @click="isSidebarOpen = false"
      @keydown.enter.space.prevent="isSidebarOpen = false"
    />
    <div
      class="app-container flex min-h-screen w-full flex-col"
      :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-hovered': isSidebarHovered }"
    >
    <AppHeader
      :notifications="notifications"
      :show-notifications="showNotifications"
      :unread-count="unreadCount"
      @toggle-notifications="toggleNotifications"
      @mark-as-read="markAsRead"
      @mark-all-read="markAllAsRead"
    />

    <AppSidebar
      :user="user"
      :user-role="userRole"
      :sidebar-role-label="sidebarRoleLabel"
      :has-permission="hasPermission"
      :has-any-permission="hasAnyPermission"
      @logout="handleLogout"
    />

    <SidebarInset>
      <main
        class="main-content flex-1 min-h-0 overflow-auto overflow-x-hidden"
        role="main"
      >
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <component v-if="Component" :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </SidebarInset>

    <footer class="footer">
      <p class="copyright">جميع الحقوق محفوظة © شركة راكز العقارية 2025</p>
    </footer>
    </div>
  </SidebarProvider>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import { usePermissions } from '@/composables/usePermissions';
import { getRoleLabel } from '@/constants/roles';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';

export default {
  name: 'MainLayout',
  components: {
    SidebarProvider,
    SidebarInset,
    AppHeader,
    AppSidebar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const isSidebarOpen = ref(false);
    const isSidebarHovered = ref(false);

    const MOBILE_BREAKPOINT = 992;
    const isMobile = ref(false);
    const updateMobile = () => {
      if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
      }
    };

    watch(
      () => route.path,
      () => {
        isSidebarOpen.value = false;
      }
    );

    watch(
      [isSidebarOpen, isMobile],
      ([open, mobile]) => {
        if (typeof document === 'undefined') return;
        if (open && mobile) {
          document.body.classList.add('sidebar-drawer-open');
        } else {
          document.body.classList.remove('sidebar-drawer-open');
        }
      },
      { immediate: true }
    );

    const user = computed(() => {
      route.path;
      return authService.getCurrentUser();
    });
    const { hasPermission, hasAnyPermission } = usePermissions();
    const showNotifications = ref(false);

    if (!authService.isAuthenticated()) {
      router.push('/login');
    }

    // Use the comprehensive notification service (ensure array for template safety)
    const notifications = computed(() => {
      const n = notificationService.getAll();
      const val = n?.value ?? n;
      return Array.isArray(val) ? val : [];
    });

    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
    };

    const markAsRead = id => {
      notificationService.markAsRead(id);
    };

    const markAllAsRead = () => {
      notificationService.markAllAsRead();
    };

    const userRole = computed(() => {
      // 1. Gather all potential role indicators
      const rawType = user.value?.type;
      const rawRole = user.value?.role;

      // 2. Helper to standardize values to string lowercase
      const check = val =>
        String(val || '')
          .toLowerCase()
          .trim();

      // 3. HR Logic (8, 9, 'hr', 'HR')
      // Supports string "8", number 8, string "hr"
      if (check(rawType) === '8' || check(rawType) === '9' || check(rawType) === 'hr') return 8;
      if (check(rawRole) === 'hr') return 8;

      // 4. Admin
      if (rawType === 1 || check(rawType) === 'admin' || check(rawRole) === 'admin') return 1;

      // 5. Project Management
      if (rawType == 3 || check(rawType) === 'project_management') {
        return user.value?.is_manager ? 10 : 3;
      }

      // 6. Map other text roles
      const roleMap = {
        hr: 8,
        marketer: 0,
        sales: 5,
        accounting: 6,
        marketing: 0,
      };

      // If type is a known string key, map it
      if (typeof rawType === 'string' && roleMap[check(rawType)] !== undefined) {
        return roleMap[check(rawType)];
      }

      // Default: parse number or return 0
      return parseInt(rawType) || 0;
    });

    /** Role label for sidebar footer: Sales Leader vs Sales when role is 5 (API uses is_manager or is_leader) */
    const sidebarRoleLabel = computed(() => {
      const u = user.value;
      if (!u) return '';
      if (userRole.value === 5) {
        const isLeader =
          u.is_leader === true ||
          u.is_leader === 1 ||
          u.is_leader === '1' ||
          u.is_manager === true ||
          u.is_manager === 1 ||
          u.is_manager === '1';
        return isLeader ? 'قائد المبيعات / Sales Leader' : 'المبيعات / Sales';
      }
      return getRoleLabel(u.type, u.is_manager) || '';
    });

    const handleLogout = async () => {
      await authService.logout();
      notificationService.disconnect();
      router.push('/login');
    };

    onMounted(() => {
      notificationService.init();
      updateMobile();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateMobile);
      }
    });

    onUnmounted(() => {
      notificationService.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateMobile);
      }
    });

    return {
      route,
      user,
      userRole,
      sidebarRoleLabel,
      hasPermission,
      hasAnyPermission,
      notifications,
      showNotifications,
      unreadCount,
      isSidebarOpen,
      isSidebarHovered,
      isMobile,
      toggleNotifications,
      markAsRead,
      markAllAsRead,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.app-container {
  background: var(--color-light-gray);
  direction: rtl;
  overflow-x: hidden;
}

/* Header - Enhanced with Luxury Vitality */
.top-header {
  height: 60px;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(177, 162, 143, 0.12);
  border-bottom: 2px solid var(--color-gold);
  position: fixed;
  top: 0;
  left: 0;
  right: 80px;
  z-index: var(--z-header);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
  animation: fadeInDown 0.5s ease-out;
}

.top-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--color-gold) 50%, transparent 100%);
  opacity: 0.5;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-charcoal);
  cursor: pointer;
  padding: 5px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn,
.notification-btn {
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
  animation: scaleIn 0.4s ease-out;
}

.back-btn svg,
.notification-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.back-btn::before,
.notification-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.back-btn:hover,
.notification-btn:hover {
  background: linear-gradient(135deg, var(--color-off-white) 0%, var(--color-white) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.25);
  transform: translateY(-4px) rotate(-3deg);
}

.back-btn:hover::before,
.notification-btn:hover::before {
  opacity: 1;
}

.notification-btn:hover {
  transform: translateY(-4px) scale(1.05);
  animation: pulse-soft 0.6s ease-in-out;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px; /* Adjusted for circular item */
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
  min-width: 0;
  flex-shrink: 1;
}
.update-info {
  text-align: left;
  font-size: 11px;
  color: var(--color-dark-gray);
  flex-shrink: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-navy);
  min-width: 0;
  overflow: hidden;
}
.logo-ar,
.logo-en {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logo-ar {
  font-weight: 700;
  font-size: 16px;
}
.logo-en {
  font-size: 12px;
  opacity: 0.7;
  margin-right: 5px;
  color: var(--color-light-gray);
}

/* Notifications Dropdown */
.notifications-dropdown {
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
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notifications-header {
  padding: 12px 16px;
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
}
.mark-read-btn {
  font-size: 11px;
  color: var(--color-gold);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.mark-read-btn:hover {
  text-decoration: underline;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--color-light-gray);
  position: relative;
}
.notification-item:hover {
  background: var(--color-off-white);
}
.notification-item.unread {
  background: rgba(161, 139, 92, 0.03);
}

.notification-icon-bg {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notification-icon-bg.info {
  background: rgba(161, 139, 92, 0.1);
  color: var(--color-gold);
}
.notification-icon-bg.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.notification-icon-bg.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.notification-content {
  flex: 1;
}
.notification-text {
  font-size: 12px;
  color: var(--color-charcoal);
  line-height: 1.4;
  margin-bottom: 3px;
}
.notification-time {
  font-size: 10px;
  color: var(--color-dark-gray);
}

.unread-dot {
  width: 5px;
  height: 5px;
  background: var(--color-gold);
  border-radius: 50%;
  position: absolute;
  top: 12px;
  left: 12px; /* Adjusted for circular item */
  box-shadow: 0 0 8px rgba(177, 162, 143, 0.8);
}

.no-notifications {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-dark-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.no-notifications p {
  font-size: 14px;
  margin: 0;
}

/* Sidebar - Enhanced Luxury with Hover Expand (use :deep so child component is styled) */
:deep(.sidebar) {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 100vh;
  background: linear-gradient(180deg, var(--color-charcoal) 0%, #0f172a 100%);
  color: white;
  z-index: var(--z-sidebar);
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  box-shadow: 10px 0 40px rgba(0, 0, 0, 0.25), 5px 0 20px rgba(177, 162, 143, 0.1);
  border-left: 1px solid rgba(177, 162, 143, 0.15);
  backdrop-filter: blur(20px);
  animation: slideInFromRight 0.6s ease-out;
}

:deep(.sidebar)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(177, 162, 143, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

:deep(.sidebar):hover {
  width: 260px;
  box-shadow: 15px 0 60px rgba(0, 0, 0, 0.35), 8px 0 30px rgba(177, 162, 143, 0.2);
}

:deep(.sidebar).open {
  right: 0 !important;
  width: 260px;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.02);
}

.sidebar-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 50%; /* Circular */
  object-fit: cover;
  border: 1.5px solid rgba(177, 162, 143, 0.4);
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

:deep(.sidebar):hover .sidebar-logo-img {
  border-color: var(--color-gold-light);
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3);
  border-radius: 8px; /* Back to rounded square when expanded */
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 700;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.4s ease 0.1s;
}

:deep(.sidebar):hover .sidebar-logo-text {
  opacity: 1;
  transform: translateX(0);
}

.rakez-ar {
  color: var(--color-gold);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.rakez-en {
  font-size: 14px;
  opacity: 0.7;
  margin-right: 5px;
  color: var(--color-light-gray);
}

.sidebar-nav {
  flex: 1;
  padding: 18px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(177, 162, 143, 0.5) rgba(177, 162, 143, 0.1);
}

/* Custom Scrollbar للقائمة الجانبية */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(177, 162, 143, 0.1);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.5);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 8px auto; /* Increased vertical spacing */
  padding: 0;
  color: var(--color-dark-gray);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 50%;
  white-space: nowrap;
  position: relative;
  border: 1px solid transparent;
  animation: fadeInRight 0.5s ease-out backwards;
}

:deep(.sidebar):hover .nav-item {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  justify-content: flex-start;
  margin: 0;
}

/* Staggered Navigation Animation */
.nav-item:nth-child(1) {
  animation-delay: 0.1s;
}
.nav-item:nth-child(2) {
  animation-delay: 0.15s;
}
.nav-item:nth-child(3) {
  animation-delay: 0.2s;
}
.nav-item:nth-child(4) {
  animation-delay: 0.25s;
}
.nav-item:nth-child(5) {
  animation-delay: 0.3s;
}
.nav-item:nth-child(6) {
  animation-delay: 0.35s;
}
.nav-item:nth-child(7) {
  animation-delay: 0.4s;
}
.nav-item:nth-child(8) {
  animation-delay: 0.45s;
}
.nav-item:nth-child(9) {
  animation-delay: 0.5s;
}
.nav-item:nth-child(10) {
  animation-delay: 0.55s;
}

.nav-item::before {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
  border-radius: 2px;
  transition: height 0.3s ease;
  opacity: 0;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.15) 0%, rgba(177, 162, 143, 0.08) 100%);
  color: var(--color-light-gray);
  border-color: rgba(177, 162, 143, 0.3);
  box-shadow: 0 8px 25px rgba(177, 162, 143, 0.2), 0 0 15px rgba(177, 162, 143, 0.15);
}

:deep(.sidebar):hover .nav-item:hover {
  transform: translateX(-6px);
}

.nav-item:hover::before {
  height: 65%;
  opacity: 1;
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.6);
}

:deep(.sidebar):not(:hover) .nav-item:hover::before {
  display: none;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.25) 0%, rgba(177, 162, 143, 0.1) 100%);
  color: var(--color-gold-light);
  font-weight: 700;
  border: 1px solid rgba(177, 162, 143, 0.4);
  box-shadow: 0 0 15px rgba(177, 162, 143, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  border-radius: 50%; /* Explicitly circular when closed */
}

:deep(.sidebar):hover .nav-item.active {
  transform: translateX(-4px);
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.3) 0%, rgba(177, 162, 143, 0.1) 100%);
  box-shadow: 0 0 30px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 25px rgba(177, 162, 143, 0.2);
  animation: glow-pulse 2.5s ease-in-out infinite;
  border-radius: 12px; /* Rounded square when open */
}

/* إشعاع متوهج للعنصر النشط فقط عند فتح القائمة */
:deep(.sidebar):hover .nav-item.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.3) 0%, transparent 70%);
  border-radius: 14px;
  opacity: 0;
  animation: pulse-glow 2.5s ease-in-out infinite;
  z-index: -1;
}

.nav-item.active::before {
  height: 60%;
  opacity: 1;
  width: 3px;
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.5);
  display: none; /* Hide side indicator when circular */
}

:deep(.sidebar):hover .nav-item.active::before {
  display: block;
  height: 80%;
  width: 4px;
  background: linear-gradient(
    180deg,
    var(--color-gold-light) 0%,
    var(--color-gold) 50%,
    var(--color-gold-light) 100%
  );
  box-shadow: 0 0 15px rgba(177, 162, 143, 0.8);
  animation: border-glow 2.5s ease-in-out infinite;
}

/* انيميشن التوهج */
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 30px rgba(177, 162, 143, 0.5), 0 0 15px rgba(177, 162, 143, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 25px rgba(177, 162, 143, 0.3);
  }
  50% {
    box-shadow: 0 0 45px rgba(177, 162, 143, 0.7), 0 0 25px rgba(177, 162, 143, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 12px 35px rgba(177, 162, 143, 0.45);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.25);
  }
}

@keyframes border-glow {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(177, 162, 143, 0.8), 0 0 8px rgba(177, 162, 143, 0.6);
  }
  50% {
    box-shadow: 0 0 25px rgba(177, 162, 143, 1), 0 0 15px rgba(177, 162, 143, 0.9);
  }
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center; /* Center icon when circular */
  width: 100%;
}

:deep(.sidebar):hover .nav-content {
  justify-content: flex-start;
  gap: 20px;
}

.nav-icon-svg {
  width: 20px;
  height: 20px;
  color: var(--color-gold-light);
  stroke-width: 2;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 5px rgba(177, 162, 143, 0.6));
}

:deep(.sidebar):hover .nav-icon-svg {
  color: var(--color-dark-gray);
  filter: none;
}

.nav-item.active .nav-icon-svg {
  color: var(--color-gold-light) !important;
  filter: drop-shadow(0 0 8px rgba(177, 162, 143, 0.8)) !important;
  transform: scale(1.1);
}

.nav-item:hover .nav-icon-svg {
  transform: scale(1.15);
  color: var(--color-light-gray);
}

.nav-text {
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  pointer-events: none;
  position: absolute; /* Don't affect centering when collapsed */
  right: 60px;
}

:deep(.sidebar):hover .nav-text {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  position: relative;
  right: auto;
}

/* Luxury Tooltip for collapsed state */
.nav-item::after {
  content: attr(data-tooltip);
  position: absolute;
  right: 85px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  visibility: hidden;
  transform: translateX(10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: var(--z-tooltip);
  pointer-events: none;
  letter-spacing: 0.01em;
}

:deep(.sidebar):not(:hover) .nav-item:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.sidebar-footer {
  padding: 18px 12px;
  border-top: 1px solid rgba(177, 162, 143, 0.1);
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 18px;
  white-space: nowrap;
}

.user-info {
  flex: 1;
  text-align: right;
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.4s ease 0.1s;
}

:deep(.sidebar):hover .user-info {
  opacity: 1;
  transform: translateX(0);
}

.user-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-light-gray);
  display: block;
  margin-bottom: 1px;
}

.user-email {
  font-size: 11px;
  color: var(--color-dark-gray);
  display: block;
}

.user-role-badge {
  font-size: 11px;
  color: var(--color-gold);
  margin-top: 4px;
  font-weight: 600;
  display: block;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%; /* Make it circular */
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:deep(.sidebar):hover .avatar {
  transform: scale(1.08);
  border-color: rgba(177, 162, 143, 0.5);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3);
  border-radius: 12px; /* Back to rounded square when expanded */
}

.logout-btn {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: var(--color-error);
  width: 44px; /* Circular size */
  height: 44px;
  padding: 0;
  border-radius: 50%; /* Circular */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  margin: 0 auto;
}

:deep(.sidebar):hover .logout-btn {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  justify-content: flex-start;
  margin: 0;
  border-radius: 12px; /* Back to rounded square when expanded */
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.logout-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-text {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.4s ease;
  font-weight: 600;
  font-size: 13px;
}

:deep(.sidebar):hover .logout-text {
  opacity: 1;
  transform: translateX(0);
}

/* Clickable overlay to close sidebar on mobile (above content, below sidebar) */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-sidebar) - 1);
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s ease;
  cursor: pointer;
}
@media (max-width: 575px) {
  .sidebar-overlay {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
  }
}
@media (min-width: 992px) {
  .sidebar-overlay {
    display: none !important;
  }
}


/* Header/footer shift on hover (header is before sidebar in DOM so use app-container class) */
.app-container.sidebar-hovered .top-header {
  right: 260px;
}
.app-container.sidebar-hovered .footer {
  margin-right: 260px;
}

/* Main content: padding and z-index only; flex/overflow from Tailwind (flex-1 min-h-0 overflow-auto) */
.main-content {
  padding: 40px;
  position: relative;
  z-index: 5;
  min-width: 0;
}

/* Adjust header width */
.top-header {
  right: 80px;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Watermark */
.logo-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
  opacity: 0.05;
  text-align: center;
  width: 100%;
}
.logo-text-main {
  font-size: 100px;
  font-weight: 900;
  color: var(--color-gold);
}

.footer {
  height: 40px;
  background: white;
  border-top: 1px solid var(--color-medium-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 80px;
  transition: margin-right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:deep(.sidebar):hover ~ .footer {
  margin-right: 260px;
}

.copyright {
  color: var(--color-dark-gray);
  font-size: 11px;
}

/* Enhanced Responsive Design - All Screen Sizes */

/* 4K / Ultra-wide (3840px+) */
@media (min-width: 3840px) {
  .main-content {
    max-width: 3200px;
    margin: 0 auto;
    padding: 60px;
  }

  .top-header {
    padding: 0 60px;
    height: 90px;
  }

  :deep(.sidebar) {
    width: 100px;
  }

  :deep(.sidebar):hover {
    width: 320px;
  }

  .main-wrapper {
    margin-right: 100px;
  }

  .sidebar-logo-img {
    width: 48px;
    height: 48px;
  }

  .nav-icon-svg {
    width: 26px;
    height: 26px;
  }

  .nav-item {
    padding: 16px;
  }

  .logo-ar {
    font-size: 22px;
  }

  .logo-en {
    font-size: 16px;
  }

  .notification-btn .bell-icon {
    width: 28px;
    height: 28px;
  }

  .notifications-dropdown {
    width: 420px;
  }

}

/* 2K / QHD (2560px - 3839px) */
@media (min-width: 2560px) and (max-width: 3839px) {
  .main-content {
    max-width: 2400px;
    margin: 0 auto;
    padding: 52px;
  }

  .top-header {
    padding: 0 52px;
    height: 80px;
  }

  :deep(.sidebar) {
    width: 90px;
  }

  :deep(.sidebar):hover {
    width: 300px;
  }

  .main-wrapper {
    margin-right: 90px;
  }

  .sidebar-logo-img {
    width: 44px;
    height: 44px;
  }

  .nav-icon-svg {
    width: 24px;
    height: 24px;
  }

  .notifications-dropdown {
    width: 380px;
  }
}

/* Extra Large Screens (1920px - 2559px) */
@media (min-width: 1920px) and (max-width: 2559px) {
  .main-content {
    max-width: 1800px;
    margin: 0 auto;
    padding: 50px;
  }

  .top-header {
    padding: 0 50px;
  }
}

/* Large Desktop (1440px - 1919px) */
@media (min-width: 1440px) and (max-width: 1919px) {
  .main-content {
    padding: 45px;
  }

  .top-header {
    padding: 0 40px;
  }
}

/* Standard Desktop (1200px - 1439px) */
@media (min-width: 1200px) and (max-width: 1439px) {
  .main-content {
    padding: 40px;
  }

  .top-header {
    padding: 0 30px;
  }
}

/* Tablet & Small Desktop (992px - 1199px) - sidebar off-canvas, open on trigger */
@media (min-width: 992px) and (max-width: 1199px) {
  .top-header {
    right: 0 !important;
    padding: 0 20px;
  }

  :deep(.sidebar) {
    right: -280px !important;
    width: 280px !important;
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  .mobile-toggle {
    display: block;
  }

  .main-content {
    padding: 35px 25px;
  }

  .header-right .update-info {
    display: none;
  }

  .logo-ar {
    font-size: 16px;
  }

  .logo-en,
  .logo-sep {
    display: none;
  }

  .nav-text,
  .user-info,
  .sidebar-logo-text,
  .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }

  .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 15px !important;
  }

  .nav-item::after {
    display: none !important;
  }

  :deep(.sidebar):hover {
    width: 280px;
  }
}

/* Tablet Portrait (768px - 991px) - sidebar off-canvas, open on trigger */
@media (min-width: 768px) and (max-width: 991px) {
  .top-header {
    right: 0 !important;
    padding: 0 20px;
    height: 65px;
  }

  :deep(.sidebar) {
    right: -280px !important;
    width: 280px !important;
  }

  :deep(.sidebar).open {
    right: 0 !important;
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  .mobile-toggle {
    display: block;
  }

  .main-content {
    padding: 30px 20px;
  }

  .header-right .update-info {
    display: none;
  }

  .back-btn,
  .notification-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .logo-ar {
    font-size: 15px;
  }

  .logo-en,
  .logo-sep {
    display: none;
  }

  .nav-text,
  .user-info,
  .sidebar-logo-text,
  .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }

  .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 15px !important;
  }

  .nav-item {
    padding: 12px 14px;
  }

  .nav-item::after {
    display: none !important;
  }

  .sidebar-header {
    height: 80px;
    padding: 0 18px;
  }

  .sidebar-logo-img {
    width: 38px;
    height: 38px;
  }

  .sidebar-logo-text {
    font-size: 20px;
  }

  .sidebar-nav {
    padding: 20px 10px;
  }

  .sidebar-footer {
    padding: 20px 12px;
  }

  .notifications-dropdown {
    width: 300px;
    left: auto;
    right: 0;
  }

  .footer {
    height: 45px;
  }

  .copyright {
    font-size: 11px;
  }
}

/* Mobile Landscape (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .top-header {
    right: 0 !important;
    padding: 0 15px;
    height: 60px;
  }

  :deep(.sidebar) {
    right: -100% !important;
    width: 280px !important;
  }

  :deep(.sidebar).open {
    right: 0 !important;
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  /* Overlay handled by .sidebar-overlay (clickable) below sidebar z-index */
  .main-wrapper.sidebar-open::after {
    content: none;
    display: none;
  }

  .mobile-toggle {
    display: block;
    padding: 8px;
  }

  .main-content {
    padding: 25px 15px;
  }

  .header-right .update-info,
  .header-right .logo-icon-bg {
    display: none;
  }

  .back-btn,
  .notification-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .back-btn svg,
  .notification-btn svg {
    width: 18px;
    height: 18px;
  }

  .logo-ar {
    font-size: 14px;
  }

  .logo-en,
  .logo-sep {
    display: none;
  }

  .nav-text,
  .user-info,
  .sidebar-logo-text,
  .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }

  .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 12px !important;
    height: 40px;
  }

  .nav-item {
    padding: 12px 14px;
    border-radius: 12px;
  }

  .nav-icon-svg {
    width: 22px !important;
    height: 22px !important;
  }

  .nav-item::after {
    display: none !important;
  }

  .sidebar-header {
    height: 75px;
    padding: 0 16px;
  }

  .sidebar-logo-img {
    width: 36px;
    height: 36px;
  }

  .sidebar-logo-text {
    font-size: 18px;
  }

  .sidebar-nav {
    padding: 18px 8px;
    gap: 6px;
  }

  .sidebar-footer {
    padding: 18px 10px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .user-name {
    font-size: 14px;
  }

  .user-email {
    font-size: 11px;
  }

  .notifications-dropdown {
    width: 280px;
    left: auto;
    right: 0;
  }

  .notification-item {
    padding: 12px 16px;
  }

  .footer {
    display: none;
  }
}

/* Mobile Portrait (320px - 575px) */
@media (max-width: 575px) {
  .top-header {
    right: 0 !important;
    padding: 0 12px;
    height: 60px;
  }

  :deep(.sidebar) {
    right: -100% !important;
    width: 85% !important;
    max-width: 300px;
  }

  :deep(.sidebar).open {
    right: 0 !important;
    box-shadow: -10px 0 50px rgba(0, 0, 0, 0.5);
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  /* Overlay handled by .sidebar-overlay (clickable) */
  .main-wrapper.sidebar-open::after {
    content: none;
    display: none;
  }

  .mobile-toggle {
    display: block;
    padding: 6px;
  }

  .main-content {
    padding: 20px 12px;
  }

  .header-left {
    gap: 10px;
  }

  .header-right .update-info,
  .header-right .logo-icon-bg,
  .header-right .logo-sep {
    display: none;
  }

  .back-btn,
  .notification-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .back-btn svg,
  .notification-btn svg {
    width: 16px;
    height: 16px;
  }

  .notification-badge {
    min-width: 16px;
    height: 16px;
    font-size: 9px;
    top: -6px;
    right: -6px;
  }

  .logo-ar {
    font-size: 13px;
  }

  .logo-en {
    display: none;
  }

  .nav-text,
  .user-info,
  .sidebar-logo-text,
  .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }

  .logout-btn {
    width: 100% !important;
    padding: 0 12px !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    height: 38px;
    border-radius: 12px;
  }

  .logout-icon {
    font-size: 16px;
  }

  .logout-text {
    font-size: 13px;
  }

  .nav-item {
    padding: 11px 12px;
    border-radius: 12px;
    font-size: 14px;
  }

  .nav-content {
    gap: 12px;
  }

  .nav-icon-svg {
    width: 20px !important;
    height: 20px !important;
  }

  .nav-text {
    font-size: 14px;
  }

  .nav-item::after {
    display: none !important;
  }

  .sidebar-header {
    height: 70px;
    padding: 0 14px;
    gap: 12px;
  }

  .sidebar-logo-img {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .sidebar-logo-text {
    font-size: 17px;
  }

  .rakez-ar {
    font-size: 17px;
  }

  .rakez-en {
    font-size: 12px;
  }

  .sidebar-nav {
    padding: 16px 8px;
    gap: 5px;
  }

  .sidebar-footer {
    padding: 16px 10px;
    gap: 12px;
  }

  .user-profile {
    gap: 12px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .avatar-text {
    font-size: 16px;
  }

  .user-name {
    font-size: 13px;
  }

  .user-email {
    font-size: 10px;
  }

  .notifications-dropdown {
    width: calc(100vw - 24px);
    max-width: 340px;
    left: 12px;
    right: auto;
    top: 65px;
    border-radius: 14px;
  }

  .notifications-header {
    padding: 12px 16px;
  }

  .notifications-title {
    font-size: 15px;
  }

  .mark-read-btn {
    font-size: 11px;
  }

  .notification-item {
    padding: 12px 16px;
  }

  .notification-icon-bg {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .notification-icon-bg svg {
    width: 14px;
    height: 14px;
  }

  .notification-text {
    font-size: 12px;
  }

  .notification-time {
    font-size: 10px;
  }

  .footer {
    display: none;
  }
}

/* Extra Small Devices (< 320px) */
@media (max-width: 319px) {
  .top-header {
    padding: 0 10px;
    height: 55px;
  }

  .main-content {
    padding: 18px 10px;
  }

  :deep(.sidebar) {
    width: 90% !important;
  }

  .back-btn,
  .notification-btn {
    width: 34px;
    height: 34px;
  }

  .logo-ar {
    font-size: 12px;
  }

  .nav-item {
    padding: 10px;
    font-size: 13px;
  }

  .nav-icon-svg {
    width: 18px !important;
    height: 18px !important;
  }
}

/* Landscape Mode for Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  :deep(.sidebar) {
    width: 70% !important;
    max-width: 320px;
  }
}

/* Custom Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

/* Notification Badge Styles */
.icon-with-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-gold);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid var(--color-charcoal);
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* ======================================================
   Sidebar should NEVER disappear (all screen sizes)
   - Always show a compact sidebar rail.
   - Expand with toggle (adds .open class).
   ====================================================== */

.app-container {
  --sidebar-collapsed-width: 80px;
  --sidebar-expanded-width: 260px;
  --sidebar-rail-padding-y: 14px;
  --sidebar-rail-gap: 10px;
  --sidebar-rail-item: 44px;
}

/* Compact rail on smaller screens */
@media (max-width: 1199px) {
  .app-container {
    --sidebar-collapsed-width: 72px;
    --sidebar-expanded-width: 280px;
    --sidebar-rail-padding-y: 12px;
    --sidebar-rail-gap: 9px;
    --sidebar-rail-item: 42px;
  }
}

@media (max-width: 575px) {
  .app-container {
    --sidebar-collapsed-width: 64px;
    --sidebar-expanded-width: clamp(240px, 85vw, 320px);
    --sidebar-rail-padding-y: 10px;
    --sidebar-rail-gap: 8px;
    --sidebar-rail-item: 40px;
  }
}

/* Desktop only (>= 1200px): sidebar rail on-screen; below 1200px sidebar is off-canvas, open on trigger */
@media (min-width: 1200px) {
/* Keep header/content/footer clear of the compact rail */
.top-header {
  right: var(--sidebar-collapsed-width) !important;
}

.main-wrapper {
  margin-right: var(--sidebar-collapsed-width) !important;
}

.footer {
  margin-right: var(--sidebar-collapsed-width) !important;
}

/* Sidebar is always on-screen on desktop; on mobile it is off-canvas (see max-width rules) */
:deep(.sidebar) {
  right: 0 !important;
  width: var(--sidebar-collapsed-width) !important;
}

:deep(.sidebar):hover {
  width: var(--sidebar-expanded-width) !important;
}

:deep(.sidebar).open {
  width: var(--sidebar-expanded-width) !important;
}

/* Rail mode (collapsed): center icons + tight spacing - desktop only */
:deep(.sidebar):not(:hover):not(.open) .sidebar-nav {
  padding: var(--sidebar-rail-padding-y) 0 !important;
  gap: var(--sidebar-rail-gap) !important;
  align-items: center !important;
  overflow-x: hidden;
  /* Prevent scrollbar from shifting centering */
  scrollbar-width: none;
}
:deep(.sidebar):not(:hover):not(.open) .sidebar-nav::-webkit-scrollbar {
  width: 0 !important;
}

:deep(.sidebar):not(:hover):not(.open) .nav-item {
  width: var(--sidebar-rail-item) !important;
  height: var(--sidebar-rail-item) !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 50% !important;
  justify-content: center !important;
}

:deep(.sidebar):not(:hover):not(.open) .nav-content {
  justify-content: center !important;
}

:deep(.sidebar):not(:hover):not(.open) .nav-text {
  display: none !important;
}

:deep(.sidebar):not(:hover):not(.open) .sidebar-header {
  justify-content: center !important;
  padding: 0 !important;
  gap: 0 !important;
}

:deep(.sidebar):not(:hover):not(.open) .sidebar-logo-text {
  /* Prevent the stray "ر" from peeking in collapsed mode */
  display: none !important;
}

:deep(.sidebar):not(:hover):not(.open) .nav-item::after {
  /* No tooltips in rail mode (prevents layout jitter on small screens) */
  display: none !important;
}

:deep(.sidebar):not(:hover):not(.open) .sidebar-footer {
  padding: 12px 8px !important;
  align-items: center;
}

:deep(.sidebar):not(:hover):not(.open) .user-profile {
  justify-content: center;
  gap: 0 !important;
}

:deep(.sidebar):not(:hover):not(.open) .user-info {
  /* Hide layout box too, not only opacity (fixes bottom cut text) */
  display: none !important;
}

:deep(.sidebar):not(:hover):not(.open) .logout-text {
  display: none !important;
}

:deep(.sidebar):not(:hover):not(.open) .logout-btn {
  width: var(--sidebar-rail-item) !important;
  height: var(--sidebar-rail-item) !important;
  border-radius: 50% !important;
  padding: 0 !important;
  justify-content: center !important;
  margin: 0 auto !important;
}

/* Disable hover-expand on touch devices (use toggle only) - desktop touch */
@media (hover: none) and (pointer: coarse) {
  :deep(.sidebar):hover {
    width: var(--sidebar-collapsed-width) !important;
  }
}
}

/* When opened on mobile/tablet, don't block the page with overlay */
.main-wrapper.sidebar-open::after {
  display: none !important;
  content: none !important;
}

/* Push layout on pointer devices (hover/open) - large desktop only */
@media (min-width: 1200px) {
  .app-container.sidebar-open .top-header,
  .app-container.sidebar-hovered .top-header {
    right: var(--sidebar-expanded-width) !important;
  }

  .app-container.sidebar-open .main-wrapper,
  .app-container.sidebar-hovered .main-wrapper {
    margin-right: var(--sidebar-expanded-width) !important;
  }

  .app-container.sidebar-open .footer,
  .app-container.sidebar-hovered .footer {
    margin-right: var(--sidebar-expanded-width) !important;
  }
}

/* Make "open" behave like hover (show texts/layout) */
:deep(.sidebar).open .sidebar-logo-text,
:deep(.sidebar).open .nav-text,
:deep(.sidebar).open .user-info,
:deep(.sidebar).open .logout-text {
  opacity: 1 !important;
  transform: none !important;
  pointer-events: auto;
}

:deep(.sidebar).open .nav-item {
  width: 100% !important;
  height: 48px !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
  justify-content: flex-start !important;
  margin: 0 !important;
}

:deep(.sidebar).open .nav-content {
  justify-content: flex-start !important;
  gap: 20px !important;
}

:deep(.sidebar).open .nav-text {
  position: relative !important;
  right: auto !important;
}

:deep(.sidebar).open .logout-btn {
  width: 100% !important;
  padding: 0 15px !important;
  justify-content: flex-start !important;
  margin: 0 !important;
  border-radius: 12px !important;
}

/* Make the compact rail look nicer on very small screens */
@media (max-width: 575px) {
  .sidebar-header {
    height: 56px !important;
    padding: 0 8px !important;
    justify-content: center;
  }

  .sidebar-logo-text {
    display: none !important;
  }

  .sidebar-logo-img {
    width: 28px !important;
    height: 28px !important;
    border-radius: 10px !important;
  }

  .sidebar-nav {
    padding: 12px 6px !important;
    gap: 4px !important;
  }

  .nav-item {
    width: 40px !important;
    height: 40px !important;
    margin: 6px auto !important;
  }

  .nav-icon-svg {
    width: 20px !important;
    height: 20px !important;
  }

  .sidebar-footer {
    padding: 10px 8px !important;
    gap: 10px !important;
  }

  .avatar {
    width: 38px !important;
    height: 38px !important;
    border-radius: 12px !important;
  }

  .logout-btn {
    width: 38px !important;
    height: 38px !important;
  }

  .sidebar-nav::-webkit-scrollbar {
    width: 2px;
  }
  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>

<!-- Body scroll lock when mobile sidebar is open (global, unscoped) -->
<style>
body.sidebar-drawer-open {
  overflow: hidden;
  touch-action: none;
}
</style>
