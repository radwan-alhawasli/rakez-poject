<template>
  <div class="rakez-erp-dashboard rakez-kpi-dashboard">
    <DashboardWelcomeHeader
      title="الإشعارات"
      subtitle="تابع آخر التحديثات والنشاطات في نظام راكز."
      english-title="Notifications"
      english-subtitle="Latest updates and activity feed"
    />

    <h3 class="rakez-dashboard-section-title">ملخص الإشعارات</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard label="إجمالي الإشعارات" :value="totalItems">
        <template #icon><DashboardStatIcon name="clipboard" /></template>
      </LuxuryStatCard>
      <LuxuryStatCard label="غير مقروءة" :value="unreadCount">
        <template #icon><DashboardStatIcon name="alert" /></template>
      </LuxuryStatCard>
      <LuxuryStatCard label="مقروءة" :value="readCount">
        <template #icon><DashboardStatIcon name="check" /></template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">قائمة الإشعارات</h3>

    <div class="rakez-notification-filters">
      <button class="btn-mark-all" :disabled="isLoading" @click="markAllRead">تعيين الكل كمقروء</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <div v-if="notifications.length === 0" class="rakez-notification-empty">
        <div class="rakez-notification-empty__icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </div>
        <p class="rakez-notification-empty__text">لا توجد إشعارات</p>
      </div>

      <div v-else class="rakez-notifications-grid">
        <NotificationCard
          v-for="notif in paginatedNotifications"
          :key="notif.id"
          :notification="notif"
          :type-label="getNotificationTypeLabel(notif.type)"
          :date-formatted="formatDate(notif.time)"
          @view="viewNotificationDetail"
          @mark-read="markAsRead"
        />
      </div>
    </template>

    <Pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-items="totalItems"
      :per-page="perPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />

    <NotificationDetailModal
      v-if="showNotificationModal"
      :notification="selectedNotificationForModal"
      :isLoading="isSavingNotification"
      @close="showNotificationModal = false"
      @mark-read="handleNotificationModalMarkRead"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';
import NotificationCard from '@/components/notifications/NotificationCard.vue';
import Pagination from '@/components/Pagination.vue';
import NotificationDetailModal from '@/modules/accounting/components/NotificationDetailModal.vue';
import notificationService from '@/services/notificationService';
import { useFormatters } from '@/composables/useFormatters';

const isLoading = ref(true);
const notifications = computed(() => notificationService.state.value);

const currentPage = ref(1);
const perPage = ref(25);
const totalItems = computed(() => notifications.value.length);
const paginatedNotifications = computed(() => {
  const list = notifications.value;
  const start = (currentPage.value - 1) * perPage.value;
  return list.slice(start, start + perPage.value);
});

const showNotificationModal = ref(false);
const selectedNotification = ref(null);
const isSavingNotification = ref(false);

const { formatDate: _fmtDate } = useFormatters();
const formatDate = dateStr => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));

const TYPE_LABELS = {
  success: 'نجاح',
  warning: 'تحذير',
  error: 'خطأ',
  info: 'معلومات',
};
const getNotificationTypeLabel = type => TYPE_LABELS[type] || type || 'عام';

/** Single pass over the list for stat cards (avoids two full filters per render). */
const notificationReadStats = computed(() => {
  const list = notifications.value;
  let unread = 0;
  for (let i = 0; i < list.length; i++) {
    if (!list[i].read) unread++;
  }
  return { unread, read: list.length - unread };
});

const unreadCount = computed(() => notificationReadStats.value.unread);
const readCount = computed(() => notificationReadStats.value.read);

const markAsRead = async id => {
  await notificationService.markAsRead(id);
};

const markAllRead = async () => {
  await notificationService.markAllAsRead();
};

const handlePageChange = page => {
  currentPage.value = page;
};

const handlePerPageChange = val => {
  perPage.value = val;
  currentPage.value = 1;
};

const viewNotificationDetail = notif => {
  selectedNotification.value = notif;
  showNotificationModal.value = true;
};

const handleNotificationModalMarkRead = async () => {
  if (!selectedNotification.value?.id) return;
  isSavingNotification.value = true;
  try {
    await notificationService.markAsRead(selectedNotification.value.id);
    selectedNotification.value = { ...selectedNotification.value, read: true };
  } finally {
    isSavingNotification.value = false;
  }
};

const selectedNotificationForModal = computed(() => {
  const s = selectedNotification.value;
  if (!s) return null;
  return { ...s, created_at: s.time };
});

onMounted(async () => {
  try {
    // MainLayout already called init() for Pusher; refresh list only (no duplicate channel binds).
    await notificationService.fetchAll();
  } finally {
    isLoading.value = false;
  }
});

watch([totalItems, perPage], () => {
  const maxPage = Math.max(1, Math.ceil(totalItems.value / perPage.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});
</script>
