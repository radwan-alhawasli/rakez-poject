import { ref, reactive } from 'vue';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useProjectBoards(projectId, projectName) {
  const isLoading = ref(false);
  const boardsTabState = ref('pending');
  const boardsFormData = reactive({ projectName: projectName || '' });
  const isBoardSaving = ref(false);

  const loadBoards = () => {
    isLoading.value = true;
    try {
      if (!boardsFormData.projectName && projectName) {
        boardsFormData.projectName = projectName;
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
      logger.error('Error loading boards:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const saveBoard = async () => {
    if (!projectId) return;
    isBoardSaving.value = true;
    try {
      const boardData = {
        ...boardsFormData,
        projectId,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`board_${projectId}`, JSON.stringify(boardData));
      boardsTabState.value = 'completed';
      toast.success('تم تأكيد إضافة اللوحات بنجاح');
    } catch (error) {
      logger.error('Error saving board:', error);
      toast.error('حدث خطأ أثناء حفظ اللوحات');
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
