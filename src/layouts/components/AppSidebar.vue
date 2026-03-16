<template>
  <Sidebar side="right" class="sidebar sidebar-luxury">
    <SidebarHeader>
      <img src="/img/logo-circle.png" class="sidebar-logo-img" alt="Logo" />
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

<style>
/* Base sidebar-internal styles (not scoped so they reach through sub-components) */

.sidebar {
  background: #27374D !important;
  border-left: 1px solid rgba(181, 169, 154, 0.35);
}

.sidebar-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(181, 169, 154, 0.6);
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 700;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.4s ease 0.1s;
}
.sidebar:hover .sidebar-logo-text {
  opacity: 1;
  transform: translateX(0);
}
.sidebar:hover .sidebar-logo-img {
  border-color: #B5A99A;
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(181, 169, 154, 0.3);
  border-radius: 8px;
}

.rakez-ar {
  color: #B5A99A;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.rakez-en {
  font-size: 14px;
  opacity: 0.9;
  margin-right: 5px;
  color: #B5A99A;
}

.sidebar .nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 8px auto;
  padding: 0;
  color: #B5A99A;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 50%;
  white-space: nowrap;
  position: relative;
  border: 1px solid transparent;
  animation: fadeInRight 0.5s ease-out backwards;
}
.sidebar:hover .nav-item {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  justify-content: flex-start;
  margin: 0;
}

.sidebar .nav-item:nth-child(1) { animation-delay: 0.1s; }
.sidebar .nav-item:nth-child(2) { animation-delay: 0.15s; }
.sidebar .nav-item:nth-child(3) { animation-delay: 0.2s; }
.sidebar .nav-item:nth-child(4) { animation-delay: 0.25s; }
.sidebar .nav-item:nth-child(5) { animation-delay: 0.3s; }
.sidebar .nav-item:nth-child(6) { animation-delay: 0.35s; }
.sidebar .nav-item:nth-child(7) { animation-delay: 0.4s; }
.sidebar .nav-item:nth-child(8) { animation-delay: 0.45s; }
.sidebar .nav-item:nth-child(9) { animation-delay: 0.5s; }
.sidebar .nav-item:nth-child(10) { animation-delay: 0.55s; }

.sidebar .nav-item::before {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: rgba(181, 169, 154, 0.5);
  border-radius: 2px;
  transition: height 0.3s ease;
  opacity: 0;
}

.sidebar .nav-item:hover {
  background: rgba(181, 169, 154, 0.15);
  color: #B5A99A;
  border-color: rgba(181, 169, 154, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 0 0 15px rgba(181, 169, 154, 0.2);
}
.sidebar:hover .nav-item:hover {
  transform: translateX(-6px);
}
.sidebar .nav-item:hover::before {
  height: 65%;
  opacity: 1;
  box-shadow: 0 0 10px rgba(181, 169, 154, 0.5);
}
.sidebar:not(:hover) .nav-item:hover::before {
  display: none;
}

.sidebar .nav-item.active {
  background: rgba(181, 169, 154, 0.2);
  color: #B5A99A;
  font-weight: 700;
  border: 1px solid rgba(181, 169, 154, 0.45);
  box-shadow: 0 0 15px rgba(181, 169, 154, 0.2), inset 0 1px 0 rgba(181, 169, 154, 0.2);
  position: relative;
  border-radius: 50%;
}
.sidebar:hover .nav-item.active {
  transform: translateX(-4px);
  background: rgba(181, 169, 154, 0.2);
  box-shadow: 0 0 30px rgba(181, 169, 154, 0.12), 0 0 15px rgba(181, 169, 154, 0.1),
    inset 0 1px 0 rgba(181, 169, 154, 0.2), 0 8px 25px rgba(0, 0, 0, 0.1);
  animation: sidebar-glow-pulse 2.5s ease-in-out infinite;
  border-radius: 12px;
}
.sidebar:hover .nav-item.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(181, 169, 154, 0.15) 0%, transparent 70%);
  border-radius: 14px;
  opacity: 0;
  animation: sidebar-pulse-glow 2.5s ease-in-out infinite;
  z-index: -1;
}
.sidebar .nav-item.active::before {
  height: 60%;
  opacity: 1;
  width: 3px;
  background: #B5A99A;
  box-shadow: 0 0 10px rgba(181, 169, 154, 0.5);
  display: none;
}
.sidebar:hover .nav-item.active::before {
  display: block;
  height: 80%;
  width: 4px;
  background: #B5A99A;
  box-shadow: 0 0 15px rgba(181, 169, 154, 0.6);
  animation: sidebar-border-glow 2.5s ease-in-out infinite;
}

@keyframes sidebar-glow-pulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(181, 169, 154, 0.12), 0 0 15px rgba(181, 169, 154, 0.1),
      inset 0 1px 0 rgba(181, 169, 154, 0.2), 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 45px rgba(181, 169, 154, 0.2), 0 0 25px rgba(181, 169, 154, 0.15),
      inset 0 1px 0 rgba(181, 169, 154, 0.3), 0 12px 35px rgba(0, 0, 0, 0.15);
  }
}
@keyframes sidebar-pulse-glow {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.25); }
}
@keyframes sidebar-border-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(181, 169, 154, 0.5), 0 0 8px rgba(181, 169, 154, 0.35); }
  50% { box-shadow: 0 0 25px rgba(181, 169, 154, 0.75), 0 0 15px rgba(181, 169, 154, 0.5); }
}

