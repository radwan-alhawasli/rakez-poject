<template>
  <div class="tasks-view">
    <div class="page-header">
      <h2>المهام الخاصة بي</h2>
      <button class="btn-primary" @click="showCreateModal = true">إضافة مهمة</button>
    </div>

    <div class="filters">
      <select v-model="filterStatus" @change="loadTasks(1)" class="form-input">
        <option value="">جميع الحالات</option>
        <option value="in_progress">قيد التنفيذ</option>
        <option value="completed">مكتملة</option>
        <option value="could_not_complete">لم تكتمل</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="empty-state">
      <p>لا توجد مهام مطابقة للبحث</p>
    </div>

        <div v-else class="tasks-grid">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3 class="task-title">{{ task.task_name || task.name || task.title }}</h3>
          <span class="status-badge" :class="task.status">{{ getStatusLabel(task.status) }}</span>
        </div>
        <div class="task-details">
              <p v-if="task.section_label || task.section_key">
                <strong>القسم:</strong>
                {{ task.section_label || getSectionLabel(task.section_key) }}
              </p>
          <p v-if="task.due_at || task.due_date">
            <strong>تاريخ الإستحقاق:</strong> {{ formatDate(task.due_at || task.due_date) }}
          </p>
          <p v-if="task.created_at">
            <strong>تاريخ الإنشاء:</strong> {{ formatDate(task.created_at) }}
          </p>
          <p v-if="task.team_id || task.team?.name || task.team_name">
            <strong>الفريق:</strong> {{ task.team_name || task.team?.name || task.team_id }}
          </p>
          <p v-if="task.assigned_to || task.assignee?.name">
            <strong>المسؤول:</strong> {{ task.assignee?.name || task.assigned_to }}
          </p>
          <p v-if="task.creator_name"><strong>بواسطة:</strong> {{ task.creator_name }}</p>
          <p v-if="task.cannot_complete_reason" class="reason">
            <strong>السبب:</strong> {{ task.cannot_complete_reason }}
          </p>
        </div>
        <div class="task-actions" v-if="task.status === 'in_progress'">
          <button class="btn-success" @click="updateStatus(task.id, 'completed')">إكمال</button>
          <button class="btn-danger" @click="openReasonModal(task.id)">تعذر الإكمال</button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="loadTasks(currentPage - 1)">السابق</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="loadTasks(currentPage + 1)">
        التالي
      </button>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>إضافة مهمة جديدة</h3>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label>اسم المهمة</label>
            <input v-model="taskForm.task_name" required class="form-input" />
          </div>
          <div class="form-group">
            <label>القسم</label>
            <select v-model="taskForm.section_key" required class="form-input">
              <option value="" disabled>اختر القسم...</option>
              <option v-for="section in taskSections" :key="section.key" :value="section.key">
                {{ section.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>موعد الإستحقاق</label>
            <!-- input datetime-local -->
            <input type="datetime-local" v-model="taskForm.due_at" required class="form-input" />
          </div>
          <div class="form-group">
            <label>المسؤول</label>
            <select
              v-model="taskForm.assigned_to"
              required
              class="form-input"
              :disabled="!taskForm.section_key || sectionUsersLoading"
            >
              <option value="" disabled>
                {{ !taskForm.section_key ? 'اختر القسم أولاً' : (sectionUsersLoading ? 'جاري التحميل...' : 'اختر الموظف المسؤول...') }}
              </option>
              <option
                v-if="
                  taskForm.section_key &&
                  currentUser &&
                  sectionUsers.some(user => user.id === currentUser.id)
                "
                :value="currentUser.id"
              >
                -- تعيين لنفسي ({{ currentUser.name }}) --
              </option>
              <option v-for="user in sectionUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              إلغاء
            </button>
            <button type="submit" class="btn-primary" :disabled="isCreating">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reason Modal -->
    <div v-if="showReasonModal" class="modal-overlay" @click.self="closeReasonModal">
      <div class="modal-content">
        <h3>سبب عدم الإكمال</h3>
        <form @submit.prevent="submitReasonModal">
          <div class="form-group">
            <label>السبب</label>
            <textarea v-model="reasonForm.reason" required class="form-input" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeReasonModal" class="btn-secondary">إلغاء</button>
            <button type="submit" class="btn-primary">تأكيد</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import taskService from '../services/taskService';
import notificationService from '../services/notificationService';
import teamService from '../services/teamService';
import userService from '../services/userService';
import authService from '../services/authService';
import logger from '../utils/logger';

const tasks = ref([]);
const teams = ref([]);
const users = ref([]);
const currentUser = authService.getCurrentUser();

// Fallback sections when API is unavailable (key + Arabic label)
const TASK_SECTIONS_FALLBACK = [
  { key: 'marketing', label: 'قسم التسويق' },
  { key: 'sales', label: 'قسم المبيعات' },
  { key: 'accounting', label: 'قسم المحاسبة' },
  { key: 'credit', label: 'قسم الائتمان' },
  { key: 'project_management', label: 'قسم إدارة المشاريع' },
  { key: 'editor', label: 'قسم المونتاج' },
  { key: 'hr', label: 'قسم الموارد البشرية' },
];

// Sections for dropdown: from API (GET /tasks/sections) or fallback
const taskSections = ref([]);

const isLoading = ref(false);
const filterStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(10);

const showCreateModal = ref(false);
const isCreating = ref(false);
const taskForm = reactive({
  task_name: '',
  section_key: '',
  team_id: '',
  due_at: '',
  assigned_to: '',
  status: 'in_progress',
});

const showReasonModal = ref(false);
const reasonForm = reactive({
  taskId: null,
  reason: '',
});

// Section-scoped users for assignee dropdown (fetched when section is selected)
const sectionUsers = ref([]);
const sectionUsersLoading = ref(false);

const extractDropdownDataFromTasks = () => {
  const uniqueTeams = new Map();
  const uniqueUsers = new Map();

  // 1. Add current user as base fallback
  if (currentUser) {
    uniqueUsers.set(currentUser.id, currentUser.name);
    if (currentUser.team_id) {
      uniqueTeams.set(currentUser.team_id, `فريق ${currentUser.team_id}`);
    }
  }

  // 2. Extract from loaded tasks to give context-aware options without permissions
  tasks.value.forEach(task => {
    if (task.team_id) {
      uniqueTeams.set(task.team_id, task.team_name || task.team?.name || `فريق ${task.team_id}`);
    }
    if (task.assigned_to) {
      uniqueUsers.set(
        task.assigned_to,
        task.assignee_name || task.assignee?.name || `موظف ${task.assigned_to}`
      );
    }
    if (task.created_by) {
      uniqueUsers.set(task.created_by, task.creator_name || `موظف ${task.created_by}`);
    }
  });

  // 3. Keep any existing data if it successfully loaded via API
  teams.value.forEach(team => {
    if (team.id) uniqueTeams.set(team.id, team.name);
  });
  users.value.forEach(user => {
    if (user.id) uniqueUsers.set(user.id, user.name);
  });

  // 4. Update the arrays used by the dropdowns
  teams.value = Array.from(uniqueTeams.entries()).map(([id, name]) => ({ id, name }));
  users.value = Array.from(uniqueUsers.entries()).map(([id, name]) => ({ id, name }));
};

/** Fetch users for the selected section via GET /tasks/sections/:section/users. */
const fetchSectionUsers = async sectionKey => {
  if (!sectionKey) {
    sectionUsers.value = [];
    return;
  }
  sectionUsersLoading.value = true;
  taskForm.assigned_to = '';
  try {
    const items = await taskService.getSectionUsers(sectionKey);
    sectionUsers.value = Array.isArray(items) ? items : [];
  } catch (error) {
    logger.error('Failed to load section users for assignee dropdown', error);
    sectionUsers.value = [];
  } finally {
    sectionUsersLoading.value = false;
  }
};

watch(
  () => taskForm.section_key,
  (newSectionKey) => {
    taskForm.assigned_to = '';
    if (!newSectionKey) {
      sectionUsers.value = [];
      sectionUsersLoading.value = false;
      return;
    }
    fetchSectionUsers(newSectionKey);
  }
);

watch(showCreateModal, (isOpen) => {
  if (isOpen) {
    sectionUsers.value = [];
    sectionUsersLoading.value = false;
  }
});

/** Load sections from API (GET /tasks/sections); fallback to static list. */
const loadTaskSections = async () => {
  try {
    const list = await taskService.getTaskSections();
    const normalized = (list || []).map(s => ({
      key: s.value ?? s.key,
      label: s.label ?? s.value ?? s.key,
    }));
    taskSections.value = normalized.length > 0 ? normalized : TASK_SECTIONS_FALLBACK;
  } catch (error) {
    logger.error('Failed to load task sections', error);
    taskSections.value = TASK_SECTIONS_FALLBACK;
  }
};

const fetchDropdownData = async () => {
  try {
    // If the user doesn't have permissions to fetch all teams or users, we silently catch the error
    // and rely on the fallback below.
    const [teamsData, usersData] = await Promise.all([
      teamService.getTeams().catch(() => []),
      userService.getEmployees({ per_page: 100 }).catch(() => ({ items: [] })),
    ]);

    teams.value = Array.isArray(teamsData) ? teamsData : teamsData.items || [];
    users.value = usersData?.items || [];

    extractDropdownDataFromTasks();
  } catch (error) {
    logger.error('Failed to load teams or users for dropdowns', error);
  }
};

const loadTasks = async (page = 1) => {
  try {
    isLoading.value = true;
    currentPage.value = page;

    const params = {
      page: currentPage.value,
      per_page: itemsPerPage.value,
    };

    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    const data = await taskService.getMyTasks(params);
    tasks.value = data.items || [];

    const total = data.total || 0;
    totalPages.value = Math.ceil(total / itemsPerPage.value) || 1;

    // Extract names for the dropdowns from the loaded tasks
    extractDropdownDataFromTasks();
  } catch (error) {
    logger.error('Failed to load tasks', error);
  } finally {
    isLoading.value = false;
  }
};

const getStatusLabel = status => {
  const map = {
    in_progress: 'قيد التنفيذ',
    completed: 'مكتملة',
    could_not_complete: 'لم تكتمل',
    pending: 'قيد الإنتظار',
  };
  return map[status] || status;
};

const getSectionLabel = sectionKey => {
  if (!sectionKey) return '';
  const section = taskSections.value.find(s => s.key === sectionKey);
  if (section) return section.label;
  const fallback = TASK_SECTIONS_FALLBACK.find(s => s.key === sectionKey);
  return fallback ? fallback.label : sectionKey;
};

const formatDate = dateString => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const createTask = async () => {
  try {
    isCreating.value = true;
    // Format datetime string for the backend
    const due_at_formatted = taskForm.due_at ? taskForm.due_at.replace('T', ' ') + ':00' : null;

    await taskService.createTask({
      task_name: taskForm.task_name,
      section: taskForm.section_key,
      assigned_to: taskForm.assigned_to,
      due_at: due_at_formatted,
      status: taskForm.status,
      ...(taskForm.team_id && { team_id: taskForm.team_id }),
    });

    notificationService.addNotification('تم إنشاء المهمة بنجاح', 'success');
    showCreateModal.value = false;

    // Reset form
    Object.assign(taskForm, {
      task_name: '',
      section_key: '',
      team_id: '',
      due_at: '',
      assigned_to: '',
      status: 'in_progress',
    });

    loadTasks(1);
  } catch (error) {
    logger.error('Failed to create task', error);
  } finally {
    isCreating.value = false;
  }
};

const updateStatus = async (taskId, status, reason = null) => {
  try {
    const data = { status };
    if (reason) {
      data.cannot_complete_reason = reason;
    }

    await taskService.updateTaskStatus(taskId, data);
    notificationService.addNotification('تم تحديث حالة المهمة', 'success');
    loadTasks(currentPage.value);
  } catch (error) {
    logger.error(`Failed to update task ${taskId}`, error);
  }
};

const openReasonModal = taskId => {
  reasonForm.taskId = taskId;
  reasonForm.reason = '';
  showReasonModal.value = true;
};

const closeReasonModal = () => {
  showReasonModal.value = false;
  reasonForm.taskId = null;
  reasonForm.reason = '';
};

const submitReasonModal = async () => {
  if (!reasonForm.reason.trim()) {
    notificationService.addNotification('الرجاء إدخال السبب', 'error');
    return;
  }

  await updateStatus(reasonForm.taskId, 'could_not_complete', reasonForm.reason);
  closeReasonModal();
};

onMounted(() => {
  loadTasks();
  loadTaskSections();
  fetchDropdownData();
});
</script>

<style scoped>
.tasks-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: var(--text-color, #333);
  margin: 0;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: var(--bg-color, #fff);
  color: var(--text-color, #333);
}

select.form-input {
  width: 200px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.btn-primary {
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-color, #333);
  border: 1px solid var(--border-color, #ddd);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-success {
  background-color: var(--success-color, #28a745);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-danger {
  background-color: var(--danger-color, #dc3545);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.task-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #eee);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color, #333);
  word-break: break-word;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  white-space: nowrap;
  margin-right: 12px;
}

.status-badge.in_progress {
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.status-badge.completed {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.could_not_complete {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-badge.pending {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.task-details {
  flex-grow: 1;
  font-size: 0.9rem;
  color: var(--text-muted, #666);
  margin-bottom: 16px;
}

.task-details p {
  margin: 4px 0;
}

.task-details .reason {
  color: var(--danger-color, #dc3545);
  margin-top: 8px;
}

.task-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color, #eee);
  padding-top: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid var(--border-color, #ddd);
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted, #666);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color, #007bff);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--bg-color, #fff);
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-color, #333);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .page-header h2 {
    font-size: 1.3rem;
  }
  .modal-content {
    max-width: 90%;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .tasks-view {
    padding: 16px;
  }
  .tasks-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .page-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  .filters {
    flex-wrap: wrap;
  }
  select.form-input {
    width: 100%;
  }
  .task-card {
    padding: 14px;
  }
  .task-title {
    font-size: 1rem;
  }
  .task-details {
    font-size: 0.85rem;
  }
  .modal-content {
    padding: 20px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .tasks-view {
    padding: 12px;
  }
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .page-header h2 {
    font-size: 1.15rem;
  }
  .btn-primary,
  .btn-secondary {
    padding: 10px 16px;
    min-height: 44px;
    font-size: 0.9rem;
  }
  .btn-success,
  .btn-danger {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 0.85rem;
  }
  .task-actions {
    flex-wrap: wrap;
  }
  .task-actions button {
    flex: 1;
    min-width: 0;
  }
  .pagination button {
    padding: 10px 14px;
    min-height: 44px;
  }
  .modal-content {
    max-width: 95%;
    padding: 16px;
    max-height: 85vh;
  }
  .modal-actions {
    flex-direction: column;
  }
  .modal-actions button {
    min-height: 44px;
  }
  .form-input {
    padding: 10px 12px;
    font-size: 0.9rem;
    min-height: 44px;
  }
  .loading-state,
  .empty-state {
    padding: 24px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .tasks-view {
    padding: 8px;
  }
  .page-header h2 {
    font-size: 1rem;
  }
  .task-card {
    padding: 10px;
  }
  .task-title {
    font-size: 0.9rem;
  }
  .task-details {
    font-size: 0.8rem;
  }
  .status-badge {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
  .modal-content {
    padding: 12px;
    border-radius: 6px;
  }
  .btn-primary,
  .btn-secondary,
  .btn-success,
  .btn-danger {
    font-size: 0.8rem;
    padding: 10px 10px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .tasks-view {
    max-width: 1600px;
    padding: 32px;
  }
  .page-header h2 {
    font-size: 1.75rem;
  }
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 28px;
  }
  .task-card {
    padding: 24px;
  }
  .task-title {
    font-size: 1.25rem;
  }
  .task-details {
    font-size: 1rem;
  }
  .modal-content {
    max-width: 580px;
    padding: 32px;
  }
  .form-input {
    font-size: 1rem;
    padding: 12px 16px;
  }
  .btn-primary,
  .btn-secondary {
    padding: 12px 24px;
    font-size: 1rem;
  }
  .pagination button {
    padding: 10px 18px;
    font-size: 1rem;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .tasks-view {
    max-width: 2000px;
    padding: 40px;
  }
  .page-header h2 {
    font-size: 2rem;
  }
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 32px;
  }
  .task-card {
    padding: 28px;
  }
  .task-title {
    font-size: 1.35rem;
  }
  .task-details {
    font-size: 1.05rem;
  }
}
</style>
