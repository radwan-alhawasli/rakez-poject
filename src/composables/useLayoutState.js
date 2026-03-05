/**
 * Shared state for the main application layout.
 * Extracted from MainLayout.vue.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import logger from '@/utils/logger';

export function useLayoutState() {
  const router = useRouter();

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  const sidebarOpen = ref(false);
  const isMobile = ref(false);

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 992;
    if (!isMobile.value) sidebarOpen.value = false;
  };

  onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  // ─── Notifications ────────────────────────────────────────────────────────
  const notifications = ref([]);
  const showNotifications = ref(false);
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
  };

  const closeNotifications = () => {
    showNotifications.value = false;
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      notifications.value = response?.data?.data || response?.data || response || [];
    } catch (error) {
      logger.error('Error loading notifications:', error);
    }
  };

  // ─── Session Warning ──────────────────────────────────────────────────────
  const showSessionWarning = ref(false);
  const sessionWarningCountdown = ref(0);

  // ─── Current User ─────────────────────────────────────────────────────────
  const currentUser = computed(() => authService.getCurrentUser());

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      router.push({ name: 'Login' });
    }
  };

  return {
    // Sidebar
    sidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    // Notifications
    notifications,
    showNotifications,
    unreadCount,
    toggleNotifications,
    closeNotifications,
    loadNotifications,
    // Session
    showSessionWarning,
    sessionWarningCountdown,
    // User
    currentUser,
    handleLogout,
  };
}
