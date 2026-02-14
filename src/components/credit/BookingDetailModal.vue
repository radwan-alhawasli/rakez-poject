<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">تفاصيل الحجز</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body" v-if="booking">
        <div class="detail-section">
          <h3 class="detail-title">معلومات الحجز</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">رقم الحجز:</span>
              <span class="detail-value">{{ booking.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">اسم العميل:</span>
              <span class="detail-value">{{ booking.customer_name || 'غير محدد' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المشروع:</span>
              <span class="detail-value">{{ booking.project_name || 'غير محدد' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تاريخ الحجز:</span>
              <span class="detail-value">{{ formatDate(booking.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحالة:</span>
              <span class="status-tag excellent">مؤكد</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="booking.notes">
          <h3 class="detail-title">ملاحظات</h3>
          <p class="detail-text">{{ booking.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'

export default {
  name: 'BookingDetailModal',
  props: {
    booking: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const formatDate = (dateStr) => {
      if (!dateStr) return 'غير محدد'
      try {
        return new Date(dateStr).toLocaleDateString('ar-SA')
      } catch {
        return dateStr
      }
    }

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

    return {
      formatDate
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
  max-width: 600px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  font-size: 28px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
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

.modal-body {
  padding: 0;
}

.detail-section {
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

.detail-text {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.6;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
}

.status-tag.excellent {
  background: #dcfce7;
  color: #16a34a;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
