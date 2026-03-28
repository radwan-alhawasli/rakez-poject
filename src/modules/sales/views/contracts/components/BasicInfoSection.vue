<template>
  <div class="form-section">
    <h4 class="section-label">معلومات العقد الأساسية</h4>
    <div class="form-group-info">
      <div class="input-row grid-3">
        <div class="field-group">
          <label>سجل تجاري الطرف الأول رقم</label>
          <input type="text" value="1010650301" class="form-input readonly" readonly />
        </div>
        <div class="field-group">
          <label>الطرف الأول</label>
          <input type="text" value="شركة راكز العقارية" class="form-input readonly" readonly />
        </div>
        <div class="field-group">
          <label>رقم العقد</label>
          <input type="text" value="ER-1312NU44" class="form-input readonly" readonly />
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>الايميل الرسمي للشركة</label>
          <input type="email" value="info@rakez.sa" class="form-input readonly" readonly />
        </div>
        <div class="field-group">
          <label>رقم هاتف الشركة</label>
          <input type="text" :value="modelValue.phone" class="form-input" placeholder="أدخل رقم الهاتف" @input="update('phone', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>يمثلها بالتوقيع على هذا العقد</label>
          <input type="text" :value="modelValue.signatory" class="form-input readonly" readonly />
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>مدينة التعاقد</label>
          <input type="text" value="الرياض" class="form-input readonly" readonly />
        </div>
        <div class="field-group">
          <label>تاريخ هجري</label>
          <input type="text" :value="modelValue.hijri_date" class="form-input" placeholder="-- / -- / --" @input="update('hijri_date', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>تاريخ ميلادي</label>
          <input type="date" :value="modelValue.gregorian_date" class="form-input" :class="{ 'input-error': errors.gregorian_date }" @input="update('gregorian_date', $event.target.value)" />
          <span v-if="errors.gregorian_date" class="field-error">{{ errors.gregorian_date }}</span>
        </div>
      </div>

      <div class="input-row">
        <div class="field-group full">
          <label>مدة الاتفاقية (بالأيام)</label>
          <input type="number" :value="modelValue.agreement_duration_days" class="form-input" :class="{ 'input-error': errors.agreement_duration_days }" placeholder="مثال: 3" @input="update('agreement_duration_days', $event.target.value)" />
          <span v-if="errors.agreement_duration_days" class="field-error">{{ errors.agreement_duration_days }}</span>
        </div>
      </div>
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
.readonly { background: #f8fafc; color: #64748b; }
.input-error { border-color: #ef4444; }
.field-error { font-size: 12px; color: #ef4444; }
</style>
