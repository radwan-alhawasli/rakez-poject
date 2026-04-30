<template>
  <ImportCard
    title="Import Teams"
    description="استيراد الفرق (Teams)."
    :required-columns="['name']"
    :optional-columns="['code', 'description']"
    template-filename="teams_template.csv"
    @upload="handleUpload"
  />
</template>

<script setup>
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importTeams(file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
