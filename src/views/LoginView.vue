<template>
  <LoginPage @login-success="onLoginSuccess" />
</template>

<script>
import LoginPage from '../components/LoginPage.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  components: {
    LoginPage
  },
  setup() {
    const router = useRouter()
    
    const onLoginSuccess = (userData) => {
      // Redirection based on user role after successful login
      if (userData && (userData.type == 8 || userData.type == 9 || String(userData.type).toLowerCase() === 'hr')) {
        router.push('/hr/dashboard')
      } else {
        router.push('/dashboard')
      }
    }

    return {
      onLoginSuccess
    }
  }
}
</script>
