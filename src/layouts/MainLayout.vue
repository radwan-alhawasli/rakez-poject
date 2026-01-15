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
                  <svg v-if="notification.type==='success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <svg v-else-if="notification.type==='warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
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

    <div class="main-wrapper">
      <!-- القائمة الجانبية -->
      <aside class="sidebar">
        <div class="sidebar-header">
           <img src="/img/logo-circle.png" class="sidebar-logo-img" alt="Logo" />
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
            
            <router-link to="/notifications" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>
            
            <a href="#" class="nav-item">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span class="nav-text">التحليلات</span>
              </div>
            </a>
            
            <router-link to="/project-management" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </router-link>
            
            <router-link to="/contracts" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span class="nav-text">العقود</span>
              </div>
            </router-link>
            
            <router-link to="/developers" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="nav-text">المطورون</span>
              </div>
            </router-link>
            
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

          <!-- Project Manager Sidebar -->
          <template v-else-if="userRole == 3">
            <!-- 1. لوحة التحكم -->
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>
            
            <!-- 2. الإشعارات -->
            <router-link to="/notifications" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 3. إدارة المشاريع -->
            <router-link to="/project-management" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </router-link>



            <!-- 4. المطورون -->
            <router-link to="/developers" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="nav-text">المطورون</span>
              </div>
            </router-link>

            <!-- 5. الحجوزات -->
            <router-link to="/reservations" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </router-link>

            <!-- 6. الحجوزات الملغاة -->
            <router-link to="/cancelled-reservations" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </router-link>

            <!-- 7. طلب مشروع حصري -->
            <router-link to="/exclusive-request" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

            <!-- 8. طلباتي -->
            <router-link to="/my-requests" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>

            <!-- 9. الملف الشخصي -->
            <router-link to="/profile" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>


            <!-- العقود (إضافي) -->
            <router-link to="/contracts" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span class="nav-text">العقود</span>
              </div>
            </router-link>
          </template>

          <!-- Project Management Manager Sidebar (Role 10 - Placeholder) -->
          <template v-else-if="userRole == 10">
             <!-- 1. لوحة التحكم -->
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>
            
            <!-- 2. الإشعارات -->
            <router-link to="/notifications" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 3. إدارة المشاريع -->
            <router-link to="/project-management" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span class="nav-text">إدارة المشاريع</span>
              </div>
            </router-link>

            <!-- الموافقة على الصور (New) -->
            <router-link to="/image-approval" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                <span class="nav-text">الموافقة على الصور</span>
              </div>
            </router-link>

            <!-- 4. المطورون -->
            <router-link to="/developers" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="nav-text">المطورون</span>
              </div>
            </router-link>

            <!-- 5. الحجوزات -->
            <router-link to="/reservations" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span class="nav-text">الحجوزات</span>
              </div>
            </router-link>

            <!-- 6. الحجوزات الملغاة -->
            <router-link to="/cancelled-reservations" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                <span class="nav-text">الحجوزات الملغاة</span>
              </div>
            </router-link>

            <!-- 7. طلب مشروع حصري -->
            <router-link to="/exclusive-request" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <span class="nav-text">طلب مشروع حصري</span>
              </div>
            </router-link>

             <!-- 8. طلباتي -->
            <router-link to="/my-requests" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span class="nav-text">طلباتي</span>
              </div>
            </router-link>

            <!-- 9. الملف الشخصي -->
            <router-link to="/profile" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>


             <!-- العقود -->
            <router-link to="/contracts" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span class="nav-text">العقود</span>
              </div>
            </router-link>

          </template>
          
          <!-- HR Sidebar (Role 6) -->
          <template v-else-if="userRole == 6">
            <!-- 1. لوحة التحكم (HR) -->
            <router-link to="/hr/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم (HR)</span>
              </div>
            </router-link>

            <!-- 2. الأفرقة -->
            <router-link to="/hr/teams" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="nav-text">الأفرقة</span>
              </div>
            </router-link>

            <!-- 3. أداء الأفرقة -->
            <router-link to="/hr/team-performance" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span class="nav-text">أداء الأفرقة</span>
              </div>
            </router-link>

            <!-- 4. أداء الموظفين -->
            <router-link to="/hr/employee-performance" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">أداء الموظفين</span>
              </div>
            </router-link>

            <!-- 5. إدارة المستخدمين -->
            <router-link to="/hr/users" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span class="nav-text">إدارة المستخدمين</span>
              </div>
            </router-link>

            <!-- 6. لوحة التحكم العامة (Optional/Backup) -->
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span class="nav-text">لوحة التحكم العامة</span>
              </div>
            </router-link>

            <!-- 7. الإشعارات -->
            <router-link to="/notifications" class="nav-item" active-class="active">
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>

            <!-- 8. الملف الشخصي -->
            <router-link to="/profile" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="nav-text">الملف الشخصي</span>
              </div>
            </router-link>
          </template>

          <!-- Marketer Sidebar (Matches Image 2) -->
          <template v-else>
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <div class="nav-content">
                <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span class="nav-text">لوحة التحكم</span>
              </div>
            </router-link>
            
            <router-link to="/notifications" class="nav-item" active-class="active">
              <div class="nav-content">
                <div class="icon-with-badge">
                  <svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
                </div>
                <span class="nav-text">الإشعارات</span>
              </div>
            </router-link>
            
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import notificationService from '../services/notificationService'
import authService from '../services/authService'

