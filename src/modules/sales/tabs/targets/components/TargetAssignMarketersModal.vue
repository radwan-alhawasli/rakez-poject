<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal">
      <div class="assign-modal-header">
        <h3>إضافة مسوقين للمشروع</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ target?.project_name || 'هدف مبيعات' }}</p>
      <div class="assign-marketers-list">
        <label v-for="m in teamMembers" :key="m.id" class="assign-marketer-row">
          <input type="checkbox" :value="m.id" :checked="selectedIds.includes(m.id)" @change="$emit('toggle-marketer', m.id)" />
          <span>{{ m.name }}</span>
        </label>
      </div>
      <p v-if="teamMembers.length === 0 && !isLoading" class="assign-empty">لا يوجد مسوقون في الفريق.</p>
      <p v-if="isLoading" class="assign-loading">جاري تحميل المسوقين...</p>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn-add" :disabled="selectedIds.length === 0 || isSaving" @click="$emit('save')">
          {{ isSaving ? 'جاري الحفظ...' : `حفظ (${selectedIds.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  target: { type: Object, required: true },
  teamMembers: { type: Array, required: true },
  selectedIds: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
});

defineEmits(['close', 'toggle-marketer', 'save']);
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
  max-width: 420px; width: 100%; max-height: 85vh;
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
.assign-marketers-list { flex: 1; overflow-y: auto; padding: 12px 20px; max-height: 280px; }
.assign-marketer-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; cursor: pointer; }
.assign-marketer-row:hover { background: #f8fafc; }
.assign-empty, .assign-loading { padding: 20px; text-align: center; color: var(--color-dark-gray); }
.assign-modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid #e5e7eb; }
.btn-add { padding: 10px 20px; background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 10px 18px; border: 1px solid var(--color-medium-gray); background: var(--color-white); border-radius: 8px; cursor: pointer; }
</style>
