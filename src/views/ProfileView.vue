<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
    <!-- Page Header -->
    <div class="page-header">
      <div class="avatar-large">
        <span>{{ userInitial }}</span>
      </div>
      <h1 class="user-name">{{ user.name }}</h1>
      <p class="user-role">{{ jobRoleLabel }}</p>
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
    getRoleLabel(u.type, u.is_manager) || (typeof u.type === 'string' ? u.type : 'غير محدد')
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
  router.push('/login');
};

onMounted(() => {
  isLoading.value = false;
});
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-dark-gray, #64748b);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  border-top-color: #b1a28f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Page Header */
.page-header {
  text-align: center;
  padding: 40px 30px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f1e30 100%);
  border-radius: 16px;
  color: white;
  margin-bottom: 30px;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b1a28f 0%, #c9a85c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 40px;
  font-weight: 700;
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.user-role {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 16px;
  border-radius: 20px;
  display: inline-block;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Profile Section */
.profile-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title svg {
  width: 20px;
  height: 20px;
  color: #b1a28f;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.info-item p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  text-align: right;
}

.settings-btn:hover {
  background: #fdfbf7;
  border-color: #b1a28f;
  color: #b1a28f;
}

.settings-btn svg {
  width: 18px;
  height: 18px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(177, 162, 143, 0.4);
  box-shadow: 0 10px 25px rgba(177, 162, 143, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #b1a28f;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

/* Logout Button */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #dc2626;
  color: white;
}

.logout-btn svg {
  width: 20px;
  height: 20px;
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .profile-page {
    max-width: 100%;
  }
  .page-header {
    padding: 32px 24px;
  }
  .avatar-large {
    width: 88px;
    height: 88px;
    font-size: 36px;
  }
  .user-name {
    font-size: 22px;
  }
  .stats-grid {
    gap: 16px;
  }
  .stat-value {
    font-size: 28px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .page-header {
    padding: 28px 20px;
    border-radius: 12px;
    margin-bottom: 24px;
  }
  .avatar-large {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  .user-name {
    font-size: 20px;
  }
  .profile-section {
    padding: 20px;
  }
  .info-grid {
    gap: 16px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat-card {
    padding: 16px;
    border-radius: 16px;
  }
  .stat-value {
    font-size: 26px;
  }
  .settings-btn {
    padding: 14px 16px;
    min-height: 44px;
  }
  .logout-btn {
    padding: 14px;
    min-height: 44px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .page-header {
    padding: 24px 16px;
    border-radius: 10px;
    margin-bottom: 16px;
  }
  .avatar-large {
    width: 72px;
    height: 72px;
    font-size: 28px;
    margin-bottom: 12px;
  }
  .user-name {
    font-size: 18px;
  }
  .user-role {
    font-size: 12px;
  }
  .profile-content {
    gap: 14px;
  }
  .profile-section {
    padding: 16px;
    border-radius: 10px;
  }
  .section-title {
    font-size: 15px;
    gap: 8px;
  }
  .info-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .info-item p {
    font-size: 14px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .stat-card {
    padding: 14px;
    border-radius: 14px;
  }
  .stat-value {
    font-size: 24px;
  }
  .stat-label {
    font-size: 12px;
  }
  .settings-btn {
    font-size: 13px;
    padding: 12px 14px;
    min-height: 44px;
  }
  .logout-btn {
    font-size: 14px;
    min-height: 44px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .page-header {
    padding: 20px 12px;
  }
  .avatar-large {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }
  .user-name {
    font-size: 16px;
  }
  .profile-section {
    padding: 12px;
  }
  .section-title {
    font-size: 14px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .stat-card {
    padding: 12px;
  }
  .stat-value {
    font-size: 20px;
  }
  .settings-btn {
    font-size: 12px;
    padding: 10px 12px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .profile-page {
    max-width: 1000px;
  }
  .page-header {
    padding: 50px 40px;
    border-radius: 20px;
    margin-bottom: 40px;
  }
  .avatar-large {
    width: 120px;
    height: 120px;
    font-size: 48px;
  }
  .user-name {
    font-size: 28px;
  }
  .user-role {
    font-size: 16px;
  }
  .profile-content {
    gap: 28px;
  }
  .profile-section {
    padding: 32px;
    border-radius: 16px;
  }
  .section-title {
    font-size: 18px;
  }
  .info-item p {
    font-size: 16px;
  }
  .stats-grid {
    gap: 24px;
  }
  .stat-card {
    padding: 28px;
  }
  .stat-value {
    font-size: 38px;
  }
  .stat-label {
    font-size: 15px;
  }
  .settings-btn {
    padding: 18px 20px;
    font-size: 16px;
  }
  .logout-btn {
    padding: 18px;
    font-size: 16px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .profile-page {
    max-width: 1200px;
  }
  .user-name {
    font-size: 32px;
  }
  .stat-value {
    font-size: 42px;
  }
}
</style>
