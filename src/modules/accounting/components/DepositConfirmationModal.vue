<template>
  <AppModal
    :open="true"
    :title="action === 'confirm' ? 'تأكيد الوديعة' : 'معالجة الاسترداد'"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="modal-body-premium">
        <div v-if="deposit" class="deposit-brief-card">
          <div class="brief-item">
            <span class="brief-label">المشروع</span>
            <span class="brief-value">{{ deposit.project_name || '—' }}</span>
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
      </form>
    <template #footer>
      <div class="modal-footer flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn-primary" :disabled="isLoading" @click="handleSubmit">
          {{ action === 'confirm' ? 'تأكيد' : 'معالجة الاسترداد' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { reactive, computed } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { useFormatters } from '@/composables/useFormatters'

export default {
  name: 'DepositConfirmationModal',
  components: { AppModal },
  props: {
    deposit: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { formatCurrency } = useFormatters();
    const action = computed(() => (props.deposit?.status === 'pending' ? 'confirm' : 'refund'));
    const formData = reactive({
      confirmed_amount: props.deposit?.amount || 0,
      confirmation_date: new Date().toISOString().split('T')[0],
      refund_amount: 0,
      reason: '',
    });

    const handleSubmit = () => {
      emit('submit', { action: action.value, ...formData });
    };

    return { action, formData, formatCurrency, handleSubmit };
  },
};
</script>

<style scoped>
.modal-body-premium {
  padding: 8px 0;
}

.deposit-brief-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.brief-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brief-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.brief-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e3a5f;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 4px rgba(177, 162, 143, 0.15);
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  padding: 12px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #1e3a5f 0%, #162a44 100%);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(30, 58, 95, 0.2);
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(30, 58, 95, 0.3);
}

/* Tablet responsive */
@media (max-width: 768px) {
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
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
}
</style>
