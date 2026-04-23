import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { usePermissions } from '@/composables/usePermissions';
import { toast } from '@/composables/useToast';

/** Same 7 platforms as weekly plan / employee plans */
export const DEVELOPER_PLAN_PLATFORMS = [
  { key: 'instagram', labelAr: 'منصة انستغرام' },
  { key: 'snapchat', labelAr: 'منصة سناب' },
  { key: 'tiktok', labelAr: 'منصة تيك توك' },
  { key: 'x', labelAr: 'منصة تويتر X' },
  { key: 'google_youtube', labelAr: 'منصة جوجل (تضمن يوتيوب)' },
  { key: 'other', labelAr: 'منصات اخرى (بيوت - سكني - حراج ....)' },
  { key: 'aqar', labelAr: 'منصة عقار' },
];

function emptyPlatformNumbers() {
  return DEVELOPER_PLAN_PLATFORMS.reduce((acc, { key }) => ({ ...acc, [key]: '' }), {});
}

/** مفتاح المنصة كما يريده الـ API (مثلاً x → twitter_x) */
function toApiPlatformKey(key) {
  return key === 'x' ? 'twitter_x' : key;
}

/** من platform_key في الـ API إلى المفتاح المحلي (twitter_x → x) */
function fromApiPlatformKey(apiKey) {
  return apiKey === 'twitter_x' ? 'x' : (apiKey || '');
}

/** استخراج قيمة منصة من كائن قد يأتي بمفاتيح snake_case أو camelCase أو بأحرف مختلفة */
function getPlatformValue(obj, platformKey) {
  if (!obj || typeof obj !== 'object') return null;
  const v = obj[platformKey] ?? obj[platformKey?.toLowerCase?.()];
  if (v != null && v !== '') return v;
  const keyLower = String(platformKey).toLowerCase();
  const entry = Object.entries(obj).find(([k]) => String(k).toLowerCase() === keyLower);
  return entry ? entry[1] : null;
}

