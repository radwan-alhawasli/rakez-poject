<template>
  <div class="login-wrapper">
    <!-- Geometric Background Shapes -->
    <div class="geo-shape shape-1"></div>
    <div class="geo-shape shape-2"></div>
    <div class="geo-shape shape-3"></div>

    <div class="login-container">
      <div class="login-header">
        <div class="logo-area">
          <span class="logo-ar">راكز العقارية</span>
          <span class="logo-tag">"majd bayer"</span>
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
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :class="{ 'input-error': getFieldError('password') }"
          />
          <span v-if="getFieldError('password')" class="field-error">{{ getFieldError('password') }}</span>
        </div>

        <div class="form-options">
          <div class="forgot-wrapper">
            <a href="#" class="forgot-link">هل نسيت  المرور؟</a>
          </div>
        </div>

        <Button type="submit" class="login-btn" :disabled="isLoading" :loading="isLoading">
          تسجيل الدخول
        </Button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>

    <div class="branding">
      <div class="rakez-logo-large">
        <div class="r-text">راكز</div>
        <div class="r-en">RAKEZ</div>
        <div class="r-sub">محل الثقة</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { loginSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';

export default {
  name: 'LoginPage',
  components: { Button, Input },
  emits: ['login-success'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
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
      isLoading,
      error,
      handleLogin,
      getFieldError,
    };
  },
};
</script>

<style scoped>
/* ─── Wrapper ─── */
.login-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #0f172a;
  background: radial-gradient(circle at top left, var(--color-charcoal), #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  direction: rtl;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
}

/* ─── Geometric Background ─── */
.geo-shape {
  position: absolute;
  background: linear-gradient(135deg, var(--color-navy) 0%, #0f172a 100%);
  opacity: 0.4;
  z-index: 1;
  box-shadow: 20px 20px 60px rgba(0, 0, 0, 0.3);
}
.shape-1 {
  width: clamp(300px, 40vw, 600px);
  height: clamp(300px, 40vw, 600px);
  transform: rotate(45deg);
  top: -200px;
  right: -200px;
  border-radius: 40px;
}
.shape-2 {
  width: clamp(200px, 30vw, 400px);
  height: clamp(200px, 30vw, 400px);
  transform: rotate(30deg);
  bottom: -100px;
  left: -100px;
  background: linear-gradient(135deg, #263c52 0%, #101927 100%);
}
.shape-3 {
  width: clamp(100px, 15vw, 200px);
  height: clamp(100px, 15vw, 200px);
  top: 20%;
  left: 10%;
  border-radius: 20px;
  transform: rotate(-15deg);
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  opacity: 0.1;
}

/* ─── Card (fluid sizing: 320px → 4K) ─── */
.login-container {
  background: white;
  width: calc(100% - 32px);
  max-width: clamp(340px, 20vw + 150px, 720px);
  border-radius: clamp(12px, 1vw + 6px, 28px);
  padding: clamp(24px, 3vw + 4px, 60px);
  z-index: 10;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  box-sizing: border-box;
}

/* ─── Header ─── */
.login-header {
  text-align: center;
  margin-bottom: clamp(24px, 3vw, 44px);
}
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.logo-ar {
  font-size: clamp(22px, 1.8vw + 8px, 36px);
  font-weight: 700;
  color: var(--color-navy);
  letter-spacing: -0.5px;
}
.logo-tag {
  font-size: clamp(12px, 0.4vw + 8px, 16px);
  color: var(--color-dark-gray);
  letter-spacing: 0.5px;
}

/* ─── Form ─── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 1.5vw + 4px, 24px);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}
.form-label {
  font-size: clamp(12px, 0.3vw + 9px, 15px);
  color: var(--color-dark-gray);
  font-weight: 500;
}
.form-input {
  padding: clamp(12px, 1vw + 4px, 22px) clamp(14px, 1vw + 6px, 24px);
  border: 1px solid var(--color-medium-gray);
  border-radius: clamp(8px, 0.5vw + 2px, 16px);
  font-size: clamp(16px, 0.4vw + 12px, 22px);
  background: var(--color-off-white);
  transition: all 0.3s ease;
  color: var(--color-charcoal);
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  background: white;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
}
.form-input::placeholder {
  color: var(--color-medium-gray);
}

/* ─── Options row ─── */
.form-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: clamp(12px, 0.3vw + 9px, 15px);
}
.forgot-link {
  color: var(--color-dark-gray);
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: var(--color-gold);
}

/* ─── Button ─── */
.login-btn {
  margin-top: 8px;
  background: var(--color-gold);
  color: white;
  border: none;
  padding: clamp(12px, 1vw + 4px, 22px);
  border-radius: clamp(8px, 0.5vw + 2px, 16px);
  font-size: clamp(15px, 0.4vw + 11px, 22px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.login-btn:hover {
  background: var(--color-gold-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.3);
}
.login-btn:active {
  transform: translateY(0);
}
.login-btn:disabled {
  background: var(--color-medium-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ─── Field Error ─── */
.field-error {
  color: var(--color-error, #ef4444);
  font-size: clamp(11px, 0.3vw + 8px, 13px);
  margin-top: 2px;
}
.input-error {
  border-color: var(--color-error, #ef4444) !important;
}

/* ─── Error ─── */
.error-message {
  color: var(--color-error);
  background: #fef2f2;
  padding: 10px;
  border-radius: 6px;
  font-size: clamp(12px, 0.3vw + 9px, 15px);
  text-align: center;
  border: 1px solid #fecaca;
}

/* ─── Branding (top-left logo) ─── */
.branding {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 5;
  opacity: 0.8;
}
.rakez-logo-large {
  text-align: center;
  color: white;
}
.r-text {
  font-size: clamp(28px, 3vw, 48px);
  font-weight: 700;
  line-height: 1;
}
.r-en {
  font-size: clamp(12px, 0.5vw + 6px, 18px);
  letter-spacing: 4px;
  color: var(--color-gold);
  margin-top: 5px;
}
.r-sub {
  font-size: clamp(10px, 0.4vw + 5px, 14px);
  color: var(--color-dark-gray);
  margin-top: 5px;
}

/* ─── Loader ─── */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-white);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ─── Mobile: hide branding, tighten card ─── */
@media (max-width: 576px) {
  .branding {
    display: none;
  }
}

/* ─── Extra small: hide geo shapes ─── */
@media (max-width: 320px) {
  .geo-shape {
    display: none;
  }
}
</style>

<style>
/* Dark Mode for Login */
html.dark .login-wrapper { background: #0f172a; }
html.dark .login-container { background: #1e293b; border-color: #334155; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
html.dark .login-container input { background: #0f172a; border-color: #334155; color: #e2e8f0; }
html.dark .login-container input::placeholder { color: #64748b; }
html.dark .login-container input:focus { border-color: var(--color-gold); }
html.dark .login-header { border-color: #334155; }
html.dark .geo-shape { opacity: 0.03; }
</style>
