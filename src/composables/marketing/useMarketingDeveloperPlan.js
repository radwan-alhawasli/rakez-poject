import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { usePermissions } from '@/composables/usePermissions';
import { toast } from '@/composables/useToast';

export function useMarketingDeveloperPlan() {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const { formatNumber } = useFormatters();
  const formatCurrency = formatNumber;

  const projects = ref([]);
  const isLoadingProjects = ref(false);
  const isLoadingDeveloperPlan = ref(false);
  const isSubmitting = ref(false);
  const developerPlanSummary = ref(null);
  const developerPlanForm = reactive({
    project_id: '',
    contract_id: '',
    marketing_value: '',
    average_cpm: '',
    average_cpc: '',
  });

  const devPlanOutputs = computed(() => {
    const marketingValue = Number(developerPlanForm.marketing_value) || 0;
    const cpm = Number(developerPlanForm.average_cpm) || 0;
    const cpc = Number(developerPlanForm.average_cpc) || 0;
    const expectedImpressions = cpm > 0 ? Math.round((marketingValue / cpm) * 1000) : 0;
    const expectedClicks = cpc > 0 ? Math.round(marketingValue / cpc) : 0;
    const s = developerPlanSummary.value || {};
    const durationLabel = String(s.marketing_duration ?? s.durationLabel ?? 'حسب مدة العقد');
    return { totalBudget: marketingValue, expectedImpressions, expectedClicks, durationLabel };
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
    if (!developerPlanForm.project_id) {
      developerPlanForm.contract_id = '';
      developerPlanForm.marketing_value = '';
      return;
    }
    const p = projects.value.find(x => String(x.id) === String(developerPlanForm.project_id));
    if (p) {
      developerPlanForm.contract_id = String(
        p.marketing_project?.contract_id ?? p.contract_id ?? p.contractId ?? p.id ?? ''
      );
      developerPlanForm.marketing_value = String(p.marketing_value ?? p.marketingValue ?? '');
    }
    loadDeveloperPlan();
  };

  const loadDeveloperPlan = async () => {
    const id = developerPlanForm.contract_id || developerPlanForm.project_id;
    if (!id) {
      toast.warning('اختر مشروعاً أو أدخل رقم العقد');
      return;
    }
    isLoadingDeveloperPlan.value = true;
    try {
      const plan = await marketingService.getDeveloperPlan(id);
      developerPlanSummary.value = plan || null;
      const raw = plan?.raw_plan || plan?.rawPlan || null;
      if (raw) {
        developerPlanForm.contract_id = String(raw.contract_id ?? developerPlanForm.contract_id ?? '');
        developerPlanForm.marketing_value = String(raw.marketing_value ?? developerPlanForm.marketing_value ?? '');
        developerPlanForm.average_cpm = String(raw.average_cpm ?? developerPlanForm.average_cpm ?? '');
        developerPlanForm.average_cpc = String(raw.average_cpc ?? developerPlanForm.average_cpc ?? '');
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
    if (!developerPlanForm.contract_id || !developerPlanForm.marketing_value || !developerPlanForm.average_cpm || !developerPlanForm.average_cpc) {
      toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
      return;
    }
    try {
      isSubmitting.value = true;
      await marketingService.storeDeveloperPlan({
        contract_id: Number(developerPlanForm.contract_id),
        marketing_value: Number(developerPlanForm.marketing_value),
        average_cpm: Number(developerPlanForm.average_cpm),
        average_cpc: Number(developerPlanForm.average_cpc),
      });
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

  const exportDeveloperPlanPdf = async () => {
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const o = devPlanOutputs.value;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = 800;
      const draw = (text, size = 12) => {
        page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
        y -= size + 10;
      };
      draw('Developer Marketing Plan / خطة المطور', 16);
      draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
      draw(`Total Budget (SAR): ${o.totalBudget ?? 0}`);
      draw(`Expected Impressions: ${o.expectedImpressions ?? 0}`);
      draw(`Expected Clicks: ${o.expectedClicks ?? 0}`);
      draw(`Marketing Duration: ${o.durationLabel ?? '—'}`);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `developer_plan_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      logger.error('Error exporting developer plan PDF:', error);
      toast.error('تعذر تصدير PDF');
    }
  };

  onMounted(() => {
    loadProjects();
    const q = route.query;
    if (q.projectId) developerPlanForm.project_id = String(q.projectId);
    if (q.contractId) developerPlanForm.contract_id = String(q.contractId);
    if (q.marketingValue) developerPlanForm.marketing_value = String(q.marketingValue);
    if (developerPlanForm.contract_id || developerPlanForm.project_id) {
      loadDeveloperPlan();
    }
  });

  return {
    developerPlanForm,
    developerPlanSummary,
    devPlanOutputs,
    isLoadingDeveloperPlan,
    isSubmitting,
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
