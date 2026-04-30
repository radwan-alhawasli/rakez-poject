<template>
  <ImportCard
    title="Import Second Party Data"
    description="استيراد بيانات الطرف الثاني لعقد محدد (يتطلب اختيار contractId)."
    :required-columns="requiredCols"
    :optional-columns="[]"
    template-filename="second_party_data_template.csv"
    :disabled="!contractId"
    :precondition-warning="warning"
    @upload="handleUpload"
  >
    <template #pre>
      <ContractPicker
        v-model="contractId"
        preconditions-hint="يشترط أن يكون العقد يحتوي على info ولا يحتوي على second party data."
      />
    </template>
  </ImportCard>
</template>

<script setup>
import { computed, ref } from 'vue';
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import ContractPicker from '@/modules/admin/imports/components/ContractPicker.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

const contractId = ref('');

const requiredCols = [
  'real_estate_papers_url',
  'plans_equipment_docs_url',
  'project_logo_url',
  'prices_units_url',
  'marketing_license_url',
  'advertiser_section_url',
];

const warning = computed(() =>
  contractId.value
    ? 'تأكد من شروط العقد قبل الاستيراد: يجب أن يكون لديه info ولا يحتوي على بيانات الطرف الثاني.'
    : 'لن يتم تفعيل الرفع حتى تختار contractId.'
);

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importSecondPartyData(contractId.value, file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
