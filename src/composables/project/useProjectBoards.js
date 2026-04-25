import { ref, reactive } from 'vue';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import boardsDepartmentService from '@/services/boardsDepartmentService';

/**
 * @param {any} projectId
 * @param {string} [projectName]
 */
export function useProjectBoards(projectId, projectName) {
  const isLoading = ref(false);
  const boardsTabState = ref('pending');
  const boardsFormData = reactive({ projectName: projectName || '' });
  const isBoardSaving = ref(false);
  const boardExistsOnServer = ref(false);

  const loadBoards = async () => {
    isLoading.value = true;
    try {
      if (!boardsFormData.projectName && projectName) {
        boardsFormData.projectName = projectName;
      }

      if (projectId) {
        const data = await boardsDepartmentService.getByContractId(projectId);
        if (data && Object.keys(data).length > 0) {
          Object.assign(boardsFormData, data);
          boardsTabState.value = 'completed';
          boardExistsOnServer.value = true;
          localStorage.setItem(`board_${projectId}`, JSON.stringify(data));
          return;
        }
      }

      const savedBoard = localStorage.getItem(`board_${projectId}`);
      if (savedBoard) {
        const data = JSON.parse(savedBoard);
        Object.assign(boardsFormData, data);
        boardsTabState.value = 'completed';
      } else {
        boardsTabState.value = 'pending';
      }
    } catch (e) {
      logger.error('Error loading boards from API, falling back to localStorage:', e);
      const savedBoard = localStorage.getItem(`board_${projectId}`);
      if (savedBoard) {
        const data = JSON.parse(savedBoard);
        Object.assign(boardsFormData, data);
        boardsTabState.value = 'completed';
      } else {
        boardsTabState.value = 'pending';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const saveBoard = async () => {
    if (!projectId) return;
    isBoardSaving.value = true;
    try {
      const boardData = { ...boardsFormData };

      if (boardExistsOnServer.value) {
        await boardsDepartmentService.update(projectId, boardData);
      } else {
        await boardsDepartmentService.store(projectId, boardData);
        boardExistsOnServer.value = true;
      }

      localStorage.setItem(`board_${projectId}`, JSON.stringify(boardData));
      boardsTabState.value = 'completed';
      toast.success('تم تأكيد إضافة اللوحات بنجاح');
    } catch (error) {
      logger.error('Error saving board to API, saving to localStorage:', error);
      try {
        const boardData = {
          ...boardsFormData,
          projectId,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(`board_${projectId}`, JSON.stringify(boardData));
        boardsTabState.value = 'completed';
        toast.warning('تم الحفظ محلياً، سيتم المزامنة لاحقاً');
      } catch (localError) {
        logger.error('Error saving board to localStorage:', localError);
        toast.error('حدث خطأ أثناء حفظ اللوحات');
      }
    } finally {
      isBoardSaving.value = false;
    }
  };

  return {
    isLoading,
    boardsTabState,
    boardsFormData,
    isBoardSaving,
    loadBoards,
    saveBoard,
  };
}
