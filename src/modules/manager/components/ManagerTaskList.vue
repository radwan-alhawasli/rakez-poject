<template>
  <div>
    <div v-if="filteredTasks.length === 0" class="empty-state">
      <p>{{ showDoneOnly ? 'لا توجد مهام مكتملة ضمن نتيجة البحث.' : 'لا توجد مهام.' }}</p>
    </div>
    <div v-else class="tasks-by-month">
      <div v-for="[monthKey, monthTasks] in groupedFilteredTasks" :key="monthKey" class="month-group-tasks">
        <h3 class="month-title-tasks">{{ taskMonthLabel(monthKey) }}</h3>
        <div class="tasks-list">
          <button
            v-for="t in monthTasks"
            :key="t.id"
            type="button"
            class="task-card task-card--clickable"
            @click="$emit('open-task-detail', t)"
          >
            <div class="task-header">
              <h4>{{ t.title || t.name || '—' }}</h4>
              <span :class="['task-status', taskStatusClass(t.status)]">{{ formatTaskStatus(t.status) }}</span>
            </div>
            <p v-if="t.description" class="task-desc">{{ t.description }}</p>
            <div class="task-meta">
              <span v-if="t.assigned_to">المُعيّن: {{ t.assigned_to }}</span>
              <span v-if="t.due_at">الموعد: {{ formatDate(t.due_at) }}</span>
            </div>
            <span class="task-open-hint">عرض التفاصيل ←</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filteredTasks: {
    type: Array,
    required: true
  },
  showDoneOnly: {
    type: Boolean,
    required: true
  },
  groupedFilteredTasks: {
    type: Array,
    required: true
  },
  taskMonthLabel: {
    type: Function,
    required: true
  },
  taskStatusClass: {
    type: Function,
    required: true
  },
  formatTaskStatus: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
});

defineEmits(['open-task-detail']);
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-dark-gray);
}

.month-group-tasks {
  margin-bottom: 24px;
}

.month-title-tasks {
  margin: 0 0 12px 0;
  font-size: 1.05rem;
  color: #475569;
  font-weight: 700;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  padding: 20px;
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.task-card--clickable {
  width: 100%;
  text-align: right;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  font: inherit;
}

.task-card--clickable:hover {
  border-color: var(--color-gold);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.task-open-hint {
  display: block;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--color-gold);
  font-weight: 600;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.task-status {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.task-status.pending {
  background: #fef3c7;
  color: #92400e;
}
.task-status.in_progress {
  background: #dbeafe;
  color: #1e40af;
}
.task-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-desc {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: var(--color-dark-gray);
  flex-wrap: wrap;
}
</style>
