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
import { useDarkMode } from './composables/useDarkMode';

useDarkMode();
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
  background-color: var(--color-off-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Custom Background Application - Luxury Enhanced */
  background-image: url('./assets/rakez_custom_bg.png');
  background-size: contain;
  background-position: center center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

@media (max-width: 768px) {
  body {
    background-size: cover;
  }
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
