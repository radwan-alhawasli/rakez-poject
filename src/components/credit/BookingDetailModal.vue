<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">تفاصيل الحجز</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body" v-if="booking">
        <!-- 3.1.1 بيانات المشروع -->
        <div class="detail-section">
          <h3 class="detail-title">3.1.1 بيانات المشروع</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">اسم المشروع:</span>
              <span class="detail-value">{{ booking.project_name || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">رقم الوحدة:</span>
              <span class="detail-value">{{ booking.unit_number ?? booking.unit_id ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحي:</span>
              <span class="detail-value">{{ booking.district ?? booking.area ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المدينة:</span>
              <span class="detail-value">{{ booking.city ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">نوع العقار:</span>
              <span class="detail-value">{{
                booking.unit_type ?? booking.property_type ?? '—'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">قيمة العقار:</span>
              <span class="detail-value">{{
                formatCurrency(booking.property_value ?? booking.unit_value ?? booking.final_price)
              }}</span>
            </div>
          </div>
        </div>

        <!-- 3.1.2 بيانات العميل -->
        <div class="detail-section">
          <h3 class="detail-title">3.1.2 بيانات العميل</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">اسم العميل:</span>
              <span class="detail-value">{{ booking.customer_name ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">رقم الهاتف:</span>
              <span class="detail-value">{{ booking.customer_phone ?? booking.phone ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">البريد الإلكتروني:</span>
              <span class="detail-value">{{ booking.customer_email ?? booking.email ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">جنسية العميل:</span>
              <span class="detail-value">{{ booking.nationality ?? '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">رقم IBAN:</span>
              <span class="detail-value">{{ booking.iban ?? '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 3.1.3 التفاصيل المالية -->
        <div class="detail-section">
          <h3 class="detail-title">3.1.3 التفاصيل المالية</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">قيمة العربون:</span>
              <span class="detail-value">{{
                formatCurrency(booking.deposit_amount ?? booking.down_payment)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ دفع العربون:</span>
              <span class="detail-value">{{
                formatDate(booking.deposit_date ?? booking.down_payment_date)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">نسبة السعي (مصدر العمولة):</span>
              <span class="detail-value">{{
                booking.commission_source === 'owner'
                  ? 'من المالك'
                  : booking.commission_source === 'buyer'
                  ? 'من المشتري'
                  : booking.commission_source ?? '—'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">طريقة دفع العربون:</span>
              <span class="detail-value">{{
                booking.payment_method === 'cash'
                  ? 'كاش (لا يحتاج تأكيد من المحاسبة)'
                  : booking.payment_method === 'transfer'
                  ? 'تحويل بنكي / دفع إلكتروني (يتطلب تأكيد استلام من المحاسبة)'
                  : booking.payment_method ?? '—'
              }}</span>
            </div>
          </div>
        </div>

        <!-- 3.1.4 تفاصيل التسويق (API: project_team, seller_team, marketer_name, purchase_mechanism_label_ar – always strings) -->
        <div class="detail-section">
          <h3 class="detail-title">3.1.4 تفاصيل التسويق</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">فريق المشروع:</span>
              <span class="detail-value">{{
                booking.project_team ?? booking.team_name ?? booking.team ?? '—'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">فريق البائع:</span>
              <span class="detail-value">{{
                booking.seller_team ?? booking.team_name ?? booking.team ?? '—'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">اسم المسوق:</span>
              <span class="detail-value">{{
                booking.marketer_name ?? booking.marketer ?? '—'
              }}</span>
            </div>
            <div class="detail-item" v-if="booking.purchase_mechanism_label_ar">
              <span class="detail-label">آلية الشراء:</span>
              <span class="detail-value">{{ booking.purchase_mechanism_label_ar }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="booking.notes">
          <h3 class="detail-title">ملاحظات</h3>
          <p class="detail-text">{{ booking.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { useFormatters } from '../../composables/useFormatters';

export default {
  name: 'BookingDetailModal',
  props: {
    booking: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

    // Handle Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        emit('close');
      }
    };

    // Lock body scroll when modal is open
    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      formatDate,
      formatCurrency,
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
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease;
}

.modal-overlay:focus {
  outline: none;
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid var(--color-light-gray);
  padding-bottom: 15px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-error);
}

.modal-body {
  padding: 0;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 13px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  color: var(--color-charcoal);
  font-weight: 500;
}

.detail-text {
  font-size: 15px;
  color: var(--color-charcoal);
  line-height: 1.6;
  padding: 15px;
  background: var(--color-light-gray);
  border-radius: 12px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
}

.status-tag.excellent {
  background: #dcfce7;
  color: var(--color-success);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  .detail-grid {
    grid-template-columns: 1fr;
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
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .detail-title {
    font-size: 16px;
  }
}
</style>
