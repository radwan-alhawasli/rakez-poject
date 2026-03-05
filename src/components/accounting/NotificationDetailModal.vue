<template>
  <AppModal
    :open="true"
    title="تفاصيل الإشعار"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <div v-if="notification" class="modal-body">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">العنوان:</span>
            <span class="detail-value">{{ notification.title || 'إشعار' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">النوع:</span>
            <span class="detail-value">{{ typeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">التاريخ:</span>
            <span class="detail-value">{{
              formatDate(notification.created_at || notification.time)
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">الحالة:</span>
            <span class="status-tag" :class="notification.read ? 'excellent' : 'good'">
              {{ notification.read ? 'مقروء' : 'غير مقروء' }}
            </span>
          </div>
          <div v-if="notification.message || notification.body" class="detail-row message-row">
            <span class="detail-label">الرسالة:</span>
            <p class="detail-message">{{ notification.message || notification.body }}</p>
          </div>
          <div
            v-if="notification.data && Object.keys(notification.data).length"
            class="detail-row data-section"
          >
            <span class="detail-label">بيانات إضافية:</span>
            <div class="data-grid">
              <div v-for="(val, key) in notification.data" :key="key" class="data-item">
                <span class="data-key">{{ formatDataKey(key) }}:</span>
                <span class="data-val">{{ formatDataValue(val) }}</span>
              </div>
            </div>
          </div>
        </div>
    </div>
    <template #footer>
      <div v-if="notification" class="modal-footer flex gap-3 justify-end flex-wrap">
        <button
          v-if="!notification.read"
          type="button"
          class="btn-primary"
          @click="$emit('mark-read')"
          :disabled="isLoading"
        >
          تعيين كمقروء
        </button>
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { computed } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { useFormatters } from '@/composables/useFormatters'

const NOTIFICATION_TYPE_LABELS = {
  unit_reserved: 'تم حجز وحدة',
  deposit_received: 'تم استلام عربون',
  unit_vacated: 'تم إفراغ الوحدة',
  reservation_cancelled: 'تم إلغاء الحجز',
  commission_confirmed: 'تم تأكيد عمولة',
  commission_received: 'تم استلام عمولة من المالك',
};

export default {
  name: 'NotificationDetailModal',
  components: { AppModal },
  props: {
    notification: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'mark-read'],
  setup(props, { emit: _emit }) {
    const typeLabel = computed(() => {
      const t = props.notification?.type;
      return NOTIFICATION_TYPE_LABELS[t] || t || 'عام';
    });

    const { formatDateLong: formatDate } = useFormatters();

    const formatDataKey = key => {
      const map = {
        project_name: 'المشروع',
        unit_number: 'رقم الوحدة',
        reservation_id: 'رقم الحجز',
        amount: 'المبلغ',
        customer_name: 'اسم العميل',
      };
      return map[key] || key;
    };

    const formatDataValue = val => {
      if (val == null) return '—';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    return {
      typeLabel,
      formatDate,
      formatDataKey,
      formatDataValue,
    };
  },
};
</script>

<style scoped>
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  color: var(--color-dark-gray);
  min-width: 100px;
}

.detail-value {
  color: var(--color-charcoal);
}

.detail-message {
  margin: 0;
  color: var(--color-charcoal);
  line-height: 1.6;
  flex: 1;
}

.message-row {
  flex-direction: column;
}

.data-section {
  flex-direction: column;
}

.data-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-light-gray);
  border-radius: 10px;
}

.data-item {
  display: flex;
  gap: 8px;
}

.data-key {
  font-weight: 600;
  color: var(--color-dark-gray);
  min-width: 120px;
}

.data-val {
  color: var(--color-charcoal);
}

.status-tag {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-tag.excellent {
  background: #dcfce7;
  color: #166534;
}

.status-tag.good {
  background: #fef3c7;
  color: #92400e;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-medium-gray);
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 10px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--color-medium-gray);
  background: var(--color-light-gray);
}

/* Tablet responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }
  .modal-container {
    width: 95%;
    max-width: 95vw;
    padding: 20px;
  }
  .modal-footer {
    flex-direction: column;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
}

/* Mobile full-screen */
@media (max-width: 575px) {
  .modal-overlay {
    padding: 8px;
  }
  .modal-container {
    width: 100%;
    max-width: 100vw;
    max-height: 100vh;
    overflow-y: auto;
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .detail-row {
    flex-direction: column;
  }
  .detail-label {
    min-width: unset;
  }
  .data-key {
    min-width: unset;
  }
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
}
</style>
