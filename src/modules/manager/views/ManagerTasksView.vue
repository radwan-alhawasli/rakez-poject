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
      <div class="tasks-stats-row" role="region" aria-label="إحصائيات المهام">
        <div class="stat-card">
          <span class="stat-label">إجمالي المهام</span>
          <span class="stat-value">{{ tasks.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">المكتملة</span>
          <span class="stat-value">{{ doneTasksCount }}</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-label">نسبة الإنجاز</span>
          <span class="stat-value">{{ completionPercentDisplay }}٪</span>
        </div>
      </div>
      <div class="tasks-status-breakdown" role="region" aria-label="نسب المهام حسب الحالة">
        <div class="breakdown-item">
          <span class="breakdown-label">قيد الانتظار</span>
          <span class="breakdown-pct">{{ statusBreakdown.pendingPct }}٪</span>
          <span class="breakdown-count">({{ statusBreakdown.pending }})</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">قيد التنفيذ</span>
          <span class="breakdown-pct">{{ statusBreakdown.inProgressPct }}٪</span>
          <span class="breakdown-count">({{ statusBreakdown.inProgress }})</span>
        </div>
        <div class="breakdown-item breakdown-item--done">
          <span class="breakdown-label">مكتمل</span>
          <span class="breakdown-pct">{{ statusBreakdown.donePct }}٪</span>
          <span class="breakdown-count">({{ statusBreakdown.done }})</span>
        </div>
        <div v-if="statusBreakdown.other > 0" class="breakdown-item">
          <span class="breakdown-label">أخرى</span>
          <span class="breakdown-pct">{{ statusBreakdown.otherPct }}٪</span>
          <span class="breakdown-count">({{ statusBreakdown.other }})</span>
        </div>
      </div>
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
                @click="openTaskDetail(t)"
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
import { ref, computed, onMounted } from 'vue';
import managerService from '@/services/managerService';
import { localeOpts } from '@/utils/intlLatn';
import { toast } from '@/composables/useToast';
import {
  isTaskDoneStatus,
  groupTasksByMonth,
  completionPercent,
  buildTaskStatusBreakdown,
} from '@/utils/managerTasksDisplay';

const tasks = ref([]);
const isLoading = ref(true);
const showDoneOnly = ref(false);
const taskDetailOpen = ref(false);
const taskDetailLoading = ref(false);
const taskDetail = ref(null);

const filters = ref({
  status: '',
  assigned_to: '',
  section: '',
  sort_by: 'due_at',
  sort_order: 'desc',
});

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

const doneTasksCount = computed(() => tasks.value.filter(t => isTaskDoneStatus(t.status)).length);

const completionPercentDisplay = computed(() =>
  completionPercent(tasks.value.length, doneTasksCount.value)
);

const statusBreakdown = computed(() => buildTaskStatusBreakdown(tasks.value));

const filteredTasks = computed(() => {
  if (!showDoneOnly.value) return tasks.value;
  return tasks.value.filter(t => isTaskDoneStatus(t.status));
});

const groupedFilteredTasks = computed(() => groupTasksByMonth(filteredTasks.value));

function taskMonthLabel(key) {
  if (key === 'unknown') return 'بدون تاريخ محدد';
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('ar-SA', localeOpts({ year: 'numeric', month: 'long' }));
}

async function fetchTasks() {
  isLoading.value = true;
  try {
    const base = {
      sort_by: filters.value.sort_by || 'due_at',
      sort_order: filters.value.sort_order || 'desc',
    };
    if (filters.value.status) base.status = filters.value.status;
    const at = String(filters.value.assigned_to || '').trim();
    if (at) base.assigned_to = at;
    const sec = String(filters.value.section || '').trim();
    if (sec) base.section = sec;

    const res = await managerService.getAllTasks(base, { perPage: 100, maxPages: 50 });
    tasks.value = res?.items ?? [];
  } catch (_) {
    tasks.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function openTaskDetail(t) {
  if (!t?.id) return;
  taskDetail.value = null;
  taskDetailOpen.value = true;
  taskDetailLoading.value = true;
  try {
    taskDetail.value = await managerService.getTask(t.id);
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر تحميل المهمة');
    taskDetailOpen.value = false;
  } finally {
    taskDetailLoading.value = false;
  }
}

function closeTaskDetail() {
  taskDetailOpen.value = false;
  taskDetail.value = null;
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

.tasks-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card--accent {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #a7f3d0;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.tasks-status-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.breakdown-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  justify-content: space-between;
}

.breakdown-item--done .breakdown-pct {
  color: #047857;
}

.breakdown-label {
  font-size: 0.85rem;
  color: #64748b;
  width: 100%;
}

.breakdown-pct {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.breakdown-count {
  font-size: 0.8rem;
  color: #94a3b8;
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
