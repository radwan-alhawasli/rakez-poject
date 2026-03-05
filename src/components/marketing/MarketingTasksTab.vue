<template>
  <div>
    <div class="section-header-compact">
      <h2 class="section-title">المهام اليومية</h2>
      <p class="section-subtitle">متابعة وإدارة المهام التسويقية اليومية</p>
    </div>

    <div v-if="isLoadingTasks" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المهام...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
      <p>لا توجد مهام حالياً</p>
    </div>

    <div v-else class="tasks-list">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-header">
          <label class="task-checkbox" @click.prevent="toggleTaskStatus(task)">
            <input type="checkbox" :checked="normalizeTaskStatus(task.status) === 'completed'" />
            <span class="checkmark"></span>
          </label>
          <div class="task-info">
            <h4 class="task-title" :class="{ completed: normalizeTaskStatus(task.status) === 'completed' }">
              {{ task.title || task.name || 'مهمة #' + task.id }}
            </h4>
            <p class="task-description">{{ task.description || '—' }}</p>
          </div>
          <span class="task-status-badge" :class="getTaskStatusClass(task.status)">
            {{ getTaskStatusText(task.status) }}
          </span>
        </div>
        <div class="task-meta">
          <span>{{ task.project_name || '—' }}</span>
          <span>{{ formatDate(task.due_date || task.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMarketingTasks } from '@/composables/marketing/useMarketingTasks';

const {
  marketingTasks: tasks,
  isLoadingTasks,
  toggleTaskStatus,
  normalizeTaskStatus,
  getTaskStatusClass,
  getTaskStatusText,
  formatDate,
} = useMarketingTasks();
</script>

<style scoped>
@media (max-width: 768px) {
  .section-header-compact { padding: 16px; }
  .section-title { font-size: 18px; }
  .section-subtitle { font-size: 13px; }
  .task-card { padding: 14px; }
}
@media (max-width: 576px) {
  .section-header-compact { padding: 12px; }
  .task-card { padding: 12px; }
  .task-title { font-size: 14px; }
}
</style>
