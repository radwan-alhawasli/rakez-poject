<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? 'إكمال نقل الملكية' : 'إنشاء طلب نقل ملكية' }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">رقم العقد</label>
          <input
            v-model="formData.contract_id"
            type="number"
            class="form-input"
            placeholder="رقم العقد"
            :disabled="isEditMode"
            required
          />
        </div>

        <div class="form-group" v-if="isEditMode">
          <label class="form-label">تاريخ الإكمال</label>
          <input
            v-model="formData.completion_date"
            type="date"
            class="form-input"
            required
          />
        </div>

        <div class="form-group" v-if="isEditMode">
          <label class="form-label">رقم الصك</label>
          <input
            v-model="formData.deed_number"
            type="text"
            class="form-input"
            placeholder="رقم الصك"
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
            <span v-if="!isLoading">{{ isEditMode ? 'إكمال' : 'إنشاء' }}</span>
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
  name: 'TitleTransferForm',
  props: {
    transfer: {
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
    const isEditMode = computed(() => !!props.transfer)

    const formData = reactive({
      contract_id: props.transfer?.contract_id || '',
      completion_date: props.transfer?.completion_date || '',
      deed_number: props.transfer?.deed_number || '',
      notes: props.transfer?.notes || ''
    })

    // Watch for prop changes to update form data
    watch(() => props.transfer, (newTransfer) => {
      if (newTransfer) {
        formData.contract_id = newTransfer.contract_id || ''
        formData.completion_date = newTransfer.completion_date || ''
        formData.deed_number = newTransfer.deed_number || ''
        formData.notes = newTransfer.notes || ''
      } else {
        // Reset form when transfer is cleared
        formData.contract_id = ''
        formData.completion_date = ''
        formData.deed_number = ''
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

.form-input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
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
