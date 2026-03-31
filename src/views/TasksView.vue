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

<style scoped src="./styles/TasksView.scoped.s1.css"></style>
<style scoped src="./styles/TasksView.scoped.s2.css"></style>
