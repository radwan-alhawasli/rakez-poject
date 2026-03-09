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
            <img :src="rakezLogo" alt="شعار راكز العقارية" class="brand-logo" />
          </div>
        </div>
        <div class="brand-copy">
          <span class="brand-en">RAKEZ REAL ESTATE</span>
          <h1 class="brand-ar">مرحباً بكم إلى موقع راكز</h1>
          <p class="brand-desc">نتمنى لكم تجربة مميزة.</p>
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

          <div class="form-options">
            <div class="forgot-wrapper">
              <a href="#" class="forgot-link">هل نسيت المرور؟</a>
            </div>
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

<style scoped>
.login-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(circle at top right, rgba(39, 55, 77, 0.42), transparent 28%),
    radial-gradient(circle at bottom left, rgba(181, 169, 154, 0.12), transparent 26%),
    linear-gradient(145deg, #060b15 0%, #10192b 46%, #0a1322 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  direction: rtl;
  padding:
    max(24px, env(safe-area-inset-top, 0))
    max(20px, env(safe-area-inset-right, 0))
    max(24px, env(safe-area-inset-bottom, 0))
    max(20px, env(safe-area-inset-left, 0));
}

.login-ambient,
.login-grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-ambient {
  filter: blur(42px);
  opacity: 0.8;
}

.login-ambient-navy {
  inset: auto auto 58% 62%;
  width: min(42vw, 700px);
  height: min(42vw, 700px);
  background: radial-gradient(circle, rgba(39, 55, 77, 0.9) 0%, rgba(39, 55, 77, 0) 70%);
}

.login-ambient-gold {
  inset: 58% 62% auto auto;
  width: min(28vw, 420px);
  height: min(28vw, 420px);
  background: radial-gradient(circle, rgba(181, 169, 154, 0.55) 0%, rgba(181, 169, 154, 0) 68%);
}

.login-grid-overlay {
  opacity: 0.08;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 140px 140px;
}

.login-shell {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(360px, 0.9fr);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(181, 169, 154, 0.14);
  border-radius: 36px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.brand-panel {
  position: relative;
  padding: clamp(34px, 4vw, 56px);
  background:
    radial-gradient(circle at top, rgba(181, 169, 154, 0.12), rgba(181, 169, 154, 0) 40%),
    linear-gradient(155deg, rgba(12, 23, 40, 0.96) 0%, rgba(18, 30, 48, 0.92) 100%);
  color: #f8f6f1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 720px;
}

.brand-panel::after {
  content: '';
  position: absolute;
  inset: 20px;
  border: 1px solid rgba(181, 169, 154, 0.08);
  border-radius: 28px;
  pointer-events: none;
}

.brand-line {
  position: absolute;
  right: 28px;
  left: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(181, 169, 154, 0.56) 50%, transparent 100%);
  pointer-events: none;
}

.brand-line-top {
  top: 18px;
}

.brand-line-bottom {
  bottom: 18px;
}

.brand-badge {
  align-self: flex-start;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(181, 169, 154, 0.12);
  border: 1px solid rgba(181, 169, 154, 0.18);
  color: rgba(248, 246, 241, 0.88);
  font-size: 13px;
  font-weight: 700;
}

.brand-logo-wrap {
  display: flex;
  justify-content: center;
  margin: clamp(12px, 3vw, 26px) 0;
}

.brand-logo-stage {
  position: relative;
  width: min(280px, 74%);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
}

.brand-logo-ring,
.brand-logo-beam {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.brand-logo-ring {
  border: 1px solid rgba(181, 169, 154, 0.28);
  box-shadow:
    0 0 0 18px rgba(181, 169, 154, 0.04),
    0 0 80px rgba(181, 169, 154, 0.14),
    inset 0 0 40px rgba(39, 55, 77, 0.18);
}

.brand-logo-ring-secondary {
  inset: 12%;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.brand-logo-beam {
  inset: 18%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(181, 169, 154, 0.08) 36%, rgba(255, 255, 255, 0) 72%);
  filter: blur(12px);
}

.brand-logo {
  position: relative;
  z-index: 1;
  width: min(64%, 188px);
  height: auto;
  object-fit: contain;
  filter:
    drop-shadow(0 16px 34px rgba(0, 0, 0, 0.35))
    drop-shadow(0 0 18px rgba(181, 169, 154, 0.12));
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: right;
}

.brand-en {
  color: var(--color-gold-light);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(18px, 1vw + 10px, 24px);
  font-weight: 600;
  letter-spacing: 0.22em;
}

.brand-ar {
  margin: 0;
  color: #f8f6f1;
  font-family: 'Cairo', 'Tajawal', sans-serif;
  font-size: clamp(32px, 2.6vw, 48px);
  font-weight: 800;
  line-height: 1.3;
}

.brand-desc {
  margin: 0;
  max-width: 460px;
  color: rgba(248, 250, 252, 0.74);
  font-size: clamp(15px, 0.6vw + 10px, 18px);
  line-height: 1.85;
}

.brand-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand-footer-line {
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, rgba(181, 169, 154, 0.9), transparent);
}

