<template>
  <ImportCard
    title="Import Districts"
    description="استيراد الأحياء فقط."
    :required-columns="['city_id', 'name']"
    :optional-columns="[]"
    template-filename="districts_template.csv"
    @upload="handleUpload"
  />
</template>

<script setup>
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importDistricts(file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
