<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">إدارة توزيع الراتب</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-body" v-if="salary">
        <div class="form-group">
          <label class="form-label">الشهر</label>
          <input v-model="formData.month" type="number" min="1" max="12" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">السنة</label>
          <input v-model.number="formData.year" type="number" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">الراتب الأساسي</label>
          <input v-model.number="formData.base_salary" type="number" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">إجمالي العمولات</label>
          <input v-model.number="formData.total_commissions" type="number" class="form-input" required />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ salary.distribution_id ? 'تحديث' : 'إنشاء' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SalaryDistributionModal',
  props: {
    salary: { type: Object, default: null },
    isLoading: { type: Boolean, default: false }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
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
    const formData = reactive({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      base_salary: props.salary?.base_salary || 0,
      total_commissions: props.salary?.total_commissions || 0
    })

    const handleSubmit = () => {
      emit('submit', { action: props.salary?.distribution_id ? 'update' : 'create', ...formData })
    }

    return { formData, handleSubmit }
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: 'Cairo', sans-serif;
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
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
</style>
