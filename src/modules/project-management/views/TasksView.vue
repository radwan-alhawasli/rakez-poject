<template>
  <div class="tasks-view">
    <div class="welcome-header">
      <div class="header-flex-container">
        <h1 class="welcome-title">إدارة المهام</h1>
        <button class="btn-primary" @click="showCreateModal = true">إضافة مهمة</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'assigned' }"
        @click="switchTab('assigned')"
      >
        <span class="tab-icon">📋</span>
        مهام مطلوبة مني
        <span v-if="assignedTotal > 0" class="tab-count">{{ assignedTotal }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'requested' }"
        @click="switchTab('requested')"
      >
        <span class="tab-icon">📤</span>
        مهام طلبتها من الآخرين
        <span v-if="requestedTotal > 0" class="tab-count">{{ requestedTotal }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filterStatus" @change="loadCurrentTab(1)" class="form-input">
        <option value="">جميع الحالات</option>
        <option value="in_progress">قيد التنفيذ</option>
        <option value="completed">مكتملة</option>
        <option value="could_not_complete">لم تكتمل</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadCurrentTab(1)">إعادة المحاولة</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentTasks.length === 0" class="empty-state">
      <p v-if="activeTab === 'assigned'">لا توجد مهام مطلوبة منك حالياً</p>
      <p v-else>لم تطلب أي مهام من الآخرين بعد</p>
    </div>

    <!-- Tasks Grid -->
    <div v-else class="tasks-grid">
      <div v-for="task in currentTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3 class="task-title">{{ task.task_name || task.name || task.title }}</h3>
          <span class="status-badge" :class="task.status">{{ getStatusLabel(task.status) }}</span>
        </div>

        <!-- Origin Badge -->
        <div class="task-origin">
          <span v-if="activeTab === 'assigned'" class="origin-badge assigned-badge">
            <span class="origin-icon">⬇️</span>
            مطلوبة مني
          </span>
          <span v-else class="origin-badge requested-badge">
            <span class="origin-icon">⬆️</span>
            طلبتها من آخرين
          </span>
        </div>

        <div class="task-details">
          <p v-if="task.section_label || task.section_key">
            <strong>القسم:</strong>
            {{ task.section_label || getSectionLabel(task.section_key) }}
          </p>
          <p v-if="task.due_at || task.due_date">
            <strong>تاريخ الاستحقاق:</strong> {{ formatDate(task.due_at || task.due_date) }}
          </p>
          <p v-if="task.created_at">
            <strong>تاريخ الإنشاء:</strong> {{ formatDate(task.created_at) }}
          </p>
          <p v-if="task.team_id || task.team?.name || task.team_name">
            <strong>الفريق:</strong> {{ task.team_name || task.team?.name || task.team_id }}
          </p>

          <!-- For tasks assigned to me: show who requested it -->
          <p v-if="activeTab === 'assigned' && (task.creator_name || task.created_by_name)">
            <strong>طُلبت بواسطة:</strong>
            <span class="person-name requester">{{ task.creator_name || task.created_by_name }}</span>
          </p>

          <!-- For tasks I requested: show who is assigned -->
          <p v-if="activeTab === 'requested' && (task.assignee?.name || task.assigned_to_name || task.assignee_name)">
            <strong>مُكلَّف بها:</strong>
            <span class="person-name assignee">{{ task.assignee?.name || task.assigned_to_name || task.assignee_name }}</span>
          </p>

          <!-- For tasks assigned to me: show assignee if different context -->
          <p v-if="activeTab === 'assigned' && (task.assigned_to || task.assignee?.name) && !task.creator_name && !task.created_by_name">
            <strong>المسؤول:</strong> {{ task.assignee?.name || task.assigned_to }}
          </p>

          <p v-if="task.cannot_complete_reason" class="reason">
            <strong>السبب:</strong> {{ task.cannot_complete_reason }}
          </p>
        </div>

        <!-- Status progress indicator -->
        <div class="status-indicator">
          <div class="status-steps">
            <div class="step" :class="{ done: true }">
              <span class="step-dot"></span>
              <span class="step-label">تم الإنشاء</span>
            </div>
            <div class="step-line" :class="{ active: task.status !== 'pending' }"></div>
            <div class="step" :class="{ done: task.status === 'in_progress' || task.status === 'completed' }">
              <span class="step-dot"></span>
              <span class="step-label">قيد التنفيذ</span>
            </div>
            <div class="step-line" :class="{ active: task.status === 'completed' }"></div>
            <div class="step" :class="{ done: task.status === 'completed', failed: task.status === 'could_not_complete' }">
              <span class="step-dot"></span>
              <span class="step-label">{{ task.status === 'could_not_complete' ? 'لم تكتمل' : 'مكتملة' }}</span>
            </div>
          </div>
        </div>

        <!-- Actions only for tasks assigned to me and in progress -->
        <div class="task-actions" v-if="activeTab === 'assigned' && task.status === 'in_progress'">
          <button class="btn-success" @click="updateStatus(task.id, 'completed')">إكمال</button>
          <button class="btn-danger" @click="openReasonModal(task.id)">تعذر الإكمال</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="currentTotalPages > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="loadCurrentTab(currentPage - 1)">السابق</button>
      <span>{{ currentPage }} / {{ currentTotalPages }}</span>
      <button :disabled="currentPage === currentTotalPages" @click="loadCurrentTab(currentPage + 1)">
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
            <label>موعد الاستحقاق</label>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import taskService from '@/services/taskService';
import notificationService from '@/services/notificationService';
import teamService from '@/services/teamService';
import userService from '@/services/userService';
import authService from '@/services/authService';
import logger from '@/utils/logger';

const currentUser = authService.getCurrentUser();

const activeTab = ref('assigned');

const assignedTasks = ref([]);
const requestedTasks = ref([]);
const assignedTotal = ref(0);
const requestedTotal = ref(0);

const assignedPage = ref(1);
const requestedPage = ref(1);
const assignedTotalPages = ref(1);
const requestedTotalPages = ref(1);

const teams = ref([]);
const users = ref([]);

const TASK_SECTIONS_FALLBACK = [
  { key: 'marketing', label: 'قسم التسويق' },
  { key: 'sales', label: 'قسم المبيعات' },
  { key: 'accounting', label: 'قسم المحاسبة' },
  { key: 'credit', label: 'قسم الائتمان' },
  { key: 'project_management', label: 'قسم إدارة المشاريع' },
  { key: 'editor', label: 'قسم المونتاج' },
  { key: 'hr', label: 'قسم الموارد البشرية' },
];

const taskSections = ref([]);
const isLoading = ref(false);
const error = ref(null);
const filterStatus = ref('');
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

const sectionUsers = ref([]);
const sectionUsersLoading = ref(false);

const currentTasks = computed(() =>
  activeTab.value === 'assigned' ? assignedTasks.value : requestedTasks.value
);

const currentPage = computed(() =>
  activeTab.value === 'assigned' ? assignedPage.value : requestedPage.value
);

const currentTotalPages = computed(() =>
  activeTab.value === 'assigned' ? assignedTotalPages.value : requestedTotalPages.value
);

const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  filterStatus.value = '';
  loadCurrentTab(1);
};

