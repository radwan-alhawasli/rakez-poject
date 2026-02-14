<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">إدارة توزيعات العمولة</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body" v-if="commission">
        <div class="form-group">
          <label class="form-label">توزيعات العمولة</label>
          <div v-for="(dist, idx) in distributions" :key="idx" class="distribution-item">
            <input v-model="dist.user_id" type="number" placeholder="معرف المستخدم" class="form-input" />
            <input v-model.number="dist.percentage" type="number" placeholder="النسبة %" class="form-input" />
            <select v-model="dist.distribution_type" class="form-input">
              <option value="sales">مبيعات</option>
              <option value="team">فريق</option>
            </select>
            <button @click="removeDistribution(idx)" class="btn-action delete">حذف</button>
          </div>
          <button @click="addDistribution" class="btn-secondary">إضافة توزيع</button>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button @click="handleUpdate" class="btn-primary" :disabled="isLoading">تحديث</button>
          <button @click="handleApprove" class="btn-primary" :disabled="isLoading">موافقة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CommissionDistributionModal',
  props: {
    commission: { type: Object, default: null },
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
    const distributions = ref(props.commission?.distributions || [{ user_id: '', percentage: 0, distribution_type: 'sales' }])

    const addDistribution = () => {
      distributions.value.push({ user_id: '', percentage: 0, distribution_type: 'sales' })
    }

    const removeDistribution = (idx) => {
      distributions.value.splice(idx, 1)
    }

    const handleUpdate = () => {
      emit('submit', { action: 'update', distributions: distributions.value })
    }

    const handleApprove = () => {
      emit('submit', { action: 'approve', distributionId: distributions.value[0]?.id })
    }

    return { distributions, addDistribution, removeDistribution, handleUpdate, handleApprove }
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

.distribution-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
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

.btn-secondary,
.btn-primary,
.btn-action {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
}

.btn-action.delete {
  padding: 8px 16px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
</style>