.sidebar .nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.sidebar:hover .nav-content {
  justify-content: flex-start;
  gap: 20px;
}

.sidebar .nav-icon-svg {
  width: 20px;
  height: 20px;
  color: #B5A99A;
  stroke-width: 2;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
}
.sidebar:hover .nav-icon-svg {
  color: #B5A99A;
  filter: none;
}
.sidebar .nav-item.active .nav-icon-svg {
  color: #B5A99A !important;
  filter: drop-shadow(0 0 8px rgba(181, 169, 154, 0.5)) !important;
  transform: scale(1.1);
}
.sidebar .nav-item:hover .nav-icon-svg {
  transform: scale(1.15);
  color: #B5A99A;
}

.sidebar .nav-text {
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  pointer-events: none;
  position: absolute;
  right: 60px;
}
.sidebar:hover .nav-text {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  position: relative;
  right: auto;
}

.sidebar .nav-item::after {
  content: attr(data-tooltip);
  position: absolute;
  right: 85px;
  background: rgba(255, 255, 255, 0.95);
  color: #27374D;
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
}
.sidebar:not(:hover) .nav-item:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.sidebar .icon-with-badge {
  position: relative;
  display: inline-flex;
}
.sidebar .notif-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5); }
  50% { transform: scale(1.15); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.7); }
}

.sidebar .user-profile {
  display: flex;
  align-items: center;
  gap: 18px;
  white-space: nowrap;
}
.sidebar .user-info {
  flex: 1;
  text-align: right;
  opacity: 0;
  transform: translateX(15px);
  transition: all 0.4s ease 0.1s;
}
.sidebar:hover .user-info {
  opacity: 1;
  transform: translateX(0);
}
.sidebar .user-name {
  font-weight: 600;
  font-size: 13px;
  color: #B5A99A;
  display: block;
  margin-bottom: 1px;
}
.sidebar .user-email {
  font-size: 11px;
  color: rgba(181, 169, 154, 0.9);
  display: block;
}
.sidebar .user-role-badge {
  font-size: 11px;
  color: #B5A99A;
  margin-top: 4px;
  font-weight: 600;
  display: block;
}

.sidebar .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #B0A68A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  border: 1px solid rgba(181, 169, 154, 0.5);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.sidebar:hover .avatar {
  transform: scale(1.08);
  border-color: #B5A99A;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(181, 169, 154, 0.3);
  border-radius: 12px;
}

.sidebar .logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
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
.sidebar:hover .logout-btn {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  justify-content: flex-start;
  margin: 0;
  border-radius: 12px;
}
.sidebar .logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
  color: #ffffff;
}
.sidebar .logout-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar .logout-text {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.4s ease;
  font-weight: 600;
  font-size: 13px;
}
.sidebar:hover .logout-text {
  opacity: 1;
  transform: translateX(0);
}

/* =========================================
   Structural elements
   ========================================= */
.sidebar .sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.05);
}
/* غلاف التمرير — عرض ثابت. التمرير الفعلي داخل SidebarScrollArea (شريط مخصص overlay) */
.sidebar .sidebar-nav-outer {
  width: 100%;
}
.sidebar .sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* إخفاء شريط التمرير المخصص عند طي اللوحة (rail) */
.sidebar:not(:hover):not(.open) .sidebar-scroll-track {
  opacity: 0;
  pointer-events: none;
}
.sidebar .sidebar-footer {
  padding: 18px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* =========================================
   Responsive – 4K (3840 px +)
   ========================================= */
@media (min-width: 3840px) {
  .sidebar .sidebar-logo-img { width: 48px; height: 48px; }
  .sidebar .nav-icon-svg { width: 26px; height: 26px; }
  .sidebar .nav-item { padding: 16px; }
}

/* 2K / QHD (2560 – 3839 px) */
@media (min-width: 2560px) and (max-width: 3839px) {
  .sidebar .sidebar-logo-img { width: 44px; height: 44px; }
  .sidebar .nav-icon-svg { width: 24px; height: 24px; }
}

/* Tablet & Small Desktop (992 – 1199 px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .sidebar .nav-text,
  .sidebar .user-info,
  .sidebar .sidebar-logo-text,
  .sidebar .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }
  .sidebar .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 15px !important;
  }
  .sidebar .nav-item::after { display: none !important; }
}

/* Tablet Portrait (768 – 991 px) */
@media (min-width: 768px) and (max-width: 991px) {
  .sidebar .nav-text,
  .sidebar .user-info,
  .sidebar .sidebar-logo-text,
  .sidebar .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }
  .sidebar .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 15px !important;
  }
  .sidebar .nav-item { padding: 12px 14px; }
  .sidebar .nav-item::after { display: none !important; }
  .sidebar .sidebar-header { height: 80px; padding: 0 18px; }
  .sidebar .sidebar-logo-img { width: 38px; height: 38px; }
  .sidebar .sidebar-logo-text { font-size: 20px; }
  .sidebar .sidebar-nav { padding: 20px 10px; }
  .sidebar .sidebar-footer { padding: 20px 12px; }
}

