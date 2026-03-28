<template>
  <div class="contract-form">
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إحضار المشاريع والعقود</h2>
        <p class="section-subtitle">إضافة مطورين جدد، إنشاء عقود، وتعبئة بيانات المشاريع الأولية.</p>
      </div>
    </div>

    <div class="import-type-section">
      <div class="form-group-info compact">
        <h4 class="group-title text-center">اختر نوع الإحضار</h4>
        <div class="select-wrapper-center">
          <select class="form-input centered">
            <option>مشاريع جاهزة</option>
            <option>مشاريع تحت الإنشاء</option>
          </select>
        </div>
      </div>
    </div>

    <div class="main-form">
      <div class="form-title-area">
        <h3 class="main-form-title">نموذج العقد الجديد</h3>
        <p class="main-form-subtitle">املأ النموذج أدناه لإرسال العقد للمراجعة وإنشاء المشاريع.</p>
      </div>

      <form @submit.prevent="saveChanges">
        <BasicInfoSection v-model="form" :errors="allErrors" />
        <MarketingSection v-model="form" :commission-from-label="commissionFromLabel" :commission-percent-display="commissionPercentDisplay" />
        <SecondPartySection v-model="form" :errors="allErrors" />
        <ProjectUnitsSection v-model="form" :errors="allErrors" />

        <div class="form-footer">
          <button type="submit" class="save-btn approve-btn" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-small"></span>
            حفظ واعتماد العقد
          </button>
        </div>
      </form>
    </div>

    <ContractSuccessDialog
      v-model:open="showDownloadModal"
      :is-downloading="isDownloading"
      @download="downloadContract"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BasicInfoSection from './contracts/components/BasicInfoSection.vue';
import MarketingSection from './contracts/components/MarketingSection.vue';
import SecondPartySection from './contracts/components/SecondPartySection.vue';
import ProjectUnitsSection from './contracts/components/ProjectUnitsSection.vue';
import ContractSuccessDialog from './contracts/components/ContractSuccessDialog.vue';
import { useContractForm } from '../composables/useContractForm';

const {
  form, isSaving, isDownloading, showDownloadModal,
  commissionFromLabel, commissionPercentDisplay,
  getFieldError, saveChanges, downloadContract
} = useContractForm();

const allErrors = computed(() => ({
  gregorian_date: getFieldError('gregorian_date'),
  agreement_duration_days: getFieldError('agreement_duration_days'),
  second_party_name: getFieldError('second_party_name'),
  second_party_id: getFieldError('second_party_id'),
  project_name: getFieldError('project_name'),
  city: getFieldError('city'),
}));
</script>

<style scoped>
.contract-form { animation: fadeIn 0.4s ease-out; direction: rtl; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.section-header { margin-bottom: 30px; }
.section-title { font-size: 32px; font-weight: 700; color: #1a2636; margin: 0 0 8px 0; }
.section-subtitle { color: #64748b; font-size: 16px; }
.import-type-section { margin-bottom: 30px; }
.form-group-info.compact { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; }
.group-title { color: #1a2636; font-size: 22px; margin: 0 0 15px 0; }
.form-input.centered { text-align: center; width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.main-form { margin-top: 40px; }
.form-title-area { text-align: center; margin-bottom: 30px; }
.main-form-title { font-size: 28px; color: #1a2636; margin: 0 0 5px 0; }
.main-form-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.form-footer { margin-top: 40px; text-align: center; }
.approve-btn { background: #1a2636; color: #fff; padding: 14px 40px; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; border: none; }
.spinner-small { width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-inline-end: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
