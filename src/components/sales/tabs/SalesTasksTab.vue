<template>
  <div class="tasks-tab">
    <div class="section-header">
      <h2>المهام التسويقية</h2>
      <button v-if="hasPermission('sales.tasks.create_for_marketing')" @click="showCreateTaskModal = true" class="btn-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة مهمة
      </button>
    </div>

    <LoadingSpinner v-if="isLoadingTasks" text="جاري تحميل المهام..." />

    <div v-else-if="marketingTasks.length === 0" class="empty-state">
      <p>لا توجد مهام تسويقية للعرض. يمكنك إضافة مهمة جديدة.</p>
    </div>

    <div v-else class="tasks-list">
      <div v-for="task in marketingTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3>{{ task.task_name }}</h3>
          <span class="task-status" :class="task.status">{{ getTaskStatusText(task.status) }}</span>
        </div>
        <div class="task-details">
          <p><strong>المشروع:</strong> {{ task.project_name }}</p>
          <p><strong>المسؤول:</strong> {{ task.marketer_name }}</p>
          <p><strong>المشاركون:</strong> {{ task.participating_marketers_count }} مسوق</p>
        </div>
        <div class="task-actions">
          <button @click="updateTask(task.id, 'in_progress')" class="btn-task" v-if="task.status === 'pending'">بدء المهمة</button>
          <button @click="updateTask(task.id, 'completed')" class="btn-task success" v-if="task.status === 'in_progress'">إكمال المهمة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesTasks } from '@/composables/sales/useSalesTasks';

const {
  marketingTasks, isLoadingTasks, showCreateTaskModal,
  hasPermission, getTaskStatusText,
  loadTasks, updateTask,
} = useSalesTasks();

loadTasks();
</script>

<style scoped>
/* تنسيقات المهام التسويقية — من الأب SalesViewExtended */
.tasks-tab {
  width: 100%;
  direction: rtl;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.tasks-list {
  display: grid;
  gap: 16px;
}

.task-card {
  padding: 20px;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-card:hover {
  border-color: var(--color-gold);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-navy);
}

.task-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
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

.task-details {
  margin-bottom: 16px;
}

.task-details p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

.task-actions {
  display: flex;
  gap: 12px;
}

.btn-task {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(177, 162, 143, 0.3);
}

.btn-task.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
