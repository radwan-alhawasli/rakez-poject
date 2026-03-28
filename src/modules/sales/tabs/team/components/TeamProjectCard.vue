<template>
  <div class="team-project-card">
    <h4>{{ project.project_name }}</h4>
    <div class="project-stats">
      <div class="stat"><span class="label">الوحدات المتاحة:</span><span class="value">{{ project.available_units }}</span></div>
      <div class="stat"><span class="label">المبيعات:</span><span class="value">{{ project.total_sales }}</span></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ project: Object });
</script>

<style scoped>
.team-project-card { padding: 22px 20px; background: white; border: 1px solid rgba(39,55,77,0.14); border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.team-project-card h4 { margin: 0 0 14px 0; font-size: 1rem; color: #27374d; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.project-stats { display: grid; gap: 10px; }
.stat { display: flex; justify-content: space-between; font-size: 0.875rem; }
.label { color: #64748b; }
.value { color: #27374d; font-weight: 700; }
</style>
