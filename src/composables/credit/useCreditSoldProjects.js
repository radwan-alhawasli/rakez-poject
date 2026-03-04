import { ref } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useCreditSoldProjects() {
  const isLoading = ref(false);
  const soldProjects = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const { formatCurrency } = useFormatters();

  const loadSoldProjects = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getSoldProjects({
        page: currentPage.value,
        per_page: perPage.value,
      });
      soldProjects.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? soldProjects.value.length;
    } catch (error) {
      logger.error('Error loading sold projects:', error);
      soldProjects.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const viewSoldProjectDetail = project => {
    logger.info('View sold project:', project);
  };

  const handlePageChange = page => {
    currentPage.value = page;
    loadSoldProjects();
  };

  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadSoldProjects();
  };

  return {
    isLoading,
    soldProjects,
    currentPage,
    perPage,
    totalItems,
    formatCurrency,
    loadSoldProjects,
    viewSoldProjectDetail,
    handlePageChange,
    handlePerPageChange,
  };
}
