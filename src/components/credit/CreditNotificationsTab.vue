<template>
  <div class="management-view">
    <div
      class="section-header-compact"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      "
    >
      <div>
        <h2 class="section-title">الإشعارات</h2>
        <p class="section-subtitle">
          استقبال إشعارات: حجز تفاوض جديد، الموافقة أو الرفض على السعر، تأكيد العربون، انتقال
          الحجز إلى مؤكد، انتهاء مهلة أي إجراء، اكتمال الإفراغ.
        </p>
      </div>
      <button
        v-if="creditNotifications.some(n => !n.read)"
        class="btn-primary"
        :disabled="isLoading"
        @click="markAllCreditNotificationsRead"
      >
        تعيين الكل كمقروء
      </button>
    </div>
    <div class="metrics-table-container">
      <div class="table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>نوع الإشعار</th>
            <th>العنوان</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="creditNotifications.length === 0 && !isLoading">
            <td
              colspan="5"
              data-label=""
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد إشعارات.
            </td>
          </tr>
          <tr v-for="n in creditNotifications" :key="n.id">
            <td data-label="التاريخ">{{ formatDate(n.created_at || n.date) }}</td>
            <td data-label="نوع الإشعار">{{ n.type_label || n.type || '—' }}</td>
            <td data-label="العنوان">{{ n.title || n.message || '—' }}</td>
            <td data-label="الحالة">
              <span class="status-tag" :class="n.read ? 'excellent' : 'good'">{{
                n.read ? 'مقروء' : 'جديد'
              }}</span>
            </td>
            <td data-label="الإجراءات">
              <button
                v-if="!n.read"
                type="button"
                class="btn-action edit"
                @click="markCreditNotificationRead(n.id)"
              >
                تعيين كمقروء
              </button>
              <span v-else style="color: var(--color-dark-gray)">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <Pagination
      v-if="creditTotalItems > 0"
      :current-page="creditCurrentPage"
      :total-items="creditTotalItems"
      :per-page="creditPerPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import { useCreditNotifications } from '@/composables/credit/useCreditNotifications';

const {
  isLoading,
  creditNotifications,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  formatDate,
  loadCreditNotifications,
  markCreditNotificationRead,
  markAllCreditNotificationsRead,
  handlePageChange,
  handlePerPageChange,
} = useCreditNotifications();

onMounted(() => {
  loadCreditNotifications();
});
</script>
