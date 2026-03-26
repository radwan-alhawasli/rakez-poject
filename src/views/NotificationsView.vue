<template>
  <div class="management-view">
    <div class="section-header-compact notifications-header">
      <div>
        <h2 class="section-title">الإشعارات</h2>
        <p class="section-subtitle">تابع آخر التحديثات والنشاطات في نظام راكز.</p>
      </div>
      <div class="notifications-header-controls">
        <button
          class="btn-primary"
          :disabled="isLoading"
          @click="markAllRead"
        >
          تعيين الكل كمقروء
        </button>
      </div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>النوع</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notif in paginatedNotifications" :key="notif.id">
            <td data-label="العنوان">{{ notif.title || 'إشعار' }}</td>
            <td data-label="النوع">{{ getNotificationTypeLabel(notif.type) }}</td>
            <td data-label="التاريخ">{{ formatDate(notif.time) }}</td>
            <td data-label="الحالة">
              <span class="status-tag" :class="notif.read ? 'excellent' : 'good'">
                {{ notif.read ? 'مقروء' : 'غير مقروء' }}
              </span>
            </td>
            <td data-label="الإجراءات">
              <div class="notification-actions">
                <button
                  class="btn-action view"
                  @click="viewNotificationDetail(notif)"
                  title="عرض التفاصيل"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  عرض التفاصيل
                </button>
                <button
                  v-if="!notif.read"
                  type="button"
                  class="btn-action edit"
                  @click="markAsRead(notif.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  تعيين كمقروء
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="notifications.length === 0 && !isLoading">
            <td colspan="5" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">
              لا توجد إشعارات
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    await notificationService.init();
  } finally {
    isLoading.value = false;
  }
});

watch(notifications, () => {
  const maxPage = Math.max(1, Math.ceil(totalItems.value / perPage.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
}, { deep: true });
</script>
