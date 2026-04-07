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
  gap: 14px;
  padding: 8px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(181, 169, 154, 0.1);
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(181, 169, 154, 0.06);
}

.detail-label {
  font-weight: 700;
  color: var(--color-gold, #b5a99a);
  min-width: 100px;
  font-size: 0.875rem;
}

.detail-value {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
}

.detail-message {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  flex: 1;
  font-size: 0.9rem;
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
  padding: 14px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(181, 169, 154, 0.08);
}

.data-item {
  display: flex;
  gap: 8px;
}

.data-key {
  font-weight: 600;
  color: var(--color-gold, #b5a99a);
  min-width: 120px;
  font-size: 0.85rem;
}

.data-val {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
}

.status-tag {
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-tag.excellent {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.status-tag.good {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(181, 169, 154, 0.12);
}

.btn-primary {
  padding: 10px 22px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #8c7851) 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(181, 169, 154, 0.25);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  padding: 10px 22px;
  border: 1px solid rgba(181, 169, 154, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: rgba(181, 169, 154, 0.35);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .modal-footer {
    flex-direction: column;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 575px) {
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
