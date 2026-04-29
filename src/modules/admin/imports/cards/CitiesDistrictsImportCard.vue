<template>
  <ImportCard
    title="Import Cities + Districts"
    description="استيراد المدن مع الأحياء (اختياري) دفعة واحدة."
    :required-columns="['city_name', 'city_code']"
    :optional-columns="['district_name']"
    template-filename="cities_districts_template.csv"
    @upload="handleUpload"
  />
</template>

<script setup>
import ImportCard from '@/modules/admin/imports/components/ImportCard.vue';
import adminCsvImportsService from '@/services/adminCsvImportsService';

function handleUpload({ file, onProgress, resolve, reject }) {
  adminCsvImportsService
    .importCitiesDistricts(file, onProgress)
    .then(resolve)
    .catch(reject);
}
</script>
