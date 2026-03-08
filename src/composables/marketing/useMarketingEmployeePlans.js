import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
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
    instagram: 25,
    snapchat: 20,
    tiktok: 20,
    x: 10,
    google_youtube: 15,
    other: 7,
    aqar: 3,
  });
  const platformBreakdownOrder = [
    { key: 'instagram', labelAr: 'منصة انستغرام' },
    { key: 'snapchat', labelAr: 'منصة سناب' },
    { key: 'tiktok', labelAr: 'منصة تيك توك' },
    { key: 'x', labelAr: 'منصة تويتر X' },
    { key: 'google_youtube', labelAr: 'منصة جوجل (تضمن يوتيوب)' },
    { key: 'other', labelAr: 'منصات اخرى (بيوت - سكني - حراج ....)' },
    { key: 'aqar', labelAr: 'منصة عقار' },
  ];
  const campaignDistributionByPlatform = reactive({
    Instagram: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    Snapchat: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    TikTok: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    X: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    'Google/YouTube': { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    Other: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
    Aqar: { 'Direct Communication': 25, 'Hand Raise': 25, Impression: 25, Sales: 25 },
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

  const selectedProject = computed(() =>
    projects.value.find(x => String(x.id) === String(employeePlansProjectId.value))
  );

  const platformBreakdownTable = computed(() => {
    const marketingValue = Number(employeePlanBudgetSummary.value.marketing_value) || 0;
    const devPlan = selectedProject.value?.developer_plan ?? selectedProject.value?.developerPlan ?? {};
    const cpm = Number(devPlan.average_cpm ?? devPlan.average_cpm) || 25;
    const cpc = Number(devPlan.average_cpc ?? devPlan.average_cpc) || 2.5;
    const rows = [];
    let totalViews = 0;
    let totalClicks = 0;
    platformBreakdownOrder.forEach(({ key, labelAr }, idx) => {
      const pct = Number(platformDistribution[key]) || 0;
      const budget = marketingValue * (pct / 100);
      const views = cpm > 0 ? Math.round((budget / cpm) * 1000) : 0;
      const clicks = cpc > 0 ? Math.round(budget / cpc) : 0;
      totalViews += views;
      totalClicks += clicks;
      rows.push({ no: idx + 1, platform: labelAr, views, clicks });
    });
    return { rows, totalViews, totalClicks, cpm, cpc };
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
      const data = await marketingService.getUsers();
      const normalizedEmployees = Array.isArray(data) ? data : data?.items || [];
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

  const apiPlatformKeyMap = { meta: 'instagram', youtube: 'google_youtube', linkedin: 'other' };
  const suggestAiPlan = async () => {
    try {
      isSuggestingAiPlan.value = true;
      const payload = { goal: 'leads' };
      const response = await marketingService.suggestEmployeePlan(payload);
      if (response?.data) {
        const data = response.data;
        if (data.platform_distribution) {
          for (const key in platformDistribution) {
            const mapped = apiPlatformKeyMap[key] || key;
            const capKey = Object.keys(data.platform_distribution).find(
              k => k.toLowerCase() === key.toLowerCase() || k.toLowerCase() === mapped?.toLowerCase()
            );
            if (capKey) platformDistribution[key] = data.platform_distribution[capKey];
          }
        }
        if (data.campaign_distribution_by_platform) {
          for (const platform in data.campaign_distribution_by_platform) {
            const ourKey = Object.keys(campaignDistributionByPlatform).find(
              p => p.toLowerCase() === platform.toLowerCase()
            );
            if (ourKey && campaignDistributionByPlatform[ourKey]) {
              for (const camp in data.campaign_distribution_by_platform[platform]) {
                if (campaignDistributionByPlatform[ourKey][camp] !== undefined) {
                  campaignDistributionByPlatform[ourKey][camp] = data.campaign_distribution_by_platform[platform][camp];
                }
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

  const toApiPlatformKeys = dist => {
    const map = { instagram: 'Meta', google_youtube: 'YouTube', other: 'Other', aqar: 'Aqar' };
    const out = {};
    for (const [k, v] of Object.entries(dist)) {
      out[map[k] || (k.charAt(0).toUpperCase() + k.slice(1))] = v;
    }
    return out;
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
        platform_distribution: toApiPlatformKeys(platformDistribution),
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

  const exportEmployeePlansExcel = async () => {
    const projectId = employeePlansProjectId.value;
    if (projectId) {
      const blob = await marketingService.exportEmployeePlansByProject(projectId, 'csv');
      if (blob && blob.size > 0) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        return;
      }
    }
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

  const loadArabicFontBytes = async () => {
    const urls = [
      '/fonts/amiri-arabic-400-normal.woff',
      'https://cdn.jsdelivr.net/npm/@fontsource/amiri@5.0.0/files/amiri-arabic-400-normal.woff2',
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.arrayBuffer();
      } catch (_) {}
    }
    throw new Error('Could not load Arabic font');
  };

  const exportEmployeePlansPdf = async () => {
    try {
      const projectId = employeePlansProjectId.value;
      if (projectId) {
        const blob = await marketingService.exportEmployeePlansByProject(projectId, 'pdf');
        if (blob && blob.size > 0) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          return;
        }
      }
      const [pdfLib, fontkitMod] = await Promise.all([
        import('pdf-lib'),
        import('@pdf-lib/fontkit').then(m => m?.default ?? m),
      ]);
      const { PDFDocument, rgb } = pdfLib;
      const fontkit = fontkitMod?.default ?? fontkitMod;
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontBytes = await loadArabicFontBytes();
      const font = await pdfDoc.embedFont(fontBytes);
      const reshapeArabic = t => (!t ? '' : String(t).split('').reverse().join(''));
      const page = pdfDoc.addPage([595, 842]);
      let y = 800;
      const draw = (text, size = 12) => {
        page.drawText(reshapeArabic(String(text)), {
          x: 40,
          y,
          size,
          font,
          color: rgb(0.1, 0.2, 0.3),
        });
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

  const exportWeeklyPlanPdf = async () => {
    const projectId = employeePlansProjectId.value;
    if (!projectId) {
      toast.warning('اختر مشروعاً');
      return;
    }
    try {
      const blob = await marketingService.exportDistributionByProject(projectId);
      if (blob && blob.size > 0) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `خطة_اسبوعية_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      } else {
        toast.error('تعذر تحميل التقرير من الخادم');
      }
    } catch (error) {
      logger.error('Error exporting weekly plan PDF:', error);
      toast.error('تعذر تصدير خطة اسبوعية PDF');
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
    platformDistribution,
    campaignDistributionByPlatform,
    platformDistributionSum,
    campaignDistributionSums,
    platformBreakdownTable,
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
    exportWeeklyPlanPdf,
  };
}
