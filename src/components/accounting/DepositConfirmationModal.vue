<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ action === 'confirm' ? 'تأكيد الوديعة' : 'معالجة الاسترداد' }}
        </h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div v-if="deposit" class="deposit-detail-section">
          <div class="detail-row">
            <span class="detail-label">المشروع:</span> {{ deposit.project_name || '—' }}
          </div>
          <div class="detail-row">
            <span class="detail-label">نوع الوحدة:</span> {{ deposit.unit_type || '—' }}
          </div>
          <div class="detail-row">
            <span class="detail-label">سعر البيع النهائي:</span>
            {{ formatCurrency(deposit.final_price || deposit.total_value) }}
          </div>
          <div class="detail-row">
            <span class="detail-label">قيمة العربون:</span> {{ formatCurrency(deposit.amount) }}
          </div>
          <div class="detail-row">
            <span class="detail-label">طريقة الدفع:</span> {{ deposit.payment_method || '—' }}
          </div>
          <div class="detail-row">
            <span class="detail-label">اسم العميل:</span>
            {{ deposit.client_name || deposit.customer_name || '—' }}
          </div>
          <div class="detail-row">
            <span class="detail-label">نسبة السعي:</span>
            {{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }}
            {{
              deposit.commission_source === 'owner'
                ? '(من المالك)'
                : deposit.commission_source === 'buyer'
                ? '(من المشتري)'
                : ''
            }}
          </div>
        </div>
        <div class="form-group" v-if="action === 'confirm'">
          <label class="form-label">المبلغ المؤكد</label>
          <input
            v-model.number="formData.confirmed_amount"
            type="number"
            class="form-input"
            :placeholder="deposit?.amount"
            required
          />
        </div>
        <div class="form-group" v-if="action === 'confirm'">
          <label class="form-label">تاريخ التأكيد</label>
          <input v-model="formData.confirmation_date" type="date" class="form-input" required />
        </div>
        <div class="form-group" v-if="action === 'refund'">
          <label class="form-label">مبلغ الاسترداد</label>
          <input
            v-model.number="formData.refund_amount"
            type="number"
            class="form-input"
            required
          />
        </div>
        <div class="form-group" v-if="action === 'refund'">
          <label class="form-label">سبب الاسترداد</label>
          <textarea v-model="formData.reason" class="form-textarea" rows="3" required></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ action === 'confirm' ? 'تأكيد' : 'معالجة الاسترداد' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'DepositConfirmationModal',
  props: {
    deposit: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const action = computed(() => (props.deposit?.status === 'pending' ? 'confirm' : 'refund'));
    const formData = reactive({
      confirmed_amount: props.deposit?.amount || 0,
      confirmation_date: new Date().toISOString().split('T')[0],
      refund_amount: 0,
      reason: '',
    });

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

    const formatCurrency = val => {
      if (!val) return '0 ر.س';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(val);
    };

    const handleSubmit = () => {
      emit('submit', { action: action.value, ...formData });
    };

    return { action, formData, formatCurrency, handleSubmit };
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
  animation: fadeIn 0.3s ease;
}

.modal-overlay:focus {
  outline: none;
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
  width: 90%;
  max-width: 500px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e3a5f;
  font-family: 'Amiri', serif;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #94a3b8;
  cursor: pointer;
}

.close-btn:hover {
  color: #ef4444;
}

.deposit-detail-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.detail-row {
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
  margin-left: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: 'Cairo', sans-serif;
}

.form-textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
</style>
