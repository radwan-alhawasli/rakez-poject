import { computed, ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingDeposits() {
  const isLoading = ref(false);
  const deposits = ref([]);
  const depositsSubTab = ref('manage');
  const isGeneratingClaimFile = ref(false);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);
  const projectFilter = ref('');

  const showDepositModal = ref(false);
  const selectedDeposit = ref(null);
  const isSavingDeposit = ref(false);

  const loadDeposits = async () => {
    isLoading.value = true;
    try {
      const data = await accountingService.getPendingDeposits({
        page: currentPage.value,
        per_page: perPage.value,
      });
      deposits.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? deposits.value.length;
    } catch (error) {
      logger.error('Error loading deposits:', error);
      deposits.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const loadDepositsFollowUp = async () => {
    isLoading.value = true;
    try {
      const data = await accountingService.getDepositsFollowUp({
        page: currentPage.value,
        per_page: perPage.value,
      });
      const followUpItems = data?.items ?? (Array.isArray(data) ? data : []);
      deposits.value = followUpItems.filter(
        deposit => deposit.commission_source === 'owner' && deposit.unit_emptied !== false
      );
      totalItems.value = deposits.value.length;
    } catch (error) {
      logger.error('Error loading deposits follow-up:', error);
      deposits.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const setDepositsSubTab = (subTab) => {
    depositsSubTab.value = subTab;
    currentPage.value = 1;
    if (subTab === 'manage') loadDeposits();
    else loadDepositsFollowUp();
  };

  const generateClaimFile = async (deposit) => {
    const reservationId = deposit.reservation_id || deposit.id;
    if (!reservationId) { toast.warning('رقم الحجز غير متوفر'); return; }
    isGeneratingClaimFile.value = true;
    try {
      await accountingService.generateClaimFile(reservationId);
      toast.success('تم إصدار ملف المطالبة بنجاح');
      loadDepositsFollowUp();
    } catch (error) {
      logger.error('Error generating claim file:', error);
      toast.error('حدث خطأ أثناء إصدار ملف المطالبة');
    } finally {
      isGeneratingClaimFile.value = false;
    }
  };

  const confirmCommissionReceived = async (deposit) => {
    const reservationId = deposit.reservation_id || deposit.id;
    if (!reservationId) { toast.warning('رقم الحجز غير متوفر'); return; }
    try {
      await accountingService.confirmCommissionReceived(reservationId);
      toast.success('تم تأكيد وصول العمولة بنجاح');
      loadDepositsFollowUp();
    } catch (error) {
      logger.error('Error confirming commission received:', error);
      toast.error('حدث خطأ أثناء تأكيد وصول العمولة');
    }
  };

  const confirmDeposit = (deposit) => {
    selectedDeposit.value = deposit;
    showDepositModal.value = true;
  };

  const processRefund = (deposit) => {
    selectedDeposit.value = deposit;
    showDepositModal.value = true;
  };

  const handleDepositSubmit = async (data) => {
    isSavingDeposit.value = true;
    try {
      if (data.action === 'confirm') { await accountingService.confirmDeposit(selectedDeposit.value.id); toast.success('تم تأكيد الوديعة بنجاح'); }
      else if (data.action === 'refund') { await accountingService.processRefund(selectedDeposit.value.id); toast.success('تم معالجة الاسترداد بنجاح'); }
      showDepositModal.value = false;
      if (depositsSubTab.value === 'manage') loadDeposits(); else loadDepositsFollowUp();
    } catch (error) {
      logger.error('Error processing deposit:', error);
      toast.error('حدث خطأ أثناء معالجة الوديعة');
    } finally {
      isSavingDeposit.value = false;
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    if (depositsSubTab.value === 'manage') loadDeposits();
    else loadDepositsFollowUp();
  };

  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    if (depositsSubTab.value === 'manage') loadDeposits();
    else loadDepositsFollowUp();
  };

  const { formatCurrency, formatDate: _fmtDate } = useFormatters();
  const formatDate = (dateStr) => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));
  const normalizedProjectFilter = computed(() => projectFilter.value.trim().toLowerCase());
  const filteredDeposits = computed(() => {
    if (!normalizedProjectFilter.value) return deposits.value;
    return deposits.value.filter((deposit) =>
      String(deposit.project_name || '')
        .toLowerCase()
        .includes(normalizedProjectFilter.value)
    );
  });

  return {
    isLoading,
    deposits,
    filteredDeposits,
    depositsSubTab,
    isGeneratingClaimFile,
    currentPage,
    perPage,
    totalItems,
    projectFilter,
    showDepositModal,
    selectedDeposit,
    isSavingDeposit,
    loadDeposits,
    loadDepositsFollowUp,
    setDepositsSubTab,
    generateClaimFile,
    confirmCommissionReceived,
    confirmDeposit,
    processRefund,
    handleDepositSubmit,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
    formatDate,
  };
}
