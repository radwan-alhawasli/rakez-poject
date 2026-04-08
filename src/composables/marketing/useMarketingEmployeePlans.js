import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import marketingService from '@/services/marketingService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { getCaughtMessage } from '@/utils/caughtError';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';

export function useMarketingEmployeePlans() {
  const route = useRoute();
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const MARKETING_PERCENT_FIXED = 10;

  const projects = ref([]);
  const isLoadingProjects = ref(false);
  const employeePlansProjectId = ref('');
  const employeePlans = ref([]);
  const isLoadingEmployeePlans = ref(false);
  const isSubmitting = ref(false);

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
    const platformViews = devPlan.platform_views ?? devPlan.platformViews ?? {};
    const platformClicks = devPlan.platform_clicks ?? devPlan.platformClicks ?? {};
    const hasManualValues = Object.keys(platformViews).length > 0 || Object.keys(platformClicks).length > 0;
    const defaultCpm = Number(devPlan.average_cpm ?? devPlan.averageCpm) || 25;
    const defaultCpc = Number(devPlan.average_cpc ?? devPlan.averageCpc) || 2.5;
    const platformCpm = devPlan.platform_cpm ?? devPlan.platformCpm ?? {};
    const platformCpc = devPlan.platform_cpc ?? devPlan.platformCpc ?? {};
    const rows = [];
    let totalViews = 0;
    let totalClicks = 0;
    platformBreakdownOrder.forEach(({ key, labelAr }, idx) => {
      const manualViews = Number(platformViews[key]) || 0;
      const manualClicks = Number(platformClicks[key]) || 0;
      let views;
      let clicks;
      if (hasManualValues && (manualViews > 0 || manualClicks > 0)) {
        views = manualViews;
        clicks = manualClicks;
      } else {
        const pct = Number(platformDistribution[key]) || 0;
        const budget = marketingValue * (pct / 100);
        const cpm = Number(platformCpm[key] ?? defaultCpm) || defaultCpm;
        const cpc = Number(platformCpc[key] ?? defaultCpc) || defaultCpc;
        views = cpm > 0 ? Math.round((budget / cpm) * 1000) : 0;
        clicks = cpc > 0 ? Math.round(budget / cpc) : 0;
      }
      totalViews += views;
      totalClicks += clicks;
      rows.push({ no: idx + 1, platform: labelAr, views, clicks });
    });
    return { rows, totalViews, totalClicks, cpm: defaultCpm, cpc: defaultCpc };
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

  /**
   * شكل المنصات المتوقّع من الباكند (Postman / MARKETING): TikTok, Meta, Snapchat, YouTube, LinkedIn, X.
   * other + aqar من الواجهة يُدمجان في LinkedIn حتى يبقى المجموع 100%.
   */
  const buildEmployeePlanPlatformDistributionForApi = dist => ({
    Meta: Number(dist.instagram) || 0,
    Snapchat: Number(dist.snapchat) || 0,
    TikTok: Number(dist.tiktok) || 0,
    X: Number(dist.x) || 0,
    YouTube: Number(dist.google_youtube) || 0,
    LinkedIn: (Number(dist.other) || 0) + (Number(dist.aqar) || 0),
  });

  const CAMPAIGN_DISTRIBUTION_KEYS = ['Direct Communication', 'Hand Raise', 'Impression', 'Sales'];

  const UI_PLATFORM_TO_CAMPAIGN_BLOCK = {
    instagram: 'Instagram',
    snapchat: 'Snapchat',
    tiktok: 'TikTok',
    x: 'X',
    google_youtube: 'Google/YouTube',
    other: 'Other',
    aqar: 'Aqar',
  };

  /** متوسط مرجّح لنسب الحملات لأن الـ API يتوقع campaign_distribution مسطحاً وليس حسب المنصة فقط. */
  const buildFlatCampaignDistributionForApi = (platformDist, byPlatform) => {
    const out = Object.fromEntries(CAMPAIGN_DISTRIBUTION_KEYS.map(k => [k, 0]));
    for (const [uiKey, pct] of Object.entries(platformDist)) {
      const w = (Number(pct) || 0) / 100;
      if (w <= 0) continue;
      const blockKey = UI_PLATFORM_TO_CAMPAIGN_BLOCK[uiKey];
      const row = blockKey && byPlatform[blockKey];
      if (!row) continue;
      for (const c of CAMPAIGN_DISTRIBUTION_KEYS) {
        out[c] += w * (Number(row[c]) || 0);
      }
    }
    for (const c of CAMPAIGN_DISTRIBUTION_KEYS) {
      out[c] = Math.round(out[c] * 100) / 100;
    }
    const sum = CAMPAIGN_DISTRIBUTION_KEYS.reduce((a, c) => a + out[c], 0);
    if (sum > 0 && Math.abs(sum - 100) > 0.05) {
      const f = 100 / sum;
      for (const c of CAMPAIGN_DISTRIBUTION_KEYS) {
        out[c] = Math.round(out[c] * f * 100) / 100;
      }
    }
    return out;
  };

  /** الباكند يتطلب غالباً user_id — نربط الخطة بالمستخدم الحالي من الجلسة. */
  const resolveEmployeePlanUserId = () => {
    const u = authService.getCurrentUser();
    const raw = u?.id ?? u?.user_id;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const employeePlanSaveErrorMessage = error => {
    const data = error?.response?.data;
    if (data && typeof data === 'object' && data.errors && typeof data.errors === 'object') {
      const lines = [];
      for (const [field, msgs] of Object.entries(data.errors)) {
        if (Array.isArray(msgs)) lines.push(...msgs.map(m => `${field}: ${m}`));
        else if (msgs != null) lines.push(`${field}: ${msgs}`);
      }
      if (lines.length) return lines.join(' — ');
    }
    const m = getCaughtMessage(error);
    return m && m !== '{}' ? m : '';
  };

  const applyManualEmployeePlan = async () => {
    if (!employeePlansProjectId.value) {
      toast.warning('اختر مشروعاً');
      return;
    }
    if (!validateDistributions()) return;
    const marketingProjectId = Number(employeePlansProjectId.value);
    if (!Number.isFinite(marketingProjectId) || marketingProjectId <= 0) {
      toast.warning('معرّف المشروع غير صالح');
      return;
    }
    const userId = resolveEmployeePlanUserId();
    if (userId == null) {
      toast.warning('تعذر تحديد المستخدم الحالي. أعد تسجيل الدخول ثم أعد المحاولة.');
      return;
    }

    try {
      isSubmitting.value = true;
      const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
      const platform_distribution = buildEmployeePlanPlatformDistributionForApi(platformDistribution);
      const campaign_distribution = buildFlatCampaignDistributionForApi(
        platformDistribution,
        campaignDistributionByPlatform
      );
      const payload = {
        marketing_project_id: marketingProjectId,
        user_id: userId,
        marketing_percent: rawMarketingPercent,
        platform_distribution,
        campaign_distribution,
      };
      const response = await marketingService.createEmployeePlan(payload);
      if (response?.breakdown) budgetDistributionResult.value = response.breakdown;
      notificationService.addNotification('تم حفظ خطة الموظف مع التوزيعات', 'success');
      await loadEmployeePlans();
    } catch (error) {
      logger.error('Error saving employee distribution:', error);
      const detail = employeePlanSaveErrorMessage(error);
      toast.error(detail ? `${detail}` : 'تعذر حفظ خطة الموظف بالتوزيعات');
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

  watch(
    () => [route?.name, route?.query?.projectId],
    () => {
      if (route?.name !== 'MarketingEmployeePlans') return;
      const pid = route?.query?.projectId;
      if (pid == null || pid === '') return;
      employeePlansProjectId.value = String(pid);
      loadEmployeePlans();
    },
    { immediate: true }
  );

  onMounted(() => {
    loadProjects();
  });

  return {
    employeePlans,
    isLoadingEmployeePlans,
    employeePlansProjectId,
    projects,
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
    formatNumber,
    formatDate,
    formatDistribution,
    loadEmployeePlans,
    applyManualEmployeePlan,
    suggestAiPlan,
  };
}
