import { computed, ref } from 'vue';
import accountingService from '@/services/accountingService';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { MSG_ERROR_LOADING } from '@/constants/messages';

export function useAccountingDeposits() {
  const { run: runLoad, isLoading } = useAsyncAction({ loadingKey: 'isLoading' });
  const { run: runGenerate, isGeneratingClaimFile } = useAsyncAction({
    loadingKey: 'isGeneratingClaimFile',
  });
  const { run: runSave, isSavingDeposit } = useAsyncAction({ loadingKey: 'isSavingDeposit' });
  const { run: runConfirm } = useAsyncAction({ loadingKey: 'isConfirmingCommission' });

  const deposits = ref([]);
  const depositsSubTab = ref('manage');
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);
  const projectFilter = ref('');

  const showDepositModal = ref(false);
  const selectedDeposit = ref(null);

  const loadDeposits = async () => {
    const data = await runLoad(
      () =>
        accountingService.getPendingDeposits({
          page: currentPage.value,
          per_page: perPage.value,
        }),
      { errorMessage: MSG_ERROR_LOADING, showLoading: true }
    );
    if (data !== undefined) {
      deposits.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? deposits.value.length;
    } else {
      deposits.value = [];
      totalItems.value = 0;
    }
  };

  const loadDepositsFollowUp = async () => {
    const data = await runLoad(
      () =>
        accountingService.getDepositsFollowUp({
          page: currentPage.value,
          per_page: perPage.value,
        }),
      { errorMessage: MSG_ERROR_LOADING, showLoading: true }
    );
    if (data !== undefined) {
      const followUpItems = data?.items ?? (Array.isArray(data) ? data : []);
      deposits.value = followUpItems.filter(
        deposit => deposit.commission_source === 'owner' && deposit.unit_emptied !== false
      );
      totalItems.value = deposits.value.length;
    } else {
      deposits.value = [];
      totalItems.value = 0;
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
    if (!reservationId) {
      toast.warning('رقم الحجز غير متوفر');
      return;
    }
    const done = await runGenerate(
      () => accountingService.generateClaimFile(reservationId),
      {
        successMessage: 'تم إصدار ملف المطالبة بنجاح',
        errorMessage: 'حدث خطأ أثناء إصدار ملف المطالبة',
      }
    );
    if (done !== undefined) loadDepositsFollowUp();
  };

  const confirmCommissionReceived = async (deposit) => {
    const reservationId = deposit.reservation_id || deposit.id;
    if (!reservationId) {
      toast.warning('رقم الحجز غير متوفر');
      return;
    }
    const done = await runConfirm(
      () => accountingService.confirmCommissionReceived(reservationId),
      {
        successMessage: 'تم تأكيد وصول العمولة بنجاح',
        errorMessage: 'حدث خطأ أثناء تأكيد وصول العمولة',
      }
    );
    if (done !== undefined) loadDepositsFollowUp();
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
    const successMsg =
      data.action === 'confirm' ? 'تم تأكيد الوديعة بنجاح' : 'تم معالجة الاسترداد بنجاح';
    const apiCall =
      data.action === 'confirm'
        ? () => accountingService.confirmDeposit(selectedDeposit.value.id)
        : () => accountingService.processRefund(selectedDeposit.value.id);
    const done = await runSave(apiCall, {
      successMessage: successMsg,
      errorMessage: 'حدث خطأ أثناء معالجة الوديعة',
    });
    if (done !== undefined) {
      showDepositModal.value = false;
      if (depositsSubTab.value === 'manage') loadDeposits();
      else loadDepositsFollowUp();
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
  const normalizedProjectFilter = computed(() =>
    String(projectFilter.value ?? '').trim().toLowerCase()
  );
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
