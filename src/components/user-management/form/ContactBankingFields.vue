<template>
  <div class="form-section">
    <h3 class="section-title">
      <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      بيانات التواصل والبنوك
    </h3>

    <div class="form-row">
      <div class="form-group">
        <label class="label">البريد الإلكتروني *</label>
        <input v-model="form.email" type="email" autocomplete="email" class="input" :class="{ 'input-error': errors.email }" placeholder="user@example.com" required />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>
      <div class="form-group">
        <label class="label">رقم حساب البنك (IBAN)</label>
        <input v-model="form.iban" type="text" autocomplete="off" class="input" placeholder="SA..." />
      </div>
    </div>

    <div class="form-group">
      <label class="label">كلمة المرور {{ isEdit ? '(اتركها فارغة للإبقاء على الحالية)' : '*' }}</label>
      <input v-model="form.password" type="password" :autocomplete="isEdit ? 'current-password' : 'new-password'" class="input" :class="{ 'input-error': errors.password }" placeholder="••••••" :required="!isEdit" />
      <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  form: Object,
  errors: Object,
  isEdit: Boolean,
});
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
.field-error { font-size: 12px; color: #ef4444; }
@media (max-width: 576px) { .form-row { grid-template-columns: 1fr; } }
</style>
