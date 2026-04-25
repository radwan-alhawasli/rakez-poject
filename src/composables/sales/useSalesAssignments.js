import { ref, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesAssignments() {
  const { formatDate } = useFormatters();

  /** @type {import('vue').ShallowRef<any[]>} */
  const myAssignments = shallowRef([]);
  const isLoadingAssignments = ref(false);

  const loadAssignments = async () => {
    isLoadingAssignments.value = true;
    try {
      const result = await salesService.getMyAssignments({ per_page: 30, page: 1 });
      myAssignments.value = result?.items ?? (Array.isArray(result) ? result : []);
    } catch (error) {
      logger.error('Error loading assignments:', error);
      myAssignments.value = [];
    } finally {
      isLoadingAssignments.value = false;
    }
  };

  return {
    myAssignments,
    isLoadingAssignments,
    loadAssignments,
    formatDate,
  };
}
