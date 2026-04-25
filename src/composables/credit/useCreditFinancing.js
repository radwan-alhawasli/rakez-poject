import { ref } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import { useFormatters } from '@/composables/useFormatters';
import { getStatusClass } from '@/utils/statusHelpers';

export function useCreditFinancing() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const financingList = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showFinancingModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedFinancing = ref(null);
  const isSavingFinancing = ref(false);

  const { formatCurrency } = useFormatters();

  const loadFinancing = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getFinancing({
        page: currentPage.value,
        per_page: perPage.value,
      });
      financingList.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? financingList.value.length;
    } catch (error) {
      logger.error('Error loading financing:', error);
      financingList.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} financing */
  const viewFinancingDetail = financing => {
    selectedFinancing.value = financing;
    showFinancingModal.value = true;
  };

  /** @param {any} data */
  const handleFinancingUpdate = async data => {
    isSavingFinancing.value = true;
    try {
      if (selectedFinancing.value) {
        await creditService.updateFinancing((/** @type {any} */ (selectedFinancing.value)).id, data);
        toast.success('تم تحديث بيانات التمويل بنجاح');
        showFinancingModal.value = false;
        loadFinancing();
      }
    } catch (error) {
      logger.error('Error updating financing:', error);
      showApiError(error, 'حدث خطأ أثناء تحديث بيانات التمويل');
    } finally {
      isSavingFinancing.value = false;
    }
  };

  /** @param {any} page */
  const handlePageChange = page => {
    currentPage.value = page;
    loadFinancing();
  };

  /** @param {any} val */
  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadFinancing();
  };

  return {
    isLoading,
    financingList,
    currentPage,
    perPage,
    totalItems,
    showFinancingModal,
    selectedFinancing,
    isSavingFinancing,
    formatCurrency,
    getStatusClass,
    loadFinancing,
    viewFinancingDetail,
    handleFinancingUpdate,
    handlePageChange,
    handlePerPageChange,
  };
}
