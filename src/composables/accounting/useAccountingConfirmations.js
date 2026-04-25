import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingConfirmations() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const confirmations = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  /** @type {import('vue').Ref<any>} */
  const selectedReservationId = ref(null);

  const loadConfirmations = async () => {
    isLoading.value = true;
    try {
      const data = await accountingService.getConfirmationHistory({
        page: currentPage.value,
        per_page: perPage.value,
      });
      confirmations.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? confirmations.value.length;
    } catch (error) {
      logger.error('Error loading confirmations:', error);
      confirmations.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} confirmation */
  const viewConfirmationHistory = (confirmation) => {
    selectedReservationId.value = confirmation.booking_number ?? confirmation.reservation_id;
    showConfirmationHistoryModal.value = true;
  };

  /** @param {number} page */
  const handlePageChange = (page) => {
    currentPage.value = page;
    loadConfirmations();
  };

  /** @param {number} val */
  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadConfirmations();
  };

  const { formatCurrency, formatDate: _fmtDate } = useFormatters();
  /** @param {string} dateStr */
  const formatDate = (dateStr) => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));

  return {
    isLoading,
    confirmations,
    currentPage,
    perPage,
    totalItems,
    showConfirmationHistoryModal,
    selectedReservationId,
    loadConfirmations,
    viewConfirmationHistory,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
    formatDate,
  };
}
