<template>
  <div class="tab-content project-details-tab">
    <div class="section-header"><h2>تفاصيل المشروع</h2></div>
    <LoadingSpinner v-if="isLoading" text="جاري تحميل التفاصيل..." />
    <slot v-else :project="project" />
  </div>
</template>
<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
defineProps({ project: { type: Object, default: null }, isLoading: { type: Boolean, default: false } });
</script>
