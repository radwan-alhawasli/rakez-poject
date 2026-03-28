<template>
  <div class="form-section">
    <h3 class="section-title">
      <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
      البيانات الوظيفية
    </h3>

    <div class="form-row" v-if="!useAdminApi">
      <div class="form-group">
        <label class="label">المسمى الوظيفي</label>
        <input v-model="form.job_title" type="text" class="input" placeholder="مثال: مسوق عقاري" />
      </div>
      <div class="form-group">
        <label class="label">الدور *</label>
        <select v-model="form.type" class="input select" :class="{ 'input-error': errors.role }" required>
          <option value="" disabled>اختر الدور</option>
          <option v-for="opt in ROLE_OPTIONS" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
        </select>
        <span v-if="errors.role" class="field-error">{{ errors.role }}</span>
      </div>
    </div>
    <div class="form-group" v-else>
      <label class="label">الدور *</label>
      <select v-model="form.type" class="input select" :class="{ 'input-error': errors.role }" required>
        <option value="" disabled>اختر الدور</option>
        <option v-for="opt in ROLE_OPTIONS" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
      </select>
      <span v-if="errors.role" class="field-error">{{ errors.role }}</span>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="label">الراتب الشامل (ر.س) *</label>
        <input v-model.number="form.salary" type="number" class="input" placeholder="0.00" required />
      </div>
      <div class="form-group">
        <label class="label">نوع الدوام *</label>
        <select v-model="form.contract_type" class="input select" required>
          <option value="full_time">دوام كامل</option>
          <option value="part_time">دوام جزئي</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="label">تاريخ مباشرة العمل *</label>
        <input v-model="form.date_of_works" type="date" class="input" required />
      </div>
      <div class="form-group" v-if="!useAdminApi">
        <label class="label">فترة التجربة (بالأيام)</label>
        <input v-model.number="form.trial_period_days" type="number" class="input" placeholder="90" />
      </div>
    </div>

    <!-- Team & Manager Toggle -->
    <div class="form-row">
      <div class="form-group">
        <label class="label">الفريق</label>
        <select v-model="form.team" class="input select">
          <option value="">لا يوجد فريق</option>
          <option v-for="t in teamsList" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>
      <div class="form-group d-flex-center">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.is_manager" class="checkbox" />
          <span class="fw-bold">هل هذا الموظف مدير (Manager)؟</span>
        </label>
      </div>
    </div>

    <div class="form-group" v-if="!useAdminApi">
      <label class="label">ميزات أخرى</label>
      <textarea v-model="form.additional_benefits" class="input textarea" rows="3" placeholder="تأمين صحي، سكن..."></textarea>
    </div>
  </div>
</template>

<script setup>
import { ROLE_OPTIONS } from '@/constants/roles';
defineProps({
  form: Object,
  errors: Object,
  useAdminApi: Boolean,
  teamsList: Array,
});
</script>

<style scoped>
.form-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 18px; font-weight: 700; color: #27374d; display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 2px solid #b5a99a; }
.section-icon { width: 22px; height: 22px; color: #b5a99a; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 14px; font-weight: 600; color: #333; }
.input, .textarea { padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
.input:focus, .textarea:focus { border-color: #b5a99a; outline: none; }
.input.select { cursor: pointer; }
.field-error { font-size: 12px; color: #ef4444; }
.textarea { resize: vertical; min-height: 80px; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; }
.d-flex-center { justify-content: center; padding-top: 15px; }
@media (max-width: 576px) { .form-row { grid-template-columns: 1fr; } .d-flex-center { justify-content: flex-start; } }
</style>
