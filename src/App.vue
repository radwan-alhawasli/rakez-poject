<template>
  <div id="app">
    <div class="logo-container">
      <div class="rakez-logo">
        <div class="logo-text-main">راكز</div>
        <div class="logo-subtitle">RAKEZ</div>
        <div class="logo-tagline">محل الثقة</div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  font-family: 'Times New Roman', serif;
  direction: rtl;
  margin: 0;
  padding: 0;
  color: #1e293b;
  line-height: 1.5;
  overflow-x: hidden;
  background-color: #fdfbf7;
  
  /* Custom Background Application - Enhanced */
  background-image: url('./assets/rakez_custom_bg.png');
  background-size: contain;
  background-position: center center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

#app {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Overlay for better content visibility */
#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(253, 251, 247, 0.75);
  z-index: -1;
  pointer-events: none;
}



/* Custom Scrollbar - Gold & Navy */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #a18b5c, #8c7851);
  border-radius: 5px;
  border: 2px solid #f1f5f9;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1e3a5f, #162c46);
}
</style>