export default {
  name: 'MainLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const user = computed(() => {
        route.path
        return authService.getCurrentUser()
    })
    const showNotifications = ref(false)
    
    if (!authService.isAuthenticated()) {
      router.push('/login')
    }
    
    // Use the comprehensive notification service
    const notifications = notificationService.getAll()
    
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
    
    const toggleNotifications = () => { showNotifications.value = !showNotifications.value }
    
    const markAsRead = (id) => { 
      notificationService.markAsRead(id)
    }
    
    const markAllAsRead = () => { 
        notificationService.markAllAsRead()
    }

    const userRole = computed(() => {
      let type = user.value?.type
      if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1
      
      // Project Management Role (3)
      if (type == 3 || type === 'project_management') {
          return user.value?.is_manager ? 10 : 3
      }

      // HR Role (6) - Normalize if it's coming as string or from constants
      const roleMap = {
        'hr': 6,
        'marketer': 0,
        'sales': 5,
        'accounting': 6, // Keep consistent if needed
      }

      if (typeof type === 'string' && roleMap[type] !== undefined) {
        type = roleMap[type]
      }
      
      return parseInt(type) ?? 0
    })

    const handleLogout = async () => {
      await authService.logout()
      notificationService.disconnect()
      router.push('/login')
    }

    onMounted(() => {
      notificationService.init()
    })

    onUnmounted(() => {
      notificationService.disconnect()
    })

    return {
      user,
      userRole,
      showNotifications,
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
  border-bottom: 2px solid #B1A28F;
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
  border-color: #B1A28F;
  color: #B1A28F;
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.15);
  transform: translateY(-2px);
}
.back-btn:hover, .notification-btn:hover { border-color: #B1A28F; background: white; }

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
.mark-read-btn { font-size: 12px; color: #B1A28F; background: none; border: none; cursor: pointer; font-weight: 600; }
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
.notification-icon-bg.info { background: rgba(161, 139, 92, 0.1); color: #B1A28F; }
.notification-icon-bg.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.notification-icon-bg.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.notification-content { flex: 1; }
.notification-text { font-size: 13px; color: #1e293b; line-height: 1.4; margin-bottom: 4px; }
.notification-time { font-size: 11px; color: #94a3b8; }

.unread-dot {
    width: 6px; height: 6px; background: #B1A28F; border-radius: 50%;
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
  height: 80px; display: flex; align-items: center; padding: 0 20px; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-logo-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(161, 139, 92, 0.3);
}

.sidebar-logo-text { font-size: 20px; font-weight: 700; font-family: 'Amiri', serif; }
.rakez-ar { color: #B1A28F; }
.rakez-en { font-size: 14px; opacity: 0.7; margin-right: 5px; }

.sidebar-nav { flex: 1; padding: 15px 10px; overflow-y: auto; }

.nav-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 15px; color: #94a3b8; text-decoration: none;
  font-size: 14px; transition: all 0.2s; border-radius: 8px; margin-bottom: 2px;
}

.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: linear-gradient(90deg, #334155 0%, #1e293b 100%); color: #B1A28F; font-weight: 700; border-left: 3px solid #B1A28F; }

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
.logo-text-main { font-size: 100px; font-weight: 900; color: #B1A28F; font-family: 'Amiri', serif; }

.footer { height: 50px; background: white; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-right: 260px; }
.copyright { color: #94a3b8; font-size: 12px; }

/* Custom Scrollbar */
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

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
  background: #B1A28F;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #1e293b;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

</style>
