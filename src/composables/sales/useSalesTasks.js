import { ref, reactive, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import logger from '@/utils/logger';

export function useSalesTasks() {
  const { hasPermission } = usePermissions();

  const marketingTasks = shallowRef([]);
  const taskProjectOptions = shallowRef([]);
  const isLoadingTasks = ref(false);
  const showCreateTaskModal = ref(false);
  const taskForm = reactive({
    contract_id: '',
    task_name: '',
    marketer_id: '',
    participating_marketers_count: 1,
  });

  const loadTaskProjectOptions = async () => {
    try {
      const list = await salesService.getTaskProjects();
      taskProjectOptions.value = (Array.isArray(list) ? list : []).map(p => ({
        ...p,
        id: p.contract_id ?? p.id,
        contract_id: p.contract_id ?? p.id,
        project_name:
          p.project_name ?? p.name ?? p.contract_name ?? `مشروع #${p.contract_id ?? p.id ?? ''}`,
      }));
    } catch (error) {
      logger.error('Error loading task project options:', error);
      taskProjectOptions.value = [];
    }
  };

  const loadTasks = async () => {
    isLoadingTasks.value = true;
    try {
      await loadTaskProjectOptions();
      const projects = taskProjectOptions.value.length
        ? taskProjectOptions.value
        : await salesService.getTaskProjects();
      const projectList = Array.isArray(projects) ? projects : [];
      const allTasks = [];
      for (const project of projectList) {
        const projectId = project.contract_id ?? project.id;
        if (projectId == null || projectId === '') continue;
        const tasks = await salesService.getProjectTasks(projectId);
        const projectName =
          project.project_name ?? project.name ?? project.contract_name ?? `مشروع #${projectId}`;
        const normalized = (Array.isArray(tasks) ? tasks : []).map(t => ({
          id: t.id ?? t.task_id,
          task_name: t.task_name ?? t.name ?? t.title ?? '—',
          status: t.status ?? t.task_status ?? 'pending',
          contract_id: t.contract_id ?? t.project_id ?? projectId,
          project_name: t.project_name ?? projectName,
          marketer_name: t.marketer_name ?? t.assignee_name ?? t.user_name ?? '—',
          participating_marketers_count:
            t.participating_marketers_count ?? t.participants_count ?? 0,
        }));
        allTasks.push(...normalized);
      }
      marketingTasks.value = allTasks;
    } catch (error) {
      logger.error('Error loading tasks:', error);
      marketingTasks.value = [];
    } finally {
      isLoadingTasks.value = false;
    }
  };

  const getTaskStatusText = status => {
    const statusMap = {
      pending: 'معلقة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
    };
    return statusMap[status] || status;
  };

  const openCreateTaskModal = async (teamMembers, loadTeamMembers) => {
    if (teamMembers.value.length === 0) await loadTeamMembers();
    if (taskProjectOptions.value.length === 0) await loadTaskProjectOptions();
    showCreateTaskModal.value = true;
  };

  const createTask = async () => {
    if (!hasPermission('sales.tasks.create_for_marketing')) {
      notificationService.addNotification('غير مصرح لك بإنشاء مهام التسويق', 'warning');
      return;
    }
    try {
      await salesService.createMarketingTask(taskForm);
      notificationService.addNotification('تم إنشاء المهمة بنجاح', 'success');
      showCreateTaskModal.value = false;
      Object.assign(taskForm, {
        contract_id: '',
        task_name: '',
        marketer_id: '',
        participating_marketers_count: 1,
      });
      await loadTasks();
    } catch (error) {
      logger.error('Error creating task:', error);
      notificationService.addNotification('حدث خطأ أثناء إنشاء المهمة', 'error');
    }
  };

  const updateTask = async (taskId, status) => {
    if (!hasPermission('sales.tasks.manage')) {
      notificationService.addNotification('غير مصرح لك بتحديث حالة المهام', 'warning');
      return;
    }
    try {
      await salesService.updateTaskStatus(taskId, { status });
      notificationService.addNotification('تم تحديث حالة المهمة', 'success');
      loadTasks();
    } catch (error) {
      logger.error('Error updating task:', error);
      notificationService.addNotification('حدث خطأ أثناء تحديث المهمة', 'error');
    }
  };

  return {
    marketingTasks,
    taskProjectOptions,
    isLoadingTasks,
    showCreateTaskModal,
    taskForm,
    loadTasks,
    getTaskStatusText,
    openCreateTaskModal,
    createTask,
    updateTask,
    hasPermission,
  };
}
