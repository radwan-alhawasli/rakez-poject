<template>
  <div v-if="show" class="session-warning-overlay" role="alertdialog" aria-modal="true">
    <div class="session-warning-modal">
      <div class="session-warning-icon">⚠️</div>
      <h3>تنبيه انتهاء الجلسة</h3>
      <p>ستنتهي جلستك خلال <strong>{{ countdown }}</strong> ثانية.</p>
      <div class="session-warning-actions">
        <button class="btn-primary" @click="$emit('extend')">تمديد الجلسة</button>
        <button class="btn-text" @click="$emit('logout')">تسجيل الخروج</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  countdown: { type: Number, default: 0 },
});

defineEmits(['extend', 'logout']);
</script>

<style scoped>
.session-warning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.session-warning-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.session-warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-charcoal, #2d2d2d);
}

.session-warning-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
