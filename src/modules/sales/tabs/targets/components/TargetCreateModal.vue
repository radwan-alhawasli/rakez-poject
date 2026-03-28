<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal create-target-modal">
      <div class="assign-modal-header">
        <h3>إضافة هدف جديد</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="$emit('submit')" class="create-target-form">
        <div class="form-row">
          <label class="form-label">المسوق</label>
          <select v-model="targetForm.marketer_id" class="form-select" required>
            <option value="">— اختر المسوق —</option>
            <option v-for="m in teamMembers" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">المشروع</label>
          <select v-model="targetForm.contract_id" class="form-select" required>
            <option value="">— اختر المشروع —</option>
            <option v-for="p in teamProjects" :key="p.id" :value="p.id">{{ p.project_name || p.name }}</option>
          </select>
        </div>
        <div v-if="targetForm.contract_id" class="form-row">
          <label class="form-label">الوحدات (اختياري)</label>
          <label class="checkbox-row">
            <input type="checkbox" :checked="targetForm.contract_unit_ids.length === 0" @change="$emit('toggle-full-project')" />
            <span>كل وحدات المشروع</span>
          </label>
          <p v-if="targetForm.contract_unit_ids.length === 0" class="units-hint">سيُنشأ هدف واحد للمشروع بدون ربط وحدة محددة. أو أزل التحديد واختر وحدات أدناه.</p>
          <div class="units-list">
            <LoadingSpinner v-if="isLoadingUnits" text="جاري تحميل الوحدات..." />
            <p v-else-if="unitsError" class="form-error">{{ unitsError }}</p>
            <template v-else-if="units.length">
              <label v-for="u in units" :key="u.id" class="units-checkbox-row">
                <input type="checkbox" :checked="targetForm.contract_unit_ids.includes(u.id)" @change="$emit('toggle-unit', u.id)" />
                <span>{{ u.unit_number ?? u.id }}</span>
              </label>
            </template>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">قيمة الهدف (ر.س)</label>
          <input v-model.number="targetForm.target_value" type="number" min="0" class="form-input" placeholder="0" />
        </div>
        <div class="form-row">
          <label class="form-label">الموعد النهائي</label>
          <input v-model="targetForm.deadline" type="date" class="form-input" required />
        </div>
        <div class="assign-modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-add" :disabled="isSaving">
            {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';

defineProps({
  targetForm: { type: Object, required: true },
  teamMembers: { type: Array, required: true },
  teamProjects: { type: Array, required: true },
  units: { type: Array, required: true },
  isLoadingUnits: { type: Boolean, default: false },
  unitsError: { type: String, default: '' },
  isSaving: { type: Boolean, default: false },
});

defineEmits(['close', 'submit', 'toggle-full-project', 'toggle-unit']);
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
  max-width: 480px; width: 100%; max-height: 85vh;
  display: flex; flex-direction: column; overflow-y: auto;
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
.create-target-form { padding: 16px 20px; }
.form-row { margin-bottom: 14px; }
.form-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--color-navy); margin-bottom: 6px; }
.form-select, .form-input {
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9375rem;
}
.checkbox-row, .units-checkbox-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; }
.units-list { margin-top: 8px; max-height: 200px; overflow-y: auto; padding: 8px 0; }
.form-error { font-size: 0.875rem; color: #b91c1c; }
.assign-modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
.btn-add { padding: 10px 20px; background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 10px 18px; border: 1px solid var(--color-medium-gray); background: var(--color-white); border-radius: 8px; cursor: pointer; }
</style>
