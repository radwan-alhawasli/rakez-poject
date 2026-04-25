import { ref, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useMarketingTasks() {
  /** @type {import('vue').Ref<any[]>} */
  const tasks = ref([]);
  const isLoadingTasks = ref(false);
  /** @type {import('vue').Ref<Set<any>>} */
  const knownTaskIds = ref(new Set());
  const marketingTasks = computed(() => tasks.value);

  const loadTasks = async () => {
    isLoadingTasks.value = true;
    try {
      const data = await marketingService.getTasks();
      tasks.value = data?.items ?? (Array.isArray(data) ? data : []);
      const currentIds = knownTaskIds.value;
      const newTask = tasks.value.find(
        (/** @type {any} */ t) =>
          !currentIds.has(t.id) &&
          ['new', 'pending'].includes(String(t.status || '').toLowerCase())
      );
      if (newTask) {
        notificationService.addNotification('تمت إضافة مهمة يومية جديدة', 'info');
      }
      knownTaskIds.value = new Set(tasks.value.map((/** @type {any} */ t) => t.id));
    } catch (error) {
      logger.error('Error loading tasks:', error);
      tasks.value = [];
    } finally {
      isLoadingTasks.value = false;
    }
  };

  /** @param {any} task */
  const toggleTaskStatus = async task => {
    const current = normalizeTaskStatus(task.status);
    const newStatus = current === 'completed' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'in_progress';
    try {
      await marketingService.updateTaskStatus(task.id, newStatus);
      task.status = newStatus;
      notificationService.addNotification('تم تحديث حالة المهمة بنجاح', 'success');
    } catch (error) {
      logger.error('Error updating task status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };

  /** @param {any} status */
  const normalizeTaskStatus = status => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed' || s === 'done') return 'completed';
    if (s === 'in-progress' || s === 'in_progress') return 'in_progress';
    if (s === 'new' || s === 'pending') return 'pending';
    return 'pending';
  };

  /** @param {any} status */
  const getTaskStatusClass = status => {
    const statusMap = { completed: 'task-completed', in_progress: 'task-in-progress', pending: 'task-pending' };
    return statusMap[normalizeTaskStatus(status)] || 'task-pending';
  };

  /** @param {any} status */
  const getTaskStatusText = status => {
    const normalized = normalizeTaskStatus(status);
    const textMap = { completed: 'مكتملة', in_progress: 'قيد التنفيذ', pending: 'معلقة' };
    return textMap[normalized] || 'غير محدد';
  };

  /** @param {any} dateString */
  const formatDate = dateString => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  onMounted(() => {
    loadTasks();
  });

  return {
    marketingTasks,
    isLoadingTasks,
    toggleTaskStatus,
    normalizeTaskStatus,
    getTaskStatusClass,
    getTaskStatusText,
    formatDate,
    loadTasks,
  };
}
