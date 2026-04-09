<!-- targetForm كائن تفاعلي من useSalesTargets في الأب — نفس النمط السابق قبل استخراج المودال -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div v-if="open" class="assign-overlay" @click.self="$emit('close')">
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
            <option v-for="m in teamMembersList" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">المشروع</label>
          <select v-model="targetForm.contract_id" class="form-select" required>
            <option value="">— اختر المشروع —</option>
            <option v-for="p in teamProjectsList" :key="p.id" :value="p.id">{{ p.project_name || p.name }}</option>
          </select>
        </div>
        <div v-if="targetForm.contract_id" class="form-row">
          <label class="form-label">الوحدات (اختياري)</label>
          <label class="checkbox-row">
            <input type="checkbox" :checked="targetForm.contract_unit_ids.length === 0" @change="onTargetFullProjectChange" />
            <span>كل وحدات المشروع</span>
          </label>
          <p v-if="targetForm.contract_unit_ids.length === 0" class="units-hint">سيُنشأ هدف واحد للمشروع بدون ربط وحدة محددة. أو أزل التحديد واختر وحدات أدناه.</p>
          <div class="units-list">
            <LoadingSpinner v-if="isLoadingTargetFormUnits" text="جاري تحميل الوحدات..." />
            <p v-else-if="targetFormUnitsError" class="form-error">{{ targetFormUnitsError }}</p>
            <template v-else-if="targetFormUnits.length">
              <label v-for="u in targetFormUnits" :key="u.id" class="units-checkbox-row">
                <input type="checkbox" :checked="targetForm.contract_unit_ids.includes(u.id)" @change="toggleTargetUnit(u.id)" />
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
          <button type="submit" class="btn-add" :disabled="createTargetSaving">
            {{ createTargetSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';

defineProps({
  open: { type: Boolean, default: false },
  targetForm: { type: Object, required: true },
  teamMembersList: { type: Array, default: () => [] },
  teamProjectsList: { type: Array, default: () => [] },
  targetFormUnits: { type: Array, default: () => [] },
  isLoadingTargetFormUnits: { type: Boolean, default: false },
  targetFormUnitsError: { type: String, default: '' },
  createTargetSaving: { type: Boolean, default: false },
  onTargetFullProjectChange: { type: Function, required: true },
  toggleTargetUnit: { type: Function, required: true },
});

defineEmits(['close', 'submit']);
</script>
