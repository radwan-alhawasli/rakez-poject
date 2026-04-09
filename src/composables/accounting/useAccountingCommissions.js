import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { getStatusClass } from '@/utils/statusHelpers';

export function useAccountingCommissions() {
  const isLoading = ref(false);
  const commissions = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showCommissionModal = ref(false);
  const selectedCommission = ref(null);
  const isSavingCommission = ref(false);

  const loadCommissions = async () => {
    isLoading.value = true;
    try {
      const data = await accountingService.getCommissions({
        page: currentPage.value,
        per_page: perPage.value,
      });
      commissions.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? commissions.value.length;
    } catch (error) {
      logger.error('Error loading commissions:', error);
      commissions.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const viewCommissionDetail = (commission) => {
    selectedCommission.value = commission;
    showCommissionModal.value = true;
  };

  const handleCommissionUpdate = async (data) => {
    isSavingCommission.value = true;
    try {
      if (data.action === 'update') await accountingService.updateDistributions(selectedCommission.value.id, data);
      else if (data.action === 'approve') await accountingService.approveDistribution(selectedCommission.value.id, data.distributionId);
      else if (data.action === 'reject') await accountingService.rejectDistribution(selectedCommission.value.id, data.distributionId, data);
      else if (data.action === 'confirm')
        await accountingService.confirmPayment(selectedCommission.value.id, data.distributionId);
      toast.success('تم تحديث العمولة بنجاح');
      showCommissionModal.value = false;
      loadCommissions();
    } catch (error) {
      logger.error('Error updating commission:', error);
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء تحديث العمولة'));
    } finally {
      isSavingCommission.value = false;
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    loadCommissions();
  };

  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadCommissions();
  };

  const { formatCurrency } = useFormatters();


  return {
    isLoading,
    commissions,
    currentPage,
    perPage,
    totalItems,
    showCommissionModal,
    selectedCommission,
    isSavingCommission,
    loadCommissions,
    viewCommissionDetail,
    handleCommissionUpdate,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
    getStatusClass,
  };
}