export function useMarketingDeveloperPlan() {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const projects = ref([]);
  const isLoadingProjects = ref(false);
  const isLoadingDeveloperPlan = ref(false);
  const isCalculatingBudget = ref(false);
  const isSubmitting = ref(false);
  const developerPlanSummary = ref(null);
  /** 'cpm_cpc' = حساب من CPM و CPC لكل منصة | 'manual' = إدخال النقرات والمشاهدات يدوياً (لا CPM/CPC) */
  const inputMode = ref('cpm_cpc');
  /** true بعد تحميل خطة محفوظة من الـ API — يمنع watch ميزانية الحملة من الكتابة فوق قيمة التسويق */
  const hasLoadedSavedPlan = ref(false);
  const developerPlanForm = reactive({
    project_id: '',
    contract_id: '',
    marketing_value: '',
    /** نسبة التسويق (يدخلها موظف الماركتينج) 6%–10% */
    marketing_percent: '',
    platform_cpm: emptyPlatformNumbers(),
    platform_cpc: emptyPlatformNumbers(),
    platform_views: emptyPlatformNumbers(),
    platform_clicks: emptyPlatformNumbers(),
  });

  const selectedProject = computed(() =>
    projects.value.find(x => String(x.id) === String(developerPlanForm.project_id))
  );

  /** نسبة السعي في العقد، متوسط سعر الوحدات (من API data.contract إن وُجد، وإلا من المشروع) */
  const contractRates = computed(() => {
    const apiContract = developerPlanSummary.value?.contract;
    if (apiContract) {
      const commissionPct = Number(apiContract.commission_percent ?? apiContract.commission_percentage) || 0;
      const avgPrice = Number(apiContract.average_unit_price ?? apiContract.unit_price) || 0;
      return { commissionPct, avgPrice };
    }
    const p = selectedProject.value;
    const commissionPct = Number(p?.commission_percentage ?? p?.commission_percent) || 0;
    const avgPrice = Number(p?.average_unit_price ?? p?.avg_unit_price) || 0;
    return { commissionPct, avgPrice };
  });

  /** العمولة الإجمالية = نسبة السعي في العقد × متوسط سعر الوحدات (مقرّبة لرقمين عشريين) */
  const commissionValue = computed(() => {
    const { commissionPct, avgPrice } = contractRates.value;
    const raw = (commissionPct / 100) * avgPrice;
    const total = Number.isFinite(raw) ? Math.round(raw * 100) / 100 : 0;
    return { total };
  });

  /** نسبة التسويق 6%–10% (إدخال موظف الماركتينج). ميزانية الحملة = العمولة × نسبة التسويق. مقرّبة لرقمين عشريين. */
  const campaignBudgetFromFormula = computed(() => {
    const pct = Number(developerPlanForm.marketing_percent) || 0;
    if (pct < 6 || pct > 10) return null;
    const totalCommission = commissionValue.value.total;
    const raw = (totalCommission * pct) / 100;
    return Number.isFinite(raw) ? Math.round(raw * 100) / 100 : null;
  });

  /** تحديث فوري: عند تغيّر ميزانية الحملة المحسوبة أو نسبة التسويق نحدّث قيمة التسويق — إلا إذا كانت الخطة محملة من خطة محفوظة */
  watch(
    campaignBudgetFromFormula,
    (val) => {
      if (hasLoadedSavedPlan.value) return;
      if (val != null && developerPlanForm.contract_id) {
        const str = String(val);
        if (developerPlanForm.marketing_value !== str) {
          developerPlanForm.marketing_value = str;
        }
      }
    },
    { immediate: true }
  );

  const effectiveCpm = computed(() => {
    const vals = Object.values(developerPlanForm.platform_cpm).map(v => Number(v)).filter(n => n > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  const effectiveCpc = computed(() => {
    const vals = Object.values(developerPlanForm.platform_cpc).map(v => Number(v)).filter(n => n > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  const devPlanOutputs = computed(() => {
    const marketingValue = Number(developerPlanForm.marketing_value) || 0;
    const s = developerPlanSummary.value || {};
    const durationLabel = String(s.marketing_duration ?? s.durationLabel ?? 'حسب مدة العقد');
    if (inputMode.value === 'manual') {
      const totalViews = DEVELOPER_PLAN_PLATFORMS.reduce((sum, { key }) => sum + (Number(developerPlanForm.platform_views[key]) || 0), 0);
      const totalClicks = DEVELOPER_PLAN_PLATFORMS.reduce((sum, { key }) => sum + (Number(developerPlanForm.platform_clicks[key]) || 0), 0);
      return { totalBudget: marketingValue, expectedImpressions: totalViews, expectedClicks: totalClicks, durationLabel, effectiveCpm: 0, effectiveCpc: 0, isManual: true };
    }
    const cpm = effectiveCpm.value;
    const cpc = effectiveCpc.value;
    const expectedImpressions = cpm > 0 ? Math.round((marketingValue / cpm) * 1000) : 0;
    const expectedClicks = cpc > 0 ? Math.round(marketingValue / cpc) : 0;
    return { totalBudget: marketingValue, expectedImpressions, expectedClicks, durationLabel, effectiveCpm: cpm, effectiveCpc: cpc, isManual: false };
  });

  /** النتيجة لكل منصة: مشاهدات ونقرات (محسوبة من CPM/CPC أو من الإدخال اليدوي) */
  const platformResults = computed(() => {
    const marketingValue = Number(developerPlanForm.marketing_value) || 0;
    return DEVELOPER_PLAN_PLATFORMS.map(({ key, labelAr }) => {
      if (inputMode.value === 'manual') {
        const views = Number(developerPlanForm.platform_views[key]) || 0;
        const clicks = Number(developerPlanForm.platform_clicks[key]) || 0;
        return { key, labelAr, views, clicks };
      }
      const cpm = Number(developerPlanForm.platform_cpm[key]) || 0;
      const cpc = Number(developerPlanForm.platform_cpc[key]) || 0;
      const views = cpm > 0 ? Math.round((marketingValue / cpm) * 1000) : 0;
      const clicks = cpc > 0 ? Math.round(marketingValue / cpc) : 0;
      return { key, labelAr, views, clicks };
    });
  });

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const data = await marketingService.getProjects({});
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects for developer plan:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const onDeveloperPlanProjectChange = () => {
    hasLoadedSavedPlan.value = false;
    if (!developerPlanForm.project_id) {
      developerPlanForm.contract_id = '';
      developerPlanForm.marketing_value = '';
      developerPlanForm.marketing_percent = '';
      developerPlanForm.platform_cpm = emptyPlatformNumbers();
      developerPlanForm.platform_cpc = emptyPlatformNumbers();
      developerPlanForm.platform_views = emptyPlatformNumbers();
      developerPlanForm.platform_clicks = emptyPlatformNumbers();
      return;
    }
    const p = projects.value.find(x => String(x.id) === String(developerPlanForm.project_id));
    if (p) {
      developerPlanForm.contract_id = String(
        p.marketing_project?.contract_id ?? p.contract_id ?? p.contractId ?? p.id ?? ''
      );
      developerPlanForm.marketing_value = String(p.marketing_value ?? p.marketingValue ?? '');
      if (developerPlanForm.marketing_percent === '') developerPlanForm.marketing_percent = '10';
    }
    loadDeveloperPlan();
  };

  const applyCampaignBudget = async () => {
    const pct = Number(developerPlanForm.marketing_percent) || 0;
    if (pct < 6 || pct > 10) {
      toast.warning('أدخل نسبة التسويق بين 6% و 10%');
      return;
    }
    const contractId = developerPlanForm.contract_id || developerPlanForm.project_id;
    if (!contractId) {
      toast.warning('اختر مشروعاً أولاً');
      return;
    }
    isCalculatingBudget.value = true;
    try {
      const unitPrice = contractRates.value.avgPrice || null;
      const result = await marketingService.calculateDeveloperPlanBudget(contractId, pct, unitPrice);
      const val = result?.marketing_value ?? result?.data?.marketing_value;
      if (val != null) {
        developerPlanForm.marketing_value = String(Number(val));
        hasLoadedSavedPlan.value = false;
        notificationService.addNotification('تم تطبيق ميزانية الحملة من الخادم', 'success');
      } else {
        const budget = campaignBudgetFromFormula.value;
        if (budget != null) developerPlanForm.marketing_value = String(Math.round(budget * 100) / 100);
      }
    } catch (error) {
      logger.error('Error calculating campaign budget', error);
      const budget = campaignBudgetFromFormula.value;
      if (budget != null) developerPlanForm.marketing_value = String(Math.round(budget * 100) / 100);
      toast.error('تم استخدام الحساب المحلي لميزانية الحملة');
    } finally {
      isCalculatingBudget.value = false;
    }
  };

  const loadDeveloperPlan = async () => {
    const contractId = developerPlanForm.contract_id || developerPlanForm.project_id;
    if (!contractId) {
      toast.warning('اختر مشروعاً أو أدخل رقم العقد');
      return;
    }
    isLoadingDeveloperPlan.value = true;
    try {
      const plan = await marketingService.getDeveloperPlan(contractId);
      const contractFromApi = plan?.contract ?? plan?.data?.contract;
      const p = projects.value.find(x => String(x.id) === String(developerPlanForm.project_id));
      let contract = contractFromApi || (p ? {
        commission_percent: p.commission_percentage ?? p.commission_percent,
        average_unit_price: p.average_unit_price ?? p.avg_unit_price,
      } : null);
      const hasRates = contract && (
        (Number(contract.commission_percent ?? contract.commission_percentage) || 0) > 0 ||
        (Number(contract.average_unit_price ?? contract.unit_price) || 0) > 0
      );
      if ((!contract || !hasRates) && contractId) {
        try {
          const projectDetail = await marketingService.getProjectByContractId(contractId);
          const cp = Number(projectDetail?.commission_percentage ?? projectDetail?.commission_percent) || 0;
          const ap = Number(projectDetail?.average_unit_price ?? projectDetail?.avg_unit_price) || 0;
          contract = {
            ...(contract || {}),
            commission_percent: cp || (contract?.commission_percent ?? contract?.commission_percentage ?? 0),
            average_unit_price: ap || (contract?.average_unit_price ?? contract?.unit_price ?? 0),
          };
        } catch (_) {
          if (!contract) contract = null;
        }
      }
      const merged = { ...(plan || {}), contract };
      developerPlanSummary.value = merged.contract ? merged : (plan || null);
      if (merged.contract && !developerPlanForm.marketing_percent) developerPlanForm.marketing_percent = '10';
      /* دعم أشكال متعددة من الـ API: raw_plan أو plan أو الحقول في المستوى الأعلى */
      const raw = plan?.raw_plan ?? plan?.rawPlan ?? plan?.plan ?? plan ?? null;
      const platformsArray = Array.isArray(raw?.platforms) ? raw.platforms : [];
      const hasPlanData = raw && (
        raw.contract_id != null || raw.marketing_value != null ||
        platformsArray.length > 0 ||
        (raw.platform_cpm && Object.keys(raw.platform_cpm).length > 0) ||
        (raw.platformCpm && Object.keys(raw.platformCpm).length > 0) ||
        (raw.platform_cpc && Object.keys(raw.platform_cpc).length > 0) ||
        (raw.platformCpc && Object.keys(raw.platformCpc).length > 0) ||
        (raw.platform_views && Object.keys(raw.platform_views).length > 0) ||
        (raw.platformViews && Object.keys(raw.platformViews).length > 0) ||
        (raw.platform_clicks && Object.keys(raw.platform_clicks).length > 0) ||
        (raw.platformClicks && Object.keys(raw.platformClicks).length > 0)
      );
      if (hasPlanData) {
        hasLoadedSavedPlan.value = true;
        developerPlanForm.contract_id = String(raw.contract_id ?? developerPlanForm.contract_id ?? '');
        developerPlanForm.marketing_value = String(raw.marketing_value ?? developerPlanForm.marketing_value ?? '');
        if (raw.marketing_percent != null && raw.marketing_percent !== '') developerPlanForm.marketing_percent = String(raw.marketing_percent);
        const pcpm = raw.platform_cpm ?? raw.platformCpm ?? {};
        const pcpc = raw.platform_cpc ?? raw.platformCpc ?? {};
        /* إن وُجد مصفوفة platforms من الـ API نعبئ منها أولاً */
        if (platformsArray.length > 0) {
          platformsArray.forEach((p) => {
            const key = fromApiPlatformKey(p.platform_key ?? p.platformKey);
            if (!key) return;
            if (p.cpm != null && p.cpm !== '') developerPlanForm.platform_cpm[key] = String(p.cpm);
            if (p.cpc != null && p.cpc !== '') developerPlanForm.platform_cpc[key] = String(p.cpc);
            if (p.views != null && p.views !== '') developerPlanForm.platform_views[key] = String(p.views);
            if (p.clicks != null && p.clicks !== '') developerPlanForm.platform_clicks[key] = String(p.clicks);
          });
        }
        /* تعبئة إضافية من كائنات platform_cpm / platform_cpc إن وُجدت */
        DEVELOPER_PLAN_PLATFORMS.forEach(({ key }) => {
          const cpmVal = getPlatformValue(pcpm, key);
          const cpcVal = getPlatformValue(pcpc, key);
          if (cpmVal != null && cpmVal !== '') developerPlanForm.platform_cpm[key] = String(cpmVal);
          if (cpcVal != null && cpcVal !== '') developerPlanForm.platform_cpc[key] = String(cpcVal);
        });
        const pviews = raw.platform_views ?? raw.platformViews ?? {};
        const pclicks = raw.platform_clicks ?? raw.platformClicks ?? {};
        const hasManualData = platformsArray.some(p => (p.views != null && p.views !== '') || (p.clicks != null && p.clicks !== '')) ||
          Object.keys(pviews).length > 0 || Object.keys(pclicks).length > 0;
        /* input_mode من الـ API إن وُجد؛ وإلا نستنتجه من البيانات أو نترك الوضع الحالي */
        const inputModeFromApi = raw.input_mode ?? raw.inputMode ?? null;
        if (inputModeFromApi === 'manual' || inputModeFromApi === 'cpm_cpc') {
          inputMode.value = inputModeFromApi;
        } else if (hasManualData) {
          inputMode.value = 'manual';
        }
        /* إذا لم يرد شيء من API ولا توجد بيانات يدوية، لا نغيّر inputMode (يبقى الحالي أو الافتراضي cpm_cpc) */
        if (hasManualData) {
          DEVELOPER_PLAN_PLATFORMS.forEach(({ key }) => {
            const v = getPlatformValue(pviews, key);
            const c = getPlatformValue(pclicks, key);
            if (v != null && v !== '') developerPlanForm.platform_views[key] = String(v);
            if (c != null && c !== '') developerPlanForm.platform_clicks[key] = String(c);
          });
        }
      } else {
        hasLoadedSavedPlan.value = false;
      }
      notificationService.addNotification('تم جلب خطة المطور بنجاح', 'success');
    } catch (error) {
      logger.error('Error loading developer plan:', error);
      toast.error('لم يتم العثور على خطة/حدث خطأ');
    } finally {
      isLoadingDeveloperPlan.value = false;
    }
  };

  const saveDeveloperPlan = async () => {
    if (!developerPlanForm.contract_id || !developerPlanForm.marketing_value) {
      toast.warning('الرجاء إدخال المشروع وقيمة التسويق');
      return;
    }
    try {
      isSubmitting.value = true;
      const results = platformResults.value || [];
      const payload = {
        contract_id: Number(developerPlanForm.contract_id),
        marketing_value: Number(developerPlanForm.marketing_value),
        average_cpm: effectiveCpm.value > 0 ? Math.round(effectiveCpm.value * 100) / 100 : undefined,
        average_cpc: effectiveCpc.value > 0 ? Math.round(effectiveCpc.value * 100) / 100 : undefined,
      };
      if (developerPlanForm.marketing_percent !== '' && Number(developerPlanForm.marketing_percent) >= 6 && Number(developerPlanForm.marketing_percent) <= 10) {
        payload.marketing_percent = Number(developerPlanForm.marketing_percent);
      }
      payload.platforms = DEVELOPER_PLAN_PLATFORMS.map((plat, i) => {
        const r = results[i];
        const cpm = Number(developerPlanForm.platform_cpm[plat.key]) || 0;
        const cpc = Number(developerPlanForm.platform_cpc[plat.key]) || 0;
        const views = r?.views ?? 0;
        const clicks = r?.clicks ?? 0;
        return {
          platform_key: toApiPlatformKey(plat.key),
          platform_name_ar: plat.labelAr,
          cpm,
          cpc,
          views,
          clicks,
        };
      });
      await marketingService.storeDeveloperPlan(payload);
      notificationService.addNotification('تم حفظ خطة المطور بنجاح', 'success');
    } catch (error) {
      logger.error('Error saving developer plan:', error);
      toast.error('حدث خطأ أثناء حفظ خطة المطور');
    } finally {
      isSubmitting.value = false;
    }
  };

  const exportDeveloperPlanExcel = () => {
    const o = devPlanOutputs.value;
    const rows = [
      ['خطة المطور', ''],
      ['الميزانية الإجمالية (ريال)', String(o.totalBudget ?? 0)],
      ['المشاهدات المتوقعة', String(o.expectedImpressions ?? 0)],
      ['النقرات المتوقعة', String(o.expectedClicks ?? 0)],
      ['مدة التسويق', String(o.durationLabel ?? '—')],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `developer_plan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const isExportingPdf = ref(false);

  const exportDeveloperPlanPdf = async () => {
    const contractId = developerPlanForm.contract_id || developerPlanForm.project_id;
    if (!contractId) {
      toast.warning('يرجى اختيار مشروع أولاً لتتمكن من تنزيل الـ PDF');
      return;
    }
    isExportingPdf.value = true;
    try {
      const blob = await marketingService.getDeveloperPlanPdf(contractId);
      if (!blob || blob.size === 0) {
        toast.error('لم يتم استلام ملف PDF صالح من الخادم');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `developer_plan_${contractId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error exporting developer plan PDF from API:', error);
      toast.error('تعذر تنزيل PDF — تحقق من الاتصال أو حاول مجدداً');
    } finally {
      isExportingPdf.value = false;
    }
  };

  onMounted(async () => {
    await loadProjects();
    const q = route.query;
    if (q.projectId) developerPlanForm.project_id = String(q.projectId);
    if (q.contractId) developerPlanForm.contract_id = String(q.contractId);
    if (q.marketingValue) developerPlanForm.marketing_value = String(q.marketingValue);
    /* إن وُجد projectId فقط دون contractId، نملأ contract_id من المشروع لضمان جلب الخطة المحفوظة */
    if (developerPlanForm.project_id && !developerPlanForm.contract_id) {
      const p = projects.value.find(x => String(x.id) === String(developerPlanForm.project_id));
      if (p) {
        developerPlanForm.contract_id = String(p.marketing_project?.contract_id ?? p.contract_id ?? p.contractId ?? p.id ?? '');
        if (developerPlanForm.marketing_value === '' && (p.marketing_value != null || p.marketingValue != null)) {
          developerPlanForm.marketing_value = String(p.marketing_value ?? p.marketingValue ?? '');
        }
      }
    }
    if (developerPlanForm.contract_id || developerPlanForm.project_id) {
      await loadDeveloperPlan();
    }
  });

  return {
    developerPlanForm,
    developerPlanSummary,
    devPlanOutputs,
    platformResults,
    selectedProject,
    contractRates,
    commissionValue,
    campaignBudgetFromFormula,
    applyCampaignBudget,
    effectiveCpm,
    effectiveCpc,
    platformList: DEVELOPER_PLAN_PLATFORMS,
    inputMode,
    isLoadingDeveloperPlan,
    isCalculatingBudget,
    isSubmitting,
    isExportingPdf,
    projects,
    formatCurrency,
    formatNumber,
    hasPermission,
    onDeveloperPlanProjectChange,
    loadDeveloperPlan,
    saveDeveloperPlan,
    exportDeveloperPlanExcel,
    exportDeveloperPlanPdf,
  };
}
