<template>
  <div class="form-section">
    <h4 class="section-label">المشاريع والوحدات</h4>
    <div class="form-group-info">
      <div class="input-row grid-3">
        <div class="field-group">
          <label>عدد الوحدات</label>
          <input type="number" :value="modelValue.units_count" class="form-input" @input="update('units_count', Number($event.target.value))" />
        </div>
        <div class="field-group">
          <label>نوع الوحدة</label>
          <select :value="modelValue.unit_type" class="form-input" @change="update('unit_type', $event.target.value)">
            <option value="">اختر النوع</option>
            <option value="فيلا">فيلا</option>
            <option value="شقة">شقة</option>
          </select>
        </div>
        <div class="field-group">
          <label>اسم المشروع</label>
          <input type="text" :value="modelValue.project_name" class="form-input" :class="{ 'input-error': errors.project_name }" @input="update('project_name', $event.target.value)" />
          <span v-if="errors.project_name" class="field-error">{{ errors.project_name }}</span>
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>الحي</label>
          <input type="text" :value="modelValue.district" class="form-input" @input="update('district', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>المساحة (إجمالي القيمة)</label>
          <input type="number" :value="modelValue.total_units_value" class="form-input" @input="update('total_units_value', Number($event.target.value))" />
        </div>
        <div class="field-group">
          <label>المدينة</label>
          <input type="text" :value="modelValue.city" class="form-input" :class="{ 'input-error': errors.city }" @input="update('city', $event.target.value)" />
          <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
        </div>
      </div>

      <div class="input-row">
        <div class="field-group full">
          <label>الوصف</label>
          <textarea :value="modelValue.notes" class="form-input text-area" placeholder="أدخل ملاحظاتك هنا..." @input="update('notes', $event.target.value)" />
        </div>
      </div>

      <div class="input-row">
        <div class="field-group full">
          <label>رابط موقع المشروع</label>
          <input type="url" :value="modelValue.project_site_url" class="form-input" placeholder="https://..." @input="update('project_site_url', $event.target.value)" />
        </div>
      </div>

      <button type="button" class="add-project-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>إضافة مشروع آخر</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['update:modelValue']);
const update = (key, val) => emit('update:modelValue', { ...props.modelValue, [key]: val });
</script>

<style scoped>
.form-section { margin-bottom: 40px; }
.section-label { font-size: 20px; color: #27374d; margin-bottom: 15px; padding-right: 10px; border-right: 4px solid #b5a99a; }
.form-group-info { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 30px; }
.input-row { display: flex; gap: 20px; margin-bottom: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group.full { width: 100%; }
label { font-size: 14px; font-weight: 600; color: #475569; }
.form-input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.text-area { min-height: 100px; resize: vertical; }
.input-error { border-color: #ef4444; }
.field-error { font-size: 12px; color: #ef4444; }
.add-project-btn { display: flex; align-items: center; gap: 8px; background: transparent; border: 1px dashed #b5a99a; color: #b5a99a; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin-top: 10px; }
</style>
