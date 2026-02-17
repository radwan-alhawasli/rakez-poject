<template>
  <div class="toast-container" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast-item"
        :class="t.type"
        role="alert"
      >
        <span class="toast-icon">{{ iconFor(t.type) }}</span>
        <span class="toast-message">{{ t.message }}</span>
        <button type="button" class="toast-close" aria-label="إغلاق" @click="t.dismiss()">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useToast } from '../composables/useToast'

export default {
  name: 'ToastContainer',
  setup() {
    const { toasts } = useToast()
    const iconFor = (type) => {
      const icons = { success: '✓', error: '✕', warning: '!', info: 'i' }
      return icons[type] || '•'
    }
    return { toasts, iconFor }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  width: calc(100% - 32px);
  pointer-events: none;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Tajawal', 'Cairo', sans-serif;
  direction: rtl;
}
.toast-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}
.toast-message {
  flex: 1;
}
.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  padding: 0 4px;
}
.toast-close:hover {
  opacity: 1;
}
.toast-item.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}
.toast-item.success .toast-icon {
  background: #16a34a;
  color: #fff;
}
.toast-item.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
.toast-item.error .toast-icon {
  background: #dc2626;
  color: #fff;
}
.toast-item.warning {
  background: #fefce8;
  color: #854d0e;
  border: 1px solid #fde047;
}
.toast-item.warning .toast-icon {
  background: #eab308;
  color: #fff;
}
.toast-item.info {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #93c5fd;
}
.toast-item.info .toast-icon {
  background: #2563eb;
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
