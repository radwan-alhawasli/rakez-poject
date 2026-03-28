<template>
  <div class="form-section">
    <h3 class="section-title">
      <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      البيانات الشخصية
    </h3>

    <div class="form-row">
      <div class="form-group">
        <label class="label">الاسم الكامل *</label>
        <input v-model="form.name" type="text" autocomplete="name" class="input" :class="{ 'input-error': errors.name }" placeholder="مثال: علي أحمد" required />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>
      <div class="form-group">
        <label class="label">رقم الهوية *</label>
        <input v-model="form.identity_number" type="text" class="input" placeholder="مثال: 1234567890" required />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="label">تاريخ الميلاد *</label>
        <div class="date-type-toggle">
          <button type="button" @click="dateType = 'gregorian'" :class="{ active: dateType === 'gregorian' }" class="toggle-btn"> ميلادي </button>
          <button type="button" @click="dateType = 'hijri'" :class="{ active: dateType === 'hijri' }" class="toggle-btn"> هجري </button>
        </div>
        <input v-model="form.birthday" type="date" class="input" required />
      </div>
      <div class="form-group">
        <label class="label">رقم الجوال *</label>
        <input v-model="form.phone" type="tel" autocomplete="tel" class="input" :class="{ 'input-error': errors.phone }" placeholder="05xxxxxxxx" required />
        <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
      </div>
    </div>

    <div class="form-row" v-if="!useAdminApi">
      <div class="form-group">
        <label class="label">الجنسية</label>
        <select v-model="form.nationality" class="input select">
          <option value="">اختر الجنسية</option>
          <option v-for="opt in NATIONALITIES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="label">الحالة الاجتماعية</label>
        <select v-model="form.marital_status" class="input select">
          <option v-for="opt in MARITAL_STATUSES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NATIONALITIES, MARITAL_STATUSES } from '@/constants/lookups';
const props = defineProps({
  form: Object,
  errors: Object,
  useAdminApi: Boolean,
  dateType: String,
});
const emit = defineEmits(['update:dateType']);
</script>

<style scoped>
.form-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 18px; font-weight: 700; color: #27374d; display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 2px solid #b5a99a; }
.section-icon { width: 22px; height: 22px; color: #b5a99a; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 14px; font-weight: 600; color: #333; }
.input { padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
.input:focus { border-color: #b5a99a; outline: none; }
.input.select { cursor: pointer; }
.field-error { font-size: 12px; color: #ef4444; }
.date-type-toggle { display: flex; gap: 8px; margin-bottom: 8px; }
.toggle-btn { flex: 1; padding: 8px; background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.toggle-btn.active { background: #b5a99a; border-color: #b5a99a; color: white; }
@media (max-width: 576px) { .form-row { grid-template-columns: 1fr; } }
</style>
