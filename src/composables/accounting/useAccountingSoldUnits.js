import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { mergeSoldUnitDetail } from '@/utils/accountingSoldUnitFields';

export function useAccountingSoldUnits() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const soldUnits = ref([]);
  const soldUnitDetailView = ref('list');
  /** @type {import('vue').Ref<any>} */
  const selectedSoldUnit = ref(null);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const loadSoldUnits = async () => {
    isLoading.value = true;
    try {
      const data = await accountingService.getSoldUnits({
        page: currentPage.value,
        per_page: perPage.value,
      });
      soldUnits.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? soldUnits.value.length;
    } catch (error) {
      logger.error('Error loading sold units:', error);
      soldUnits.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} unit */
  const viewSoldUnitDetail = async (unit) => {
    selectedSoldUnit.value = unit;
    soldUnitDetailView.value = 'detail';
    const reservationId = unit?.reservation_id ?? unit?.id;
    if (reservationId == null) return;
    try {
      const detail = await accountingService.getSoldUnitById(reservationId);
      if (detail && typeof detail === 'object') {
        selectedSoldUnit.value = mergeSoldUnitDetail(unit, detail);
      }
    } catch (error) {
      logger.error('Error loading sold unit detail:', error);
    }
  };

  const handleSoldUnitDetailBack = () => {
    soldUnitDetailView.value = 'list';
    selectedSoldUnit.value = null;
  };


  /** @param {any} page */
  const handlePageChange = (page) => {
    currentPage.value = page;
    loadSoldUnits();
  };

  /** @param {any} val */
  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadSoldUnits();
  };

  const { formatCurrency } = useFormatters();

  return {
    isLoading,
    soldUnits,
    soldUnitDetailView,
    selectedSoldUnit,
    currentPage,
    perPage,
    totalItems,
    loadSoldUnits,
    viewSoldUnitDetail,
    handleSoldUnitDetailBack,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
  };
}
