import { ref, reactive, computed, shallowRef, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import marketingService from '@/services/marketingService';
import contractService from '@/services/contractService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import { usePermissions } from '@/composables/usePermissions';
import { toast } from '@/composables/useToast';
import {
  getStatusClass,
  getStatusText,
  contractTimelineDaysLeft,
  durationStatusClass,
  contractTimelineLabel,
  getRecommendedEmployee as getRecommendedEmployeePure,
  formatDistribution,
} from '@/modules/marketing/tabs/projects/marketingProjectsUiHelpers.js';

export function useMarketingProjects() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { formatNumber } = useFormatters();
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
  const showCalculateBudgetModal = ref(false);
  const showPlanUnavailableModal = ref(false);
  const planUnavailableProject = ref(null);
  /** حقل واجهة فقط في مودال التفاصيل — لا يُحفظ ولا يُرسل لأي API */
  const uiOnlyMarketingPercent = ref('');

  // Budget form
  const budgetForm = reactive({
    project_id: '',
    contract_id: '',
    unit_price: '',
    commission_percent: '',
    marketing_percent: MARKETING_PERCENT_FIXED,
    contract_duration_days: '',
    contract_duration_months: '',
  });
  const budgetResult = ref(null);
  const isSubmitting = ref(false);

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

  const loadProjectDetails = async projectOrId => {
    const project = typeof projectOrId === 'object' && projectOrId != null ? projectOrId : null;
    const contractId = project
      ? project.marketing_project?.contract_id ?? project.contract_id ?? project.id
      : projectOrId;
    const projectId = project ? project.id ?? project.marketing_project_id : projectOrId;
    if (!contractId && !projectId) return;
    isLoadingProjectDetails.value = true;
    try {
      const [details, recommended] = await Promise.all([
        contractId
          ? marketingService.getProjectByContractId(contractId)
          : marketingService.getProjectById(projectId),
        projectId ? marketingService.getRecommendedEmployee(projectId) : Promise.resolve(null),
      ]);
      selectedProjectDetails.value = details;
      if (projectId && recommended != null && typeof recommended === 'object') {
        recommendedEmployeeByProjectId.value = {
          ...recommendedEmployeeByProjectId.value,
          [projectId]: recommended,
        };
      }
    } catch (error) {
      logger.error('Error loading project details:', error);
      selectedProjectDetails.value = null;
    } finally {
      isLoadingProjectDetails.value = false;
    }
  };

  const viewProjectDetails = async project => {
    uiOnlyMarketingPercent.value = '';
    showProjectDetailsModal.value = true;
    showUnitsTable.value = false;
    isLoadingUnits.value = false;
    await loadProjectDetails(project);
  };

  const goToMarketingTeamsPage = () => {
    const d = selectedProjectDetails.value;
    if (!d) return;
    const contractIdRaw = d.marketing_project?.contract_id ?? d.contract_id ?? '';
    const marketingProjectIdRaw = d.id ?? d.marketing_project_id ?? '';
    const contractId = contractIdRaw != null && contractIdRaw !== '' ? String(contractIdRaw) : '';
    const marketingProjectId =
      marketingProjectIdRaw != null && marketingProjectIdRaw !== '' ? String(marketingProjectIdRaw) : '';
    if (!contractId && !marketingProjectId) return;
    router
      .push({
        name: 'MarketingTeams',
        query: {
          ...(contractId ? { contractId } : {}),
          ...(marketingProjectId ? { marketingProjectId } : {}),
        },
      })
      .catch(() => {});
    showProjectDetailsModal.value = false;
  };

  const goToUnits = async project_id => {
    showUnitsTable.value = true;
    if (selectedProjectDetails.value?.units?.length > 0) return;
    isLoadingUnits.value = true;
    try {
      const units = await contractService.getContractUnits(project_id);
      if (selectedProjectDetails.value) {
        selectedProjectDetails.value = { ...selectedProjectDetails.value, units };
      }
    } catch (error) {
      logger.error('Error loading units:', error);
    } finally {
      isLoadingUnits.value = false;
    }
  };

  const goToPhotography = projectId => {
    if (!projectId) return;
    router.push({ name: 'ProjectTracker', params: { id: String(projectId) }, query: { tab: 'photography' } }).catch(() => {});
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

  const viewProjectPlan = async project => {
    const raw = project?.project_plans || project?.marketing_project?.project_plans || project?.plan_url || '';
    const planUrl = typeof raw === 'string' && raw.trim() ? (raw.startsWith('http') ? raw : `${window.location.origin}${raw.startsWith('/') ? raw : '/' + raw}`) : '';
    if (planUrl) {
      window.open(planUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const contractId = project?.marketing_project?.contract_id ?? project?.contract_id ?? project?.contractId ?? project?.id;
    if (contractId) {
      try {
        const plan = await marketingService.getDeveloperPlan(contractId);
        if (plan?.raw_plan || plan?.rawPlan || (plan && Object.keys(plan).length > 0)) {
          router.push({
            name: 'MarketingPlans',
            query: {
              sub: 'developer',
              projectId: String(project.id ?? project.marketing_project_id),
              contractId: String(project?.marketing_project?.contract_id ?? project?.contract_id ?? project?.contractId ?? contractId ?? ''),
              marketingValue: String(project?.marketing_value ?? project?.marketingValue ?? plan?.raw_plan?.marketing_value ?? ''),
            },
          }).catch(() => {});
          return;
        }
      } catch (e) {
        logger.debug('No developer plan for project', contractId, e);
      }
    }
    planUnavailableProject.value = project;
    showPlanUnavailableModal.value = true;
  };

  const closePlanUnavailableModal = () => {
    showPlanUnavailableModal.value = false;
    planUnavailableProject.value = null;
  };

  const goToManagePlanFromModal = () => {
    const p = planUnavailableProject.value;
    closePlanUnavailableModal();
    if (p?.id) managePlan(p.id);
  };

  // Budget calculation
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

  const getRecommendedEmployee = project =>
    getRecommendedEmployeePure(project, recommendedEmployeeByProjectId.value);

  onMounted(() => {
    loadProjects();
  });

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
    showPlanUnavailableModal,
    planUnavailableProject,
    uiOnlyMarketingPercent,
    budgetForm,
    budgetResult,
    isSubmitting,
    loadProjects,
    loadProjectDetails,
    viewProjectDetails,
    goToMarketingTeamsPage,
    goToUnits,
    goToPhotography,
    managePlan,
    viewProjectPlan,
    closePlanUnavailableModal,
    goToManagePlanFromModal,
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
  };
}
