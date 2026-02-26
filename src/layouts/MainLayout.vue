<template>
  <div
    class="app-container"
    :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-hovered': isSidebarHovered }"
  >
    <!-- الهيدر العلوي -->
    <header class="top-header">
      <div class="header-left">
        <button class="mobile-toggle" @click="toggleSidebar">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button class="back-btn" @click="$router.back()">
          <svg
            class="arrow-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="notification-wrapper">
          <button class="notification-btn" @click="toggleNotifications">
            <svg
              class="bell-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>

          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notifications-header">
              <h3 class="notifications-title">الإشعارات</h3>
              <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-read-btn">
                تعيين الكل كمقروء
              </button>
            </div>
            <div class="notifications-list custom-scrollbar">
              <div v-if="notifications.length === 0" class="no-notifications">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity="0.3"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>لا يوجد إشعارات جديدة</p>
              </div>
              <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['notification-item', { unread: !notification.read }]"
                @click="markAsRead(notification.id)"
              >
                <div class="notification-icon-bg" :class="notification.type">
                  <svg
                    v-if="notification.type === 'success'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else-if="notification.type === 'warning'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    ></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <svg
                    v-else
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div class="notification-content">
                  <div class="notification-text">{{ notification.title }}</div>
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

    <div class="main-wrapper" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- القائمة الجانبية -->
      <aside
        class="sidebar"
        :class="{ open: isSidebarOpen }"
        @mouseenter="onSidebarEnter"
        @mouseleave="onSidebarLeave"
      >
        <div class="sidebar-header">
          <img src="/img/logo-circle.png" class="sidebar-logo-img" alt="Logo" />
          <div class="sidebar-logo-text">
            <span class="rakez-ar">راكز</span> | <span class="rakez-en">Rakez</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <!-- AI Assistant - for all users -->
          <router-link
            to="/ai-assistant"
            class="nav-item"
            active-class="active"
            data-tooltip="المساعد الذكي"
          >
            <div class="nav-content">
              <svg
                class="nav-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span class="nav-text">المساعد الذكي</span>
            </div>
          </router-link>

          <!-- Chat - for all users -->
          <router-link
            to="/chat"
            class="nav-item"
            active-class="active"
            data-tooltip="المحادثات"
          >
            <div class="nav-content">
              <svg
                class="nav-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span class="nav-text">المحادثات</span>
            </div>
          </router-link>

          <!-- Admin Sidebar (Matches Image 1) -->
          <template v-if="userRole == 1">
            <router-link
              to="/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <router-link
              to="/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <a href="#" class="nav-item" data-tooltip="التحليلات">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span class="nav-text">التحليلات</span>
              </div>
            </a>

            <router-link
              to="/project-management"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة المشاريع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </router-link>

            <router-link
              to="/contracts"
              class="nav-item"
              active-class="active"
              data-tooltip="العقود"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="nav-text">العقود</span>
              </div>
            </router-link>

            <router-link
              to="/developers"
              class="nav-item"
              active-class="active"
              data-tooltip="المطورون"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">المطورون</span>
              </div>
            </router-link>

            <router-link
              to="/team-management"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة الفرق"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                <span class="nav-text">إدارة الفرق</span>
              </div>
            </router-link>

            <router-link
              to="/users"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة المستخدمين"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">إدارة المستخدمين</span>
              </div>
            </router-link>

            <router-link to="/agents" class="nav-item" active-class="active" data-tooltip="الوكلاء">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="nav-text">الوكلاء / Agents</span>
              </div>
            </router-link>

            <router-link
              v-if="hasPermission('manage-ai-knowledge')"
              to="/knowledge-management"
              class="nav-item"
              active-class="active"
              data-tooltip="قاعدة المعرفة"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span class="nav-text">قاعدة المعرفة</span>
              </div>
            </router-link>

            <router-link
              to="/commission-deposits/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="العمولات والودائع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span class="nav-text">العمولات والودائع</span>
              </div>
            </router-link>

            <a href="#" class="nav-item" data-tooltip="إحضار المشاريع">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span class="nav-text">إحضار المشاريع</span>
              </div>
            </a>

            <a href="#" class="nav-item" data-tooltip="الحجوزات">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </a>

            <a href="#" class="nav-item" data-tooltip="الحجوزات الملغاة">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </a>

            <a href="#" class="nav-item" data-tooltip="الوحدات المباعة">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span class="nav-text">الوحدات المباعة</span>
              </div>
            </a>

            <a href="#" class="nav-item" data-tooltip="الحسابات">
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span class="nav-text">الحسابات</span>
              </div>
            </a>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>
          </template>

          <!-- Project Manager Sidebar -->
          <template v-else-if="userRole == 3 || userRole == 10">
            <!-- 1. لوحة التحكم -->
            <router-link
              to="/project-management"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <!-- 2. الإشعارات -->
            <router-link
              to="/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 3. إدارة المشاريع -->
            <router-link
              to="/project-management"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة المشاريع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </router-link>

            <!-- 4. إدارة الفرق (New) -->
            <router-link
              to="/team-management"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة الفرق"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">إدارة الفرق</span>
              </div>
            </router-link>

            <!-- 4. المطورون -->
            <router-link
              to="/developers"
              class="nav-item"
              active-class="active"
              data-tooltip="المطورون"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">المطورون</span>
              </div>
            </router-link>

            <!-- 5. الحجوزات -->
            <router-link
              to="/reservations"
              class="nav-item"
              active-class="active"
              data-tooltip="الحجوزات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </router-link>

            <!-- 6. الحجوزات الملغاة -->
            <router-link
              to="/cancelled-reservations"
              class="nav-item"
              active-class="active"
              data-tooltip="الحجوزات الملغاة"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </router-link>

            <!-- 8. طلباتي -->
            <router-link
              v-if="hasPermission('exclusive_projects.request')"
              to="/my-requests"
              class="nav-item"
              active-class="active"
              data-tooltip="طلباتي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <!-- 9. الملف الشخصي -->
            <router-link
              to="/profile"
              class="nav-item"
              active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- Sales Sidebar (Role 5) - Sales & Sales Leader: exact-active so only current page is highlighted -->
          <template v-else-if="userRole == 5">
            <!-- 0. الرئيسية (Dashboard) -->
            <router-link
              v-if="hasPermission('sales.dashboard.view')"
              to="/sales/dashboard"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الرئيسية"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">الرئيسية</span>
              </div>
            </router-link>

            <!-- 1. الأهداف -->
            <router-link
              v-if="hasPermission('sales.targets.view')"
              to="/sales/targets"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الأهداف"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <span class="nav-text">الأهداف</span>
              </div>
            </router-link>

            <!-- 2. المشاريع -->
            <router-link
              v-if="hasPermission('sales.projects.view')"
              to="/sales/projects"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="المشاريع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">المشاريع</span>
              </div>
            </router-link>

            <!-- 3. الحجوزات -->
            <router-link
              v-if="hasPermission('sales.reservations.view')"
              to="/sales/reservations"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الحجوزات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </router-link>

            <!-- 4. دوامي -->
            <router-link
              v-if="hasPermission('sales.attendance.view')"
              to="/sales/attendance"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="دوامي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="nav-text">دوامي</span>
              </div>
            </router-link>

            <!-- 5. الفريق (Sales Leader only) -->
            <router-link
              v-if="hasPermission('sales.team.manage')"
              to="/sales/team"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الفريق"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">الفريق</span>
              </div>
            </router-link>

            <!-- 6. المهام (Sales Leader only) -->
            <router-link
              v-if="hasPermission('sales.tasks.manage')"
              to="/sales/tasks"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="المهام"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <polyline points="9 11 12 14 22 4"></polyline>
                </svg>
                <span class="nav-text">المهام</span>
              </div>
            </router-link>

            <!-- توزيع الشفتات (Sales Leader only) -->
            <router-link
              v-if="hasPermission('sales.projects.allocate_shifts')"
              to="/sales/assignments"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="توزيع الشفتات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">توزيع الشفتات</span>
              </div>
            </router-link>

            <!-- 10. خطط الدفع (Sales Leader only) -->
            <router-link
              v-if="hasPermission('sales.payment-plan.manage')"
              to="/sales/payment-plans"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="خطط الدفع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span class="nav-text">خطط الدفع</span>
              </div>
            </router-link>

            <!-- 11. إدارة دوام المشاريع (Sales Leader only) -->
            <router-link
              v-if="hasPermission('sales.attendance.manage')"
              to="/sales/project-schedules"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة دوام المشاريع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>
                </svg>
                <span class="nav-text">إدارة دوام المشاريع</span>
              </div>
            </router-link>

            <!-- 12. الوحدات المباعة -->
            <router-link
              v-if="hasPermission('sales.sold_units.view')"
              to="/sales/sold-units"
              class="nav-item"
              active-class="active"
              data-tooltip="الوحدات المباعة"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">الوحدات المباعة</span>
              </div>
            </router-link>

            <!-- 13. الودائع -->
            <router-link
              v-if="hasPermission('sales.deposits.view')"
              to="/sales/deposits"
              class="nav-item"
              active-class="active"
              data-tooltip="الودائع"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span class="nav-text">الودائع</span>
              </div>
            </router-link>

            <!-- 14. التحليلات -->
            <router-link
              v-if="hasPermission('sales.analytics.view')"
              to="/sales/analytics"
              class="nav-item"
              active-class="active"
              data-tooltip="التحليلات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span class="nav-text">التحليلات</span>
              </div>
            </router-link>

            <!-- 15. الإشعارات -->
            <router-link
              v-if="hasPermission('notifications.view')"
              to="/notifications"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg
                    class="nav-icon-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 12. طلباتي -->
            <router-link
              v-if="hasPermission('exclusive_projects.request')"
              to="/my-requests"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="طلباتي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- 13. الملف الشخصي -->
            <router-link
              to="/profile"
              class="nav-item"
              exact-active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- HR Sidebar (Role 8) - Comprehensive Management & Employee View -->
          <template v-else-if="userRole == 8">
            <!-- 1. لوحة التحكم -->
            <router-link
              v-if="hasPermission('hr.dashboard.view')"
              to="/hr/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <!-- 2. الإشعارات -->
            <router-link
              v-if="hasPermission('notifications.view')"
              to="/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg
                    class="nav-icon-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 3. إدارة الأفرقة (3.2) -->
            <router-link
              v-if="hasPermission('hr.teams.manage')"
              to="/hr/teams"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة الفرق"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">إدارة الفرق</span>
              </div>
            </router-link>

            <!-- 4. أداء المسوقين (3.3) -->
            <router-link
              v-if="hasPermission('hr.performance.view')"
              to="/hr/employee-performance"
              class="nav-item"
              active-class="active"
              data-tooltip="أداء المسوقين"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                <span class="nav-text">أداء المسوقين</span>
              </div>
            </router-link>

            <!-- 5. إدارة المستخدمين (3.4) -->
            <router-link
              v-if="hasPermission('hr.users.create')"
              to="/hr/users"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة المستخدمين"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">إدارة المستخدمين</span>
              </div>
            </router-link>

            <!-- 6. التقارير (5.0) -->
            <router-link
              v-if="hasPermission('hr.reports.view')"
              to="/hr/reports"
              class="nav-item"
              active-class="active"
              data-tooltip="التقارير"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="nav-text">التقارير</span>
              </div>
            </router-link>

            <!-- 7. طلباتي -->
            <router-link
              to="/my-requests"
              class="nav-item"
              active-class="active"
              data-tooltip="طلباتي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <!-- 8. الملف الشخصي -->
            <router-link
              to="/profile"
              class="nav-item"
              active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- Credit Sidebar (Role 6) -->
          <template v-else-if="userRole == 6">
            <router-link
              to="/credit/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <router-link
              to="/credit/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg
                    class="nav-icon-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <router-link
              to="/credit/bookings"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة الحجوزات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">إدارة الحجوزات</span>
              </div>
            </router-link>

            <router-link
              to="/credit/claim-files"
              class="nav-item"
              active-class="active"
              data-tooltip="إصدار ملف المطالبة والإفراغات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span class="nav-text">إصدار ملف المطالبة والإفراغات</span>
              </div>
            </router-link>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <router-link
              to="/profile"
              class="nav-item"
              active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- Accounting Sidebar (Role 7) -->
          <template v-else-if="userRole == 7">
            <router-link
              to="/accounting/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg
                    class="nav-icon-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/sold-units"
              class="nav-item"
              active-class="active"
              data-tooltip="الوحدات المباعة"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-text">الوحدات المباعة</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/commissions"
              class="nav-item"
              active-class="active"
              data-tooltip="العمولات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span class="nav-text">العمولات</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/deposits"
              class="nav-item"
              active-class="active"
              data-tooltip="إدارة العربون والمتابعة"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="nav-text">إدارة العربون والمتابعة</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/salaries"
              class="nav-item"
              active-class="active"
              data-tooltip="الرواتب وتوزيع العمولات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">الرواتب وتوزيع العمولات</span>
              </div>
            </router-link>

            <router-link
              to="/accounting/confirmations"
              class="nav-item"
              active-class="active"
              data-tooltip="التأكيدات"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="nav-text">التأكيدات</span>
              </div>
            </router-link>

            <router-link
              to="/developers"
              class="nav-item"
              active-class="active"
              data-tooltip="عرض المطورين"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">عرض المطورين</span>
              </div>
            </router-link>

            <router-link
              to="/exclusive-request"
              class="nav-item"
              active-class="active"
              data-tooltip="طلب مشروع حصري"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <router-link
              to="/profile"
              class="nav-item"
              active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- Marketer Sidebar (Matches Image 2) -->
          <template v-else>
            <router-link
              v-if="hasPermission('marketing.dashboard.view')"
              to="/marketing/dashboard"
              class="nav-item"
              active-class="active"
              data-tooltip="لوحة التحكم"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>

            <router-link
              to="/notifications"
              class="nav-item"
              active-class="active"
              data-tooltip="الإشعارات"
            >
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg
                    class="nav-icon-svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <router-link
              v-if="hasPermission('marketing.projects.view')"
              to="/marketing/projects"
              class="nav-item"
              active-class="active"
              data-tooltip="مشاريع التسويق"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 21h18"></path>
                  <path
                    d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"
                  ></path>
                  <line x1="5" y1="21" x2="5" y2="10"></line>
                  <line x1="9" y1="21" x2="9" y2="10"></line>
                  <line x1="13" y1="21" x2="13" y2="10"></line>
                  <line x1="17" y1="21" x2="17" y2="10"></line>
                </svg>
                <span class="nav-text">مشاريع التسويق</span>
              </div>
            </router-link>

            <router-link
              v-if="hasPermission('marketing.plans.create')"
              to="/marketing/developer-plan"
              class="nav-item"
              active-class="active"
              data-tooltip="خطة المطور"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="nav-text">خطة المطور</span>
              </div>
            </router-link>

            <router-link
              v-if="hasPermission('marketing.plans.create')"
              to="/marketing/employee-plans"
              class="nav-item"
              active-class="active"
              data-tooltip="خطط الموظفين"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="nav-text">خطط الموظفين</span>
              </div>
            </router-link>

            <!-- المهام الخاصة بي -->
            <router-link
              to="/tasks"
              class="nav-item"
              active-class="active"
              data-tooltip="المهام الخاصة بي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span class="nav-text">المهام الخاصة بي</span>
              </div>
            </router-link>

            <router-link
              v-if="hasPermission('marketing.reports.view')"
              to="/marketing/reports"
              class="nav-item"
              active-class="active"
              data-tooltip="أدائي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                <span class="nav-text">أدائي</span>
              </div>
            </router-link>

            <router-link
              to="/profile"
              class="nav-item"
              active-class="active"
              data-tooltip="الملف الشخصي"
            >
              <div class="nav-content">
                <svg
                  class="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
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
              <div v-if="sidebarRoleLabel" class="user-role-badge">{{ sidebarRoleLabel }}</div>
            </div>
          </div>
          <button @click="handleLogout" class="logout-btn">
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
        </div>
      </aside>

      <!-- Watermark Background -->

      <!-- المحتوى المتغير -->
      <main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <component v-if="Component" :is="Component" :key="route.path" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import notificationService from '../services/notificationService';
