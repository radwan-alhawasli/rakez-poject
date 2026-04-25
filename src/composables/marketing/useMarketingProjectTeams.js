import { ref } from 'vue';
import teamService from '@/services/teamService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/**
 * Assign/remove marketing (PM) teams on a contract using the same IDs as project details (`details.id`).
 * @param {import('vue').Ref<object|null>} projectDetailsRef
 * @param {() => Promise<void>} reloadProject
 */
export function useMarketingProjectTeams(projectDetailsRef, reloadProject) {
  /** @type {import('vue').Ref<any[]>} */
  const availableTeams = ref([]);
  const selectedTeamIdToAdd = ref('');
  const isTeamActionLoading = ref(false);
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    /** @type {(() => Promise<void>)|null} */
    resolve: null,
  });

  const loadAvailableTeams = async () => {
    try {
      const allTeams = await teamService.getTeams();
      availableTeams.value = allTeams;
    } catch (error) {
      logger.error('Error loading teams:', error);
    }
  };

  const assignTeamToProject = async () => {
    if (!selectedTeamIdToAdd.value || !projectDetailsRef.value) return;
    const projectId = /** @type {any} */ (projectDetailsRef.value).id;
    isTeamActionLoading.value = true;
    try {
      await teamService.addTeamsToContract(projectId, [selectedTeamIdToAdd.value]);
      notificationService.addNotification('تم إضافة الفريق للمشروع بنجاح', 'success');
      selectedTeamIdToAdd.value = '';
      await reloadProject();
    } catch (error) {
      logger.error('Error adding team:', error);
      toast.error('تعذر إضافة الفريق');
    } finally {
      isTeamActionLoading.value = false;
    }
  };

  /** @param {any} team */
  const removeTeamFromProject = team => {
    const details = projectDetailsRef.value;
    if (!details) return;
    const projectId = /** @type {any} */ (details).id;
    const teamId = team.id;
    confirmModalConfig.value = {
      title: 'إزالة الفريق',
      message: 'هل أنت متأكد من إزالة هذا الفريق؟',
      type: 'danger',
      confirmText: 'إزالة',
      resolve: async () => {
        isTeamActionLoading.value = true;
        try {
          await teamService.removeTeamsFromContract(projectId, [teamId]);
          notificationService.addNotification('تم إزالة الفريق بنجاح', 'success');
          await reloadProject();
        } catch (error) {
          logger.error('Error removing team:', error);
          toast.error('تعذر إزالة الفريق');
        } finally {
          isTeamActionLoading.value = false;
        }
      },
    };
    showConfirmModal.value = true;
  };

  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  return {
    availableTeams,
    selectedTeamIdToAdd,
    isTeamActionLoading,
    showConfirmModal,
    confirmModalConfig,
    loadAvailableTeams,
    assignTeamToProject,
    removeTeamFromProject,
    onConfirmModalConfirm,
  };
}
