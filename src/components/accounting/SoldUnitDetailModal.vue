<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">تفاصيل الوحدة المباعة</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body" v-if="unit">
        <div class="detail-section">
          <h3 class="detail-title">معلومات الوحدة</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">رقم الحجز:</span>
              <span class="detail-value">{{ unit.reservation_id || unit.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">اسم العميل:</span>
              <span class="detail-value">{{ unit.customer_name || 'غير محدد' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المشروع:</span>
              <span class="detail-value">{{ unit.project_name || 'غير محدد' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">القيمة الإجمالية:</span>
              <span class="detail-value">{{ formatCurrency(unit.total_value) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">مبلغ العمولة:</span>
              <span class="detail-value">{{ formatCurrency(unit.commission_amount) }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="detail-title">إنشاء عمولة يدوية</h3>
          <form @submit.prevent="handleCreateCommission">
            <div class="form-group">
              <label class="form-label">المبلغ</label>
              <input v-model.number="commissionForm.amount" type="number" class="form-input" min="0" required />
            </div>
            <div class="form-group">
              <label class="form-label">نسبة العمولة (%)</label>
              <input v-model.number="commissionForm.commission_percentage" type="number" class="form-input" min="0" max="100" />
            </div>
            <div class="form-group">
              <label class="form-label">مصدر العمولة</label>
              <input v-model="commissionForm.commission_source" type="text" class="form-input" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
              <button type="submit" class="btn-primary">إنشاء عمولة</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SoldUnitDetailModal',
  props: {
    unit: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'create-commission'],
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
    const commissionForm = reactive({
      amount: props.unit?.commission_amount || 0,
      commission_percentage: 0,
      commission_source: ''
    })

    const formatCurrency = (val) => {
      if (!val) return '0 ر.س'
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val)
    }

    const handleCreateCommission = () => {
      emit('create-commission', { ...commissionForm })
    }

    return {
      commissionForm,
      formatCurrency,
      handleCreateCommission
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
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

.detail-section,
.form-section {
  margin-bottom: 30px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 15px;
  font-family: 'Cairo', sans-serif;
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
  color: #64748b;
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
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
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #B1A28F;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}
</style>
