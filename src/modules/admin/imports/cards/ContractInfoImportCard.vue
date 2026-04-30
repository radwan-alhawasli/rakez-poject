<template>
  <ImportCard
    title="Import Contract Info"
    description="استيراد معلومات العقد لعقد محدد (يتطلب اختيار contractId)."
    :required-columns="requiredCols"
    :optional-columns="[]"
    template-filename="contract_info_template.csv"
    :disabled="!contractId"
    :precondition-warning="warning"
    @upload="handleUpload"
  >
    <template #pre>
      <ContractPicker
        v-model="contractId"
        preconditions-hint="يشترط أن يكون العقد معتمدًا (approved) ولا يحتوي على info مسبقًا."
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
  'gregorian_date',
  'hijri_date',
  'contract_city',
  'location_url',
  'agreement_duration_days',
  'agency_number',
  'agency_date',
  'avg_property_value',
  'release_date',
  'second_party_name',
  'second_party_address',
  'second_party_cr_number',
  'second_party_signatory',
  'second_party_id_number',
  'second_party_role',
  'second_party_phone',
  'second_party_email',
];

const warning = computed(() =>
  contractId.value
    ? 'تأكد من شروط العقد قبل الاستيراد: يجب أن يكون معتمدًا ولا يحتوي على معلومات عقد مسبقًا.'
    : 'لن يتم تفعيل الرفع حتى تختار contractId.'
);

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importContractInfo(contractId.value, file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
