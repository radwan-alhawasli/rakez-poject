import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingSoldUnits() {
  const isLoading = ref(false);
  const soldUnits = ref([]);
  const soldUnitDetailView = ref('list');
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

  const viewSoldUnitDetail = async (unit) => {
    selectedSoldUnit.value = unit;
    soldUnitDetailView.value = 'detail';
    const reservationId = unit?.reservation_id ?? unit?.id;
    if (reservationId == null) return;
    try {
      const detail = await accountingService.getSoldUnitById(reservationId);
      if (detail && typeof detail === 'object') {
        selectedSoldUnit.value = { ...unit, ...detail };
      }
    } catch (error) {
      logger.error('Error loading sold unit detail:', error);
    }
  };

  const handleSoldUnitDetailBack = () => {
    soldUnitDetailView.value = 'list';
    selectedSoldUnit.value = null;
  };

  const handleCreateCommission = async (data) => {
    try {
      const commission = await accountingService.createManualCommission(
        selectedSoldUnit.value.reservation_id || selectedSoldUnit.value.id, data
      );
      toast.success('تم إنشاء العمولة اليدوية بنجاح');
      if (commission?.id) {
        selectedSoldUnit.value = { ...selectedSoldUnit.value, commission_id: commission.id };
      }
      loadSoldUnits();
    } catch (error) {
      logger.error('Error creating commission:', error);
      toast.error('حدث خطأ أثناء إنشاء العمولة');
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    loadSoldUnits();
  };

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
    handleCreateCommission,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
  };
}
