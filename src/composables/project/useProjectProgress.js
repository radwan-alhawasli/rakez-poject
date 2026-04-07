import { ref, reactive, computed } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import {
  normalizeProjectProgressSteps,
  isStepMarkedComplete,
  isSecondPartyTrackerComplete,
  buildSecondPartyTrackerPayload,
  extractSecondPartyShowRow,
} from '@/utils/projectProgressSteps';

/**
 * @param {string|number} projectId - Contract/project ID
 * @param {{ onTrackerFullyCompleted?: (id: string|number) => void }} [options] - Called when all stages are completed and backend status is updated
 */
export function useProjectProgress(projectId, options = {}) {
  const { onTrackerFullyCompleted } = options;
  const isLoading = ref(false);
  const projectLinkUrl = ref('');

  /** Six stages ↔ POST/PUT second-party-data body (no completion_certificate_url). */
  const stages = reactive([
    { name: 'الصكوك والرخصة', status: 'pending', apiKey: 'real_estate_papers_url', value: '', entryDate: '', completedAt: null },
    { name: 'المخطاطات والتصميمات', status: 'pending', apiKey: 'plans_equipment_docs_url', value: '', entryDate: '', completedAt: null },
    { name: 'السجل والهوية', status: 'pending', apiKey: 'project_logo_url', value: '', entryDate: '', completedAt: null },
    { name: 'الاسعار والوحدات', status: 'pending', apiKey: 'prices_units_url', value: '', entryDate: '', completedAt: null },
    { name: 'شهادة اتمام و ضمانات', status: 'pending', apiKey: 'marketing_license_url', value: '', entryDate: '', completedAt: null },
    {
      name: 'رقم المعلن',
      status: 'pending',
      apiKey: 'advertiser_section_url',
      value: '',
      entryDate: '',
      completedAt: null,
      inputType: 'text',
      inputmode: 'numeric',
      inputLabel: 'رقم المعلن',
      placeholder: '0000',
    },
  ]);

  const activeStageIndex = ref(0);
  const isTrackerCompleted = computed(() => stages.every(s => s.status === 'completed'));
  const completedStages = computed(() => stages.filter(s => s.status === 'completed').length);
  const progressPercentage = computed(() => {
    const n = stages.length;
    if (!n) return 0;
    const count = stages.filter(s => s.status === 'completed').length;
    return Math.round((count / n) * 100);
  });

  const selectStage = (index) => { activeStageIndex.value = index; };

  /**
   * @param {{ skipActiveStageUpdate?: boolean }} [opts]
   */
  const applyProjectProgress = (projectProgress, opts = {}) => {
    const normalized = normalizeProjectProgressSteps(projectProgress?.steps);
    if (!normalized.length) return;
    normalized.forEach(step => {
      const n = Number(step.step_number);
      const idx = Number.isFinite(n) && n > 0 ? n - 1 : -1;
      if (idx < 0 || !stages[idx]) return;
      stages[idx].name = step.label_ar || stages[idx].name;
      const done = isStepMarkedComplete(step);
      stages[idx].status = done ? 'completed' : 'pending';
      stages[idx].completedAt = done ? stages[idx].completedAt || 'تم' : null;
    });
    if (opts.skipActiveStageUpdate) return;
    const firstPending = stages.findIndex(s => s.status === 'pending');
    activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;
  };

  /**
   * مصدر حقيقة اكتمال المرحلة: project_progress.steps من العقد إن وُجدت.
   * بيانات second-party تُستخدم للقيم والتواريخ فقط — لا تُفرض «مكتمل» لأن وجود رابط قد يسبق تحديث العداد في الـ API.
   */
  const loadProgress = async projectProgress => {
    isLoading.value = true;
    try {
      let secondParty = null;
      try {
        const trackerData = await contractService.getSecondPartyData(projectId);
        secondParty = extractSecondPartyShowRow(trackerData);
      } catch (_) {
        /* وصول مقيد */
      }
      if (secondParty && typeof secondParty === 'object') {
        const d = secondParty;
        projectLinkUrl.value = d.project_link_url || d.project_link || '';
        stages.forEach(stage => {
          if (stage.apiKey && d[stage.apiKey]) {
            stage.value = d[stage.apiKey];
            if (d.stage_entry_dates?.[stage.apiKey]) stage.entryDate = d.stage_entry_dates[stage.apiKey];
          }
        });
        const marketing = stages.find(s => s.apiKey === 'marketing_license_url');
        if (marketing && !marketing.value && d.completion_certificate_url) {
          marketing.value = d.completion_certificate_url;
        }
      }

      const hasSteps =
        projectProgress?.steps && Array.isArray(projectProgress.steps) && projectProgress.steps.length > 0;
      if (hasSteps) {
        applyProjectProgress(projectProgress);
        stages.forEach(stage => {
          const fromSp =
            secondParty && typeof secondParty === 'object' && stage.apiKey
              ? secondParty[stage.apiKey]
              : null;
          const hasVal =
            (stage.value != null && String(stage.value).trim() !== '') ||
            (fromSp != null && String(fromSp).trim() !== '');
          if (hasVal && stage.status === 'pending') {
            stage.status = 'completed';
            stage.completedAt = stage.completedAt || 'تم';
          }
        });
        const firstPending = stages.findIndex(s => s.status === 'pending');
        activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;
      } else {
        stages.forEach(stage => {
          if (stage.apiKey && stage.value) {
            stage.status = 'completed';
            stage.completedAt = stage.completedAt || 'تم';
          }
        });
        const firstPending = stages.findIndex(s => s.status === 'pending');
        activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;
      }
    } catch (_) {
      /* restricted access */
    } finally {
      isLoading.value = false;
    }
  };

  const saveProgress = async () => {
    const currentStage = stages[activeStageIndex.value];
    if (!currentStage.value && currentStage.value !== 0) {
      const msg = currentStage.apiKey === 'advertiser_section_url'
        ? 'الرجاء إدخال رقم المعلن قبل الحفظ'
        : 'الرجاء إدخال الرابط قبل الحفظ';
      toast.warning(msg);
      return;
    }
    try {
      const payload = buildSecondPartyTrackerPayload(stages);
      await contractService.saveSecondPartyTracker(projectId, payload);

      const savedIndex = activeStageIndex.value;
      const savedApiKey = stages[savedIndex]?.apiKey;

      let freshProgress = null;
      let secondPartyAfter = null;
      try {
        const [contract, spRes] = await Promise.all([
          contractService.getContractById(projectId),
          contractService.getSecondPartyData(projectId).catch(() => null),
        ]);
        freshProgress = contract?.project_progress ?? null;
        secondPartyAfter = extractSecondPartyShowRow(spRes);
      } catch (e) {
        logger.warn('Could not refresh contract/second-party after tracker save:', e);
      }

      const applySecondPartyToStages = d => {
        if (!d || typeof d !== 'object') return;
        projectLinkUrl.value = d.project_link_url || d.project_link || projectLinkUrl.value;
        stages.forEach(stage => {
          if (stage.apiKey && d[stage.apiKey] != null && String(d[stage.apiKey]).trim() !== '') {
            stage.value = d[stage.apiKey];
            if (d.stage_entry_dates?.[stage.apiKey]) stage.entryDate = d.stage_entry_dates[stage.apiKey];
          }
        });
        const marketing = stages.find(s => s.apiKey === 'marketing_license_url');
        if (marketing && !marketing.value && d.completion_certificate_url) {
          marketing.value = d.completion_certificate_url;
        }
      };
      applySecondPartyToStages(secondPartyAfter);

      const fieldPersisted =
        savedApiKey &&
        secondPartyAfter &&
        secondPartyAfter[savedApiKey] != null &&
        String(secondPartyAfter[savedApiKey]).trim() !== '';

      if (freshProgress?.steps?.length) {
        applyProjectProgress(freshProgress, { skipActiveStageUpdate: true });
        stages.forEach(stage => {
          const v = stage.value;
          if (v != null && String(v).trim() !== '' && stage.status === 'pending') {
            stage.status = 'completed';
            stage.completedAt = stage.completedAt || new Date().toLocaleDateString('ar-SA');
          }
        });
        const norm = normalizeProjectProgressSteps(freshProgress.steps);
        const step = norm.find(s => Number(s.step_number) === savedIndex + 1);
        const serverSaysDone = isStepMarkedComplete(step);

        if (!serverSaysDone && !fieldPersisted) {
          toast.warning(
            'تم حفظ الطلب، لكن لم يُؤكَّد حفظ هذه المرحلة من الخادم. حدّث الصفحة أو تحقق من الاتصال.',
          );
          return;
        }

        const allDoneFromProgress = norm.length > 0 && norm.every(s => isStepMarkedComplete(s));
        const allDone = allDoneFromProgress || isSecondPartyTrackerComplete(secondPartyAfter);
        const firstPending = stages.findIndex(s => s.status === 'pending');
        activeStageIndex.value = firstPending !== -1 ? firstPending : stages.length - 1;

        if (allDone) {
          try {
            await contractService.updateContractStatusProjectManager(projectId, 'ready');
            onTrackerFullyCompleted?.(projectId);
            toast.success('تهانينا! تم إكمال المتتبع، يمكنك الآن إدارة الوحدات.');
          } catch (err) {
            logger.warn('Tracker completed but contract status update failed:', err);
            showApiError(
              err,
              'تم حفظ جميع مراحل المتتبع لكن تحديث حالة العقد فشل. يقبل الخادم الحالة: ready أو rejected (جاهز / مرفوض).',
            );
          }
        } else {
          toast.success('تم حفظ المرحلة.');
        }
        return;
      }

      currentStage.status = 'completed';
      currentStage.completedAt = new Date().toLocaleDateString('ar-SA');
      const allCompleted = stages.every(s => s.status === 'completed');
      if (allCompleted) {
        try {
          await contractService.updateContractStatusProjectManager(projectId, 'ready');
          onTrackerFullyCompleted?.(projectId);
          toast.success('تهانينا! تم إكمال المتتبع، يمكنك الآن إدارة الوحدات.');
        } catch (err) {
          logger.warn('Tracker completed but contract status update failed:', err);
          showApiError(err, 'تم حفظ المتتبع لكن تحديث حالة العقد فشل. جرّب تحديث الصفحة.');
        }
      } else if (activeStageIndex.value < stages.length - 1) {
        activeStageIndex.value++;
      }
    } catch (error) {
      logger.error('Failed to save progress:', error);
      showApiError(error, 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const updateProjectLink = async () => {
    if (!projectId) return;
    try {
      const payload = {
        ...buildSecondPartyTrackerPayload(stages),
        project_link_url: projectLinkUrl.value,
      };
      await contractService.saveSecondPartyTracker(projectId, payload);
      toast.success('تم تحديث رابط المشروع');
    } catch (error) {
      logger.error('Failed to update project link:', error);
      showApiError(error, 'فشل تحديث الرابط');
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
