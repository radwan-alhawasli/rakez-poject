import { ref, computed } from 'vue';
import managerService from '@/services/managerService';
import { toast } from '@/composables/useToast';
import {
  isTaskDoneStatus,
  groupTasksByMonth,
  completionPercent,
  buildTaskStatusBreakdown,
} from '@/utils/managerTasksDisplay';

export function useManagerTasks() {
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

  const doneTasksCount = computed(() => tasks.value.filter(t => isTaskDoneStatus(t.status)).length);
  const completionPercentDisplay = computed(() => completionPercent(tasks.value.length, doneTasksCount.value));
  const statusBreakdown = computed(() => buildTaskStatusBreakdown(tasks.value));

  const filteredTasks = computed(() => {
    if (!showDoneOnly.value) return tasks.value;
    return tasks.value.filter(t => isTaskDoneStatus(t.status));
  });

  const groupedFilteredTasks = computed(() => groupTasksByMonth(filteredTasks.value));

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

  return {
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
  };
}
