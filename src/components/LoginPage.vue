<template>
  <div class="login-wrapper">
    <div class="login-ambient login-ambient-navy"></div>
    <div class="login-ambient login-ambient-gold"></div>
    <div class="login-grid-overlay"></div>

    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-line brand-line-top"></div>
        <div class="brand-badge">بوابة الموظفين</div>
        <div class="brand-logo-wrap">
          <div class="brand-logo-stage">
            <div class="brand-logo-ring"></div>
            <div class="brand-logo-ring brand-logo-ring-secondary"></div>
            <div class="brand-logo-beam"></div>
            <img :src="rakezLogo" alt="شعار راكز العقارية" class="brand-logo" width="200" height="200" fetchpriority="high" />
          </div>
        </div>
        <div class="brand-copy">
          <span class="brand-en">RAKEZ REAL ESTATE</span>
        </div>
        <div class="brand-footer">
          <span class="brand-footer-line"></span>
        </div>
        <div class="brand-line brand-line-bottom"></div>
      </section>

      <section class="login-container">
        <div class="login-header">
          <div class="logo-area">
            <span class="logo-kicker">RAKEZ REAL ESTATE</span>
            <span class="logo-ar">تسجيل الدخول</span>
            <span class="logo-tag">استخدم بياناتك للوصول إلى بوابة الموظفين.</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">البريد الإلكتروني</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="user@rakez.com"
              dir="auto"
              required
              :class="{ 'input-error': getFieldError('email') }"
            />
            <span v-if="getFieldError('email')" class="field-error">{{ getFieldError('email') }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">كلمة المرور</label>
            <div class="password-field">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                :class="['password-input', { 'input-error': getFieldError('password') }]"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <span v-if="getFieldError('password')" class="field-error">{{ getFieldError('password') }}</span>
          </div>

          <Button type="submit" class="login-btn" :disabled="isLoading" :loading="isLoading">
            تسجيل الدخول
          </Button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import { Eye, EyeOff } from 'lucide-vue-next';
import { ref } from 'vue';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { loginSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';
import rakezLogo from '@/assets/rakez-logo-brown-trans.webp';

export default {
  name: 'LoginPage',
  components: { Button, Input, Eye, EyeOff },
  emits: ['login-success'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const isLoading = ref(false);
    const error = ref('');

    const { validate, getFieldError, clearErrors } = useValidation(loginSchema);

    const handleLogin = async () => {
      clearErrors();
      error.value = '';

      if (!validate({ email: email.value, password: password.value })) {
        return;
      }

      isLoading.value = true;

      try {
        const user = await authService.login(email.value, password.value);
        emit('login-success', user);
      } catch (err) {
        logger.error('Login failed', err);
        error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      password,
      showPassword,
      isLoading,
      error,
      rakezLogo,
      handleLogin,
      getFieldError,
    };
  },
};
</script>

<style scoped src="./styles/LoginPage.scoped.s1.css"></style>
<style scoped src="./styles/LoginPage.scoped.s2.css"></style>

<style>
/* Dark Mode for Login */
html.dark .login-container {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98));
}
html.dark .logo-ar,
html.dark .form-label {
  color: #e2e8f0;
}
html.dark .logo-tag {
  color: #94a3b8;
}
html.dark .login-form .form-input {
  background: linear-gradient(180deg, #0f172a, #111c2d);
  border-color: #334155;
  color: #e2e8f0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
html.dark .login-grid-overlay {
  opacity: 0.03;
}
html.dark .password-toggle {
  color: rgba(226, 232, 240, 0.82);
  background: transparent;
}
html.dark .password-toggle:hover {
  color: #f8fafc;
  background: rgba(148, 163, 184, 0.12);
}
html.dark .login-form .form-input::placeholder {
  color: #64748b;
}
html.dark .login-form .form-input:focus {
  border-color: var(--color-gold);
  background: #0f172a;
}
</style>
