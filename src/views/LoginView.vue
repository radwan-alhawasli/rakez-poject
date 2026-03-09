<template>
  <div
    class="login-view-shell"
    :class="{ 'intro-running': showIntro, 'intro-complete': !showIntro, 'page-ready': pageReady, 'page-pending': !pageReady }"
  >
    <div class="login-view-content">
      <LoginPage @login-success="onLoginSuccess" />
    </div>

    <Transition name="intro-overlay">
      <LoginIntroSplash v-if="showIntro" @done="handleIntroDone" />
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import LoginPage from '@/components/LoginPage.vue';
import LoginIntroSplash from '@/components/LoginIntroSplash.vue';
import { useRouter } from 'vue-router';
import { getDashboardPathForUser } from '@/utils/rbac';
import authService from '@/services/authService';

const router = useRouter();
const SESSION_INTRO_KEY = 'rakez-login-intro-seen';
const pageReady = ref(false);

const shouldShowIntro = () => {
  if (typeof window === 'undefined') return false;
  if (authService.isAuthenticated()) return false;

  try {
    if (window.sessionStorage.getItem(SESSION_INTRO_KEY) === '1') {
      return false;
    }

    window.sessionStorage.setItem(SESSION_INTRO_KEY, '1');
    return true;
  } catch (_) {
    return true;
  }
};

const showIntro = ref(shouldShowIntro());

const revealLogin = () => {
  if (typeof window === 'undefined') {
    pageReady.value = true;
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      pageReady.value = true;
    });
  });
};

onMounted(() => {
  if (!showIntro.value) {
    revealLogin();
  }
});

const onLoginSuccess = userData => {
  router.push(getDashboardPathForUser(userData) || '/dashboard');
};

const handleIntroDone = () => {
  showIntro.value = false;
  pageReady.value = false;
  revealLogin();
};
</script>

<style scoped>
.login-view-shell {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
}

.login-view-content {
  transition:
    opacity 1.05s ease,
    transform 1.1s cubic-bezier(0.22, 1, 0.36, 1),
    filter 1.05s ease;
}

.intro-running .login-view-content {
  opacity: 0.18;
  transform: scale(1.015) translateY(10px);
  filter: blur(5px);
}

.intro-complete .login-view-content {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.page-pending.intro-complete .login-view-content {
  opacity: 0;
  transform: translateY(26px) scale(0.985);
  filter: blur(6px);
}

.login-view-shell :deep(.login-wrapper),
.login-view-shell :deep(.login-shell),
.login-view-shell :deep(.brand-panel),
.login-view-shell :deep(.login-container),
.login-view-shell :deep(.brand-logo-stage),
.login-view-shell :deep(.logo-area),
.login-view-shell :deep(.login-form) {
  transition:
    opacity 1.05s ease,
    transform 1.15s cubic-bezier(0.22, 1, 0.36, 1),
    filter 1.05s ease,
    box-shadow 1.05s ease;
}

.intro-running :deep(.login-wrapper) {
  transform: scale(1.018);
}

.intro-running :deep(.login-shell) {
  opacity: 0.22;
  transform: translateY(34px) scale(0.94);
  filter: blur(3px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
}

.intro-running :deep(.brand-panel) {
  opacity: 0.26;
  transform: translateY(26px) scale(0.985);
}

.intro-running :deep(.login-container) {
  opacity: 0.34;
  transform: translateY(42px) scale(0.99);
}

.intro-running :deep(.brand-logo-stage) {
  opacity: 0.22;
  transform: scale(0.86);
}

.intro-running :deep(.logo-area),
.intro-running :deep(.login-form) {
  opacity: 0.2;
  transform: translateY(20px);
}

.intro-complete :deep(.login-shell),
.intro-complete :deep(.brand-panel),
.intro-complete :deep(.login-container),
.intro-complete :deep(.brand-logo-stage),
.intro-complete :deep(.logo-area),
.intro-complete :deep(.login-form) {
  opacity: 1;
  transform: none;
  filter: none;
}

.page-pending.intro-complete :deep(.login-shell),
.page-pending.intro-complete :deep(.brand-panel),
.page-pending.intro-complete :deep(.login-container),
.page-pending.intro-complete :deep(.brand-logo-stage),
.page-pending.intro-complete :deep(.logo-area),
.page-pending.intro-complete :deep(.login-form) {
  opacity: 0;
  transform: translateY(22px) scale(0.985);
  filter: blur(4px);
}

.intro-overlay-enter-active,
.intro-overlay-leave-active {
  transition: opacity 0.8s ease;
}

.intro-overlay-enter-from,
.intro-overlay-leave-to {
  opacity: 0;
}

/* Touch-target safety net on mobile */
@media (max-width: 576px) {
  .login-view-content {
    transition-duration: 0.45s;
  }

  .intro-running .login-view-content {
    transform: scale(1.01) translateY(6px);
    filter: blur(2px);
  }

  .page-pending.intro-complete .login-view-content {
    transform: translateY(14px);
    filter: blur(2px);
  }

  :deep(input),
  :deep(button) {
    min-height: 44px;
  }
}
</style>
