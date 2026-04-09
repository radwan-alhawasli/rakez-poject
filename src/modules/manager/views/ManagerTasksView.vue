<template>
  <div class="manager-tasks-view">
    <div class="page-header">
      <h1 class="page-title">المهام</h1>
      <p class="page-subtitle">عرض وإدارة المهام التابعة لك.</p>
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

    <div v-else-if="tasks.length === 0" class="empty-state">
      <p>لا توجد مهام.</p>
    </div>

    <div v-else class="tasks-list">
      <div v-for="t in tasks" :key="t.id" class="task-card">
        <div class="task-header">
          <h4>{{ t.title || t.name || '—' }}</h4>
          <span :class="['task-status', t.status]">{{ t.status || '—' }}</span>
        </div>
        <p v-if="t.description" class="task-desc">{{ t.description }}</p>
        <div class="task-meta">
          <span v-if="t.assigned_to">المُعيّن: {{ t.assigned_to }}</span>
          <span v-if="t.due_at">الموعد: {{ formatDate(t.due_at) }}</span>
        </div>
        <router-link
          v-if="t.id"
          :to="{ name: 'ManagerEmployees' }"
          class="task-link"
        >
          عرض التفاصيل
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import managerService from '@/services/managerService';
import { localeOpts } from '@/utils/intlLatn';

const tasks = ref([]);
const isLoading = ref(true);

const filters = ref({
  status: '',
  assigned_to: '',
  section: '',
  sort_by: 'due_at',
  sort_order: 'asc',
  per_page: 20,
});

function formatDate(d) {
  if (!d) return '—';
  const d2 = new Date(d);
  return isNaN(d2.getTime()) ? d : d2.toLocaleDateString('ar-SA', localeOpts());
}

async function fetchTasks() {
  isLoading.value = true;
  try {
    const params = {};
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.assigned_to) params.assigned_to = filters.value.assigned_to;
    if (filters.value.section) params.section = filters.value.section;
    params.sort_by = filters.value.sort_by || 'due_at';
    params.sort_order = filters.value.sort_order || 'asc';
    params.per_page = filters.value.per_page || 20;

    const res = await managerService.getTasks(params);
    tasks.value = res?.items ?? [];
  } catch (_) {
    tasks.value = [];
  } finally {
    isLoading.value = false;
  }
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

.task-status.pending { background: #fef3c7; color: #92400e; }
.task-status.in_progress { background: #dbeafe; color: #1e40af; }
.task-status.completed { background: #d1fae5; color: #065f46; }

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
  margin-bottom: 12px;
}

.task-link {
  color: var(--color-gold);
  font-weight: 600;
  text-decoration: none;
}

.task-link:hover {
  text-decoration: underline;
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
  to { transform: rotate(360deg); }
}
</style>