/* Mobile Landscape (576 – 767 px) */
@media (min-width: 576px) and (max-width: 767px) {
  .sidebar .nav-text,
  .sidebar .user-info,
  .sidebar .sidebar-logo-text,
  .sidebar .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }
  .sidebar .logout-btn {
    width: 100% !important;
    padding: 0 15px !important;
    justify-content: flex-start !important;
    gap: 12px !important;
    height: 40px;
  }
  .sidebar .nav-item { padding: 12px 14px; border-radius: 12px; }
  .sidebar .nav-icon-svg { width: 22px !important; height: 22px !important; }
  .sidebar .nav-item::after { display: none !important; }
  .sidebar .sidebar-header { height: 75px; padding: 0 16px; }
  .sidebar .sidebar-logo-img { width: 36px; height: 36px; }
  .sidebar .sidebar-logo-text { font-size: 18px; }
  .sidebar .sidebar-nav { padding: 18px 8px; gap: 6px; }
  .sidebar .sidebar-footer { padding: 18px 10px; }
  .sidebar .avatar { width: 40px; height: 40px; }
  .sidebar .user-name { font-size: 14px; }
  .sidebar .user-email { font-size: 11px; }
}

/* Mobile Portrait (320 – 575 px) */
@media (max-width: 575px) {
  .sidebar .nav-text,
  .sidebar .user-info,
  .sidebar .sidebar-logo-text,
  .sidebar .logout-text {
    opacity: 1 !important;
    transform: none !important;
  }
  .sidebar .logout-btn {
    width: 100% !important;
    padding: 0 12px !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    height: 38px;
    border-radius: 12px;
  }
  .sidebar .logout-icon { font-size: 16px; }
  .sidebar .logout-text { font-size: 13px; }
  .sidebar .nav-item { padding: 11px 12px; border-radius: 12px; font-size: 14px; }
  .sidebar .nav-content { gap: 12px; }
  .sidebar .nav-icon-svg { width: 20px !important; height: 20px !important; }
  .sidebar .nav-text { font-size: 14px; }
  .sidebar .nav-item::after { display: none !important; }
  .sidebar .sidebar-header { height: 70px; padding: 0 14px; gap: 12px; }
  .sidebar .sidebar-logo-img { width: 34px; height: 34px; border-radius: 10px; }
  .sidebar .sidebar-logo-text { font-size: 17px; }
  .sidebar .rakez-ar { font-size: 17px; }
  .sidebar .rakez-en { font-size: 12px; }
  .sidebar .sidebar-nav { padding: 16px 8px; gap: 5px; }
  .sidebar .sidebar-footer { padding: 16px 10px; gap: 12px; }
  .sidebar .user-profile { gap: 12px; }
  .sidebar .avatar { width: 38px; height: 38px; border-radius: 12px; }
  .sidebar .avatar-text { font-size: 16px; }
  .sidebar .user-name { font-size: 13px; }
  .sidebar .user-email { font-size: 10px; }
}

/* Extra Small (< 320 px) */
@media (max-width: 319px) {
  .sidebar .nav-item { padding: 10px; font-size: 13px; }
  .sidebar .nav-icon-svg { width: 18px !important; height: 18px !important; }
}

/* Landscape Mode for Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .sidebar .sidebar-nav { padding: 12px 8px; }
  .sidebar .nav-item { padding: 8px 12px; }
  .sidebar .sidebar-header { height: 60px; }
  .sidebar .sidebar-footer { padding: 12px 10px; }
}

/* Compact rail refinements – very small screens */
@media (max-width: 575px) {
  .sidebar .sidebar-header {
    height: 56px !important;
    padding: 0 8px !important;
    justify-content: center;
  }
  .sidebar .sidebar-logo-text { display: none !important; }
  .sidebar .sidebar-logo-img {
    width: 28px !important;
    height: 28px !important;
    border-radius: 10px !important;
  }
  .sidebar .sidebar-nav {
    padding: 12px 6px !important;
    gap: 4px !important;
  }
  .sidebar .nav-item {
    width: 40px !important;
    height: 40px !important;
    margin: 6px auto !important;
  }
  .sidebar .nav-icon-svg {
    width: 20px !important;
    height: 20px !important;
  }
  .sidebar .sidebar-footer {
    padding: 10px 8px !important;
    gap: 10px !important;
  }
  .sidebar .avatar {
    width: 38px !important;
    height: 38px !important;
    border-radius: 12px !important;
  }
  .sidebar .logout-btn {
    width: 38px !important;
    height: 38px !important;
  }
  .sidebar .sidebar-nav::-webkit-scrollbar { width: 2px; }
  .sidebar .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); }
}
</style>
