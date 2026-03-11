import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

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
    return (u && u.type == 1) || (u && u.type == 3 && u.is_manager);
  });
  const isProjectManagerOnly = computed(() => {
    const u = authService.getCurrentUser();
    return u && u.type == 3 && !u.is_manager;
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

      const unitList = p => p.units || [];
      const mapped = list.map(p => {
        const units = unitList(p);
        const totalUnits = units.length;
        const soldCount = units.filter(
          u =>
            String(u.status || '').toLowerCase() === 'sold' ||
            String(u.status || '')
              .toLowerCase()
              .includes('sold')
        ).length;
        const daysLeftVal = (() => {
          const d = new Date(p.contract_end_date || p.end_date || p.agreement_end_date || 0);
          if (Number.isNaN(d.getTime())) return null;
          return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        })();
        const isExclusive = p.type === 'Exclusive' || p.is_exclusive;
        const unitType = p.unit_type || (units[0] && units[0].unit_type) || 'Apartment';
        const descLine = isExclusive
          ? `طلب مشروع حصري. ${p.total_units || totalUnits || 100} وحدة من نوع ${unitType}.`
          : (p.description || p.details || '').split('\n')[0] ||
            (totalUnits ? `${totalUnits} وحدة` : '');
        const pp = p.project_progress;
        const totalSteps = pp?.total_count ?? pp?.steps?.length ?? 7;
        const completedSteps = pp?.completed_count ?? (Array.isArray(pp?.steps) ? pp.steps.filter(s => s.completed).length : 0);
        const setupProgressVal =
          totalSteps > 0
            ? Math.round((completedSteps / totalSteps) * 100)
            : p.setup_progress != null
              ? Number(p.setup_progress)
              : 0;
        const contractRemainingLabel =
          daysLeftVal === null ? '—' : daysLeftVal < 0 ? 'منتهي' : `${daysLeftVal} يوم`;
        const contractColor =
          daysLeftVal === null
            ? 'gray'
            : daysLeftVal < 0
              ? 'red'
              : daysLeftVal <= 7
                ? 'red'
                : daysLeftVal <= 30
                  ? 'yellow'
                  : 'green';
        const contractDurationPercent =
          daysLeftVal === null
            ? 0
            : daysLeftVal < 0
              ? 100
              : Math.min(100, Math.max(0, Math.round((1 - daysLeftVal / 365) * 100)));

        const unitPrices = units.map(u => Number(u.price) || 0).filter(Boolean);
        const priceMin = p.price_min ?? p.min_price ?? (unitPrices.length ? Math.min(...unitPrices) : null);
        const priceMax = p.price_max ?? p.max_price ?? (unitPrices.length ? Math.max(...unitPrices) : null);
        const avgPrice = units.length ? units.reduce((a, b) => a + (Number(b.price) || 0), 0) / units.length : (p.average_unit_price ?? p.avg_unit_price);
        let priceRangeText = '—';
        if (priceMin != null && priceMax != null && priceMin !== priceMax) {
          priceRangeText = `${Number(priceMax).toLocaleString('en-US')} - ${Number(priceMin).toLocaleString('en-US')}`;
        } else if (priceMin != null || priceMax != null) {
          const single = priceMax ?? priceMin;
          priceRangeText = `${Number(single).toLocaleString('en-US')} - ${Number(single).toLocaleString('en-US')}`;
        } else if (avgPrice != null && Number(avgPrice) > 0) {
          priceRangeText = `${Number(avgPrice).toLocaleString('en-US')} - ${Number(avgPrice).toLocaleString('en-US')}`;
        }
        const unitAreas = units.map(u => Number(u.area) || Number(u.area_m2) || 0).filter(Boolean);
        const areaMin = p.area_min_m2 ?? p.area_min ?? (unitAreas.length ? Math.min(...unitAreas) : null);
        const areaMax = p.area_max_m2 ?? p.area_max ?? (unitAreas.length ? Math.max(...unitAreas) : null);
        const areaRange =
          areaMin != null && areaMax != null ? `${areaMin} - ${areaMax} م²` : areaMax != null ? `${areaMax} م²` : areaMin != null ? `${areaMin} م²` : '—';
        const bedroomsMin = p.bedrooms_min ?? (units[0] && units[0].bedrooms);
        const bedroomsMax = p.bedrooms_max ?? (units[0] && units[0].bedrooms);
        const bedroomsRange =
          bedroomsMin != null && bedroomsMax != null ? `${bedroomsMin} - ${bedroomsMax}` : bedroomsMax != null ? `${bedroomsMax}` : bedroomsMin != null ? `${bedroomsMin}` : '—';
        const rakezStatusLabel = p.status === 'Approved' ? 'متاح' : (p.status === 'Rejected' || p.status === 'Refused' ? 'مؤرشف' : (p.statusLabel || p.status || '—'));
        const propertyTypeLabel = (p.unit_type_label_ar && String(p.unit_type_label_ar).trim()) || unitType || (totalUnits ? 'وحدات' : 'مشروع');

        return {
          id: p.id,
          contract_id: p.contract_id ?? p.id,
          name: p.project_name ?? p.name ?? `مشروع #${p.id}`,
          location:
            `${(p.district || '').trim()}${p.district && p.city ? ', ' : ''}${(
              p.city || ''
            ).trim()}`.replace(/^,\s*|,\s*$/g, '') || '—',
          image: p.project_image_url ?? p.image,
          hasImage: !!((p.project_image_url ?? p.image) && String(p.project_image_url ?? p.image).trim()),
          statusLabel: p.status === 'Approved' ? 'Active' : p.status,
          statusClass: p.status === 'Approved' ? 'active' : 'pending',
          units,
          advertiser_number: p.advertiser_number,
          assignee: p.marketer,
          status: p.status,
          description: p.description || p.details || '',
          descriptionLine: descLine,
          setupProgress: setupProgressVal,
          soldUnitsCount: soldCount,
          soldUnitsPercent: totalUnits ? Math.round((soldCount / totalUnits) * 100) : 0,
          avgPrice: units.length
            ? units.reduce((a, b) => a + (Number(b.price) || 0), 0) / units.length
            : 0,
          commission_percentage: Number(p.commission_percentage || 0),
          availableUnits: units.filter(
            u => String(u.status || '').toLowerCase() === 'available' || !u.status
          ).length,
          pendingUnits: units.filter(
            u =>
              String(u.status || '')
                .toLowerCase()
                .includes('pending') ||
              String(u.status || '')
                .toLowerCase()
                .includes('reserved')
          ).length,
          availableUnitsValue: units
            .filter(u => String(u.status || '').toLowerCase() === 'available' || !u.status)
            .reduce((acc, u) => acc + (Number(u.price) || 0), 0),
          endDate: p.contract_end_date || p.end_date || p.agreement_end_date || null,
          daysLeft: daysLeftVal,
          contractRemainingLabel,
          contractColor,
          contractDurationPercent,
          timelinePillLabel:
            daysLeftVal === null
              ? '—'
              : daysLeftVal < 0
              ? 'انتهت المهلة'
              : `خلال ${daysLeftVal} أيام`,
          distance: p.distance || '15',
          landmark: p.landmark || 'مطار الملك خالد',
          priceRangeText,
          areaRange,
          bedroomsRange,
          rakezStatusLabel,
          propertyTypeLabel,
        };
      });

      // تقدم الإعداد: من GET contracts/show/{{contract_id}} → data.project_progress.steps
      const getContract = isEditor.value ? contractService.getEditorContractById : contractService.getContractById;
      const enriched = await Promise.all(
        mapped.map(async (proj) => {
          const contractId = proj.contract_id ?? proj.id;
          try {
            const detail = await getContract(contractId);
            const pp = detail?.project_progress;
            if (!pp) return { ...proj };

            const steps = Array.isArray(pp.steps) ? pp.steps : [];
            // Use steps array from API as source for تقدم الإعداد
            const totalSteps = steps.length > 0 ? steps.length : (pp.total_count ?? 0);
            const completedSteps =
              steps.length > 0
                ? steps.filter(s => s.completed === true).length
                : (pp.completed_count ?? 0);
            const setupProgressVal =
              totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            return { ...proj, setupProgress: setupProgressVal };
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
      filtered = filtered.filter(p => p.status === 'Approved' && p.units && p.units.length > 0);
    } else if (activeTab.value === 'not_ready') {
      filtered = filtered.filter(
        p => p.status !== 'Approved' || !p.units || p.units.length === 0
      );
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

  const notReadyCount = computed(
    () =>
      projects.value.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0)
        .length
  );
  const readyCount = computed(
    () =>
      projects.value.filter(p => p.status === 'Approved' && p.units && p.units.length > 0).length
  );
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
    } catch (e) {
      toast.error('فشل أرشفة المشروع');
    }
  };

  const onMarkComplete = () => {
    activeMenuId.value = null;
    toast.info('تحديد كمكتمل: سيتم ربطها بالـ API عند التوفر.');
  };

  const onDownloadContract = async project => {
    activeMenuId.value = null;
    try {
      if (typeof contractService.downloadContract === 'function') {
        await contractService.downloadContract(project.id);
        toast.success('تم تحميل العقد');
      } else {
        toast.info('تحميل العقد: سيتم ربطها بالـ API عند التوفر.');
      }
    } catch (e) {
      toast.error('فشل تحميل العقد');
    }
  };

  const onAssignTeam = project => {
    activeMenuId.value = null;
    projectForAssignTeam.value = project;
    assignTeamSelectedId.value = '';
    showAssignTeamModal.value = true;
    loadAssignTeamData();
  };

  const loadAssignTeamData = async () => {
    const project = projectForAssignTeam.value;
    if (!project) return;
    assignTeamLoading.value = true;
    try {
      const [assignedData, allTeams] = await Promise.all([
        teamService.getProjectTeams(project.id),
        teamService.getTeams(),
      ]);
      const raw = Array.isArray(assignedData) ? assignedData : assignedData?.data || [];
      const assigned = raw.map(t => ({
        id: t.team_id ?? t.id,
        project_team_id: t.id,
        name: t.team?.name ?? t.name ?? '',
      }));
      assignTeamAssigned.value = assigned;
      const assignedIds = new Set(assigned.map(t => t.id));
      assignTeamAvailable.value = allTeams.filter(t => !assignedIds.has(t.id));
    } catch (error) {
      logger.error('Error loading teams for assign modal:', error);
      toast.error('فشل تحميل قائمة الفرق');
    } finally {
      assignTeamLoading.value = false;
    }
  };

  const assignTeamSubmit = async () => {
    const project = projectForAssignTeam.value;
    if (!project || !assignTeamSelectedId.value) return;
    assignTeamActionLoading.value = true;
    try {
      await teamService.addProjectTeams(project.id, [Number(assignTeamSelectedId.value)]);
      toast.success('تم تعيين الفريق بنجاح');
      assignTeamSelectedId.value = '';
      await loadAssignTeamData();
      await fetchProjects();
    } catch (error) {
      logger.error('Error assigning team:', error);
      toast.error('حدث خطأ أثناء تعيين الفريق');
    } finally {
      assignTeamActionLoading.value = false;
    }
  };

  const assignTeamRemove = async team => {
    const project = projectForAssignTeam.value;
    if (!project) return;
    const projectTeamId = team.project_team_id ?? team.id;
    if (!projectTeamId) return;
    assignTeamActionLoading.value = true;
    try {
      await teamService.removeProjectTeam(projectTeamId);
      toast.success('تم إزالة الفريق بنجاح');
      await loadAssignTeamData();
      await fetchProjects();
    } catch (error) {
      logger.error('Error removing team:', error);
      toast.error('حدث خطأ أثناء إزالة الفريق');
    } finally {
      assignTeamActionLoading.value = false;
    }
  };

  const closeAssignTeamModal = () => {
    showAssignTeamModal.value = false;
    projectForAssignTeam.value = null;
    assignTeamAssigned.value = [];
    assignTeamAvailable.value = [];
    assignTeamSelectedId.value = '';
  };

  const openProjectDetails = async project => {
    selectedProject.value = project;
    showDetailsModal.value = true;
    activeMenuId.value = null;

    try {
      let details = null;
      if (isEditor.value) {
        details = await contractService.getEditorContractById(project.id);
      } else {
        details = await contractService.getContractById(project.id);
      }

      if (details) {
        logger.debug('Fetched Details:', details);
        selectedProject.value = {
          ...selectedProject.value,
          ...details,
          advertiser_number: details.advertiser_number || details.advertiser_section_url || null,
          avgPrice: details.average_unit_price || details.avg_price || null,
          description: details.description || details.project_description || null,
          units: details.units || [],
        };
      }
    } catch (e) {
      logger.error('Failed to fetch detailed project info', e);
    }
  };

  const closeDetailsModal = () => (showDetailsModal.value = false);

  const openWorkspace = project => {
    selectedProject.value = project;
    workspaceForm.url = '';
    showWorkspaceModal.value = true;
    activeMenuId.value = null;
  };

  const closeWorkspaceModal = () => (showWorkspaceModal.value = false);

  const submitWorkspaceLink = async () => {
    if (!workspaceForm.url) {
      toast.warning('الرجاء إدخال الرابط');
      return;
    }
    logger.debug(
      `Submitting workspace link for project ${selectedProject.value.id}:`,
      workspaceForm
    );
    toast.success('تم إضافة الرابط بنجاح وإشعار الإدارة ومدير المشاريع.');
    closeWorkspaceModal();
  };

  const openMediaModal = async project => {
    selectedProject.value = project;
    try {
      const photoData = await contractService.getPhotography(project.id);
      if (photoData && photoData.data) {
        mediaForm.image_url = photoData.data.image_url || '';
        mediaForm.video_url = photoData.data.video_url || '';
        mediaForm.description = photoData.data.description || '';
        mediaForm.isExisting = true;
      } else {
        mediaForm.image_url = '';
        mediaForm.video_url = '';
        mediaForm.description = '';
        mediaForm.isExisting = false;
      }
    } catch (e) {
      logger.error(e);
      mediaForm.image_url = '';
      mediaForm.video_url = '';
      mediaForm.description = '';
      mediaForm.isExisting = false;
    }
    showMediaModalState.value = true;
    activeMenuId.value = null;
  };

  const closeMediaModalState = () => (showMediaModalState.value = false);

  const submitMediaForm = async () => {
    if (!selectedProject.value) return;
    isMediaSaving.value = true;
    try {
      const payload = {
        image_url: mediaForm.image_url,
        video_url: mediaForm.video_url,
        description: mediaForm.description,
        status: 'pending',
      };

      if (mediaForm.isExisting) {
        await contractService.updatePhotography(selectedProject.value.id, payload);
        notificationService.addNotification(
          'تم تحديث الصور من قسم التحرير وإرسالها للموافقة',
          'success'
        );
      } else {
        await contractService.storePhotography(selectedProject.value.id, payload);
        notificationService.addNotification(
          'تم رفع الصور من قسم التحرير وإرسالها للموافقة',
          'success'
        );
        mediaForm.isExisting = true;
      }
      closeMediaModalState();
    } catch (error) {
      logger.error('Save failed:', error);
      const msg = error.response?.data?.message || error.message;
      if (msg && msg.includes('يجب أن يكون العقد لديه معلومات')) {
        toast.warning(
          'تنبيه: لا يمكن إضافة صور لهذا المشروع لأنه يفتقر إلى بيانات العقد الأساسية. يرجى إكمال بيانات المشروع أولاً (الطرف الثاني، المعلومات المالية) في صفحة التتبع.'
        );
      } else {
        toast.error('فشل الحفظ: ' + msg);
      }
    } finally {
      isMediaSaving.value = false;
    }
  };

  const goToUnits = project => {
    router.push({ name: 'ProjectTracker', params: { id: project.id }, query: { tab: 'units' } });
  };

  const getStatusClass = status => {
    switch (status) {
      case 'available':
        return 'ok';
      case 'pending':
        return 'pending';
      case 'notfound':
        return 'missing';
      default:
        return '';
    }
  };

  const timelineClass = daysLeft => {
    if (daysLeft === null) return '';
    if (daysLeft < 30) return 'timeline-red';
    if (daysLeft < 90) return 'timeline-orange';
    return 'timeline-green';
  };

  const timelineLabel = daysLeft => {
    if (daysLeft === null) return 'المدة غير متاحة';
    if (daysLeft < 0) return 'العقد منتهي';
    if (daysLeft < 30) return `أحمر: ${daysLeft} يوم`;
    if (daysLeft < 90) return `برتقالي: ${daysLeft} يوم`;
    return `أخضر: ${daysLeft} يوم`;
  };

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

  // When user types in search, refetch so results come from all pages (search mode)
  let searchDebounce = null;
  watch(searchQuery, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      if (!isEditor.value) {
        if ((searchQuery.value || '').trim()) currentPage.value = 1;
        fetchProjects();
      }
      searchDebounce = null;
    }, 350);
  });

  onMounted(fetchProjects);

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
    onAssignTeam,
    showAssignTeamModal,
    projectForAssignTeam,
    assignTeamAssigned,
    assignTeamAvailable,
    assignTeamSelectedId,
    assignTeamLoading,
    assignTeamActionLoading,
    assignTeamSubmit,
    assignTeamRemove,
    closeAssignTeamModal,
    showDetailsModal,
    selectedProject,
    openProjectDetails,
    closeDetailsModal,
    showWorkspaceModal,
    workspaceForm,
    openWorkspace,
    closeWorkspaceModal,
    submitWorkspaceLink,
    formatCurrency,
    showMediaModalState,
    mediaForm,
    isMediaSaving,
    openMediaModal,
    closeMediaModalState,
    submitMediaForm,
    getStatusClass,
    goToUnits,
    timelineClass,
    timelineLabel,
  };
}
