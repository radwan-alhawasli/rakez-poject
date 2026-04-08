import { ref, reactive, computed, onMounted, watch } from 'vue';
import taskService from '@/services/taskService';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { getCaughtMessage } from '@/utils/caughtError';

export function useTasksView() {
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
    title: '',
    description: '',
    section_key: '',
    due_at: '',
    assigned_to: '',
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

  const switchTab = tab => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    filterStatus.value = '';
    loadCurrentTab(1);
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
    } catch (e) {
      logger.error('Failed to load section users for assignee dropdown', e);
      sectionUsers.value = [];
    } finally {
      sectionUsersLoading.value = false;
    }
  };

  watch(
    () => taskForm.section_key,
    newSectionKey => {
      taskForm.assigned_to = '';
      if (!newSectionKey) {
        sectionUsers.value = [];
        sectionUsersLoading.value = false;
        return;
      }
      fetchSectionUsers(newSectionKey);
    }
  );

  watch(showCreateModal, isOpen => {
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
    } catch (e) {
      logger.error('Failed to load task sections', e);
      taskSections.value = TASK_SECTIONS_FALLBACK;
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
      void 0;
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

      const assignedToNum = Number(taskForm.assigned_to);
      if (
        taskForm.assigned_to === '' ||
        taskForm.assigned_to === null ||
        Number.isNaN(assignedToNum) ||
        assignedToNum < 1
      ) {
        notificationService.addNotification('الرجاء اختيار الموظف المسؤول', 'error');
        return;
      }

      const payload = {
        task_name: taskForm.title.trim(),
        section: taskForm.section_key,
        due_at: due_at_formatted,
        assigned_to: assignedToNum,
      };
      const desc = taskForm.description?.trim();
      if (desc) {
        payload.description = desc;
      }

      await taskService.createTask(payload);

      notificationService.addNotification('تم إنشاء المهمة بنجاح', 'success');
      showCreateModal.value = false;

      Object.assign(taskForm, {
        title: '',
        description: '',
        section_key: '',
        due_at: '',
        assigned_to: '',
      });

      loadAssignedTasks(1);
      loadRequestedTasks(1);
    } catch (e) {
      logger.error('Failed to create task', e);
      notificationService.addNotification(getCaughtMessage(e) || 'فشل إنشاء المهمة', 'error');
    } finally {
      isCreating.value = false;
    }
  };

  const updateStatus = async (taskId, status, reason = null) => {
    try {
      const data = {
        status,
        cannot_complete_reason: reason != null && String(reason).trim() !== '' ? reason : null,
      };

      await taskService.updateTaskStatus(taskId, data);
      notificationService.addNotification('تم تحديث حالة المهمة', 'success');
      loadCurrentTab(currentPage.value);
    } catch (e) {
      logger.error(`Failed to update task ${taskId}`, e);
      notificationService.addNotification(getCaughtMessage(e) || 'فشل تحديث حالة المهمة', 'error');
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
  });

  return {
    currentUser,
    activeTab,
    assignedTotal,
    requestedTotal,
    isLoading,
    error,
    filterStatus,
    showCreateModal,
    isCreating,
    taskForm,
    showReasonModal,
    reasonForm,
    sectionUsers,
    sectionUsersLoading,
    currentTasks,
    currentPage,
    currentTotalPages,
    taskSections,
    switchTab,
    loadCurrentTab,
    getStatusLabel,
    getSectionLabel,
    formatDate,
    createTask,
    updateStatus,
    openReasonModal,
    closeReasonModal,
    submitReasonModal,
  };
}
