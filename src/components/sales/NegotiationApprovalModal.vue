<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">مراجعة التفاوض</h2>
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

      <div class="modal-body">
        <div v-if="negotiation" class="negotiation-details">
          <div class="detail-section">
            <h3 class="section-title">معلومات الحجز</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">رقم الحجز:</span>
                <span class="detail-value"
                  >#{{ negotiation.reservation_id || negotiation.id }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">اسم العميل:</span>
                <span class="detail-value">{{ negotiation.client_name || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">المشروع:</span>
                <span class="detail-value">{{ negotiation.project_name || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">تاريخ الطلب:</span>
                <span class="detail-value">{{
                  formatDate(negotiation.created_at || negotiation.request_date)
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">تفاصيل التفاوض</h3>
            <div class="price-comparison">
              <div class="price-item">
                <span class="price-label">السعر الأصلي:</span>
                <span class="price-value original">{{
                  formatCurrency(negotiation.original_price || 0)
                }}</span>
              </div>
              <div class="price-arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="24"
                  height="24"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div class="price-item">
                <span class="price-label">السعر المقترح:</span>
                <span class="price-value proposed">{{
                  formatCurrency(negotiation.proposed_price || 0)
                }}</span>
              </div>
              <div class="price-difference">
                <span class="difference-label">الفرق:</span>
                <span class="difference-value" :class="getDifferenceClass()">
                  {{
                    formatCurrency(
                      Math.abs(
                        (negotiation.proposed_price || 0) - (negotiation.original_price || 0)
                      )
                    )
                  }}
                  ({{ getDifferencePercentage() }}%)
                </span>
              </div>
            </div>
            <div v-if="negotiation.reason || negotiation.negotiation_reason" class="reason-box">
              <span class="reason-label">سبب التفاوض:</span>
              <p class="reason-text">{{ negotiation.reason || negotiation.negotiation_reason }}</p>
            </div>
          </div>
        </div>

        <div class="action-section">
          <div class="action-tabs">
            <button
              :class="['action-tab', { active: actionType === 'approve' }]"
              @click="actionType = 'approve'"
            >
              موافقة
            </button>
            <button
              :class="['action-tab', { active: actionType === 'reject' }]"
              @click="actionType = 'reject'"
            >
              رفض
            </button>
          </div>

          <div v-if="actionType === 'approve'" class="approve-form">
            <div class="form-group">
              <label class="form-label">ملاحظات (اختياري)</label>
              <textarea
                v-model="approveData.notes"
                class="form-textarea"
                placeholder="أدخل ملاحظات حول الموافقة..."
                rows="4"
              ></textarea>
            </div>
            <button @click="handleApprove" class="btn-primary approve-btn" :disabled="isProcessing">
              <span v-if="!isProcessing">تأكيد الموافقة</span>
              <span v-else>جاري المعالجة...</span>
            </button>
          </div>

          <div v-if="actionType === 'reject'" class="reject-form">
            <div class="form-group">
              <label class="form-label">سبب الرفض *</label>
              <textarea
                v-model="rejectData.reason"
                class="form-textarea"
                placeholder="أدخل سبب رفض التفاوض..."
                rows="4"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظات إضافية</label>
              <textarea
                v-model="rejectData.notes"
                class="form-textarea"
                placeholder="ملاحظات إضافية (اختياري)..."
                rows="3"
              ></textarea>
            </div>
            <button
              @click="handleReject"
              class="btn-danger reject-btn"
              :disabled="isProcessing || !rejectData.reason"
            >
              <span v-if="!isProcessing">تأكيد الرفض</span>
              <span v-else>جاري المعالجة...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { toast } from '../../composables/useToast';

export default {
  name: 'NegotiationApprovalModal',
  props: {
    negotiation: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'approve', 'reject'],
  setup(props, { emit }) {
    const actionType = ref('approve');
    const isProcessing = computed(() => props.isLoading);

    const approveData = reactive({
      notes: '',
    });

    const rejectData = reactive({
      reason: '',
      notes: '',
    });

    const formatCurrency = amount => {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount || 0);
    };

    const formatDate = dateString => {
      if (!dateString) return '—';
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const getDifferencePercentage = () => {
      if (!props.negotiation) return '0';
      const original = props.negotiation.original_price || 0;
      const proposed = props.negotiation.proposed_price || 0;
      if (original === 0) return '0';
      const diff = ((proposed - original) / original) * 100;
      return diff.toFixed(2);
    };

    const getDifferenceClass = () => {
      if (!props.negotiation) return '';
      const original = props.negotiation.original_price || 0;
      const proposed = props.negotiation.proposed_price || 0;
      return proposed < original ? 'positive' : 'negative';
    };

    const handleApprove = () => {
      emit('approve', {
        notes: approveData.notes || null,
      });
    };

    const handleReject = () => {
      if (!rejectData.reason.trim()) {
        toast.warning('يرجى إدخال سبب الرفض');
        return;
      }
      emit('reject', {
        reason: rejectData.reason,
        notes: rejectData.notes || null,
      });
    };

    const handleEscape = e => {
      if (e.key === 'Escape') {
        emit('close');
      }
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
      actionType,
      approveData,
      rejectData,
      formatCurrency,
      formatDate,
      getDifferencePercentage,
      getDifferenceClass,
      handleApprove,
      handleReject,
      isProcessing,
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
  padding: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: var(--color-dark-gray);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-error);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.negotiation-details {
  margin-bottom: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-light-gray);
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
  font-size: 12px;
  font-weight: 600;
  color: var(--color-dark-gray);
  text-transform: uppercase;
}

.detail-value {
  font-size: 15px;
  color: var(--color-charcoal);
  font-weight: 600;
}

.price-comparison {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--color-light-gray);
  border-radius: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-label {
  font-size: 12px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
}

.price-value.original {
  color: var(--color-charcoal);
}

.price-value.proposed {
  color: #059669;
}

.price-arrow {
  font-size: 24px;
  color: var(--color-dark-gray);
}

.price-difference {
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.difference-label {
  font-size: 12px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.difference-value {
  font-size: 18px;
  font-weight: 700;
}

.difference-value.positive {
  color: #059669;
}

.difference-value.negative {
  color: #dc2626;
}

.reason-box {
  padding: 15px;
  background: #fef3c7;
  border-radius: 12px;
  border-right: 4px solid var(--color-warning);
}

.reason-label {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  display: block;
  margin-bottom: 8px;
}

.reason-text {
  font-size: 14px;
  color: #92400e;
  margin: 0;
  line-height: 1.6;
}

.action-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid var(--color-light-gray);
}

.action-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-tab {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-tab:hover {
  border-color: var(--color-medium-gray);
  background: var(--color-light-gray);
}

.action-tab.active {
  border-color: var(--color-gold);
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
}

.approve-form,
.reject-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.btn-primary,
.btn-danger {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(5, 150, 105, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.btn-primary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .price-comparison {
    flex-direction: column;
    gap: 12px;
  }
  .price-arrow {
    transform: rotate(90deg);
    align-self: center;
  }
  .action-tabs button {
    min-height: 44px;
  }
  .btn-primary,
  .btn-danger {
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
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .price-value {
    font-size: 16px;
  }
  .difference-value {
    font-size: 15px;
  }
  .btn-primary,
  .btn-danger {
    min-height: 44px;
    width: 100%;
  }
}
</style>
