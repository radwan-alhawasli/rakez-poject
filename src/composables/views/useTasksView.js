import { ref, reactive, computed, onMounted, watch } from 'vue';
import taskService from '@/services/taskService';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { localeOpts } from '@/utils/intlLatn';

export function useTasksView() {
  const currentUser = authService.getCurrentUser();

  const activeTab = ref('assigned');

  /** @type {import('vue').Ref<any[]>} */
  const assignedTasks = ref([]);
  /** @type {import('vue').Ref<any[]>} */
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

  /** @type {import('vue').Ref<{key: string, label: string}[]>} */
  const taskSections = ref([]);
  const isLoading = ref(false);
  /** @type {import('vue').Ref<string|null>} */
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
    /** @type {number|null} */
    taskId: null,
    reason: '',
  });

  /** @type {import('vue').Ref<any[]>} */
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

  /** @param {string} tab */
  const switchTab = tab => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    filterStatus.value = '';
    loadCurrentTab(1);
  };

  /** @param {string} sectionKey */
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
      const normalized = (list || []).map(s => {
        const item = /** @type {any} */ (s);
        return {
          key: item.value ?? item.key,
          label: item.label ?? item.value ?? item.key,
        };
      });
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

      /** @type {any} */
      const params = {
        page,
        per_page: itemsPerPage.value,
      };
      if (filterStatus.value) params.status = filterStatus.value;

      const data = await taskService.getMyTasks(params);
      assignedTasks.value = (/** @type {any} */ (data)).items || [];
      assignedTotal.value = (/** @type {any} */ (data)).total || 0;
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

      /** @type {any} */
      const params = {
        page,
        per_page: itemsPerPage.value,
      };
      if (filterStatus.value) params.status = filterStatus.value;

      const data = await taskService.getRequestedTasks(params);
      requestedTasks.value = (/** @type {any} */ (data)).items || [];
      requestedTotal.value = (/** @type {any} */ (data)).total || 0;
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
      assignedTotal.value = (/** @type {any} */ (assignedData)).total || 0;
      requestedTotal.value = (/** @type {any} */ (requestedData)).total || 0;
    } catch {
      void 0;
    }
  };

  /** @param {string} status */
  const getStatusLabel = status => {
    /** @type {Record<string, string>} */
    const map = {
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
      could_not_complete: 'لم تكتمل',
      pending: 'قيد الانتظار',
    };
    return map[status] || status;
  };

  /** @param {string} sectionKey */
  const getSectionLabel = sectionKey => {
    if (!sectionKey) return '';
    const section = taskSections.value.find(s => s.key === sectionKey);
    if (section) return section.label;
    const fallback = TASK_SECTIONS_FALLBACK.find(s => s.key === sectionKey);
    return fallback ? fallback.label : sectionKey;
  };

  /**
   * تواريخ بالعربية (تقويم ميلادي) — متوافق مع واجهة عربية أولاً
   * @param {string} dateString
   */
  const formatDate = dateString => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(
      'ar-SA',
      localeOpts({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    );
  };

  /**
   * لسمة <time datetime="..."> (ISO)
   * @param {string} dateString
   */
  const taskDateAttr = dateString => {
    if (!dateString) return undefined;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  /** @param {string} localValue - value from input[type=datetime-local] */
  const formatDueAtForApi = localValue => {
    if (!localValue) return null;
    const s = String(localValue).trim().replace('T', ' ');
    const m = s.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?::(\d{2}))?/);
    if (m) {
      const [, datePart, hm, sec] = m;
      return sec !== undefined ? `${datePart} ${hm}:${sec}` : `${datePart} ${hm}:00`;
    }
    if (/\d{2}:\d{2}:\d{2}/.test(s)) return s;
    return `${s}:00`;
  };

  const createTask = async () => {
    try {
      isCreating.value = true;
      const due_at_formatted = formatDueAtForApi(taskForm.due_at);

      const assignedId = Number.parseInt(String(taskForm.assigned_to), 10);
      /** @type {any} */
      const payload = {
        task_name: taskForm.title.trim(),
        section: taskForm.section_key,
        assigned_to: Number.isFinite(assignedId) ? assignedId : taskForm.assigned_to,
        due_at: due_at_formatted,
      };
      const desc = taskForm.description?.trim();
      if (desc) payload.description = desc;

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
      notificationService.addNotification(
        getApiErrorMessage(e, 'تعذر حفظ المهمة. تحقق من البيانات والمحاولة مرة أخرى.'),
        'error'
      );
    } finally {
      isCreating.value = false;
    }
  };

  /**
   * @param {number} taskId
   * @param {string} status
   * @param {string|null} [reason=null]
   */
  const updateStatus = async (taskId, status, reason = null) => {
    try {
      /** @type {any} */
      const data = { status };
      if (reason) {
        data.cannot_complete_reason = reason;
      }

      await taskService.updateTaskStatus(taskId, data);
      notificationService.addNotification('تم تحديث حالة المهمة', 'success');
      loadCurrentTab(currentPage.value);
    } catch (e) {
      logger.error(`Failed to update task ${taskId}`, e);
      notificationService.addNotification(
        getApiErrorMessage(e, 'تعذر تحديث حالة المهمة. حاول مرة أخرى.'),
        'error'
      );
      throw e;
    }
  };

  /** @param {number} taskId */
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
    if (!reasonForm.reason?.trim()) {
      notificationService.addNotification('يرجى كتابة سبب عدم الاكتمال', 'warning');
      return;
    }
    try {
      await updateStatus(
        /** @type {number} */ (reasonForm.taskId),
        'could_not_complete',
        reasonForm.reason
      );
      closeReasonModal();
    } catch {
      // notification handled in updateStatus
    }
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
    taskDateAttr,
    createTask,
    updateStatus,
    openReasonModal,
    closeReasonModal,
    submitReasonModal,
  };
}
