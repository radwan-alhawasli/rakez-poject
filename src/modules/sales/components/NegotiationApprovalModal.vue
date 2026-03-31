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
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';

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
    const { formatCurrencyAr: formatCurrency, formatDateLong: formatDate } = useFormatters();

    const actionType = ref('approve');
    const isProcessing = computed(() => props.isLoading);

    const approveData = reactive({
      notes: '',
    });

    const rejectData = reactive({
      reason: '',
      notes: '',
    });

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

<style scoped src="./styles/NegotiationApprovalModal.scoped.s1.css"></style>
