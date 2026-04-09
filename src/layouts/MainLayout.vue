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
    <header>
      <AppHeader
        :notifications="notifications"
        :show-notifications="showNotifications"
        :unread-count="unreadCount"
        :chat-unread-count="chatUnreadCount"
        @toggle-notifications="toggleNotifications"
        @mark-as-read="markAsRead"
        @mark-all-read="markAllAsRead"
      />
    </header>

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
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import { useMainLayout } from './composables/useMainLayout.js';

export default {
  name: 'MainLayout',
  components: {
    SidebarProvider,
    SidebarInset,
    AppHeader,
    AppSidebar,
  },
  setup() {
    return useMainLayout();
  },
};
</script>

<style scoped src="./styles/main-layout.scoped.s1.css"></style>
<style scoped src="./styles/main-layout.scoped.s2.css"></style>
<style scoped src="./styles/main-layout.scoped.s3.css"></style>
<style scoped src="./styles/main-layout.scoped.s4.css"></style>
<style scoped src="./styles/main-layout.scoped.s5.css"></style>

<!-- Body scroll lock when mobile sidebar is open (global, unscoped) -->
<style>
body.sidebar-drawer-open {
  overflow: hidden;
  touch-action: none;
}
</style>
