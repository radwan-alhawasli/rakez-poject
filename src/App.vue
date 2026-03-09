<template>
  <div id="app">
    <div class="logo-container">
      <div class="rakez-logo"></div>
    </div>
    <router-view />
    <ToastContainer />
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
</style>
