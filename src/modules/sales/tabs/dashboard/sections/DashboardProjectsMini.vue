<template>
  <div class="dashboard-projects animate-fade-in-up">
    <div class="section-header">
      <h3>المشاريع النشطة</h3>
      <button type="button" class="btn-text-link" @click="$emit('view-all')">عرض الكل</button>
    </div>
    <div class="projects-mini-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="mini-project-card"
        @click="$emit('open-project', project.id)"
      >
        <div class="p-image">
          <img
            :src="project.image || '/img/placeholder-project.jpg'"
            :alt="project.name || 'Project'"
            width="320"
            height="200"
            loading="lazy"
          />
        </div>
        <div class="p-info">
          <h4>{{ project.name }}</h4>
          <div class="p-stats">
            <span class="success">المتاحة: {{ project.available_units || 0 }}</span>
            <span class="warning">المحجوزة: {{ project.reserved_units || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projects: { type: Array, default: () => [] },
});

defineEmits(['view-all', 'open-project']);
</script>

<style scoped>
.dashboard-projects {
  margin-top: 40px;
  background: var(--color-white);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(30, 58, 95, 0.05);
  border: 1px solid rgba(177, 162, 143, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
}

.section-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0;
}

.btn-text-link {
  background: none;
  border: none;
  color: var(--color-gold);
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-text-link:hover {
  color: var(--color-navy);
  text-decoration: underline;
}

.projects-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.mini-project-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--color-off-white);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(177, 162, 143, 0.05);
}

.mini-project-card:hover {
  background: var(--color-white);
  border-color: rgba(177, 162, 143, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(177, 162, 143, 0.15);
}

.mini-project-card .p-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mini-project-card .p-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-project-card .p-info {
  flex: 1;
}

.mini-project-card .p-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
}

.p-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  font-weight: 600;
}

.p-stats .success {
  color: #10b981;
}
.p-stats .warning {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .projects-mini-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-projects {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .mini-project-card {
    padding: 12px;
    gap: 12px;
  }
  .mini-project-card .p-image {
    width: 56px;
    height: 56px;
  }
  .mini-project-card .p-info h4 {
    font-size: 14px;
  }
}
</style>
