<template>
  <div class="form-section">
    <h4 class="section-label">معلومات التسويق والعمولة</h4>
    <div class="form-group-info">
      <div class="input-row grid-3">
        <div class="field-group">
          <label>السعي من</label>
          <input type="text" :value="commissionFromLabel" class="form-input readonly" readonly />
        </div>
        <div class="field-group">
          <label>نسبة السعي (%)</label>
          <input type="text" :value="commissionPercentDisplay" class="form-input readonly" readonly />
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>تاريخ اصدار المخالصة والانتهاء</label>
          <input type="date" :value="modelValue.release_date" class="form-input" @input="update('release_date', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>متوسط قيمة العقار</label>
          <input type="number" :value="modelValue.avg_property_value" class="form-input" placeholder="0.00" @input="update('avg_property_value', $event.target.value)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true },
  commissionFromLabel: { type: String, default: '' },
  commissionPercentDisplay: { type: String, default: '' },
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
label { font-size: 14px; font-weight: 600; color: #475569; }
.form-input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.readonly { background: #f8fafc; color: #64748b; }
</style>
