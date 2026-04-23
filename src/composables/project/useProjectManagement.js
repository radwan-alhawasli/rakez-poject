import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import {
  isSecondPartyTrackerShowResponseComplete,
} from '@/utils/projectProgressSteps';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { useProjectManagementModals } from '@/composables/project/useProjectManagementModals';
import { getApiErrorMessage } from '@/utils/errorHandler';
import {
  isReadyForMarketingTab,
  isNotReadyTab,
} from '@/composables/project/useProjectManagementHelpers';
import { useProjectManagementLifecycle } from '@/composables/project/useProjectManagementLifecycle';
import { mapProjectItem, enrichProjectItem } from '@/composables/project/projectManagementMapper';

export function useProjectManagement() {
  const router = useRouter();
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const userRole = computed(() => {
    const u = authService.getCurrentUser();
    return u ? u.type : 0;
  });
  const isEditor = computed(() => userRole.value == 4);
  const isManager = computed(() => {
    const u = authService.getCurrentUser();
    return (u && u.type == 1) || (u && u.type == 2 && u.is_manager);
  });
  const isProjectManagerOnly = computed(() => {
    const u = authService.getCurrentUser();
    return u && u.type == 2 && !u.is_manager;
  });

  const activeTab = ref(isEditor.value ? 'all_projects' : 'not_ready');
  const searchQuery = ref('');
  const isLoading = ref(false);
  const projects = ref([]);
  const activeMenuId = ref(null);
  const currentPage = ref(1);
  const perPage = ref(15);
  const totalProjects = ref(0);

  // Details modal
  const showDetailsModal = ref(false);
  const selectedProject = ref(null);

  // Workspace modal
  const showWorkspaceModal = ref(false);
  const workspaceForm = reactive({
    type: 'story',
    url: '',
  });

  // Assign team modal
  const showAssignTeamModal = ref(false);
  const projectForAssignTeam = ref(null);
  const assignTeamAssigned = ref([]);
  const assignTeamAvailable = ref([]);
  const assignTeamSelectedId = ref('');
  const assignTeamLoading = ref(false);
  const assignTeamActionLoading = ref(false);

  // Media modal
  const showMediaModalState = ref(false);
  const mediaForm = reactive({
    image_url: '',
    video_url: '',
    description: '',
    isExisting: false,
  });
  const isMediaSaving = ref(false);

  const fetchProjects = async () => {
    isLoading.value = true;
    try {
      let list = [];
      if (isEditor.value) {
        list = await contractService.getEditorContracts();
        totalProjects.value = Array.isArray(list) ? list.length : 0;
      } else {
        const query = (searchQuery.value || '').trim();
        // When searching, fetch from all pages (large per_page) then filter client-side
        const isSearchMode = query.length > 0;
        const { items, total } = await contractService.getContracts({
          page: isSearchMode ? 1 : currentPage.value,
          per_page: isSearchMode ? 500 : perPage.value,
        });
        let rawList = Array.isArray(items) ? items : [];
        if (isSearchMode && query) {
          const q = query.toLowerCase();
          rawList = rawList.filter(
            p =>
              (p.name || p.project_name || '').toLowerCase().includes(q) ||
              (p.location || '').toLowerCase().includes(q) ||
              (p.city || '').toLowerCase().includes(q) ||
              (p.district || '').toLowerCase().includes(q)
          );
        }
        list = rawList;
        totalProjects.value = isSearchMode ? list.length : total;
      }
      logger.debug('Fetched Projects:', list?.length, 'total:', totalProjects.value);
      // تشخيص: لمعرفة لماذا لا تظهر الصور، تحقق من أن الـ API يرجّع حقل الصورة (مثلاً project_image_url أو image)
      if (list?.length > 0) {
        const first = list[0];
        const imageKeys = ['project_image_url', 'image', 'image_url', 'main_image', 'cover_image', 'photo', 'project_image'];
        const found = imageKeys.filter(k => first[k] != null && String(first[k]).trim());
        logger.debug('صورة المشروع الأول من الـ API:', found.length ? found.map(k => ({ [k]: first[k] })) : 'لا يوجد حقل صورة في الاستجابة. الحقول المرجعة:', Object.keys(first).filter(k => /image|photo|picture|url|cover|main/i.test(k)));
      }

      const mapped = list.map(mapProjectItem);

      // تقدم الإعداد: دائماً من 6 مراحل (يُعاد حسابه بعد show بدمج second_party_data)
      const getContract = isEditor.value ? contractService.getEditorContractById : contractService.getContractById;
      const enriched = await Promise.all(
        mapped.map(async (proj) => {
          const contractId = proj.contract_id ?? proj.id;
          try {
            const detail = await getContract(contractId);
            return enrichProjectItem(proj, detail);
          } catch (e) {
            logger.debug('Enrich project progress for contract_id', contractId, e);
            return proj;
          }
        })
      );
      projects.value = enriched;
    } catch (err) {
      logger.error('Error fetching projects:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const filteredProjects = computed(() => {
    let filtered = projects.value;

    if (activeTab.value === 'all_projects') {
      filtered = filtered.filter(p => p.status !== 'Rejected' && p.status !== 'Refused');
    } else if (activeTab.value === 'ready') {
      filtered = filtered.filter(isReadyForMarketingTab);
    } else if (activeTab.value === 'not_ready') {
      filtered = filtered.filter(isNotReadyTab);
    } else if (activeTab.value === 'archive') {
      filtered = filtered.filter(p => p.status === 'Refused' || p.status === 'Rejected');
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }

    return filtered;
  });

  const notReadyCount = computed(() => projects.value.filter(isNotReadyTab).length);
  const readyCount = computed(() => projects.value.filter(isReadyForMarketingTab).length);
  const archiveCount = computed(
    () => projects.value.filter(p => p.status === 'Refused' || p.status === 'Rejected').length
  );
  const allProjectsCount = computed(
    () => projects.value.filter(p => p.status !== 'Rejected' && p.status !== 'Refused').length
  );

  const viewTracker = project => {
    router.push({ name: 'ProjectTracker', params: { id: project.id } });
  };

  const toggleMenu = id => {
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  const onEditProject = project => {
    activeMenuId.value = null;
    router.push({ name: 'ProjectTracker', params: { id: project.id } });
  };

  const onArchiveProject = async () => {
    activeMenuId.value = null;
    try {
      toast.info('أرشفة المشروع: سيتم ربطها بالـ API عند التوفر.');
    } catch (_e) {
      toast.error('فشل أرشفة المشروع');
    }
  };

  const onMarkComplete = async project => {
    activeMenuId.value = null;
    const id = project?.contract_id ?? project?.id;
    if (id == null || String(id).trim() === '') {
      toast.error('تعذر تحديد المشروع');
      return;
    }
    try {
      // GET /second-party-data/show/:id — يجب أن تكون الست مراحل (الحقول الستة) مكتملة
      const trackerSnap = await contractService.getSecondPartyData(id);
      if (!isSecondPartyTrackerShowResponseComplete(trackerSnap)) {
        toast.warning(
          'يجب إكمال الست مراحل في متتبع الطرف الثاني (جميع الحقول المطلوبة) قبل تحديد المشروع كمكتمل'
        );
        return;
      }
      await contractService.markContractComplete(id);
      toast.success('تم تحديد المشروع كمكتمل وسيظهر ضمن «مشاريع جاهزة للتسويق»');
      if (!isEditor.value) {
        activeTab.value = 'ready';
      }
      await fetchProjects();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر تحديث حالة المشروع'));
    }
  };

  const onDownloadContract = async project => {
    activeMenuId.value = null;
    const cid = project?.contract_id ?? project?.id;
    if (!cid) {
      toast.error('تعذر تحديد معرف العقد');
      return;
    }
    try {
      if (typeof contractService.downloadContract === 'function') {
        await contractService.downloadContract(cid);
        toast.success('تم تحميل العقد');
      } else {
        toast.info('تحميل العقد: سيتم ربطها بالـ API عند التوفر.');
      }
    } catch (_e) {
      toast.error('فشل تحميل العقد');
    }
  };

  const modalApi = useProjectManagementModals({
    router,
    isEditor,
    fetchProjects,
    activeMenuId,
    showAssignTeamModal,
    projectForAssignTeam,
    assignTeamAssigned,
    assignTeamAvailable,
    assignTeamSelectedId,
    assignTeamLoading,
    assignTeamActionLoading,
    showDetailsModal,
    selectedProject,
    showWorkspaceModal,
    workspaceForm,
    showMediaModalState,
    mediaForm,
    isMediaSaving,
  });

  const handlePageChange = page => {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProjects();
  };

  const handlePerPageChange = newPerPage => {
    perPage.value = newPerPage;
    currentPage.value = 1;
    fetchProjects();
  };

  useProjectManagementLifecycle({ searchQuery, isEditor, currentPage, fetchProjects });

  return {
    activeTab,
    searchQuery,
    isLoading,
    filteredProjects,
    currentPage,
    perPage,
    totalProjects,
    handlePageChange,
    handlePerPageChange,
    notReadyCount,
    readyCount,
    archiveCount,
    allProjectsCount,
    isEditor,
    isManager,
    isProjectManagerOnly,
    activeMenuId,
    toggleMenu,
    viewTracker,
    onEditProject,
    onArchiveProject,
    onMarkComplete,
    onDownloadContract,
    formatCurrency,
    ...modalApi,
    showAssignTeamModal,
    projectForAssignTeam,
    assignTeamAssigned,
    assignTeamAvailable,
    assignTeamSelectedId,
    assignTeamLoading,
    assignTeamActionLoading,
    showDetailsModal,
    selectedProject,
    showWorkspaceModal,
    workspaceForm,
    showMediaModalState,
    mediaForm,
    isMediaSaving,
  };
}
