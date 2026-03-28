<template>
  <div class="management-view">
    <div class="section-header-compact notifications-header">
      <div>
        <h2 class="section-title">الإشعارات</h2>
        <p class="section-subtitle">
          استقبال إشعارات: حجز تفاوض جديد، الموافقة أو الرفض على السعر، تأكيد العربون، انتقال
          الحجز إلى مؤكد، انتهاء مهلة أي إجراء، اكتمال الإفراغ.
        </p>
      </div>
      <div class="notifications-header-controls">
        <button
          class="btn-primary"
          :disabled="isLoading"
          @click="markAllCreditNotificationsRead"
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
          <tr v-for="n in creditNotifications" :key="n.id">
            <td data-label="العنوان">{{ n.title || n.message || 'إشعار' }}</td>
            <td data-label="النوع">{{ getNotificationTypeLabel(n.type_label || n.type) }}</td>
            <td data-label="التاريخ">{{ formatDate(n.created_at || n.date) }}</td>
            <td data-label="الحالة">
              <span class="status-tag" :class="n.read ? 'excellent' : 'good'">
                {{ n.read ? 'مقروء' : 'غير مقروء' }}
              </span>
            </td>
            <td data-label="الإجراءات">
              <div class="notification-actions">
                <button
                  class="btn-action view"
                  @click="viewNotificationDetail(n)"
                  title="عرض التفاصيل"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  عرض التفاصيل
                </button>
                <button
                  v-if="!n.read"
                  type="button"
                  class="btn-action edit"
                  @click="markCreditNotificationRead(n.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  تعيين كمقروء
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="creditNotifications.length === 0 && !isLoading">
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
import { computed, onMounted } from 'vue';
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

onMounted(() => {
  loadCreditNotifications();
});
</script>
