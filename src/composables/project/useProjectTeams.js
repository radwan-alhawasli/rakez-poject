import { ref } from 'vue';
import teamService from '@/services/teamService';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { MSG_ERROR_LOADING } from '@/constants/messages';

/** @param {any} projectId */
export function useProjectTeams(projectId) {
  const { run: runLoad, assignedTeamsLoading } = useAsyncAction({
    loadingKey: 'assignedTeamsLoading',
  });
  const { run: runTeamAction, isTeamActionLoading } = useAsyncAction({
    loadingKey: 'isTeamActionLoading',
  });

  /** @type {import('vue').Ref<any[]>} */
  const assignedTeams = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const availableTeams = ref([]);
  const selectedTeamId = ref('');

  const showConfirmModal = ref(false);
  /** @type {import('vue').Ref<{title: string, message: string, type: string, confirmText: string, resolve: (() => Promise<void>) | null}>} */
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    /** @type {any} */
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadTeams = async () => {
    if (!projectId) return;
    const assignedData = await runLoad(
      () => teamService.getContractTeams(projectId),
      { errorMessage: MSG_ERROR_LOADING, showLoading: true }
    );
    if (assignedData !== undefined) {
      assignedTeams.value = Array.isArray(assignedData) ? assignedData : assignedData.data || [];
      const allTeams = await teamService.getTeams();
      /** @type {any[]} */
      const teamsList = Array.isArray(allTeams) ? allTeams : [];
      const assignedIds = new Set(assignedTeams.value.map(t => t.id));
      availableTeams.value = teamsList.filter(t => !assignedIds.has(t.id));
    }
  };

  const assignTeam = async () => {
    if (!selectedTeamId.value) return;
    const done = await runTeamAction(
      () => teamService.addTeamsToContract(projectId, [selectedTeamId.value]),
      {
        successMessage: 'تم تعيين الفريق بنجاح',
        errorMessage: 'حدث خطأ أثناء تعيين الفريق',
      }
    );
    if (done !== undefined) {
      selectedTeamId.value = '';
      loadTeams();
    }
  };

  /** @param {any} team */
  const removeTeam = (team) => {
    confirmModalConfig.value = {
      title: 'إزالة الفريق',
      message: `هل أنت متأكد من إزالة الفريق "${team.name}" من المشروع؟`,
      type: 'danger',
      confirmText: 'إزالة',
      resolve: async () => {
        const done = await runTeamAction(
          () => teamService.removeTeamsFromContract(projectId, [team.id]),
          {
            successMessage: 'تم إزالة الفريق بنجاح',
            errorMessage: 'حدث خطأ أثناء إزالة الفريق',
          }
        );
        if (done !== undefined) {
          loadTeams();
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
