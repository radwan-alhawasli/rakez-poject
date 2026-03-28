<template>
  <AppModal
    :open="true"
    :title="isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'"
    :subtitle="isEdit ? 'تعديل تفاصيل الموظف في النظام.' : 'أدخل تفاصيل الموظف الجديد لإنشاء حسابه.'"
    size="wide"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="user-form" dir="rtl">
      <!-- Personal Data -->
      <PersonalDataFields
        :form="form"
        :errors="getFieldError"
        :use-admin-api="useAdminApi"
        :date-type="dateType"
        @update:dateType="dateType = $event"
      />

      <div class="divider"></div>

      <!-- Job Data -->
      <JobDataFields
        :form="form"
        :errors="getFieldError"
        :use-admin-api="useAdminApi"
        :teams-list="teamsList"
      />

      <div class="divider"></div>

      <!-- Contact & Banking -->
      <ContactBankingFields
        :form="form"
        :errors="getFieldError"
        :is-edit="isEdit"
      />

      <div class="divider" v-if="!useAdminApi"></div>

      <!-- Documents & Approvals -->
      <DocumentFields
        v-if="!useAdminApi"
        :form="form"
      />

      <div class="divider" v-if="!useAdminApi"></div>

      <!-- Contracts Notice -->
      <div class="form-section" v-if="!useAdminApi && !isEdit">
        <h3 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          العقود
        </h3>
        <div class="contract-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>سيتم إنشاء وإرسال عقد التوظيف تلقائياً بعد حفظ بيانات الموظف</p>
        </div>
      </div>
    </form>
    
    <template #footer>
      <div class="modal-actions flex gap-3 flex-wrap justify-end">
        <button type="button" class="btn btn-cancel" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn btn-submit" :disabled="isLoading" @click="handleSubmit">
          <span v-if="isLoading" class="loader-state">
            <svg class="spinner-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            </svg>
            جاري الحفظ...
          </span>
          <span v-else>{{ isEdit ? 'حفظ التعديلات' : 'إنشاء الموظف' }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import AppModal from '@/components/AppModal.vue';
import PersonalDataFields from './user-management/form/PersonalDataFields.vue';
import JobDataFields from './user-management/form/JobDataFields.vue';
import ContactBankingFields from './user-management/form/ContactBankingFields.vue';
import DocumentFields from './user-management/form/DocumentFields.vue';
import { useAddUserForm } from './user-management/form/useAddUserForm';

const props = defineProps({
  editUser: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  useAdminApi: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'submit']);

const { form, isEdit, dateType, teamsList, handleSubmit, getFieldError } = useAddUserForm(props, emit);
</script>

<style scoped>
.user-form { display: flex; flex-direction: column; gap: 30px; }
.divider { height: 1px; background: #e2e8f0; margin: 5px 0; }
.form-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 18px; font-weight: 700; color: #27374d; display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 2px solid #b5a99a; }
.section-icon { width: 22px; height: 22px; color: #b5a99a; }
.contract-notice { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 10px; color: #475569; }
.contract-notice svg { width: 24px; height: 24px; color: #3b82f6; flex-shrink: 0; }
.contract-notice p { margin: 0; font-size: 14px; font-weight: 500; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
.btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; border: none; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-cancel:hover { background: #e2e8f0; color: #27374d; }
.btn-submit { background: linear-gradient(135deg, #b5a99a 0%, #9a8d7d 100%); color: white; box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2); }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(161, 139, 92, 0.3); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.loader-state { display: flex; align-items: center; gap: 8px; }
.spinner-icon { width: 16px; height: 16px; animation: spin 1s linear infinite; }
.spinner-icon circle { stroke: currentColor; stroke-dasharray: 60; stroke-dashoffset: 40; }
@keyframes spin { 100% { transform: rotate(360deg); } }
@media (max-width: 576px) { .modal-actions { flex-direction: column; } .btn { width: 100%; } }
</style>
