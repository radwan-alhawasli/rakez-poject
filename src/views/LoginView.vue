<template>
  <LoginPage @login-success="onLoginSuccess" />
</template>

<script setup>
import LoginPage from '@/components/LoginPage.vue';
import { useRouter } from 'vue-router';
import { getDashboardPathForUser } from '@/utils/rbac';

const router = useRouter();

const onLoginSuccess = userData => {
  router.push(getDashboardPathForUser(userData) || '/dashboard');
};
</script>

<style scoped>
/* Touch-target safety net on mobile */
@media (max-width: 576px) {
  :deep(input),
  :deep(button) {
    min-height: 44px;
  }
}
</style>
