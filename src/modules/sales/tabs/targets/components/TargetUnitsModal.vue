<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="units-modal assign-modal">
      <div class="assign-modal-header">
        <h3>{{ isLeaderView ? 'الوحدات المعينة للفريق' : 'وحداتي المعينة' }}</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>
      <LoadingSpinner v-if="isLoading" text="جاري تحميل الوحدات المعينة..." />
      <div v-else-if="error" class="units-modal-error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="rows.length === 0" class="units-modal-empty">
        <p>{{ isLeaderView ? 'لا توجد وحدات معينة لهذا المشروع.' : 'لا توجد وحدات معينة لك في هذا المشروع.' }}</p>
      </div>
      <div v-else class="units-modal-table-wrap">
        <table class="units-modal-table">
          <thead>
            <tr>
              <th>رقم الوحدة</th>
              <th v-if="isLeaderView">موظف المبيعات (المستلم)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="row.unit_id + '-' + idx">
              <td>{{ row.unit_number }}</td>
              <td v-if="isLeaderView">{{ row.marketer_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';

defineProps({
  projectName: { type: String, default: '' },
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  isLeaderView: { type: Boolean, default: false },
});

defineEmits(['close']);
</script>

<style scoped>
.assign-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.assign-modal {
  background: var(--color-white); border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 520px; width: 100%; max-height: 85vh;
  display: flex; flex-direction: column;
}
.assign-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px; border-bottom: 1px solid #e5e7eb;
}
.assign-modal-header h3 { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--color-navy); }
.assign-close {
  width: 32px; height: 32px; padding: 0; border: none; background: none;
  font-size: 1.5rem; color: var(--color-dark-gray); cursor: pointer; border-radius: 6px;
}
.assign-project-name { margin: 0; padding: 12px 20px; font-size: 0.9375rem; color: var(--color-dark-gray); border-bottom: 1px solid #f1f5f9; }
.units-modal-error { padding: 20px; text-align: center; color: #b91c1c; }
.units-modal-empty { padding: 24px 20px; text-align: center; color: var(--color-dark-gray); }
.units-modal-table-wrap { flex: 1; overflow: auto; padding: 0 20px; max-height: 320px; }
.units-modal-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
.units-modal-table th, .units-modal-table td { padding: 10px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; }
.units-modal-table th { font-weight: 600; color: var(--color-navy); background: #f8fafc; }
.assign-modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid #e5e7eb; }
.btn-secondary { padding: 10px 18px; border: 1px solid var(--color-medium-gray); background: var(--color-white); border-radius: 8px; cursor: pointer; }
</style>
