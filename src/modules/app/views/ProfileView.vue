<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
    <!-- Page Header -->
    <div class="welcome-header">
      <div class="avatar-large">
        <span>{{ userInitial }}</span>
      </div>
      <h1 class="welcome-title">{{ user.name }}</h1>
      <p class="welcome-subtitle">{{ jobRoleLabel }}</p>
    </div>

    <!-- Profile Content -->
    <div class="profile-content">
      <!-- Personal Information -->
      <div class="profile-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          المعلومات الشخصية
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <label>الاسم الكامل</label>
            <p>{{ user.name }}</p>
          </div>
          <div class="info-item">
            <label>البريد الإلكتروني</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="info-item">
            <label>رقم الجوال</label>
            <p>{{ user.phone || 'غير محدد' }}</p>
          </div>
          <div class="info-item">
            <label>الدور الوظيفي</label>
            <p>{{ jobRoleLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="profile-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
          إعدادات الحساب
        </h2>
        <div class="settings-list">
          <button class="settings-btn" @click="handleComingSoon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            تغيير كلمة المرور
          </button>
          <button class="settings-btn" @click="handleComingSoon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            إعدادات الإشعارات
          </button>
          <button class="settings-btn" @click="handleComingSoon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20"></path>
              <path
                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              ></path>
            </svg>
            اللغة والمنطقة
          </button>
        </div>
      </div>

      <!-- Activity Stats -->
      <div class="profile-section">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          إحصائيات النشاط
        </h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ userStats.reservations }}</div>
            <div class="stat-label">الحجوزات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.sold }}</div>
            <div class="stat-label">المباعة</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.pending }}</div>
            <div class="stat-label">قيد الانتظار</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.cancelled }}</div>
            <div class="stat-label">ملغاة</div>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <button class="logout-btn" @click="handleLogout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        تسجيل الخروج
      </button>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/authService';
import { getRoleLabel } from '@/constants/roles';
import { toast } from '@/composables/useToast';

const router = useRouter();
const isLoading = ref(true);

const user = computed(
  () =>
    authService.getCurrentUser() || {
      name: 'مستخدم',
      email: 'user@rakez.com',
      type: 3,
    }
);

const userInitial = computed(() => {
  return (user.value.name || 'م').charAt(0).toUpperCase();
});

/** الدور الوظيفي من type في استجابة تسجيل الدخول (رقم أو نص) */
const jobRoleLabel = computed(() => {
  const u = user.value;
  if (!u) return 'غير محدد';
  return (
    getRoleLabel(u.type, { is_manager: u.is_manager, is_executive_director: u.is_executive_director }) || (typeof u.type === 'string' ? u.type : 'غير محدد')
  );
});

const userStats = computed(() => {
  const u = user.value;
  return {
    reservations: u?.reservations_count ?? u?.bookings_count ?? 0,
    sold: u?.sold_count ?? u?.sold_units_count ?? 0,
    pending: u?.pending_count ?? u?.pending_bookings_count ?? 0,
    cancelled: u?.cancelled_count ?? u?.cancelled_bookings_count ?? 0,
  };
});

const handleComingSoon = () => {
  toast.info('هذه الميزة قيد التطوير');
};

const handleLogout = async () => {
  await authService.logout();
  router.replace({ path: '/login', query: { from: 'logout', t: String(Date.now()) } });
};

onMounted(() => {
  isLoading.value = false;
});
</script>

<style scoped src="./styles/ProfileView.scoped.s1.css"></style>
