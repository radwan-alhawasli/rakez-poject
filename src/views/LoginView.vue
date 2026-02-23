<template>
  <LoginPage @login-success="onLoginSuccess" />
</template>

<script>
import LoginPage from '../components/LoginPage.vue';
import { useRouter } from 'vue-router';
import { getDashboardPathForUser } from '../utils/rbac';

export default {
  name: 'LoginView',
  components: {
    LoginPage,
  },
  setup() {
    const router = useRouter();

    const onLoginSuccess = userData => {
      router.push(getDashboardPathForUser(userData) || '/dashboard');
    };

    return {
      onLoginSuccess,
    };
  },
};
</script>