.login-container {
  background: linear-gradient(180deg, rgba(253, 251, 247, 0.98), rgba(255, 255, 255, 0.96));
  padding: clamp(30px, 4vw, 58px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: right;
  margin-bottom: clamp(24px, 2.5vw, 36px);
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.logo-kicker {
  color: var(--color-gold-dark);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(14px, 0.6vw + 10px, 18px);
  font-weight: 600;
  letter-spacing: 0.18em;
}

.logo-ar {
  font-size: clamp(28px, 2vw + 10px, 44px);
  font-weight: 800;
  color: var(--color-navy);
  font-family: 'Cairo', 'Tajawal', sans-serif;
  line-height: 1.25;
}

.logo-tag {
  font-size: clamp(13px, 0.45vw + 10px, 17px);
  color: var(--color-dark-gray);
  font-family: 'Tajawal', 'Cairo', sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: right;
}

.form-label {
  font-size: 15px;
  color: var(--color-navy);
  font-weight: 700;
  font-family: 'Tajawal', 'Cairo', sans-serif;
}
.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: 14px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: rgba(39, 55, 77, 0.68);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.password-toggle:hover {
  color: var(--color-navy);
  background: rgba(39, 55, 77, 0.06);
}

.password-toggle:focus-visible {
  outline: none;
  color: var(--color-navy);
  background: rgba(181, 169, 154, 0.18);
  box-shadow: 0 0 0 3px rgba(181, 169, 154, 0.18);
}

.password-toggle:active {
  transform: translateY(-50%) scale(0.96);
}

::deep(.login-form .password-input) {
  padding-inline-end: 56px;
}

:deep(.login-form .form-input) {
  width: 100%;
  min-height: 62px;
  padding: 16px 20px;
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 20px;
  background: linear-gradient(180deg, #f8fafc, #f2f5fb);
  color: var(--color-charcoal);
  font-size: 17px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    transform 0.25s ease;
}

:deep(.login-form .form-input:focus) {
  outline: none;
  border-color: rgba(181, 169, 154, 0.8);
  background: white;
  box-shadow:
    0 0 0 4px rgba(181, 169, 154, 0.12),
    0 12px 28px rgba(39, 55, 77, 0.08);
  transform: translateY(-1px);
}

:deep(.login-form .form-input::placeholder) {
  color: var(--color-medium-gray);
}

.form-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 14px;
}

.forgot-link {
  color: var(--color-dark-gray);
  text-decoration: none;
  transition: color 0.2s, transform 0.2s ease;
  display: inline-block;
}

.forgot-link:hover {
  color: var(--color-gold);
  transform: translateX(-2px);
}

.login-btn {
  margin-top: 10px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  min-height: 62px;
  padding: 16px 22px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Tajawal', 'Cairo', sans-serif;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-shadow: 0 18px 36px rgba(181, 169, 154, 0.24);
}

.login-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.02);
  box-shadow: 0 20px 42px rgba(181, 169, 154, 0.3);
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

.field-error {
  color: var(--color-error, #ef4444);
  font-size: 13px;
  margin-top: 2px;
}

.input-error {
  border-color: var(--color-error, #ef4444) !important;
}

.error-message {
  color: var(--color-error);
  background: #fef2f2;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fecaca;
}

@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: unset;
    gap: 26px;
    padding-bottom: 28px;
  }

  .brand-logo-wrap {
    justify-content: flex-start;
  }

  .brand-logo-stage {
    width: min(210px, 52%);
  }
}

@media (max-width: 768px) {
  .login-ambient {
    filter: blur(24px);
    opacity: 0.46;
  }

  .login-grid-overlay {
    opacity: 0.04;
    background-size: 180px 180px;
  }

  .login-shell {
    backdrop-filter: none;
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
  }

  .brand-panel::after {
    display: none;
  }

  .brand-logo-ring {
    box-shadow:
      0 0 0 12px rgba(181, 169, 154, 0.03),
      0 0 42px rgba(181, 169, 154, 0.08),
      inset 0 0 22px rgba(39, 55, 77, 0.16);
  }
}

@media (max-width: 576px) {
  .login-wrapper {
    padding: max(14px, env(safe-area-inset-top, 0)) max(12px, env(safe-area-inset-right, 0))
      max(14px, env(safe-area-inset-bottom, 0)) max(12px, env(safe-area-inset-left, 0));
  }

  .login-shell {
    border-radius: 24px;
  }

  .brand-panel {
    padding: 24px 20px;
  }

  .brand-panel::after {
    inset: 12px;
    border-radius: 18px;
  }

  .brand-badge {
    font-size: 12px;
  }

  .brand-en {
    font-size: 16px;
    letter-spacing: 0.16em;
  }

  .brand-ar {
    font-size: 31px;
  }

  .brand-desc {
    font-size: 14px;
  }

  .logo-kicker {
    font-size: 13px;
    letter-spacing: 0.14em;
  }

  .login-container {
    padding: 24px 20px 26px;
  }

  .logo-ar {
    font-size: 28px;
  }

  .logo-tag {
    font-size: 14px;
  }

  :deep(.login-form .form-input) {
    min-height: 56px;
    font-size: 16px;
    border-radius: 16px;
  }

  .login-btn {
    min-height: 56px;
    border-radius: 16px;
    font-size: 20px;
  }
}
</style>

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
html.dark .brand-desc,
html.dark .brand-footer-text {
  color: rgba(226, 232, 240, 0.72);
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
