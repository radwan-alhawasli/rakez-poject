<template>
  <div class="tab-content project-licenses-tab">
    <div class="section-header"><h2>تراخيص المشروع</h2></div>
    <LoadingSpinner v-if="isLoading" text="جاري تحميل التراخيص..." />
    <div v-else-if="!licenses.length" class="empty-state"><p>لا توجد تراخيص.</p></div>
    <slot v-else :licenses="licenses" />
  </div>
</template>
<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
defineProps({ licenses: { type: Array, default: () => [] }, isLoading: { type: Boolean, default: false } });
</script>
