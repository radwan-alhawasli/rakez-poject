import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';
import { normalizeExpectedSale } from '@/utils/marketingNormalizers';

export function useMarketingExpectedSales() {
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const expectedSalesRows = ref([]);
  const isLoadingExpectedSales = ref(false);
  const isSubmitting = ref(false);
  const expectedSalesForm = reactive({
    project_id: '',
    direct_communications: 0,
    hand_raises: 0,
    conversion_rate_percent: 1,
    campaign_budget: 0,
    expected_booking_value: 0,
  });
  const expectedSalesItems = computed(() => expectedSalesRows.value);

  const projects = ref([]);
  const isLoadingProjects = ref(false);

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const data = await marketingService.getProjects({});
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects for expected sales:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const loadExpectedSales = async () => {
    isLoadingExpectedSales.value = true;
    try {
      const data = await marketingService.getExpectedSales({
        project_id: expectedSalesForm.project_id || undefined,
        per_page: 100,
      });
      const raw = data?.items ?? [];
      expectedSalesRows.value = raw.map(item => normalizeExpectedSale(item));
    } catch (error) {
      logger.error('Error loading expected sales:', error);
      expectedSalesRows.value = [];
    } finally {
      isLoadingExpectedSales.value = false;
    }
  };

  const saveExpectedSale = async () => {
    if (!expectedSalesForm.project_id) {
      toast.warning('\u0627\u062E\u062A\u0631 \u0645\u0634\u0631\u0648\u0639\u0627\u064B \u0623\u0648\u0644\u0627\u064B');
      return;
    }
    try {
      isSubmitting.value = true;
      const conversionRatePercent = Number(expectedSalesForm.conversion_rate_percent) || 0;
      const expectedBookings = Math.round(
        (Number(expectedSalesForm.direct_communications) + Number(expectedSalesForm.hand_raises)) * (conversionRatePercent / 100)
      );
      await marketingService.createExpectedSale({
        project_id: Number(expectedSalesForm.project_id),
        direct_communications: Number(expectedSalesForm.direct_communications) || 0,
        hand_raises: Number(expectedSalesForm.hand_raises) || 0,
        conversion_rate: conversionRatePercent,
        expected_bookings: expectedBookings,
        expected_booking_value: Number(expectedSalesForm.expected_booking_value) || 0,
        campaign_budget: Number(expectedSalesForm.campaign_budget) || 0,
      });
      notificationService.addNotification('\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629 \u0628\u0646\u062C\u0627\u062D', 'success');
      await loadExpectedSales();
    } catch (error) {
      logger.error('Error saving expected sale:', error);
      toast.error('\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629');
    } finally {
      isSubmitting.value = false;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '\u063A\u064A\u0631 \u0645\u062D\u062F\u062F';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  onMounted(() => {
    loadProjects();
    loadExpectedSales();
  });

  return {
    expectedSalesItems,
    expectedSalesForm,
    isLoadingExpectedSales,
    isSubmitting,
    projects,
    formatCurrency,
    formatDate,
    saveExpectedSale,
    loadExpectedSales,
  };
}
