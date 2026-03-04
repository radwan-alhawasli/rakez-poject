<template>
  <div class="tasks-tab">
    <div class="section-header">
      <h2>خطط الدفع</h2>
    </div>
    <div class="empty-state">
      <p>إدارة خطط الدفع تتم من تبويب الحجوزات عبر زر خيارات المشاريع على الخارطة.</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.tasks-tab { padding: 20px 0; }
.section-header { margin-bottom: 24px; }
.section-header h2 { font-size: 24px; font-weight: 700; color: #1e3a5f; margin: 0; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
.empty-state p { font-size: 16px; color: #64748b; margin: 0; }
</style>
