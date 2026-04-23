import { reactive, ref } from 'vue';
import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useMarketingProjectBudget(projects) {
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const MARKETING_PERCENT_FIXED = 10;
  
  const showCalculateBudgetModal = ref(false);
  const isSubmitting = ref(false);
  const budgetResult = ref(null);

  const budgetForm = reactive({
    project_id: '',
    contract_id: '',
    unit_price: '',
    commission_percent: '',
    marketing_percent: MARKETING_PERCENT_FIXED,
    contract_duration_days: '',
    contract_duration_months: '',
  });

  const onBudgetProjectChange = () => {
    if (!budgetForm.project_id) {
      budgetForm.contract_id = '';
      budgetForm.unit_price = '';
      budgetForm.commission_percent = '';
      return;
    }
    const p = projects.value.find(proj => String(proj.id) === String(budgetForm.project_id));
    if (p) {
      budgetForm.contract_id = p.contract_number ?? p.marketing_project?.contract_id ?? p.id ?? '';
      budgetForm.unit_price = p.average_unit_price ?? '';
      budgetForm.commission_percent = p.commission_percentage ?? '';
    }
  };

  const openCalculateBudgetModal = () => {
    budgetForm.project_id = '';
    budgetForm.contract_id = '';
    budgetForm.unit_price = '';
    budgetForm.commission_percent = '';
    budgetForm.marketing_percent = MARKETING_PERCENT_FIXED;
    budgetForm.contract_duration_days = '';
    budgetForm.contract_duration_months = '';
    budgetResult.value = null;
    showCalculateBudgetModal.value = true;
  };

  const calculateBudget = async () => {
    if (!budgetForm.contract_id || !budgetForm.unit_price) {
      toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
      return;
    }
    try {
      isSubmitting.value = true;
      const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
      const result = await marketingService.calculateBudget({
        contract_id: parseInt(budgetForm.contract_id),
        unit_price: parseFloat(budgetForm.unit_price),
        marketing_percent: rawMarketingPercent,
      });
      const unitPrice = Number(budgetForm.unit_price) || 0;
      const commissionPercent = Number(budgetForm.commission_percent) || 0;
      const marketingPercent = rawMarketingPercent > 1 ? rawMarketingPercent / 100 : rawMarketingPercent;
      const commissionValue = result.commission_value ?? unitPrice * (commissionPercent / 100);
      const marketingValue = result.marketing_value ?? Number(commissionValue) * marketingPercent;
      const durationDays = Number(budgetForm.contract_duration_days) || Number(result.contract_duration_days) || 0;
      const durationMonths = Number(budgetForm.contract_duration_months) || Number(result.contract_duration_months) || 0;
      const dailyBudget = durationDays ? Number(marketingValue) / durationDays : result.daily_budget ?? 0;
      const monthlyBudget = durationMonths ? Number(marketingValue) / durationMonths : result.monthly_budget ?? 0;
      budgetResult.value = {
        commission_value: Number(commissionValue) || 0,
        marketing_value: Number(marketingValue) || 0,
        daily_budget: Number(dailyBudget) || 0,
        monthly_budget: Number(monthlyBudget) || 0,
      };
      notificationService.addNotification(
        `تم حساب الميزانية: إجمالي التسويق ${formatCurrency(marketingValue || 0)} ريال | يومي ${formatCurrency(dailyBudget || 0)} ريال | شهري ${formatCurrency(monthlyBudget || 0)} ريال`,
        'success'
      );
      showCalculateBudgetModal.value = false;
    } catch (error) {
      logger.error('Error calculating budget:', error);
      toast.error('حدث خطأ أثناء حساب الميزانية');
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    showCalculateBudgetModal,
    budgetForm,
    budgetResult,
    isSubmitting,
    onBudgetProjectChange,
    openCalculateBudgetModal,
    calculateBudget,
  };
}
