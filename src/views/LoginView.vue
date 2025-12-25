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
    
    const onLoginSuccess = () => {
      router.push('/dashboard')
    }

    return {
      onLoginSuccess
    }
  }
}
</script>
