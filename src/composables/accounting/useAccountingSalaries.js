import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { getStatusClass } from '@/utils/statusHelpers';

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
  const isLoadingDetail = ref(false);

  const loadSalaries = async () => {
    isLoading.value = true;
    try {
      const [y, m] = salaryMonth.value.split('-').map(Number);
      const year = y || new Date().getFullYear();
      const month = m || new Date().getMonth() + 1;
      const data = await accountingService.getSalaries({
        year,
        month: month >= 1 && month <= 12 ? month : new Date().getMonth() + 1,
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

  const viewSalaryDetail = async (salary) => {
    selectedSalary.value = salary;
    showSalaryModal.value = true;
    const employeeId = salary?.employee_id ?? salary?.user_id ?? salary?.id;
    const [y, m] = salaryMonth.value.split('-').map(Number);
    const year = y || new Date().getFullYear();
    const month = m || new Date().getMonth() + 1;
    if (employeeId && (year && month)) {
      isLoadingDetail.value = true;
      try {
        const detail = await accountingService.getEmployeeSalary(employeeId, { year, month });
        const employee = detail?.employee && typeof detail.employee === 'object' ? detail.employee : {};
        const dist = detail?.salary_distribution && typeof detail.salary_distribution === 'object' ? detail.salary_distribution : null;
        selectedSalary.value = {
          ...salary,
          ...detail,
          ...employee,
          name: employee.name ?? salary.name,
          employee_name: employee.employee_name ?? employee.name ?? salary.employee_name ?? salary.name,
          job_title: employee.job_title ?? salary.job_title ?? '—',
          department: employee.department ?? salary.department ?? '—',
          team_name: employee.team_name ?? salary.team_name ?? '—',
          phone: employee.phone ?? salary.phone ?? '—',
          email: employee.email ?? salary.email ?? '—',
          commissions_by_project: detail?.commissions_by_project ?? salary?.commissions_by_project ?? [],
          commissions_total: detail?.commissions_total ?? salary?.commissions_total,
          period: detail?.period ?? salary?.period,
          sold_units: detail?.sold_units ?? salary?.sold_units,
          summary: detail?.summary ?? salary?.summary,
          unit_breakdown: detail?.unit_breakdown ?? salary?.unit_breakdown,
          commission_breakdown: detail?.commission_breakdown ?? salary?.commission_breakdown,
          distribution_id: dist?.id ?? salary?.distribution_id ?? salary?.distribution?.id,
          base_salary: dist?.base_salary ?? salary?.base_salary ?? salary?.contract_salary,
          total_commissions: dist?.total_commissions ?? detail?.commissions_total ?? salary?.total_commissions,
          total_amount: dist?.total_amount ?? salary?.total_amount,
          status: dist?.status ?? salary?.status,
          salary_distribution: dist ?? salary?.salary_distribution,
        };
      } catch (e) {
        logger.error('Error loading salary detail:', e);
      } finally {
        isLoadingDetail.value = false;
      }
    }
  };

  const handleSalarySubmit = async (data) => {
    isSavingSalary.value = true;
    try {
      if (data.action === 'create') { await accountingService.createDistribution(selectedSalary.value.employee_id, data); toast.success('تم إنشاء التوزيع بنجاح'); }
      else if (data.action === 'approve') { await accountingService.approveSalaryDistribution(data.distributionId); toast.success('تم الموافقة على التوزيع بنجاح'); }
      else if (data.action === 'paid') { await accountingService.markSalaryAsPaid(data.distributionId); toast.success('تم تعيين الراتب كمقبوض بنجاح'); }
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


  return {
    isLoading,
    isLoadingDetail,
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
