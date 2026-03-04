import { ref, reactive, computed } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useProjectProgress(projectId) {
  const isLoading = ref(false);
  const projectLinkUrl = ref('');

  const stages = reactive([
    { name: 'الصكوك و الرخصه', status: 'pending', apiKey: 'real_estate_papers_url', value: '', entryDate: '', completedAt: null },
    { name: 'المخطاطات و التصميمات', status: 'pending', apiKey: 'plans_equipment_docs_url', value: '', entryDate: '', completedAt: null },
    { name: 'السجل و الهويه', status: 'pending', apiKey: 'project_logo_url', value: '', entryDate: '', completedAt: null },
    { name: 'شهادة اتمام و اخرى', status: 'pending', apiKey: 'completion_certificate_url', value: '', entryDate: '', completedAt: null },
    { name: 'الاسعار و الوحدات', status: 'pending', apiKey: 'prices_units_url', value: '', entryDate: '', completedAt: null },
    { name: 'الضمانات و اخرى', status: 'pending', apiKey: 'marketing_license_url', value: '', entryDate: '', completedAt: null },
    { name: 'رقم المعلن', status: 'pending', apiKey: 'advertiser_section_url', value: '', entryDate: '', completedAt: null, inputType: 'number', placeholder: 'أدخل رقم المعلن' },
  ]);

  const activeStageIndex = ref(0);
  const isTrackerCompleted = computed(() => stages.every(s => s.status === 'completed'));
  const completedStages = computed(() => stages.filter(s => s.status === 'completed').length);
  const progressPercentage = computed(() => {
    const count = stages.filter(s => s.status === 'completed').length;
    return count === stages.length ? 100 : (count / stages.length) * 100;
  });

  const selectStage = (index) => { activeStageIndex.value = index; };

  const applyProjectProgress = (projectProgress) => {
    if (!projectProgress?.steps || !Array.isArray(projectProgress.steps)) return;
    projectProgress.steps.forEach((step, i) => {
      if (stages[i]) {
        stages[i].name = step.label_ar || stages[i].name;
        stages[i].status = step.completed ? 'completed' : 'pending';
        stages[i].completedAt = step.completed ? (stages[i].completedAt || 'تم') : null;
      }
    });
    const firstPending = stages.findIndex(s => s.status === 'pending');
    activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;
  };

  const loadProgress = async (projectProgress) => {
    isLoading.value = true;
    try {
      if (projectProgress) applyProjectProgress(projectProgress);

      const trackerData = await contractService.getSecondPartyData(projectId);
      if (trackerData?.data) {
        const d = trackerData.data;
        projectLinkUrl.value = d.project_link_url || d.project_link || '';
        stages.forEach(stage => {
          if (stage.apiKey && d[stage.apiKey]) {
            stage.value = d[stage.apiKey];
            stage.status = 'completed';
            stage.completedAt = d.updated_at ? new Date(d.updated_at).toLocaleDateString() : 'تم';
            if (d.stage_entry_dates?.[stage.apiKey]) stage.entryDate = d.stage_entry_dates[stage.apiKey];
          }
        });
      }
      const firstPending = stages.findIndex(s => s.status === 'pending');
      activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;
    } catch (_) {
      /* restricted access */
    } finally {
      isLoading.value = false;
    }
  };

  const saveProgress = async () => {
    const currentStage = stages[activeStageIndex.value];
    if (!currentStage.value) {
      toast.warning('الرجاء إدخال الرابط قبل الحفظ');
      return;
    }
    try {
      const payload = {};
      stages.forEach(stage => {
        if (stage.apiKey) payload[stage.apiKey] = stage.value || null;
      });
      const stageEntryDates = {};
      stages.forEach(stage => {
        if (stage.apiKey && stage.entryDate) stageEntryDates[stage.apiKey] = stage.entryDate;
      });
      if (Object.keys(stageEntryDates).length) payload.stage_entry_dates = stageEntryDates;
      if (projectLinkUrl.value) payload.project_link_url = projectLinkUrl.value;

      try {
        await contractService.storeSecondPartyData(projectId, payload);
      } catch {
        await contractService.updateSecondPartyData(projectId, payload);
      }
      currentStage.status = 'completed';
      currentStage.completedAt = new Date().toLocaleDateString('ar-SA');
      if (activeStageIndex.value < stages.length - 1) {
        activeStageIndex.value++;
      } else {
        toast.success('تهانينا! تم إكمال المتتبع، يمكنك الآن إدارة الوحدات.');
      }
    } catch (error) {
      logger.error('Failed to save progress:', error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`حدث خطأ أثناء حفظ البيانات: ${errorMsg}`);
    }
  };

  const updateProjectLink = async () => {
    if (!projectId) return;
    try {
      const payload = { project_link_url: projectLinkUrl.value };
      try {
        await contractService.updateSecondPartyData(projectId, payload);
      } catch {
        await contractService.storeSecondPartyData(projectId, payload);
      }
      toast.success('تم تحديث رابط المشروع');
    } catch (error) {
      logger.error('Failed to update project link:', error);
      toast.error('فشل تحديث الرابط');
    }
  };

  return {
    isLoading,
    stages,
    activeStageIndex,
    completedStages,
    isTrackerCompleted,
    progressPercentage,
    projectLinkUrl,
    selectStage,
    loadProgress,
    saveProgress,
    updateProjectLink,
  };
}