const extractDropdownDataFromTasks = () => {
  const uniqueTeams = new Map();
  const uniqueUsers = new Map();

  if (currentUser) {
    uniqueUsers.set(currentUser.id, currentUser.name);
    if (currentUser.team_id) {
      uniqueTeams.set(currentUser.team_id, `فريق ${currentUser.team_id}`);
    }
  }

  const allTasks = [...assignedTasks.value, ...requestedTasks.value];
  allTasks.forEach(task => {
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

  teams.value.forEach(team => {
    if (team.id) uniqueTeams.set(team.id, team.name);
  });
  users.value.forEach(user => {
    if (user.id) uniqueUsers.set(user.id, user.name);
  });

  teams.value = Array.from(uniqueTeams.entries()).map(([id, name]) => ({ id, name }));
  users.value = Array.from(uniqueUsers.entries()).map(([id, name]) => ({ id, name }));
};

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

const loadAssignedTasks = async (page = 1) => {
  try {
    isLoading.value = true;
    error.value = null;
    assignedPage.value = page;

    const params = {
      page,
      per_page: itemsPerPage.value,
    };
    if (filterStatus.value) params.status = filterStatus.value;

    const data = await taskService.getMyTasks(params);
    assignedTasks.value = data.items || [];
    assignedTotal.value = data.total || 0;
    assignedTotalPages.value = Math.ceil(assignedTotal.value / itemsPerPage.value) || 1;

    extractDropdownDataFromTasks();
  } catch (err) {
    logger.error('Failed to load assigned tasks', err);
    error.value = 'حدث خطأ في تحميل المهام';
  } finally {
    isLoading.value = false;
  }
};

const loadRequestedTasks = async (page = 1) => {
  try {
    isLoading.value = true;
    error.value = null;
    requestedPage.value = page;

    const params = {
      page,
      per_page: itemsPerPage.value,
    };
    if (filterStatus.value) params.status = filterStatus.value;

    const data = await taskService.getRequestedTasks(params);
    requestedTasks.value = data.items || [];
    requestedTotal.value = data.total || 0;
    requestedTotalPages.value = Math.ceil(requestedTotal.value / itemsPerPage.value) || 1;

    extractDropdownDataFromTasks();
  } catch (err) {
    logger.error('Failed to load requested tasks', err);
    error.value = 'حدث خطأ في تحميل المهام';
  } finally {
    isLoading.value = false;
  }
};

const loadCurrentTab = (page = 1) => {
  if (activeTab.value === 'assigned') {
    loadAssignedTasks(page);
  } else {
    loadRequestedTasks(page);
  }
};

const loadInitialCounts = async () => {
  try {
    const [assignedData, requestedData] = await Promise.all([
      taskService.getMyTasks({ page: 1, per_page: 1 }).catch(() => ({ total: 0 })),
      taskService.getRequestedTasks({ page: 1, per_page: 1 }).catch(() => ({ total: 0 })),
    ]);
    assignedTotal.value = assignedData.total || 0;
    requestedTotal.value = requestedData.total || 0;
  } catch {
    // counts will remain 0
  }
};

const getStatusLabel = status => {
  const map = {
    in_progress: 'قيد التنفيذ',
    completed: 'مكتملة',
    could_not_complete: 'لم تكتمل',
    pending: 'قيد الانتظار',
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
  return new Date(dateString).toLocaleString('en-US', {
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

    Object.assign(taskForm, {
      task_name: '',
      section_key: '',
      team_id: '',
      due_at: '',
      assigned_to: '',
      status: 'in_progress',
    });

    loadAssignedTasks(1);
    loadRequestedTasks(1);
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
    loadCurrentTab(currentPage.value);
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
  loadAssignedTasks();
  loadInitialCounts();
  loadTaskSections();
  fetchDropdownData();
});
</script>

<style scoped>
.tasks-view {
  direction: rtl;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
}

.header-flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Tabs — هوية راكز (كحلي / ذهبي + زجاج محايد، بدل الأزرق الافتراضي) */
.tabs-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 6px;
  margin-bottom: clamp(18px, 2.5vw, 26px);
  padding: 8px;
  border-radius: 16px;
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(248, 250, 252, 0.32) 50%,
    rgba(255, 255, 255, 0.34) 100%
  );
  backdrop-filter: blur(10px) saturate(1.02);
  -webkit-backdrop-filter: blur(10px) saturate(1.02);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.55) inset,
    0 8px 28px -12px rgba(15, 23, 42, 0.12);
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: min(100%, 11rem);
  padding: 11px 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-dark-gray, #64748b);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover:not(.active) {
  color: var(--color-navy, #27374d);
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(226, 232, 240, 0.5);
}

.tab-btn.active {
  color: var(--color-navy, #27374d);
  font-weight: 800;
  background: rgba(255, 255, 255, 0.38);
  border-color: rgba(39, 55, 77, 0.12);
  box-shadow: none;
}

.tab-icon {
  font-size: 1.05rem;
  opacity: 0.85;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(241, 245, 249, 0.75);
  color: var(--color-charcoal, #1e293b);
}

.tab-btn.active .tab-count {
  background: linear-gradient(145deg, var(--color-navy-dark, #1a2636) 0%, var(--color-navy, #27374d) 100%);
  color: var(--color-white, #fff);
  border-color: rgba(26, 38, 54, 0.5);
  box-shadow: 0 2px 8px rgba(39, 55, 77, 0.28);
}

/* Filters */
.filters {
  margin-bottom: 22px;
  margin-top: 4px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
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

.filters select.form-input {
  width: min(100%, 240px);
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(39, 55, 77, 0.14);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--color-navy, #27374d);
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  cursor: pointer;
}

.filters select.form-input:not(:disabled):hover {
  border-color: rgba(181, 169, 154, 0.55);
}

.filters select.form-input:focus {
  outline: none;
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 0 0 1px rgba(181, 169, 154, 0.35);
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

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #9a8d7d) 100%);
  color: var(--color-white, #fff);
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(154, 141, 125, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 6px 20px rgba(154, 141, 125, 0.42);
  transform: translateY(-1px);
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

/* Tasks Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.task-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #eee);
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-color, #333);
  word-break: break-word;
  line-height: 1.4;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.73rem;
  font-weight: bold;
  white-space: nowrap;
  margin-right: 12px;
  flex-shrink: 0;
}

.status-badge.in_progress {
  background-color: rgba(39, 55, 77, 0.1);
  color: var(--color-navy, #27374d);
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
  color: #d39e00;
}

/* Origin Badge */
.task-origin {
  margin-bottom: 10px;
}

.origin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.origin-icon {
  font-size: 0.8rem;
}

.assigned-badge {
  background-color: rgba(39, 55, 77, 0.08);
  color: var(--color-navy, #27374d);
}

.requested-badge {
  background-color: rgba(253, 203, 110, 0.2);
  color: #b8860b;
}

/* Task Details */
.task-details {
  flex-grow: 1;
  font-size: 0.88rem;
  color: var(--text-muted, #666);
  margin-bottom: 12px;
}

.task-details p {
  margin: 4px 0;
}

.task-details .reason {
  color: var(--danger-color, #dc3545);
  margin-top: 8px;
}

.person-name {
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.person-name.requester {
  background: rgba(39, 55, 77, 0.08);
  color: var(--color-navy-dark, #1a2636);
}

.person-name.assignee {
  background: rgba(253, 203, 110, 0.15);
  color: #b8860b;
}

/* Status Progress */
.status-indicator {
  margin-bottom: 12px;
  padding: 8px 0;
}

.status-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-color, #ddd);
  border: 2px solid var(--border-color, #ccc);
  transition: all 0.3s ease;
}

.step.done .step-dot {
  background: var(--success-color, #28a745);
  border-color: var(--success-color, #28a745);
}

.step.failed .step-dot {
  background: var(--danger-color, #dc3545);
  border-color: var(--danger-color, #dc3545);
}

.step-label {
  font-size: 0.65rem;
  color: var(--text-muted, #999);
  white-space: nowrap;
}

.step.done .step-label {
  color: var(--success-color, #28a745);
  font-weight: 600;
}

.step.failed .step-label {
  color: var(--danger-color, #dc3545);
  font-weight: 600;
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border-color, #ddd);
  margin: 0 4px;
  margin-bottom: 18px;
  transition: background 0.3s ease;
}

.step-line.active {
  background: var(--success-color, #28a745);
}

/* Task Actions */
.task-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color, #eee);
  padding-top: 12px;
}

/* Pagination */
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

/* Loading / Empty / Error */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted, #666);
}

.error-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted, #666);
}

.error-state button {
  margin-top: 15px;
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #9a8d7d) 100%);
  color: var(--color-white, #fff);
  border: none;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(154, 141, 125, 0.35);
  transition: filter 0.2s ease, opacity 0.2s;
}

.error-state button:hover {
  filter: brightness(1.05);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.08);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--color-gold, #b5a99a);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal */
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

/* Responsive */
@media (max-width: 992px) {
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .page-header h2 {
    font-size: 1.3rem;
  }
  .modal-content {
    max-width: 90%;
  }
}

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
  .filters select.form-input {
    width: 100%;
    max-width: none;
  }
  .tabs-container {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .tab-btn {
    flex: 0 0 auto;
    min-width: max-content;
    padding: 10px 16px;
    font-size: 0.85rem;
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
  .step-line {
    width: 28px;
  }
}

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
  .tabs-container {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 6px;
    gap: 4px;
  }
  .tab-btn {
    flex: 0 0 auto;
    min-width: max-content;
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  .tab-icon {
    display: none;
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
  .status-steps {
    transform: scale(0.9);
  }
  .step-line {
    width: 20px;
  }
}

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
  .tab-btn {
    padding: 14px 28px;
    font-size: 1.05rem;
  }
}

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
