<template>
  <Sidebar side="right" class="sidebar sidebar-luxury">
    <SidebarHeader>
      <img src="/img/logo-circle.png" class="sidebar-logo-img" alt="Logo" />
      <div class="sidebar-logo-text">
        <span class="rakez-ar">راكز</span> | <span class="rakez-en">Rakez</span>
      </div>
    </SidebarHeader>
  
    <SidebarContent>
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
  
          <router-link to="/sales/analytics" class="nav-item" active-class="active" data-tooltip="التحليلات">
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
          </router-link>
  
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
  
          <router-link to="/contracts" class="nav-item" active-class="active" data-tooltip="إحضار المشاريع">
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
          </router-link>
  
          <router-link to="/reservations" class="nav-item" active-class="active" data-tooltip="الحجوزات">
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
  
          <router-link to="/cancelled-reservations" class="nav-item" active-class="active" data-tooltip="الحجوزات الملغاة">
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
  
          <router-link to="/sales/sold-units" class="nav-item" active-class="active" data-tooltip="الوحدات المباعة">
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
          </router-link>
  
          <router-link to="/accounting/dashboard" class="nav-item" active-class="active" data-tooltip="الحسابات">
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
  
        <!-- 2.5. بحث الوحدات -->
        <router-link
          v-if="hasPermission('sales.projects.view')"
          to="/sales/unit-search"
          class="nav-item"
          exact-active-class="active"
          data-tooltip="بحث الوحدات"
        >
          <div class="nav-content">
            <svg
              class="nav-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span class="nav-text">بحث الوحدات</span>
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
import { useRoute } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';

defineProps({
  user: { type: Object, default: null },
  userRole: { type: Number, default: 0 },
  sidebarRoleLabel: { type: String, default: '' },
  hasPermission: { type: Function, required: true },
  hasAnyPermission: { type: Function, required: true },
  unreadCount: { type: Number, default: 0 },
});

defineEmits(['logout']);

const route = useRoute();
</script>

<style>
/* Base sidebar-internal styles (not scoped so they reach through sub-components) */

.sidebar-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(177, 162, 143, 0.4);
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
  border-color: var(--color-gold-light);
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3);
  border-radius: 8px;
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

.sidebar .nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 8px auto;
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
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
  border-radius: 2px;
  transition: height 0.3s ease;
  opacity: 0;
}

.sidebar .nav-item:hover {
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.15) 0%, rgba(177, 162, 143, 0.08) 100%);
  color: var(--color-light-gray);
  border-color: rgba(177, 162, 143, 0.3);
  box-shadow: 0 8px 25px rgba(177, 162, 143, 0.2), 0 0 15px rgba(177, 162, 143, 0.15);
}
.sidebar:hover .nav-item:hover {
  transform: translateX(-6px);
}
.sidebar .nav-item:hover::before {
  height: 65%;
  opacity: 1;
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.6);
}
.sidebar:not(:hover) .nav-item:hover::before {
  display: none;
}

.sidebar .nav-item.active {
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.25) 0%, rgba(177, 162, 143, 0.1) 100%);
  color: var(--color-gold-light);
  font-weight: 700;
  border: 1px solid rgba(177, 162, 143, 0.4);
  box-shadow: 0 0 15px rgba(177, 162, 143, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  border-radius: 50%;
}
.sidebar:hover .nav-item.active {
  transform: translateX(-4px);
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.3) 0%, rgba(177, 162, 143, 0.1) 100%);
  box-shadow: 0 0 30px rgba(177, 162, 143, 0.4), 0 0 15px rgba(177, 162, 143, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 25px rgba(177, 162, 143, 0.2);
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
  background: radial-gradient(circle, rgba(177, 162, 143, 0.3) 0%, transparent 70%);
  border-radius: 14px;
  opacity: 0;
  animation: sidebar-pulse-glow 2.5s ease-in-out infinite;
  z-index: -1;
}
.sidebar .nav-item.active::before {
  height: 60%;
  opacity: 1;
  width: 3px;
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.5);
  display: none;
}
.sidebar:hover .nav-item.active::before {
  display: block;
  height: 80%;
  width: 4px;
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 50%, var(--color-gold-light) 100%);
  box-shadow: 0 0 15px rgba(177, 162, 143, 0.8);
  animation: sidebar-border-glow 2.5s ease-in-out infinite;
}

@keyframes sidebar-glow-pulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(177, 162, 143, 0.5), 0 0 15px rgba(177, 162, 143, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 25px rgba(177, 162, 143, 0.3);
  }
  50% {
    box-shadow: 0 0 45px rgba(177, 162, 143, 0.7), 0 0 25px rgba(177, 162, 143, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 12px 35px rgba(177, 162, 143, 0.45);
  }
}
@keyframes sidebar-pulse-glow {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.25); }
}
@keyframes sidebar-border-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(177, 162, 143, 0.8), 0 0 8px rgba(177, 162, 143, 0.6); }
  50% { box-shadow: 0 0 25px rgba(177, 162, 143, 1), 0 0 15px rgba(177, 162, 143, 0.9); }
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
.sidebar .nav-item.active .nav-icon-svg {
  color: var(--color-gold-light) !important;
  filter: drop-shadow(0 0 8px rgba(177, 162, 143, 0.8)) !important;
  transform: scale(1.1);
}
.sidebar .nav-item:hover .nav-icon-svg {
  transform: scale(1.15);
  color: var(--color-light-gray);
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
  background: var(--color-error);
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
  color: var(--color-light-gray);
  display: block;
  margin-bottom: 1px;
}
.sidebar .user-email {
  font-size: 11px;
  color: var(--color-dark-gray);
  display: block;
}
.sidebar .user-role-badge {
  font-size: 11px;
  color: var(--color-gold);
  margin-top: 4px;
  font-weight: 600;
  display: block;
}

.sidebar .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
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
  border-radius: 12px;
}

.sidebar .logout-btn {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: var(--color-error);
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
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
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
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.02);
}
.sidebar .sidebar-nav {
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
.sidebar .sidebar-nav::-webkit-scrollbar { width: 6px; }
.sidebar .sidebar-nav::-webkit-scrollbar-track {
  background: rgba(177, 162, 143, 0.1);
  border-radius: 3px;
}
.sidebar .sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}
.sidebar .sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: 0 0 10px rgba(177, 162, 143, 0.5);
}
.sidebar .sidebar-footer {
  padding: 18px 12px;
  border-top: 1px solid rgba(177, 162, 143, 0.1);
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
