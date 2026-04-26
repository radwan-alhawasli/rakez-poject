<template>
  <div class="app-shell">
    <div class="logo-container">
      <div class="rakez-logo"></div>
    </div>
    <router-view />
    <!-- نقل الرسائل إلى body لظهورها فوق أي modal (مثل لوحة إضافة الموظف) -->
    <Teleport to="body">
      <div class="toast-teleport">
        <ToastContainer />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import ToastContainer from './components/ToastContainer.vue';
</script>

<style>
/* Global theme/tailwind loaded via main.js (app.css) */
body {
  direction: rtl;
  margin: 0;
  padding: 0;
  color: var(--color-charcoal);
  line-height: 1.65;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top right, rgba(39, 55, 77, 0.08), transparent 24%),
    linear-gradient(180deg, #fdfbf7 0%, #f8fafc 100%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app-shell {
  min-height: 100vh;
  position: relative;
}

/* Luxury Overlay for better content visibility */
#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(253, 251, 247, 0.82);
  backdrop-filter: blur(1px);
  z-index: -1;
  pointer-events: none;
}

/* حاوية Toast تُعرض في body بترتيب فوق الـ modals (z-index الـ modal 1000–1001) */
.toast-teleport {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10002;
}
.toast-teleport > * {
  pointer-events: none;
}
</style>
