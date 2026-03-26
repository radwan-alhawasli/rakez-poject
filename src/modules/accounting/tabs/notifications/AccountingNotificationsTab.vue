<template>
  <div class="management-view">
    <div class="section-header-compact notifications-header">
      <div>
        <h2 class="section-title">الإشعارات</h2>
        <p class="section-subtitle">إشعارات قسم المحاسبة.</p>
      </div>
      <div class="notifications-header-controls">
        <select v-model="notificationTypeFilter" class="form-input notification-type-filter" @change="loadNotifications">
          <option value="">جميع الأنواع</option>
          <option value="unit_reserved">تم حجز وحدة</option>
          <option value="deposit_received">تم استلام عربون</option>
          <option value="unit_vacated">تم إفراغ الوحدة</option>
          <option value="reservation_cancelled">تم إلغاء الحجز</option>
          <option value="commission_confirmed">تم تأكيد عمولة</option>
          <option value="commission_received">تم استلام عمولة من المالك</option>
        </select>
        <button class="btn-primary" @click="markAllAsRead" :disabled="isLoading">تعيين الكل كمقروء</button>
      </div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead><tr><th>العنوان</th><th>النوع</th><th>التاريخ</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
        <tbody>
          <tr v-for="notification in notifications" :key="notification.id">
            <td data-label="العنوان">{{ notification.title || 'إشعار' }}</td>
            <td data-label="النوع">{{ getNotificationTypeLabel(notification.type) }}</td>
            <td data-label="التاريخ">{{ formatDate(notification.created_at) }}</td>
            <td data-label="الحالة"><span class="status-tag" :class="notification.read ? 'excellent' : 'good'">{{ notification.read ? 'مقروء' : 'غير مقروء' }}</span></td>
            <td data-label="الإجراءات">
              <div class="notification-actions">
                <button class="btn-action view" @click="viewNotificationDetail(notification)" title="عرض التفاصيل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  عرض التفاصيل
                </button>
                <button v-if="!notification.read" class="btn-action edit" @click="markAsRead(notification.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  تعيين كمقروء
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="notifications.length === 0 && !isLoading"><td colspan="5" data-label="" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد إشعارات</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />

    <NotificationDetailModal
      v-if="showNotificationModal"
      :notification="selectedNotification"
      :isLoading="isSavingNotification"
      @close="showNotificationModal = false"
      @mark-read="handleNotificationModalMarkRead"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import NotificationDetailModal from '@/modules/accounting/components/NotificationDetailModal.vue';
import { useAccountingNotifications } from '@/composables/accounting/useAccountingNotifications';

const {
  isLoading,
  notifications,
  notificationTypeFilter,
  currentPage,
  perPage,
  totalItems,
  showNotificationModal,
  selectedNotification,
  isSavingNotification,
  loadNotifications,
  markAsRead,
  markAllAsRead,
  viewNotificationDetail,
  handleNotificationModalMarkRead,
  handlePageChange,
  handlePerPageChange,
  getNotificationTypeLabel,
  formatDate,
} = useAccountingNotifications();

onMounted(() => {
  loadNotifications();
});
</script>
