<template>
  <div class="rakez-erp-dashboard rakez-kpi-dashboard">
    <DashboardWelcomeHeader
      greeting-name="قسم الائتمان"
      subtitle="استقبال إشعارات التفاوض والحجز والإفراغ."
      english-title="Credit Notifications"
      english-subtitle="Negotiation, reservation & transfer alerts"
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
      <button class="btn-mark-all" :disabled="isLoading" @click="markAllCreditNotificationsRead">تعيين الكل كمقروء</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <div v-if="creditNotifications.length === 0" class="rakez-notification-empty">
        <div class="rakez-notification-empty__icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </div>
        <p class="rakez-notification-empty__text">لا توجد إشعارات</p>
      </div>

      <div v-else class="rakez-notifications-grid">
        <NotificationCard
          v-for="n in creditNotifications"
          :key="n.id"
          :notification="n"
          :type-label="getNotificationTypeLabel(n.type_label || n.type)"
          :date-formatted="formatDate(n.created_at || n.date)"
          @view="viewNotificationDetail"
          @mark-read="markCreditNotificationRead"
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
import { computed, onMounted } from 'vue';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';
import NotificationCard from '@/components/notifications/NotificationCard.vue';
import Pagination from '@/components/Pagination.vue';
import NotificationDetailModal from '@/modules/accounting/components/NotificationDetailModal.vue';
import { useCreditNotifications } from '@/composables/credit/useCreditNotifications';

const {
  isLoading,
  creditNotifications,
  currentPage,
  perPage,
  totalItems,
  showNotificationModal,
  selectedNotification,
  isSavingNotification,
  formatDate,
  loadCreditNotifications,
  markCreditNotificationRead,
  markAllCreditNotificationsRead,
  handlePageChange,
  handlePerPageChange,
  viewNotificationDetail,
  handleNotificationModalMarkRead,
  getNotificationTypeLabel,
} = useCreditNotifications();

const selectedNotificationForModal = computed(() => {
  const s = selectedNotification.value;
  if (!s) return null;
  return { ...s, time: s.created_at || s.date };
});

const unreadCount = computed(() => creditNotifications.value.filter(n => !n.read).length);
const readCount = computed(() => creditNotifications.value.filter(n => n.read).length);

onMounted(() => {
  loadCreditNotifications();
});
</script>
