/**
 * Main shell: sidebar state, auth redirect, notifications binding, logout.
 * @module layouts/composables/useMainLayout
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import { usePermissions } from '@/composables/usePermissions';
import { getRoleLabel } from '@/constants/roles';
import { normalizeRole } from '@/utils/rbac';
import { useChatUnreadBadge } from '@/composables/chat/useChatUnreadBadge';

const MOBILE_BREAKPOINT = 992;

export function useMainLayout() {
  const route = useRoute();
  const router = useRouter();
  const { chatUnreadCount, refreshChatUnreadCount } = useChatUnreadBadge();

  const isSidebarOpen = ref(false);
  const isSidebarHovered = ref(false);

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

  const notifications = computed(() => {
    const n = notificationService.getAll();
    const val = n?.value ?? n;
    return Array.isArray(val) ? val : [];
  });

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
  };

  /**
   * @param {any} id
   */
  const markAsRead = id => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const userRole = computed(() => {
    const rawType = user.value?.type;
    const normalized = normalizeRole(/** @type {any} */ (rawType));
    return normalized !== null ? normalized : 0;
  });

  const sidebarRoleLabel = computed(() => {
    const u = user.value;
    if (!u) return '';
    return (
      getRoleLabel(u.type, {
        is_manager: u.is_manager,
        is_executive_director: u.is_executive_director,
        is_leader: u.is_leader,
      }) || ''
    );
  });

  const handleLogout = async () => {
    await authService.logout();
    notificationService.disconnect();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-drawer-open');
    }
    router.replace({ path: '/login', query: { from: 'logout', t: String(Date.now()) } });
  };

  onMounted(() => {
    if (authService.isAuthenticated()) {
      authService.fetchCurrentUser();
    }
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
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-drawer-open');
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
    chatUnreadCount,
    refreshChatUnreadCount,
    isSidebarOpen,
    isSidebarHovered,
    isMobile,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    handleLogout,
  };
}

