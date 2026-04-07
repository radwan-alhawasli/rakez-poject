import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { useProjectManagementModals } from '@/composables/project/useProjectManagementModals';
import { getApiErrorMessage } from '@/utils/errorHandler';
import {
  computeAgreementTimeline,
  agreementRemainingPercent,
} from '@/utils/agreementTimeline.js';

/** عرض متتبع الاتفاقية: أيام متبقية + لون الشريط + نسبة العد التنازلي */
function contractTimelineDisplay(source) {
  const { daysLeft, totalDays } = computeAgreementTimeline(source);
  const daysLeftVal = daysLeft;
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
    daysLeftVal != null && daysLeftVal < 0
      ? 100
      : agreementRemainingPercent(daysLeftVal, totalDays);
  return { daysLeftVal, contractRemainingLabel, contractColor, contractDurationPercent };
}

function isArchivedProject(p) {
  return p.status === 'Refused' || p.status === 'Rejected';
}

/** تبويب «جاهزة للتسويق»: معتمد أو مُعلَم جاهزاً (من الـ API) + وجود وحدات؛ لا يشمل المؤرشف. */
function isReadyForMarketingTab(p) {
  if (isArchivedProject(p)) return false;
  const hasUnits = Array.isArray(p.units) && p.units.length > 0;
  return hasUnits && p.is_ready_for_marketing === true;
}

function isNotReadyTab(p) {
  return !isArchivedProject(p) && !isReadyForMarketingTab(p);
}

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
        const timeline = contractTimelineDisplay(p);
        const { daysLeftVal, contractRemainingLabel, contractColor, contractDurationPercent } = timeline;
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
        const isReadyFlag =
          p.is_ready === true ||
          p.is_ready === 1 ||
          String(p.is_ready || '').toLowerCase() === 'true' ||
          p.ready_for_marketing === true ||
          p.ready_for_marketing === 1 ||
          String(p.ready_for_marketing || '').toLowerCase() === 'true';
        const rakezStatusLabel = p.status === 'Approved' || isReadyFlag ? 'متاح' : (p.status === 'Rejected' || p.status === 'Refused' ? 'مؤرشف' : (p.statusLabel || p.status || '—'));
        const propertyTypeLabel = (p.unit_type_label_ar && String(p.unit_type_label_ar).trim()) || unitType || (totalUnits ? 'وحدات' : 'مشروع');

        const photo = p.photography_department;
        const imageUrl =
          p.project_image_url ??
          (photo && (photo.image_url ?? photo.image)) ??
          p.image ??
          p.image_url ??
          p.main_image ??
          p.cover_image ??
          p.photo ??
          (typeof p.project_image === 'string' ? p.project_image : null);
        const imageStr = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : '';
        const imagePending =
          !!photo &&
          (String(photo.status || '').toLowerCase() === 'pending' ||
            String(photo.approval_status || '').toLowerCase() === 'pending');
        return {
          id: p.id,
          contract_id: p.contract_id ?? p.id,
          name: p.project_name ?? p.name ?? `مشروع #${p.id}`,
          imagePending: !!imageStr && imagePending,
          location:
            `${(p.district || '').trim()}${p.district && p.city ? ', ' : ''}${(
              p.city || ''
            ).trim()}`.replace(/^,\s*|,\s*$/g, '') || '—',
          image: imageStr || null,
          hasImage: !!imageStr,
          statusLabel: p.status === 'Approved' || isReadyFlag ? 'Active' : p.status,
          statusClass: p.status === 'Approved' || isReadyFlag ? 'active' : 'pending',
          units,
          advertiser_number: p.advertiser_number,
          assignee: p.marketer,
          status: p.status,
          is_ready_for_marketing: p.status === 'Approved' || isReadyFlag,
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
          agreement_duration_days: p.agreement_duration_days ?? null,
          created_at: p.created_at ?? null,
          release_date: p.release_date ?? null,
          info: p.info ?? null,
          second_party_data: p.second_party_data ?? null,
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
            if (!detail) {
              return proj;
            }
            const pp = detail?.project_progress;
            const detailImage =
              detail?.project_image_url ?? detail?.image ?? detail?.image_url ?? detail?.main_image ?? '';
            const detailImageStr =
              typeof detailImage === 'string' && detailImage.trim() ? detailImage.trim() : '';
            const hasImageFromDetail = !!detailImageStr;

            const timelineFromDetail = contractTimelineDisplay({
              ...proj,
              contract_end_date: detail?.contract_end_date ?? proj.endDate,
              end_date: detail?.end_date,
              agreement_end_date: detail?.agreement_end_date,
              release_date: detail?.release_date,
              agreement_duration_days:
                detail?.agreement_duration_days ?? proj.agreement_duration_days,
              created_at: detail?.created_at ?? proj.created_at,
              contract_start_date: detail?.contract_start_date,
              agreement_start_date: detail?.agreement_start_date,
              info: detail?.info,
              second_party_data: detail?.second_party_data,
            });

            if (!pp) {
              const base =
                hasImageFromDetail && !proj.hasImage
                  ? { ...proj, image: detailImageStr, hasImage: true }
                  : { ...proj };
              return {
                ...base,
                ...timelineFromDetail,
                daysLeft: timelineFromDetail.daysLeftVal,
                contractRemainingLabel: timelineFromDetail.contractRemainingLabel,
                contractColor: timelineFromDetail.contractColor,
                contractDurationPercent: timelineFromDetail.contractDurationPercent,
                agreement_duration_days:
                  detail?.agreement_duration_days ?? proj.agreement_duration_days,
                endDate:
                  detail?.contract_end_date ||
                  detail?.end_date ||
                  detail?.agreement_end_date ||
                  proj.endDate,
                timelinePillLabel:
                  timelineFromDetail.daysLeftVal === null
                    ? '—'
                    : timelineFromDetail.daysLeftVal < 0
                      ? 'انتهت المهلة'
                      : `خلال ${timelineFromDetail.daysLeftVal} أيام`,
              };
            }

            const steps = Array.isArray(pp.steps) ? pp.steps : [];
            const totalSteps = steps.length > 0 ? steps.length : (pp.total_count ?? 0);
            const completedSteps =
              steps.length > 0
                ? steps.filter(s => s.completed === true).length
                : (pp.completed_count ?? 0);
            const setupProgressVal =
              totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            return {
              ...proj,
              setupProgress: setupProgressVal,
              ...timelineFromDetail,
              daysLeft: timelineFromDetail.daysLeftVal,
              contractRemainingLabel: timelineFromDetail.contractRemainingLabel,
              contractColor: timelineFromDetail.contractColor,
              contractDurationPercent: timelineFromDetail.contractDurationPercent,
              agreement_duration_days:
                detail?.agreement_duration_days ?? proj.agreement_duration_days,
              endDate:
                detail?.contract_end_date ||
                detail?.end_date ||
                detail?.agreement_end_date ||
                proj.endDate,
              timelinePillLabel:
                timelineFromDetail.daysLeftVal === null
                  ? '—'
                  : timelineFromDetail.daysLeftVal < 0
                    ? 'انتهت المهلة'
                    : `خلال ${timelineFromDetail.daysLeftVal} أيام`,
              ...(hasImageFromDetail && !proj.hasImage ? { image: detailImageStr, hasImage: true } : {}),
            };
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
      await contractService.markContractComplete(id);
      toast.success('تم تحديد المشروع كمكتمل ويظهر ضمن «جاهزة للتسويق»');
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
    try {
      if (typeof contractService.downloadContract === 'function') {
        await contractService.downloadContract(project.id);
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
