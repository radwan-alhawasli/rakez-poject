<template>
  <div class="schedule-project-card" @click="$emit('click')">
    <h3 class="project-card-title">
      {{ project.project_name || project.name || project.contract_name }}
    </h3>
    <p class="project-card-activity">{{ project.activity_type || 'أنشطة المشروع' }}</p>
    <p class="project-card-team">فريق المبيعات</p>
  </div>
</template>

<script setup>
defineProps({
  project: { type: Object, required: true },
});
defineEmits(['click']);
</script>

<style scoped>
.schedule-project-card {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  padding: 24px 22px;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  box-shadow: 0 4px 24px rgba(39, 55, 77, 0.08);
}
.schedule-project-card:hover {
  border-color: rgba(181, 169, 154, 0.65);
  box-shadow: 0 12px 36px rgba(39, 55, 77, 0.14), 0 0 0 1px rgba(181, 169, 154, 0.2);
  transform: translateY(-3px);
}
.project-card-title {
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--color-navy, #27374d);
  margin: 0 0 8px 0;
}
.project-card-activity {
  font-size: 13px;
  color: #52606d;
  margin: 0 0 4px 0;
}
.project-card-team {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(39, 55, 77, 0.55);
  margin: 0;
}
</style>
