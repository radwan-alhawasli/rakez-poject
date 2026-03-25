<template>
  <div class="welcome-header">
    <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
    <p class="welcome-subtitle">نظرة عامة على أدائك ونتائج المبيعات.</p>
  </div>
</template>

<script setup>
defineProps({
  userName: { type: String, default: 'مستخدم' },
});
</script>
