import { ref } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesSoldUnits() {
  const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

  /** @type {import('vue').Ref<any[]>} */
  const soldUnits = ref([]);
  const soldUnitsTotal = ref(0);
  const soldUnitsPage = ref(1);
  const soldUnitsPerPage = ref(15);
  const isLoadingSoldUnits = ref(false);
  const selectedSoldUnit = ref(null);
  /** @type {import('vue').Ref<any>} */
  const soldUnitCommission = ref(null);
  const isLoadingCommission = ref(false);

  const loadSoldUnits = async () => {
    isLoadingSoldUnits.value = true;
    try {
      const { items, total } = /** @type {any} */ (await salesService.getSoldUnits({
        page: soldUnitsPage.value,
        per_page: soldUnitsPerPage.value,
      }));
      soldUnits.value = items;
      soldUnitsTotal.value = total;
    } catch (e) {
      logger.error('loadSoldUnits', e);
    } finally {
      isLoadingSoldUnits.value = false;
    }
  };

  /** @param {any} unit */
  const viewSoldUnitCommission = async unit => {
    selectedSoldUnit.value = unit;
    soldUnitCommission.value = null;
    isLoadingCommission.value = true;
    try {
      soldUnitCommission.value = /** @type {any} */ (await salesService.getSoldUnitCommissionSummary(unit.id));
    } catch (e) {
      logger.error('viewSoldUnitCommission', e);
    } finally {
      isLoadingCommission.value = false;
    }
  };

  const clearSelectedUnit = () => {
    selectedSoldUnit.value = null;
    soldUnitCommission.value = null;
  };

  /** @param {number} page */
  const handleSoldUnitsPageChange = async page => {
    soldUnitsPage.value = page;
    await loadSoldUnits();
  };

  /** @param {number} perPage */
  const handleSoldUnitsPerPageChange = async perPage => {
    soldUnitsPerPage.value = perPage;
    soldUnitsPage.value = 1;
    await loadSoldUnits();
  };

  return {
    soldUnits,
    soldUnitsTotal,
    soldUnitsPage,
    soldUnitsPerPage,
    isLoadingSoldUnits,
    selectedSoldUnit,
    soldUnitCommission,
    isLoadingCommission,
    loadSoldUnits,
    viewSoldUnitCommission,
    clearSelectedUnit,
    handleSoldUnitsPageChange,
    handleSoldUnitsPerPageChange,
    formatCurrency,
    formatDate,
  };
}
