import { ref } from 'vue';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useProjectTeams(projectId) {
  const assignedTeams = ref([]);
  const availableTeams = ref([]);
  const selectedTeamId = ref('');
  const assignedTeamsLoading = ref(false);
  const isTeamActionLoading = ref(false);

  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadTeams = async () => {
    if (!projectId) return;
    assignedTeamsLoading.value = true;
    try {
      const assignedData = await teamService.getContractTeams(projectId);
      assignedTeams.value = Array.isArray(assignedData) ? assignedData : assignedData.data || [];
      const allTeams = await teamService.getTeams();
      const assignedIds = new Set(assignedTeams.value.map(t => t.id));
      availableTeams.value = allTeams.filter(t => !assignedIds.has(t.id));
    } catch (error) {
      logger.error('Error loading teams:', error);
    } finally {
      assignedTeamsLoading.value = false;
    }
  };

  const assignTeam = async () => {
    if (!selectedTeamId.value) return;
    isTeamActionLoading.value = true;
    try {
      await teamService.addTeamsToContract(projectId, [selectedTeamId.value]);
      toast.success('تم تعيين الفريق بنجاح');
      selectedTeamId.value = '';
      loadTeams();
    } catch (error) {
      logger.error('Error assigning team:', error);
      toast.error('حدث خطأ أثناء تعيين الفريق');
    } finally {
      isTeamActionLoading.value = false;
    }
  };

  const removeTeam = (team) => {
    confirmModalConfig.value = {
      title: 'إزالة الفريق',
      message: `هل أنت متأكد من إزالة الفريق "${team.name}" من المشروع؟`,
      type: 'danger',
      confirmText: 'إزالة',
      resolve: async () => {
        isTeamActionLoading.value = true;
        try {
          await teamService.removeTeamsFromContract(projectId, [team.id]);
          toast.success('تم إزالة الفريق بنجاح');
          loadTeams();
        } catch (error) {
          logger.error('Error removing team:', error);
          toast.error('حدث خطأ أثناء إزالة الفريق');
        } finally {
          isTeamActionLoading.value = false;
        }
      },
    };
    showConfirmModal.value = true;
  };

  return {
    assignedTeams,
    availableTeams,
    selectedTeamId,
    assignedTeamsLoading,
    isTeamActionLoading,
    showConfirmModal,
    confirmModalConfig,
    onConfirmModalConfirm,
    loadTeams,
    assignTeam,
    removeTeam,
  };
}
