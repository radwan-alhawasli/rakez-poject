<template>
  <div class="rakez-erp-dashboard rakez-kpi-dashboard">
    <DashboardWelcomeHeader
      greeting-name="قسم المحاسبة"
      subtitle="إدارة ومتابعة إشعارات المحاسبة."
      english-title="Accounting Notifications"
      english-subtitle="Track and manage accounting alerts"
    />

    <h3 class="rakez-dashboard-section-title">ملخص الإشعارات</h3>
    <div class="rakez-widget-grid rakez-widget-grid--dense">
      <LuxuryStatCard label="إجمالي الإشعارات" :value="totalItems">
        <template #icon><DashboardStatIcon name="clipboard" /></template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="غير مقروءة"
        :value="unreadCount"
        description="في الصفحة الحالية (القائمة مقسّمة)"
      >
        <template #icon><DashboardStatIcon name="alert" /></template>
      </LuxuryStatCard>
      <LuxuryStatCard
        label="مقروءة"
        :value="readCount"
        description="في الصفحة الحالية (القائمة مقسّمة)"
      >
        <template #icon><DashboardStatIcon name="check" /></template>
      </LuxuryStatCard>
    </div>

    <h3 class="rakez-dashboard-section-title">قائمة الإشعارات</h3>

    <div class="rakez-notification-filters">
      <select v-model="notificationTypeFilter" @change="loadNotifications">
        <option value="">جميع الأنواع</option>
        <option value="unit_reserved">تم حجز وحدة</option>
        <option value="deposit_received">تم استلام عربون</option>
        <option value="unit_vacated">تم إفراغ الوحدة</option>
        <option value="reservation_cancelled">تم إلغاء الحجز</option>
        <option value="commission_confirmed">تم تأكيد عمولة</option>
        <option value="commission_received">تم استلام عمولة من المالك</option>
      </select>
      <button class="btn-mark-all" :disabled="isLoading" @click="markAllAsRead">تعيين الكل كمقروء</button>
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
          v-for="n in notifications"
          :key="n.id"
          :notification="n"
          :type-label="getNotificationTypeLabel(n.type)"
          :date-formatted="formatDate(n.created_at)"
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
      :notification="selectedNotification"
      :isLoading="isSavingNotification"
      @close="showNotificationModal = false"
      @mark-read="handleNotificationModalMarkRead"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';
import NotificationCard from '@/components/notifications/NotificationCard.vue';
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

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
const readCount = computed(() => notifications.value.filter(n => n.read).length);

onMounted(() => {
  loadNotifications();
});
</script>
