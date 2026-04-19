<template>
  <div class="manager-tasks-view">
    <div class="page-header">
      <h1 class="page-title">المهام</h1>
      <p class="page-subtitle">عرض وإدارة المهام — إحصائيات الإنجاز والقائمة الشهرية.</p>
    </div>

    <div class="filters-bar">
      <select v-model="filters.status" class="filter-select">
        <option value="">كل الحالات</option>
        <option value="pending">قيد الانتظار</option>
        <option value="in_progress">قيد التنفيذ</option>
        <option value="completed">مكتمل</option>
      </select>
      <input v-model="filters.assigned_to" type="text" class="filter-input" placeholder="المُعيّن له" />
      <input v-model="filters.section" type="text" class="filter-input" placeholder="القسم" />
      <button type="button" class="btn-primary" @click="fetchTasks">بحث</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <ManagerTaskStats
        :tasks-count="tasks.length"
        :done-tasks-count="doneTasksCount"
        :completion-percent-display="completionPercentDisplay"
        :status-breakdown="statusBreakdown"
      />
      <div v-if="tasks.length === 0" class="empty-state">
        <p>لا توجد مهام.</p>
      </div>
      <template v-else>
        <div class="tasks-toolbar">
          <button
            type="button"
            class="btn-toggle-done"
            :class="{ active: showDoneOnly }"
            @click="showDoneOnly = !showDoneOnly"
          >
            {{ showDoneOnly ? 'عرض كل المهام' : 'عرض المهام المكتملة فقط' }}
          </button>
        </div>
        <ManagerTaskList
          :filtered-tasks="filteredTasks"
          :show-done-only="showDoneOnly"
          :grouped-filtered-tasks="groupedFilteredTasks"
          :task-month-label="taskMonthLabel"
          :task-status-class="taskStatusClass"
          :format-task-status="formatTaskStatus"
          :format-date="formatDate"
          @open-task-detail="openTaskDetail"
        />
      </template>
    </template>

    <div v-if="taskDetailOpen" class="modal-overlay" role="dialog" aria-modal="true" @click.self="closeTaskDetail">
      <div class="modal-content task-detail-modal">
        <div class="task-detail-modal__head">
          <h3>{{ taskDetail?.title || taskDetail?.name || 'تفاصيل المهمة' }}</h3>
          <button type="button" class="btn-close-modal" aria-label="إغلاق" @click="closeTaskDetail">×</button>
        </div>
        <div v-if="taskDetailLoading" class="loading-inline">جاري تحميل التفاصيل...</div>
        <div v-else class="task-detail-body">
          <p v-if="taskDetail?.description" class="task-detail-desc">{{ taskDetail.description }}</p>
          <dl class="task-detail-dl">
            <div v-if="taskDetail?.status != null" class="task-detail-row">
              <dt>الحالة</dt>
              <dd>
                <span :class="['task-status', taskStatusClass(taskDetail.status)]">{{
                  formatTaskStatus(taskDetail.status)
                }}</span>
              </dd>
            </div>
            <div v-if="taskDetail?.assigned_to" class="task-detail-row">
              <dt>المُعيّن له</dt>
              <dd>{{ taskDetail.assigned_to }}</dd>
            </div>
            <div v-if="taskDetail?.section" class="task-detail-row">
              <dt>القسم</dt>
              <dd>{{ taskDetail.section }}</dd>
            </div>
            <div v-if="taskDetail?.due_at" class="task-detail-row">
              <dt>الموعد</dt>
              <dd>{{ formatDate(taskDetail.due_at) }}</dd>
            </div>
            <div v-if="taskDetail?.created_at" class="task-detail-row">
              <dt>تاريخ الإنشاء</dt>
              <dd>{{ formatDate(taskDetail.created_at) }}</dd>
            </div>
            <div v-if="taskDetail?.updated_at" class="task-detail-row">
              <dt>آخر تحديث</dt>
              <dd>{{ formatDate(taskDetail.updated_at) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useManagerTasks } from '@/composables/manager/useManagerTasks';
import ManagerTaskStats from '@/modules/manager/components/ManagerTaskStats.vue';
import ManagerTaskList from '@/modules/manager/components/ManagerTaskList.vue';
import { localeOpts } from '@/utils/intlLatn';

const {
  tasks,
  isLoading,
  showDoneOnly,
  taskDetailOpen,
  taskDetailLoading,
  taskDetail,
  filters,
  doneTasksCount,
  completionPercentDisplay,
  statusBreakdown,
  filteredTasks,
  groupedFilteredTasks,
  fetchTasks,
  openTaskDetail,
  closeTaskDetail,
} = useManagerTasks();

function formatDate(d) {
  if (!d) return '—';
  const d2 = new Date(d);
  return Number.isNaN(d2.getTime()) ? String(d) : d2.toLocaleDateString('ar-SA', localeOpts());
}

function taskStatusClass(status) {
  const s = String(status || 'unknown').toLowerCase().replace(/[\s-]+/g, '_');
  if (s === 'done' || s === 'closed' || s === 'complete' || s === 'finished') return 'completed';
  return s;
}

function formatTaskStatus(status) {
  const s = String(status || '').toLowerCase().replace(/[\s-]+/g, '_');
  const map = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    done: 'مكتمل',
    closed: 'مكتمل',
    could_not_complete: 'لم يكتمل',
  };
  return map[s] || status || '—';
}

function taskMonthLabel(key) {
  if (key === 'unknown') return 'بدون تاريخ محدد';
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('ar-SA', localeOpts({ year: 'numeric', month: 'long' }));
}

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.manager-tasks-view {
  direction: rtl;
}

.page-header {
  margin-bottom: 24px;
  text-align: right;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  min-width: 140px;
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--color-gold);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.tasks-toolbar {
  margin-bottom: 16px;
}

.btn-toggle-done {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle-done:hover {
  border-color: var(--color-gold, #b1a28f);
}

.btn-toggle-done.active {
  background: #ecfdf5;
  border-color: #10b981;
  color: #065f46;
}


.loading-state,
.empty-state,
.loading-inline {
  text-align: center;
  padding: 2rem;
  color: var(--color-dark-gray);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.task-detail-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.task-detail-modal__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 0;
}

.task-detail-modal__head h3 {
  margin: 0;
  font-size: 1.15rem;
}

.btn-close-modal {
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: #64748b;
}

.task-detail-body {
  padding: 16px 20px 20px;
}

.task-detail-desc {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: #334155;
}

.task-detail-dl {
  margin: 0;
}

.task-detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem;
}

.task-detail-row:last-child {
  border-bottom: none;
}

.task-detail-row dt {
  margin: 0;
  color: #64748b;
}

.task-detail-row dd {
  margin: 0;
}
</style>
