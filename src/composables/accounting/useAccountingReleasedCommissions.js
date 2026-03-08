import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingReleasedCommissions() {
  const isLoading = ref(false);
  const items = ref([]);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const perPage = ref(25);
  const fromDate = ref('');
  const toDate = ref('');

  const { formatCurrency, formatDate } = useFormatters();

  const loadReleasedCommissions = async () => {
    isLoading.value = true;
    try {
      const params = {
        page: currentPage.value,
        per_page: perPage.value,
      };
      if (fromDate.value) params.from_date = fromDate.value;
      if (toDate.value) params.to_date = toDate.value;
      const data = await accountingService.getReleasedCommissions(params);
      items.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? items.value.length;
    } catch (error) {
      logger.error('Error loading released commissions:', error);
      items.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    loadReleasedCommissions();
  };

  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadReleasedCommissions();
  };

  const applyDateFilter = () => {
    currentPage.value = 1;
    loadReleasedCommissions();
  };

  return {
    isLoading,
    items,
    totalItems,
    currentPage,
    perPage,
    fromDate,
    toDate,
    loadReleasedCommissions,
    handlePageChange,
    handlePerPageChange,
    applyDateFilter,
    formatCurrency,
    formatDate,
  };
}
