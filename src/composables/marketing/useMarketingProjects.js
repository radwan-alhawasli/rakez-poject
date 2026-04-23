import { ref, reactive, computed, shallowRef, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import marketingService from '@/services/marketingService';
import contractService from '@/services/contractService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { usePermissions } from '@/composables/usePermissions';
import { toast } from '@/composables/useToast';
import { getCaughtMessage, getCaughtStatus } from '@/utils/caughtError';
import { HTTP_FORBIDDEN, HTTP_UNPROCESSABLE_ENTITY } from '@/constants/httpStatus';
import {
  getStatusClass,
  getStatusText,
  contractTimelineDaysLeft,
  durationStatusClass,
  contractTimelineLabel,
  getRecommendedEmployee as getRecommendedEmployeePure,
  formatDistribution,
  extractEmbeddedTeamMembers,
  getProjectMarketingTeamsList,
  marketingTeamDisplayName,
  marketingMemberDisplayName,
  marketingMemberRatingLabel,
  firstMarketingPercentValidationMessage,
  resolveContractIdForMarketingPatch,
  resolveProjectPlanAttachmentUrl,
  developerPlanLooksPresent,
} from '@/modules/marketing/tabs/projects/marketingProjectsUiHelpers.js';

import { useMarketingProjectBudget } from '@/composables/marketing/useMarketingProjectBudget.js';


export function useMarketingProjects() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { formatNumber, formatDate } = useFormatters();
  const formatCurrency = formatNumber;

  const MARKETING_PERCENT_FIXED = 10;

  const projects = shallowRef([]);
  const projectSearchQuery = ref('');
  const projectsFilter = reactive({ completedContractsOnly: false });
  const isLoadingProjects = ref(false);
  const selectedProjectDetails = ref(null);
  const isLoadingProjectDetails = ref(false);
  const showUnitsTable = ref(false);
  const isLoadingUnits = ref(false);
  const recommendedEmployeeByProjectId = ref({});

  // Media modal
  const showMediaModal = ref(false);
  const mediaModalProject = ref(null);

  const marketingTeamsWithMembers = computed(() => {
    const d = selectedProjectDetails.value;
    const teams = getProjectMarketingTeamsList(d);
    if (!teams.length) return [];
    return teams.map(t => ({
      team: t,
      members: extractEmbeddedTeamMembers(t),
    }));
  });

  const filteredProjects = computed(() => {
    let list = projects.value;
    if (projectSearchQuery.value) {
      const q = projectSearchQuery.value.toLowerCase();
      list = list.filter(
        p =>
          (p.project_name || p.name || '').toLowerCase().includes(q) ||
          (p.developer_name || '').toLowerCase().includes(q)
      );
    }
    if (projectsFilter.completedContractsOnly) {
      list = list.filter(p => p.contract_status === 'completed');
    }
    return list;
  });

  // Modals
  const showProjectDetailsModal = ref(false);

  const {
    showCalculateBudgetModal,
    budgetForm,
    budgetResult,
    isSubmitting,
    onBudgetProjectChange,
    openCalculateBudgetModal,
    calculateBudget,
  } = useMarketingProjectBudget(projects);

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const params = {};
      if (projectsFilter.completedContractsOnly) params.contract_status = 'completed';
      const data = await marketingService.getProjects(params);
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const syncMarketingPercentDraft = () => {
    const p = selectedProjectDetails.value?.marketing_percent;
    if (p === null || p === undefined || p === '') {
      marketingPercentDraft.value = '';
    } else {
      marketingPercentDraft.value = String(p);
    }
  };

  const loadProjectDetails = async projectOrId => {
    const project = typeof projectOrId === 'object' && projectOrId != null ? projectOrId : null;
    // marketing project id (primary key in marketing_projects table)
    const marketingProjectId = project
      ? project.id ?? project.marketing_project_id
      : projectOrId;
    if (!marketingProjectId) return;
    isLoadingProjectDetails.value = true;
    let details = null;
    try {
      const [d, recommended] = await Promise.all([
        marketingService.getProjectById(marketingProjectId),
        marketingService.getRecommendedEmployee(marketingProjectId).catch(() => null),
      ]);
      details = d;
      selectedProjectDetails.value = details;
      syncMarketingPercentDraft();
      if (marketingProjectId && recommended != null && typeof recommended === 'object') {
        recommendedEmployeeByProjectId.value = {
          ...recommendedEmployeeByProjectId.value,
          [marketingProjectId]: recommended,
        };
      }
    } catch (error) {
      logger.error('Error loading project details:', error);
      selectedProjectDetails.value = null;
    } finally {
      isLoadingProjectDetails.value = false;
    }
  };

  const saveProjectMarketingPercent = async () => {
    const d = selectedProjectDetails.value;
    const contractId = resolveContractIdForMarketingPatch(d);
    if (contractId == null || contractId === '') {
      toast.warning('تعذر تحديد رقم العقد لهذا المشروع');
      return;
    }
    const raw = String(marketingPercentDraft.value ?? '').trim();
    /** @type {number|null} */
    let payload;
    if (raw === '') {
      payload = null;
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        toast.warning('أدخل رقماً صالحاً لنسبة التسويق');
        return;
      }
      if (n < 6 || n > 10) {
        toast.warning('نسبة التسويق يجب أن تكون بين 6% و10% (أو اترك الحقل فارغاً لمسح النسبة)');
        return;
      }
      payload = n;
    }
    isSavingMarketingPercent.value = true;
    try {
      await marketingService.updateMarketingProjectPercent(contractId, payload);
      toast.success('تم تحديث نسبة التسويق للمشروع');
      await loadProjectDetails(d);
    } catch (error) {
      const st = getCaughtStatus(error);
      if (st === HTTP_FORBIDDEN) {
        toast.error('ليس لديك صلاحية تعديل الميزانية (مطلوب: marketing.budgets.manage)');
      } else if (st === HTTP_UNPROCESSABLE_ENTITY) {
        const msg = firstMarketingPercentValidationMessage(error) || getCaughtMessage(error);
        toast.error(msg);
      } else {
        toast.error(getCaughtMessage(error) || 'تعذر حفظ نسبة التسويق');
      }
    } finally {
      isSavingMarketingPercent.value = false;
    }
  };

  const clearProjectMarketingPercent = async () => {
    const d = selectedProjectDetails.value;
    const contractId = resolveContractIdForMarketingPatch(d);
    if (contractId == null || contractId === '') {
      toast.warning('تعذر تحديد رقم العقد لهذا المشروع');
      return;
    }
    isSavingMarketingPercent.value = true;
    try {
      await marketingService.updateMarketingProjectPercent(contractId, null);
      toast.success('تم مسح نسبة التسويق للمشروع');
      marketingPercentDraft.value = '';
      await loadProjectDetails(d);
    } catch (error) {
      const st = getCaughtStatus(error);
      if (st === HTTP_FORBIDDEN) {
        toast.error('ليس لديك صلاحية تعديل الميزانية (مطلوب: marketing.budgets.manage)');
      } else if (st === HTTP_UNPROCESSABLE_ENTITY) {
        const msg = firstMarketingPercentValidationMessage(error) || getCaughtMessage(error);
        toast.error(msg);
      } else {
        toast.error(getCaughtMessage(error) || 'تعذر مسح نسبة التسويق');
      }
    } finally {
      isSavingMarketingPercent.value = false;
    }
  };

  const viewProjectDetails = async project => {
    marketingPercentDraft.value = '';
    showProjectDetailsModal.value = true;
    showUnitsTable.value = false;
    isLoadingUnits.value = false;
    await loadProjectDetails(project);
  };

  const goToUnits = async project_id => {
    showUnitsTable.value = true;
    const d = selectedProjectDetails.value;

    // contract_units محمّلة بالفعل من GET /marketing/projects/:id — لا حاجة لـ API إضافي
    const alreadyLoaded =
      (d?.contract_units?.length ?? 0) > 0 ||
      (d?.units?.length ?? 0) > 0;

    if (alreadyLoaded) return;

    // fallback: إذا لم تُرجع التفاصيل وحدات، نُحاول جلبها عبر contract_id
    isLoadingUnits.value = true;
    try {
      const contractId =
        d?.marketing_project?.contract_id ??
        d?.contract_id ??
        d?.contract_info?.id ??
        project_id;
      const units = await contractService.getContractUnits(contractId);
      if (selectedProjectDetails.value) {
        selectedProjectDetails.value = {
          ...selectedProjectDetails.value,
          contract_units: Array.isArray(units) ? units : [],
          units: Array.isArray(units) ? units : [],
        };
      }
    } catch (error) {
      logger.error('Error loading units:', error);
    } finally {
      isLoadingUnits.value = false;
    }
  };

  /** فتح modal الصور والفيديوهات بدلاً من الانتقال لصفحة أخرى */
  const goToPhotography = projectId => {
    if (!projectId) return;
    mediaModalProject.value = selectedProjectDetails.value;
    showMediaModal.value = true;
  };

  const managePlan = projectId => {
    const p = projects.value.find(x => String(x.id) === String(projectId));
    router.push({
      name: 'MarketingPlans',
      query: {
        sub: 'developer',
        projectId: String(projectId),
        contractId: String(p?.marketing_project?.contract_id ?? p?.contract_id ?? p?.contractId ?? p?.id ?? ''),
        marketingValue: String(p?.marketing_value ?? p?.marketingValue ?? ''),
      },
    }).catch(() => {});
  };

  const developerPlanLooksPresent = plan => {
    if (!plan || typeof plan !== 'object') return false;
    if (plan.raw_plan || plan.rawPlan) return true;
    return Boolean(
      plan.id ??
        plan.contract_id ??
        plan.average_cpm ??
        plan.averageCpm ??
        plan.marketing_value ??
        plan.marketingValue
    );
  };

  const viewProjectPlan = async project => {
    if (!project) return;
    projectPlansModalProject.value = project;
    projectPlansModalPlanUrl.value = resolveProjectPlanAttachmentUrl(project);
    projectPlansModalHasDeveloperPlan.value = false;
    projectPlansModalDeveloperPlan.value = null;
    projectPlansModalEmployeePlans.value = [];
    showProjectPlansModal.value = true;
    projectPlansModalLoading.value = true;

    const contractId =
      project?.marketing_project?.contract_id ?? project?.contract_id ?? project?.contractId ?? project?.id;
    const marketingProjectId = project?.id ?? project?.marketing_project_id;

    const devTask = contractId
      ? marketingService.getDeveloperPlan(contractId).catch(e => {
          logger.debug('No developer plan for project', contractId, e);
          return null;
        })
      : Promise.resolve(null);

    const epTask =
      marketingProjectId != null && marketingProjectId !== ''
        ? marketingService.getEmployeePlans(marketingProjectId).catch(e => {
            logger.error('Error loading employee plans for project plans modal', e);
            return { items: [] };
          })
        : Promise.resolve({ items: [] });

    const [plan, epRes] = await Promise.all([devTask, epTask]);

    if (plan && developerPlanLooksPresent(plan)) {
      projectPlansModalDeveloperPlan.value = plan;
      projectPlansModalHasDeveloperPlan.value = true;
    }

    projectPlansModalEmployeePlans.value = epRes?.items ?? (Array.isArray(epRes) ? epRes : []);

    projectPlansModalLoading.value = false;
  };

  const closeProjectPlansModal = () => {
    showProjectPlansModal.value = false;
    projectPlansModalProject.value = null;
    projectPlansModalLoading.value = false;
    projectPlansModalPlanUrl.value = '';
    projectPlansModalHasDeveloperPlan.value = false;
    projectPlansModalDeveloperPlan.value = null;
    projectPlansModalEmployeePlans.value = [];
  };

  const openProjectPlanAttachment = () => {
    const u = projectPlansModalPlanUrl.value;
    if (u) window.open(u, '_blank', 'noopener,noreferrer');
  };

  const goToDeveloperPlanEditorFromModal = () => {
    const project = projectPlansModalProject.value;
    const plan = projectPlansModalDeveloperPlan.value;
    if (!project) return;
    const cid =
      project?.marketing_project?.contract_id ?? project?.contract_id ?? project?.contractId ?? project?.id;
    closeProjectPlansModal();
    router
      .push({
        name: 'MarketingPlans',
        query: {
          sub: 'developer',
          projectId: String(project.id ?? project.marketing_project_id),
          contractId: String(cid ?? ''),
          marketingValue: String(
            project?.marketing_value ??
              project?.marketingValue ??
              plan?.raw_plan?.marketing_value ??
              plan?.rawPlan?.marketing_value ??
              ''
          ),
        },
      })
      .catch(() => {});
  };

  const goToManageDeveloperPlanFromPlansModal = () => {
    const p = projectPlansModalProject.value;
    closeProjectPlansModal();
    if (p?.id) managePlan(p.id);
  };

  const goToEmployeePlansManagementFromModal = () => {
    const p = projectPlansModalProject.value;
    const id = p?.id ?? p?.marketing_project_id;
    closeProjectPlansModal();
    if (id == null || id === '') return;
    router.push({ name: 'MarketingEmployeePlans', query: { projectId: String(id) } }).catch(() => {});
  };


  const getRecommendedEmployee = project =>
    getRecommendedEmployeePure(project, recommendedEmployeeByProjectId.value);

  onMounted(() => {
    loadProjects();
  });

  const closeMediaModal = () => {
    showMediaModal.value = false;
    mediaModalProject.value = null;
  };

  return {
    projects,
    filteredProjects,
    projectSearchQuery,
    projectsFilter,
    isLoadingProjects,
    selectedProjectDetails,
    isLoadingProjectDetails,
    showUnitsTable,
    isLoadingUnits,
    recommendedEmployeeByProjectId,
    showProjectDetailsModal,
    showCalculateBudgetModal,
    showProjectPlansModal,
    projectPlansModalProject,
    projectPlansModalLoading,
    projectPlansModalPlanUrl,
    projectPlansModalHasDeveloperPlan,
    projectPlansModalEmployeePlans,
    marketingPercentDraft,
    isSavingMarketingPercent,
    saveProjectMarketingPercent,
    clearProjectMarketingPercent,
    budgetForm,
    budgetResult,
    isSubmitting,
    loadProjects,
    loadProjectDetails,
    viewProjectDetails,
    goToUnits,
    goToPhotography,
    managePlan,
    viewProjectPlan,
    closeProjectPlansModal,
    openProjectPlanAttachment,
    goToDeveloperPlanEditorFromModal,
    goToManageDeveloperPlanFromPlansModal,
    goToEmployeePlansManagementFromModal,
    formatDate,
    onBudgetProjectChange,
    openCalculateBudgetModal,
    calculateBudget,
    getStatusClass,
    getStatusText,
    contractTimelineDaysLeft,
    durationStatusClass,
    contractTimelineLabel,
    getRecommendedEmployee,
    formatDistribution,
    formatCurrency,
    formatNumber,
    hasPermission,
    marketingTeamsWithMembers,
    marketingTeamDisplayName,
    marketingMemberDisplayName,
    marketingMemberRatingLabel,
    showMediaModal,
    mediaModalProject,
    closeMediaModal,
  };
}
