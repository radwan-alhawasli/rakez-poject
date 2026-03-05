import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingSalaries() {
  const isLoading = ref(false);
  const salaries = ref([]);
  const salaryMonth = ref(new Date().toISOString().slice(0, 7));
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showSalaryModal = ref(false);
  const selectedSalary = ref(null);
  const isSavingSalary = ref(false);

  const loadSalaries = async () => {
    isLoading.value = true;
    try {
      const [year, month] = salaryMonth.value.split('-');
      const data = await accountingService.getSalaries({
        year,
        month,
        page: currentPage.value,
        per_page: perPage.value,
      });
      salaries.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? salaries.value.length;
    } catch (error) {
      logger.error('Error loading salaries:', error);
      salaries.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const viewSalaryDetail = (salary) => {
    selectedSalary.value = salary;
    showSalaryModal.value = true;
  };

  const handleSalarySubmit = async (data) => {
    isSavingSalary.value = true;
    try {
      if (data.action === 'create') { await accountingService.createDistribution(selectedSalary.value.employee_id, data); toast.success('تم إنشاء التوزيع بنجاح'); }
      else if (data.action === 'approve') { await accountingService.approveSalaryDistribution(data.distributionId); toast.success('تم الموافقة على التوزيع بنجاح'); }
      else if (data.action === 'paid') { await accountingService.markSalaryAsPaid(data.distributionId, data); toast.success('تم تعيين الراتب كمقبوض بنجاح'); }
      showSalaryModal.value = false;
      loadSalaries();
    } catch (error) {
      logger.error('Error processing salary:', error);
      toast.error('حدث خطأ أثناء معالجة الراتب');
    } finally {
      isSavingSalary.value = false;
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    loadSalaries();
  };

  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadSalaries();
  };

  const { formatCurrency } = useFormatters();

  const getStatusClass = (status) => {
    if (!status) return 'good';
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('approved') || s.includes('paid') || s.includes('مكتمل') || s.includes('موافق') || s.includes('مقبوض')) return 'excellent';
    return 'good';
  };

  return {
    isLoading,
    salaries,
    salaryMonth,
    currentPage,
    perPage,
    totalItems,
    showSalaryModal,
    selectedSalary,
    isSavingSalary,
    loadSalaries,
    viewSalaryDetail,
    handleSalarySubmit,
    handlePageChange,
    handlePerPageChange,
    formatCurrency,
    getStatusClass,
  };
}