import authService from '../services/authService';
import { usePermissions } from '../composables/usePermissions';
import { getRoleLabel } from '../constants/roles';

export default {
  name: 'MainLayout',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const isSidebarOpen = ref(false);
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    // Used to "push" layout on hover for pointer devices
    const isSidebarHovered = ref(false);
    const onSidebarEnter = () => {
      isSidebarHovered.value = true;
    };
    const onSidebarLeave = () => {
      isSidebarHovered.value = false;
    };

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
    });

    onUnmounted(() => {
      notificationService.disconnect();
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
      toggleSidebar,
      onSidebarEnter,
      onSidebarLeave,
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
  min-height: 100vh;
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

.sidebar:hover ~ .top-header {
  right: 260px;
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

.sidebar:hover .notification-badge {
  top: -4px;
  right: -4px;
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
  width: 300px;
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

.sidebar:hover .unread-dot {
  top: 18px;
  left: 12px;
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

/* Sidebar - Enhanced Luxury with Hover Expand */
.sidebar {
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

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(177, 162, 143, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.sidebar:hover {
  width: 260px;
  box-shadow: 15px 0 60px rgba(0, 0, 0, 0.35), 8px 0 30px rgba(177, 162, 143, 0.2);
}

.sidebar.open {
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

.sidebar:hover .sidebar-logo-img {
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

.sidebar:hover .sidebar-logo-text {
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

.sidebar:hover .nav-item {
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

.sidebar:hover .nav-item:hover {
  transform: translateX(-6px);
}

.nav-item:hover::before {
  height: 65%;
  opacity: 1;
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.6);
}

.sidebar:not(:hover) .nav-item:hover::before {
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

.sidebar:hover .nav-item.active {
  transform: translateX(-4px);
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.3) 0%, rgba(177, 162, 143, 0.1) 100%);
  box-shadow: 0 0 30px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 25px rgba(177, 162, 143, 0.2);
  animation: glow-pulse 2.5s ease-in-out infinite;
  border-radius: 12px; /* Rounded square when open */
}

/* إشعاع متوهج للعنصر النشط فقط عند فتح القائمة */
.sidebar:hover .nav-item.active::after {
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

.sidebar:hover .nav-item.active::before {
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

.sidebar:hover .nav-content {
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

.sidebar:hover .nav-icon-svg {
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

.sidebar:hover .nav-text {
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

.sidebar:not(:hover) .nav-item:hover::after {
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

.sidebar:hover .user-info {
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

.sidebar:hover .avatar {
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

.sidebar:hover .logout-btn {
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

.sidebar:hover .logout-text {
  opacity: 1;
  transform: translateX(0);
}

/* Main Wrapper */
.main-wrapper {
  margin-right: 80px;
  padding-top: 60px;
  min-height: 100vh;
  position: relative;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sidebar:hover ~ .main-wrapper {
  margin-right: 260px;
}

.main-content {
  padding: 40px;
  position: relative;
  z-index: 5;
  overflow-x: hidden;
  min-width: 0;
}

/* Adjust header width */
.top-header {
  right: 80px;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sidebar:hover ~ .top-header {
  right: 260px;
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
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sidebar:hover ~ .footer {
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

  .sidebar {
    width: 100px;
  }

  .sidebar:hover {
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

  .user-display-name {
    font-size: 16px;
  }

  .user-email-text {
    font-size: 13px;
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

  .sidebar {
    width: 90px;
  }

  .sidebar:hover {
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

/* Tablet & Small Desktop (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .top-header {
    right: 0 !important;
    padding: 0 20px;
  }

  .sidebar {
    right: -280px;
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

  .sidebar:hover {
    width: 280px;
  }
}

/* Tablet Portrait (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .top-header {
    right: 0 !important;
    padding: 0 20px;
    height: 65px;
  }

  .sidebar {
    right: -280px;
    width: 280px !important;
  }

  .sidebar.open {
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

  .sidebar {
    right: -100%;
    width: 280px !important;
  }

  .sidebar.open {
    right: 0 !important;
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  .main-wrapper.sidebar-open::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: var(--z-overlay);
    animation: fadeIn 0.3s ease;
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

  .sidebar {
    right: -100%;
    width: 85% !important;
    max-width: 300px;
  }

  .sidebar.open {
    right: 0 !important;
    box-shadow: -10px 0 50px rgba(0, 0, 0, 0.5);
  }

  .main-wrapper,
  .footer {
    margin-right: 0 !important;
  }

  .main-wrapper.sidebar-open::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: var(--z-overlay);
    animation: fadeIn 0.3s ease;
    backdrop-filter: blur(2px);
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

  .sidebar {
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
  .sidebar {
    width: 70% !important;
    max-width: 320px;
  }

  .sidebar-nav {
    padding: 12px 8px;
  }

  .nav-item {
    padding: 8px 12px;
  }

  .sidebar-header {
    height: 60px;
  }

  .sidebar-footer {
    padding: 12px 10px;
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

/* Sidebar is always on-screen; never off-canvas */
.sidebar {
  right: 0 !important;
  width: var(--sidebar-collapsed-width) !important;
}

.sidebar:hover {
  width: var(--sidebar-expanded-width) !important;
}

.sidebar.open {
  width: var(--sidebar-expanded-width) !important;
}

/* ------------------------------------------------------
   Rail mode (collapsed): center icons + tight spacing
   Applies on ALL screen sizes, ensuring consistent look.
   ------------------------------------------------------ */
.sidebar:not(:hover):not(.open) .sidebar-nav {
  padding: var(--sidebar-rail-padding-y) 0 !important;
  gap: var(--sidebar-rail-gap) !important;
  align-items: center !important;
  overflow-x: hidden;
  /* Prevent scrollbar from shifting centering */
  scrollbar-width: none;
}
.sidebar:not(:hover):not(.open) .sidebar-nav::-webkit-scrollbar {
  width: 0 !important;
}

.sidebar:not(:hover):not(.open) .nav-item {
  width: var(--sidebar-rail-item) !important;
  height: var(--sidebar-rail-item) !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 50% !important;
  justify-content: center !important;
}

.sidebar:not(:hover):not(.open) .nav-content {
  justify-content: center !important;
}

.sidebar:not(:hover):not(.open) .nav-text {
  display: none !important;
}

.sidebar:not(:hover):not(.open) .sidebar-header {
  justify-content: center !important;
  padding: 0 !important;
  gap: 0 !important;
}

.sidebar:not(:hover):not(.open) .sidebar-logo-text {
  /* Prevent the stray "ر" from peeking in collapsed mode */
  display: none !important;
}

.sidebar:not(:hover):not(.open) .nav-item::after {
  /* No tooltips in rail mode (prevents layout jitter on small screens) */
  display: none !important;
}

.sidebar:not(:hover):not(.open) .sidebar-footer {
  padding: 12px 8px !important;
  align-items: center;
}

.sidebar:not(:hover):not(.open) .user-profile {
  justify-content: center;
  gap: 0 !important;
}

.sidebar:not(:hover):not(.open) .user-info {
  /* Hide layout box too, not only opacity (fixes bottom cut text) */
  display: none !important;
}

.sidebar:not(:hover):not(.open) .logout-text {
  display: none !important;
}

.sidebar:not(:hover):not(.open) .logout-btn {
  width: var(--sidebar-rail-item) !important;
  height: var(--sidebar-rail-item) !important;
  border-radius: 50% !important;
  padding: 0 !important;
  justify-content: center !important;
  margin: 0 auto !important;
}

/* When opened on mobile/tablet, don't block the page with overlay */
.main-wrapper.sidebar-open::after {
  display: none !important;
  content: none !important;
}

/* Disable hover-expand on touch devices (use toggle only) */
@media (hover: none) and (pointer: coarse) {
  .sidebar:hover {
    width: var(--sidebar-collapsed-width) !important;
  }
}

/* Push layout on pointer devices (hover/open) */
@media (min-width: 992px) {
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
.sidebar.open .sidebar-logo-text,
.sidebar.open .nav-text,
.sidebar.open .user-info,
.sidebar.open .logout-text {
  opacity: 1 !important;
  transform: none !important;
  pointer-events: auto;
}

.sidebar.open .nav-item {
  width: 100% !important;
  height: 48px !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
  justify-content: flex-start !important;
  margin: 0 !important;
}

.sidebar.open .nav-content {
  justify-content: flex-start !important;
  gap: 20px !important;
}

.sidebar.open .nav-text {
  position: relative !important;
  right: auto !important;
}

.sidebar.open .logout-btn {
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
