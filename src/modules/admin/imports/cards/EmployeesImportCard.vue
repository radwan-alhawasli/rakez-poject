<template>
  <ImportCard
    title="Import Employees"
    description="استيراد الموظفين (عملية حساسة)."
    :required-columns="['name', 'email', 'password', 'type']"
    :optional-columns="[
      'phone',
      'role',
      'is_manager',
      'team',
      'identity_number',
      'birthday',
      'date_of_works',
      'contract_type',
      'iban',
      'salary',
      'marital_status',
    ]"
    template-filename="employees_template.csv"
    :confirm="true"
    confirm-title="تأكيد استيراد الموظفين"
    confirm-message="هذه عملية حساسة وقد تنشئ حسابات جديدة. هل أنت متأكد من المتابعة؟"
    @upload="handleUpload"
  />
</template>

<script setup>
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importEmployees(file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
