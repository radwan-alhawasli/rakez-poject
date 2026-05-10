<!-- targetForm كائن تفاعلي من useSalesTargets في الأب -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div v-if="open" class="assign-overlay" dir="rtl" lang="ar" @click.self="$emit('close')">
    <div class="assign-modal create-target-modal" role="dialog" aria-modal="true" aria-labelledby="create-target-title">
      <div class="assign-modal-header">
        <h3 id="create-target-title">إضافة هدف جديد</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="$emit('submit')" class="create-target-form">
        <template v-if="mode !== 'executive'">
          <div class="form-row">
            <label class="form-label" for="create-target-marketer">المسوق</label>
            <select id="create-target-marketer" v-model="targetForm.assignee_marketer_id" class="form-select" required>
              <option value="">اختر المسوق</option>
              <option v-for="m in teamMembersList" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label" for="create-target-project">المشروع</label>
            <select id="create-target-project" v-model="targetForm.contract_id" class="form-select" required>
              <option value="">اختر المشروع</option>
              <option v-for="p in teamProjectsList" :key="p.id" :value="p.id">{{ p.project_name || p.name }}</option>
            </select>
          </div>

          <div v-if="targetForm.contract_id" class="form-row form-row--units">
            <label class="form-label">الوحدات (اختياري)</label>
            <label class="checkbox-row">
              <input type="checkbox" :checked="targetForm.contract_unit_ids.length === 0" @change="onTargetFullProjectChange" />
              <span>كل وحدات المشروع</span>
            </label>
            <div class="units-list" role="group" aria-label="اختيار وحدات المشروع">
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
            <label class="form-label" for="create-target-value">قيمة الهدف (ر.س)</label>
            <input
              id="create-target-value"
              v-model.number="targetForm.assigned_target_value"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              class="form-input form-input--target-value"
              placeholder="0"
            />
          </div>

          <div class="form-row">
            <label class="form-label" for="create-target-deadline">الموعد النهائي</label>
            <div class="form-date-wrap" dir="ltr">
              <input
                id="create-target-deadline"
                v-model="targetForm.deadline"
                type="date"
                class="form-input form-input--date"
                required
                lang="en"
                dir="ltr"
                aria-label="الموعد النهائي للهدف"
              />
            </div>
            <p class="form-field-hint">اختر التاريخ من التقويم (يوم / شهر / سنة).</p>
          </div>
        </template>

        <template v-else>
          <div class="form-row">
            <label class="form-label" for="create-target-line-type">نوع الهدف</label>
            <select id="create-target-line-type" v-model="targetForm.line_type" class="form-select" required>
              <option value="">اختر النوع</option>
              <option
                v-for="option in SALES_EXECUTIVE_TARGET_TYPES"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label" for="create-target-exec-value">قيمة الهدف (ر.س)</label>
            <input
              id="create-target-exec-value"
              v-model.number="targetForm.value"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              class="form-input form-input--target-value"
              placeholder="0"
              required
            />
          </div>
        </template>

        <div class="create-target-actions">
          <button type="submit" class="btn-add" :disabled="createTargetSaving">
            {{ createTargetSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { SALES_EXECUTIVE_TARGET_TYPES } from '@/constants/salesTargetLineTypes';

defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'legacy' },
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
