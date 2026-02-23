<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">تفاصيل الإشعار</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
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
        <div class="modal-footer">
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
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue';

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
  props: {
    notification: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'mark-read'],
  setup(props, { emit }) {
    const typeLabel = computed(() => {
      const t = props.notification?.type;
      return NOTIFICATION_TYPE_LABELS[t] || t || 'عام';
    });

    const formatDate = dateStr => {
      if (!dateStr) return '—';
      try {
        return new Date(dateStr).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return dateStr;
      }
    };

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

    const handleEscape = e => {
      if (e.key === 'Escape') emit('close');
    };

    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
}

.close-btn:hover {
  color: #ef4444;
}

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
  color: #64748b;
  min-width: 100px;
}

.detail-value {
  color: #1e293b;
}

.detail-message {
  margin: 0;
  color: #334155;
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
  background: #f8fafc;
  border-radius: 10px;
}

.data-item {
  display: flex;
  gap: 8px;
}

.data-key {
  font-weight: 600;
  color: #64748b;
  min-width: 120px;
}

.data-val {
  color: #1e293b;
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
  border-top: 1px solid #e2e8f0;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
</style>
