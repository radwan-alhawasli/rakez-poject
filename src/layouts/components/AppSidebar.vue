<template>
  <Sidebar side="right" class="sidebar sidebar-luxury">
    <SidebarHeader>
      <img src="/img/logo-circle.png" class="sidebar-logo-img" alt="شعار راكز" width="48" height="48" fetchpriority="high" />
      <div class="sidebar-logo-text">
        <span class="rakez-ar">راكز</span> | <span class="rakez-en">Rakez</span>
      </div>
    </SidebarHeader>
  
    <SidebarContent>
      <template v-for="(item, idx) in visibleNavItems" :key="item.to + '-' + idx">
        <router-link
          :to="item.to"
          class="nav-item"
          active-class="active"
          :data-tooltip="item.tooltip || item.label"
        >
          <div class="nav-content">
            <div v-if="item.hasBadge" class="icon-with-badge">
              <svg
                class="nav-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                v-html="item.icon"
              ></svg>
              <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
            </div>
            <svg
              v-else
              class="nav-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              v-html="item.icon"
            ></svg>
            <span class="nav-text">{{ getItemLabel(item) }}</span>
          </div>
        </router-link>
      </template>
    </SidebarContent>
  
    <SidebarFooter>
      <div class="user-profile">
          <div class="avatar">
            <span class="avatar-text">{{ (user?.name || 'A').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user?.name || 'Admin' }}</div>
            <div class="user-email">{{ user?.email || 'admin@rakez.com' }}</div>
            <div v-if="sidebarRoleLabel" class="user-role-badge">{{ sidebarRoleLabel }}</div>
          </div>
        </div>
        <button @click="$emit('logout')" class="logout-btn">
          <span class="logout-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="20"
              height="20"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line></svg
          ></span>
          <span class="logout-text">تسجيل الخروج</span>
        </button>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup>
import { computed } from 'vue';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { getNavItemsForRole } from './sidebarConfig.js';

const props = defineProps({
  user: { type: Object, default: null },
  userRole: { type: Number, default: 0 },
  sidebarRoleLabel: { type: String, default: '' },
  hasPermission: { type: Function, required: true },
  hasAnyPermission: { type: Function, required: true },
  unreadCount: { type: Number, default: 0 },
});

defineEmits(['logout']);

/** الحصول على قائمة العناصر المرئية حسب الدور والصلاحيات */
const visibleNavItems = computed(() => {
  const items = getNavItemsForRole(props.userRole);
  return items.filter(item => {
    // فحص الصلاحية
    if (item.permission && !props.hasPermission(item.permission)) {
      return false;
    }
    // فحص showIf (مثل isManager)
    if (item.showIf === 'isManager') {
      return props.user?.is_manager === true || props.user?.is_manager === 1;
    }
    return true;
  });
});

/** الحصول على التسمية الديناميكية (مثل أهداف الفريق/أهدافي) */
function getItemLabel(item) {
  if (item.dynamicLabel) {
    return props.hasPermission(item.dynamicLabel.permission)
      ? item.dynamicLabel.ifTrue
      : item.dynamicLabel.ifFalse;
  }
  return item.label;
}
</script>

<style src="./styles/AppSidebar.global.s1.css"></style>
<style src="./styles/AppSidebar.global.s2.css"></style>
