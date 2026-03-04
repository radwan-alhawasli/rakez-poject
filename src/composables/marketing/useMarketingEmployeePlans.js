import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';

export function useMarketingEmployeePlans() {
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const MARKETING_PERCENT_FIXED = 10;

  const projects = ref([]);
  const isLoadingProjects = ref(false);
  const marketingEmployees = ref([]);
  const isLoadingEmployees = ref(false);
  const employeePlansProjectId = ref('');
  const employeePlans = ref([]);
  const isLoadingEmployeePlans = ref(false);
  const isSubmitting = ref(false);
  const employeePlanGenerateForm = reactive({ user_id: '' });

  const platformDistribution = reactive({
    tiktok: 20,
    meta: 30,
    snapchat: 20,
    youtube: 10,
    linkedin: 10,
    x: 10,
  });
  const campaignDistributionByPlatform = reactive({
    TikTok: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    Meta: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    Snapchat: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    YouTube: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    LinkedIn: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    X: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
  });
  const budgetDistributionResult = ref(null);
  const isSuggestingAiPlan = ref(false);
  const aiSuggestionRationale = ref('');

  const budgetForm = reactive({
    marketing_percent: MARKETING_PERCENT_FIXED,
  });

  const employeePlanBudgetSummary = computed(() => {
    const p = projects.value.find(x => String(x.id) === String(employeePlansProjectId.value));
    if (!p) return { commission_value: 0, marketing_value: 0 };
    const unitPrice = Number(p.average_unit_price) || 0;
    const commissionPercent = Number(p.commission_percentage) || 0;
    const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
    const marketingPercent = rawMarketingPercent > 1 ? rawMarketingPercent / 100 : rawMarketingPercent;
    const commissionValue = unitPrice * (commissionPercent / 100);
    const marketingValue = commissionValue * marketingPercent;
    return { commission_value: commissionValue, marketing_value: marketingValue };
  });

  const platformDistributionSum = computed(() =>
    Object.values(platformDistribution).reduce((acc, v) => acc + (Number(v) || 0), 0)
  );

  const campaignDistributionSums = computed(() => {
    const sums = {};
    for (const [platform, campaigns] of Object.entries(campaignDistributionByPlatform)) {
      sums[platform] = Object.values(campaigns).reduce((acc, v) => acc + (Number(v) || 0), 0);
    }
    return sums;
  });

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const data = await marketingService.getProjects({});
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects for employee plans:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const loadEmployees = async () => {
    isLoadingEmployees.value = true;
    try {
      const employees = await userService.getEmployees();
      const normalizedEmployees = Array.isArray(employees) ? employees : employees?.items || [];
      marketingEmployees.value = normalizedEmployees.filter(
        e =>
          String(e.type) === '0' || e.type === 0 || String(e.type).toLowerCase() === 'marketing'
      );
    } catch (error) {
      logger.error('Error loading employees:', error);
      marketingEmployees.value = [];
    } finally {
      isLoadingEmployees.value = false;
    }
  };

  const loadEmployeePlans = async () => {
    if (!employeePlansProjectId.value) {
      employeePlans.value = [];
      return;
    }
    isLoadingEmployeePlans.value = true;
    try {
      const data = await marketingService.getEmployeePlans(employeePlansProjectId.value);
      employeePlans.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading employee plans:', error);
      employeePlans.value = [];
    } finally {
      isLoadingEmployeePlans.value = false;
    }
  };

  const autoGenerateEmployeePlan = async () => {
    if (!employeePlansProjectId.value) {
      toast.warning('اختر مشروعاً');
      return;
    }
    try {
      isSubmitting.value = true;
      const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
      const payload = {
        marketing_project_id: Number(employeePlansProjectId.value),
        marketing_percent: rawMarketingPercent,
        strategy: 'ai',
      };
      if (employeePlanGenerateForm.user_id) payload.user_id = Number(employeePlanGenerateForm.user_id);
      const response = await marketingService.autoGenerateEmployeePlan(payload);
      if (response?.breakdown) budgetDistributionResult.value = response.breakdown;
      notificationService.addNotification('تم إنشاء خطة الموظف تلقائياً', 'success');
      await loadEmployeePlans();
    } catch (error) {
      logger.error('Error auto-generating employee plan:', error);
      toast.error('حدث خطأ أثناء إنشاء خطة الموظف');
    } finally {
      isSubmitting.value = false;
    }
  };

  const suggestAiPlan = async () => {
    try {
      isSuggestingAiPlan.value = true;
      const payload = { goal: 'leads' };
      const response = await marketingService.suggestEmployeePlan(payload);
      if (response?.data) {
        const data = response.data;
        if (data.platform_distribution) {
          for (const key in platformDistribution) {
            const capKey = Object.keys(data.platform_distribution).find(k => k.toLowerCase() === key.toLowerCase());
            if (capKey) platformDistribution[key] = data.platform_distribution[capKey];
          }
        }
        if (data.campaign_distribution_by_platform) {
          for (const platform in data.campaign_distribution_by_platform) {
            if (campaignDistributionByPlatform[platform]) {
              for (const camp in data.campaign_distribution_by_platform[platform]) {
                campaignDistributionByPlatform[platform][camp] = data.campaign_distribution_by_platform[platform][camp];
              }
            }
          }
        }
        if (data.breakdown) budgetDistributionResult.value = data.breakdown;
        if (data.rationale) aiSuggestionRationale.value = data.rationale;
        notificationService.addNotification('تم تطبيق اقتراح الذكاء الاصطناعي', 'success');
      }
    } catch (error) {
      logger.error('Error suggesting AI plan:', error);
      toast.error('حدث خطأ أثناء طلب اقتراح الذكاء الاصطناعي');
    } finally {
      isSuggestingAiPlan.value = false;
    }
  };

  const validateDistributions = () => {
    if (platformDistributionSum.value !== 100) {
      toast.warning('مجموع نسب المنصات يجب أن يساوي 100%');
      return false;
    }
    for (const [platform, sum] of Object.entries(campaignDistributionSums.value)) {
      if (sum !== 100) {
        toast.warning(`مجموع نسب الحملات في منصة ${platform} يجب أن يساوي 100%`);
        return false;
      }
    }
    return true;
  };

  const applyManualEmployeePlan = async () => {
    if (!employeePlansProjectId.value) {
      toast.warning('اختر مشروعاً');
      return;
    }
    if (!validateDistributions()) return;
    try {
      isSubmitting.value = true;
      const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
      const payload = {
        marketing_project_id: Number(employeePlansProjectId.value),
        marketing_percent: rawMarketingPercent,
        platform_distribution: { ...platformDistribution },
        campaign_distribution_by_platform: JSON.parse(JSON.stringify(campaignDistributionByPlatform)),
      };
      if (employeePlanGenerateForm.user_id) payload.user_id = Number(employeePlanGenerateForm.user_id);
      const response = await marketingService.createEmployeePlan(payload);
      if (response?.breakdown) budgetDistributionResult.value = response.breakdown;
      notificationService.addNotification('تم حفظ خطة الموظف مع التوزيعات', 'success');
      await loadEmployeePlans();
    } catch (error) {
      logger.error('Error saving employee distribution:', error);
      toast.error('تعذر حفظ خطة الموظف بالتوزيعات');
    } finally {
      isSubmitting.value = false;
    }
  };

  const formatDistribution = obj => {
    if (!obj || typeof obj !== 'object') return '—';
    const entries = Object.entries(obj);
    if (!entries.length) return '—';
    return entries.map(([k, v]) => `${k}: ${v}`).join(' • ');
  };

  const formatDate = dateString => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  const exportEmployeePlansExcel = () => {
    const headers = ['الموظف', 'قيمة التسويق', 'قيمة العمولة', 'توزيع المنصات', 'توزيع الحملات', 'التاريخ'];
    const rows = [headers];
    employeePlans.value.forEach(plan => {
      rows.push([
        plan.user?.name || plan.user_name || `User #${plan.user_id ?? '—'}`,
        String(plan.marketing_value ?? 0),
        String(plan.commission_value ?? 0),
        formatDistribution(plan.platform_distribution),
        formatDistribution(plan.campaign_distribution),
        formatDate(plan.created_at),
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportEmployeePlansPdf = async () => {
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = 800;
      const draw = (text, size = 12) => {
        page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
        y -= size + 8;
      };
      draw('Employee Marketing Plans / خطط الموظفين', 16);
      draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
      employeePlans.value.slice(0, 25).forEach(plan => {
        const name = plan.user?.name || plan.user_name || `User #${plan.user_id ?? '—'}`;
        draw(`${name} | ${plan.marketing_value ?? 0} SAR | ${formatDistribution(plan.platform_distribution)}`);
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      logger.error('Error exporting employee plans PDF:', error);
      toast.error('تعذر تصدير PDF');
    }
  };

  onMounted(() => {
    loadProjects();
    loadEmployees();
  });

  return {
    employeePlans,
    isLoadingEmployeePlans,
    employeePlansProjectId,
    projects,
    marketingEmployees,
    employeePlanGenerateForm,
    employeePlanBudgetSummary,
    isSubmitting,
    isSuggestingAiPlan,
    aiSuggestionRationale,
    formatCurrency,
    formatDate,
    formatDistribution,
    loadEmployeePlans,
    autoGenerateEmployeePlan,
    applyManualEmployeePlan,
    suggestAiPlan,
    exportEmployeePlansExcel,
    exportEmployeePlansPdf,
  };
}
