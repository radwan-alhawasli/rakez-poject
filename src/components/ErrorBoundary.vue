<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary">
    <div class="error-boundary-content">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3>حدث خطأ غير متوقع</h3>
      <p>{{ error.message || 'حدث خطأ أثناء تحميل هذا القسم.' }}</p>
      <button type="button" class="btn-primary" @click="reset">إعادة المحاولة</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import logger from '@/utils/logger';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  logger.error('ErrorBoundary caught:', err);
  return false;
});

function reset() {
  error.value = null;
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}
.error-boundary-content {
  text-align: center;
  max-width: 400px;
}
.error-boundary-content svg {
  color: #e74c3c;
  margin-bottom: 16px;
}
.error-boundary-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 8px;
}
.error-boundary-content p {
  color: #64748b;
  margin: 0 0 20px;
  font-size: 14px;
}
</style>
