<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? 'الموافقة على ملف المطالبة' : 'إنشاء ملف مطالبة' }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group" v-if="!isEditMode">
          <label class="form-label">رقم العقد</label>
          <input
            v-model="formData.contract_id"
            type="number"
            class="form-input"
            placeholder="رقم العقد"
            required
          />
        </div>

        <div class="form-group" v-if="!isEditMode">
          <label class="form-label">مبلغ المطالبة</label>
          <input
            v-model.number="formData.claim_amount"
            type="number"
            class="form-input"
            placeholder="المبلغ"
            min="0"
            required
          />
        </div>

        <div class="form-group" v-if="!isEditMode">
          <label class="form-label">نوع المطالبة</label>
          <select v-model="formData.claim_type" class="form-input" required>
            <option value="commission">عمولة</option>
            <option value="refund">استرداد</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <div class="form-group" v-if="isEditMode">
          <label class="form-label">المبلغ الموافق عليه</label>
          <input
            v-model.number="formData.approved_amount"
            type="number"
            class="form-input"
            placeholder="المبلغ الموافق عليه"
            min="0"
            required
          />
        </div>

        <div class="form-group" v-if="isEditMode">
          <label class="form-label">تاريخ الدفع</label>
          <input
            v-model="formData.payment_date"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea
            v-model="formData.notes"
            class="form-textarea"
            placeholder="ملاحظات إضافية"
            rows="4"
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">{{ isEditMode ? 'الموافقة' : 'إنشاء' }}</span>
            <span v-else>جاري الحفظ...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ClaimFileForm',
  props: {
    claim: {
      type: Object,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isEditMode = computed(() => !!props.claim && props.claim.status === 'submitted')

    const formData = reactive({
      contract_id: props.claim?.contract_id || '',
      claim_amount: props.claim?.claim_amount || 0,
      claim_type: props.claim?.claim_type || 'commission',
      approved_amount: props.claim?.approved_amount || 0,
      payment_date: props.claim?.payment_date || '',
      notes: props.claim?.notes || ''
    })

    // Watch for prop changes to update form data
    watch(() => props.claim, (newClaim) => {
      if (newClaim) {
        formData.contract_id = newClaim.contract_id || ''
        formData.claim_amount = newClaim.claim_amount || 0
        formData.claim_type = newClaim.claim_type || 'commission'
        formData.approved_amount = newClaim.approved_amount || 0
        formData.payment_date = newClaim.payment_date || ''
        formData.notes = newClaim.notes || ''
      } else {
        // Reset form when claim is cleared
        formData.contract_id = ''
        formData.claim_amount = 0
        formData.claim_type = 'commission'
        formData.approved_amount = 0
        formData.payment_date = ''
        formData.notes = ''
      }
    }, { immediate: true })

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        emit('close')
      }
    }

    // Lock body scroll when modal is open
    onMounted(() => {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    })

    onUnmounted(() => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    })

    const handleSubmit = () => {
      emit('submit', { ...formData })
    }

    return {
      isEditMode,
      formData,
      handleSubmit
    }
  }
}
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
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ef4444;
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
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #B1A28F;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
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
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
