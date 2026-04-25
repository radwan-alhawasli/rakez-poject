import { ref } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { getStatusClass } from '@/utils/statusHelpers';

export function useCreditTitleTransfer() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const titleTransfers = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showTitleTransferModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedTransfer = ref(null);
  const isSavingTransfer = ref(false);

  const { formatDate: _fmtDate } = useFormatters();
  /** @param {any} dateStr */
  const formatDate = dateStr => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));


  const loadTitleTransfers = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getPendingTitleTransfers();
      titleTransfers.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? titleTransfers.value.length;
    } catch (error) {
      logger.error('Error loading title transfers:', error);
      titleTransfers.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const openTitleTransferForm = () => {
    selectedTransfer.value = null;
    showTitleTransferModal.value = true;
  };

  /** @param {any} transfer */
  const completeTitleTransfer = transfer => {
    selectedTransfer.value = transfer;
    showTitleTransferModal.value = true;
  };

  /** @param {any} data */
  const handleTitleTransferSubmit = async data => {
    isSavingTransfer.value = true;
    try {
      if (selectedTransfer.value) {
        await creditService.completeTitleTransfer((/** @type {any} */ (selectedTransfer.value)).id, data);
        toast.success('تم إكمال نقل الملكية بنجاح');
      } else {
        await creditService.createTitleTransfer(data);
        toast.success('تم إنشاء طلب نقل الملكية بنجاح');
      }
      showTitleTransferModal.value = false;
      loadTitleTransfers();
    } catch (error) {
      logger.error('Error saving title transfer:', error);
      toast.error('حدث خطأ أثناء حفظ بيانات نقل الملكية');
    } finally {
      isSavingTransfer.value = false;
    }
  };

  /** @param {any} page */
  const handlePageChange = page => {
    currentPage.value = page;
    loadTitleTransfers();
  };

  /** @param {any} val */
  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadTitleTransfers();
  };

  return {
    isLoading,
    titleTransfers,
    currentPage,
    perPage,
    totalItems,
    showTitleTransferModal,
    selectedTransfer,
    isSavingTransfer,
    formatDate,
    getStatusClass,
    loadTitleTransfers,
    openTitleTransferForm,
    completeTitleTransfer,
    handleTitleTransferSubmit,
    handlePageChange,
    handlePerPageChange,
  };
}
