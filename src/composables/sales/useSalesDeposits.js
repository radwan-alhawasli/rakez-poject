import { ref } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesDeposits() {
  const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

  const depositsManagement = ref([]);
  const depositsManagementTotal = ref(0);
  const depositsFollowUp = ref([]);
  const depositsFollowUpTotal = ref(0);
  const depositsSubTab = ref('management');
  const isLoadingDepositsManagement = ref(false);
  const isLoadingDepositsFollowUp = ref(false);

  const loadDepositsManagement = async () => {
    isLoadingDepositsManagement.value = true;
    try {
      const { items, total } = await salesService.getDepositsManagement();
      depositsManagement.value = items;
      depositsManagementTotal.value = total;
    } catch (e) {
      logger.error('loadDepositsManagement', e);
    } finally {
      isLoadingDepositsManagement.value = false;
    }
  };

  const loadDepositsFollowUp = async () => {
    isLoadingDepositsFollowUp.value = true;
    try {
      const { items, total } = await salesService.getDepositsFollowUp();
      depositsFollowUp.value = items;
      depositsFollowUpTotal.value = total;
    } catch (e) {
      logger.error('loadDepositsFollowUp', e);
    } finally {
      isLoadingDepositsFollowUp.value = false;
    }
  };

  const switchSubTab = async (tab) => {
    depositsSubTab.value = tab;
    if (tab === 'management' && depositsManagement.value.length === 0) {
      await loadDepositsManagement();
    } else if (tab === 'follow-up' && depositsFollowUp.value.length === 0) {
      await loadDepositsFollowUp();
    }
  };

  return {
    depositsManagement,
    depositsManagementTotal,
    depositsFollowUp,
    depositsFollowUpTotal,
    depositsSubTab,
    isLoadingDepositsManagement,
    isLoadingDepositsFollowUp,
    loadDepositsManagement,
    loadDepositsFollowUp,
    switchSubTab,
    formatCurrency,
    formatDate,
  };
}
