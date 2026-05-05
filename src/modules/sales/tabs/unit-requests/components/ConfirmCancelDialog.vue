<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="dialog" role="dialog" aria-modal="true">
      <div class="dialog-head">
        <div class="title">{{ title }}</div>
        <button type="button" class="close" @click="$emit('close')">&times;</button>
      </div>

      <div class="body">
        <div class="message">{{ message }}</div>
      </div>

      <div class="actions">
        <button class="btn-danger" type="button" :disabled="busy" @click="$emit('confirm')">
          <span v-if="busy" class="spinner"></span>
          {{ busy ? 'جاري التنفيذ...' : confirmText }}
        </button>
        <button class="btn-secondary" type="button" :disabled="busy" @click="$emit('close')">
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  title: { type: String, default: 'تأكيد' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'تأكيد' },
  cancelText: { type: String, default: 'إلغاء' },
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(8px);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  direction: rtl;
}

.dialog {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(30, 58, 95, 0.06);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.title {
  font-weight: 1000;
  color: rgba(30, 58, 95, 0.98);
}

.close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: #fff;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body {
  padding: 16px;
}

.message {
  color: rgba(51, 65, 85, 0.95);
  font-weight: 750;
  font-size: 13px;
  line-height: 1.8;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 16px 16px 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

.btn-secondary {
  background: #fff;
  color: rgba(30, 58, 95, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.55);
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 1000;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-danger:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid rgba(239, 68, 68, 0.2);
  border-top-color: rgba(185, 28, 28, 0.95);
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

