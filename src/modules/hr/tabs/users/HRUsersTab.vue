<template>
  <div class="management-view">
    <UserManagement :use-hr-api="true" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const UserManagement = defineAsyncComponent(() => import('@/components/UserManagement.vue'));
</script>
