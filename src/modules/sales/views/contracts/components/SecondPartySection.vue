<template>
  <div class="form-section">
    <h4 class="section-label">معلومات الطرف الثاني</h4>
    <div class="form-group-info">
      <div class="input-row">
        <div class="field-group full">
          <label>اختر مطوراً موجوداً (اختياري)</label>
          <select class="form-input">
            <option>...اختر مطوراً لملء البيانات تلقائياً</option>
          </select>
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>وكالة رقم</label>
          <input type="text" :value="modelValue.agency_number" class="form-input" @input="update('agency_number', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>تاريخ الوكالة</label>
          <input type="date" :value="modelValue.agency_date" class="form-input" @input="update('agency_date', $event.target.value)" />
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>سجل تجاري الطرف الثاني رقم</label>
          <input type="text" :value="modelValue.second_party_cr_number" class="form-input" @input="update('second_party_cr_number', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>مقر الطرف الثاني</label>
          <input type="text" :value="modelValue.second_party_address" class="form-input" @input="update('second_party_address', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>اسم الطرف الثاني</label>
          <input type="text" :value="modelValue.second_party_name" class="form-input" :class="{ 'input-error': errors.second_party_name }" @input="update('second_party_name', $event.target.value)" />
          <span v-if="errors.second_party_name" class="field-error">{{ errors.second_party_name }}</span>
        </div>
      </div>

      <div class="input-row grid-3">
        <div class="field-group">
          <label>بصفته (الدور)</label>
          <input type="text" :value="modelValue.second_party_role" class="form-input" placeholder="مثال: owner" @input="update('second_party_role', $event.target.value)" />
        </div>
        <div class="field-group">
          <label>هوية رقم</label>
          <input type="text" :value="modelValue.second_party_id" class="form-input" :class="{ 'input-error': errors.second_party_id }" @input="update('second_party_id', $event.target.value)" />
          <span v-if="errors.second_party_id" class="field-error">{{ errors.second_party_id }}</span>
        </div>
        <div class="field-group">
          <label>يمثلها بالتوقيع على هذا العقد</label>
          <input type="text" :value="modelValue.second_party_signatory" class="form-input" @input="update('second_party_signatory', $event.target.value)" />
        </div>
      </div>

      <div class="input-row">
        <div class="field-group full">
          <label>البريد الإلكتروني للطرف الثاني</label>
          <input type="email" :value="modelValue.second_party_email" class="form-input" placeholder="email@example.com" @input="update('second_party_email', $event.target.value)" />
        </div>
        <div class="field-group full">
          <label>رقم جوال الطرف الثاني</label>
          <input type="text" :value="modelValue.second_party_phone" class="form-input" @input="update('second_party_phone', $event.target.value)" />
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
.input-error { border-color: #ef4444; }
.field-error { font-size: 12px; color: #ef4444; }
</style>
