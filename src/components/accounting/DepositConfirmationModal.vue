<template>
  <AppModal
    :open="true"
    :title="action === 'confirm' ? 'تأكيد الوديعة' : 'معالجة الاسترداد'"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
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
.deposit-detail-section {
  background: var(--color-light-gray);
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
  color: var(--color-dark-gray);
  margin-left: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 15px;
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
  border-top: 1px solid var(--color-light-gray);
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
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
