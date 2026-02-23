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
          <span class="logo-tag">"majd  bayer"</span>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-input"
            placeholder="user@rakez.com"
            required
            dir="auto"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">كلمة المرور</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="form-options">
          <div class="forgot-wrapper">
            <a href="#" class="forgot-link">هل نسيت كلمة المرور؟</a>
          </div>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loader"></span>
          <span v-else>تسجيل الدخول</span>
        </button>

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
import authService from '../services/authService';
import logger from '../utils/logger';

export default {
  name: 'LoginPage',
  emits: ['login-success'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      if (!email.value || !password.value) return;

      isLoading.value = true;
      error.value = '';

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
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');

.login-wrapper {
  min-height: 100vh;
  background-color: #0f172a; /* Dark Navy Base */
  background: radial-gradient(circle at top left, #1e293b, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Tajawal', sans-serif;
  position: relative;
  overflow: hidden;
  direction: rtl;
}

/* Geometric Shapes for Background */
.geo-shape {
  position: absolute;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  opacity: 0.4;
  z-index: 1;
  box-shadow: 20px 20px 60px rgba(0, 0, 0, 0.3);
}

.shape-1 {
  width: 600px;
  height: 600px;
  transform: rotate(45deg);
  top: -200px;
  right: -200px;
  border-radius: 40px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  transform: rotate(30deg);
  bottom: -100px;
  left: -100px;
  background: linear-gradient(135deg, #263c52 0%, #101927 100%);
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: 10%;
  border-radius: 20px;
  transform: rotate(-15deg);
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  opacity: 0.1;
}

.login-container {
  background: white;
  width: 420px;
  border-radius: 16px;
  padding: 40px;
  z-index: 10;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-ar {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  letter-spacing: -0.5px;
}

.logo-tag {
  font-size: 14px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}

.form-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  background: #fdfbf7;
  transition: all 0.3s ease;
  font-family: 'Tajawal', sans-serif;
  color: #334155;
}

.form-input:focus {
  outline: none;
  border-color: #b1a28f;
  background: white;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
}

.form-input::placeholder {
  color: #cbd5e1;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.forgot-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #b1a28f;
}

.login-btn {
  margin-top: 10px;
  background: #b1a28f; /* Gold */
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Tajawal', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn:hover {
  background: #8c7851;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #ef4444;
  background: #fef2f2;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #fecaca;
}

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
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.r-en {
  font-size: 14px;
  letter-spacing: 4px;
  color: #b1a28f;
  margin-top: 5px;
}

.r-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 5px;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Media Queries */
@media (max-width: 600px) {
  .login-container {
    width: 90%;
    padding: 30px 20px;
  }

  .branding {
    display: none;
  }
}
</style>
