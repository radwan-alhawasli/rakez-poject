import { ref, computed, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';
import { computeSetupProgressPercentSixStages } from '@/utils/projectProgressSteps';
import { resolveProjectDeveloperName, resolveProjectTypeLabel } from '@/utils/projectMeta';

export function useSalesProjects() {
  const router = useRouter();
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  /** @type {import('vue').ShallowRef<any[]>} */
  const projects = shallowRef([]);
  const isLoadingProjects = ref(false);
  const searchQuery = ref('');
  /** @type {import('vue').Ref<any>} */
  const selectedProject = ref(null);
  const showProjectModal = ref(false);
  const isLoadingProjectDetails = ref(false);
  /** @type {import('vue').ShallowRef<any[]>} */
  const projectUnits = shallowRef([]);
  const isLoadingUnits = ref(false);
  /** @type {import('vue').Ref<string | number | null>} */
  const activeMenuId = ref(null);
  const projectsTab = ref('ready');

  /** @param {any} p */
  const isProjectReady = p => {
    if (p.is_ready === true || p.is_ready === 1) return true;
    const s = String(p.status || p.contract_status || '').toLowerCase();
    const hasUnits = (p.total_units ?? 0) > 0 || (p.available_units ?? 0) >= 0;
    return (s === 'approved' || s === 'ready' || s === 'completed') && hasUnits;
  };

  /** @param {any} p */
  const _isProjectArchived = p => {
    const s = String(p.status || p.contract_status || '').toLowerCase();
    return s === 'refused' || s === 'rejected' || s === 'archived';
  };

  const projectsList = computed(() => (Array.isArray(projects.value) ? projects.value : []));

  const filteredProjects = computed(() => {
    /** @type {any[]} */
    let filtered = projectsList.value.filter(p => isProjectReady(p));
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  });

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const user = authService.getCurrentUser();
      const isLeader = user && isSalesLeader(user);
      const params = {
        scope: isLeader ? 'team' : 'me',
        per_page: 100,
      };
      const response = await salesService.getProjects(params);
      /** @type {any} */
      const res = response;
      let rawData = res?.data?.data || res?.data || res;
      if (!Array.isArray(rawData) && rawData?.data) rawData = rawData.data;
      if (!Array.isArray(rawData)) rawData = [];

      /** @param {any} p */
      const totalUnits = p => p.total_units ?? p.units_count ?? p.totalUnits ?? 0;
      /** @param {any} p */
      const reservedUnits = p => p.reserved_units ?? p.reservedUnits ?? 0;
      projects.value = rawData.map((/** @type {any} */ p) => {
        const id = p.contract_id || p.id;
        const contractStatus = (
          p.contract_status || p.sales_status || p.status || 'pending'
        ).toString().toLowerCase();
        const total = totalUnits(p);
        const reserved = Number(reservedUnits(p)) || 0;
        const sold = Number(p.sold_units ?? 0) || Math.max(0, total - (p.available_units ?? 0) - reserved);
        const soldPct =
          p.sold_units_percent != null ? Number(p.sold_units_percent) : total ? Math.round((sold / total) * 100) : 0;

        let statusClass = 'pending';
        let statusLabel = p.project_status_label_ar || '';
        if (p.is_ready === true || p.is_ready === 1) {
          statusClass = contractStatus === 'completed' ? 'completed' : 'ready';
          statusLabel = statusLabel || 'جاهز - متاح للبيع';
        } else if (['archived', 'rejected', 'refused'].includes(contractStatus)) {
          statusClass = 'rejected';
          statusLabel = statusLabel || 'مرفوض';
        } else if (contractStatus === 'completed') {
          statusClass = 'completed';
          statusLabel = statusLabel || 'مكتمل';
        } else if (contractStatus === 'ready' || contractStatus === 'ready_for_marketing') {
          statusClass = 'ready';
          statusLabel = statusLabel || 'جاهز - متاح للبيع';
        } else if (contractStatus === 'approved' || contractStatus === 'active') {
          statusClass = 'approved';
          statusLabel = statusLabel || 'معتمد';
        } else {
          statusClass = 'pending';
          statusLabel = statusLabel || 'غير جاهز - تتبع الأوراق';
        }

        const remainingDaysApi = p.remaining_days != null ? Number(p.remaining_days) : null;
        const endDate = p.contract_end_date || p.end_date || p.agreement_end_date || null;
        let daysLeft = remainingDaysApi;
        if (daysLeft == null && endDate) {
          const d = new Date(endDate);
          if (!Number.isNaN(d.getTime())) {
            daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          }
        }

        const loc =
          (p.location && String(p.location).trim()) ||
          [p.city || p.location_city, p.district || p.location_district].filter(Boolean).join(', ') ||
          '—';
        const desc = p.description || p.details || p.project_description || '';
        const descriptionLine = desc ? desc.split('\n')[0].trim() : total ? `${total} وحدة` : '';
        const img = p.project_image_url || p.image || '';
        const hasImage = !!(img && String(img).trim());

        const isReadyForMarketing =
          p.is_ready === true || p.is_ready === 1 ||
          (['approved', 'ready', 'ready_for_marketing', 'completed', 'active'].includes(contractStatus) &&
            (total > 0 || (p.available_units ?? 0) >= 0));
        const setupProgressVal = isReadyForMarketing
          ? 100
          : computeSetupProgressPercentSixStages(p);

        const rakezStatusLabel =
          (p.status_badge_ar && String(p.status_badge_ar).trim()) ||
          (statusClass === 'ready' || statusClass === 'completed' ? 'متاح' : statusLabel || '—');
        const propertyTypeLabel =
          (p.unit_type_label_ar && String(p.unit_type_label_ar).trim()) ||
          (p.property_type || p.unit_type || p.project_type || '').toString().trim() ||
          (total > 0 ? 'وحدات' : '') || 'مشروع';

        const priceMin = p.price_min ?? p.min_price ?? p.price_range_min;
        const priceMax = p.price_max ?? p.max_price ?? p.price_range_max;
        const avgPrice = p.average_unit_price ?? p.avg_unit_price ?? p.avg_price;
        let priceRangeText = '—';
        if (priceMin != null && priceMax != null && priceMin !== priceMax) {
          priceRangeText = `${Number(priceMax).toLocaleString('en-US')} - ${Number(priceMin).toLocaleString('en-US')}`;
        } else if (priceMin != null || priceMax != null) {
          const single = priceMax ?? priceMin;
          priceRangeText = `${Number(single).toLocaleString('en-US')} - ${Number(single).toLocaleString('en-US')}`;
        } else if (avgPrice != null && Number(avgPrice) > 0) {
          const n = Number(avgPrice);
          priceRangeText = `${n.toLocaleString('en-US')} - ${n.toLocaleString('en-US')}`;
        }

        const bedroomsMin = p.bedrooms_min ?? p.min_bedrooms ?? p.rooms_min;
        const bedroomsMax = p.bedrooms_max ?? p.max_bedrooms ?? p.rooms_max;
        const bedroomsRange =
          bedroomsMin != null && bedroomsMax != null ? `${bedroomsMin} - ${bedroomsMax}` :
          bedroomsMax != null ? `${bedroomsMax} - ${bedroomsMax}` :
          bedroomsMin != null ? `${bedroomsMin} - ${bedroomsMin}` : '—';
        const areaMin = p.area_min_m2 ?? p.area_min ?? p.min_area ?? p.area_m2_min;
        const areaMax = p.area_max_m2 ?? p.area_max ?? p.max_area ?? p.area_m2_max;
        const areaRange =
          areaMin != null && areaMax != null ? `${areaMin} - ${areaMax}` :
          areaMax != null ? `${areaMax} - ${areaMax}` :
          areaMin != null ? `${areaMin} - ${areaMin}` : '—';

        return {
          ...p,
          id,
          name: p.project_name || p.name || `مشروع #${id || ''}`,
          location: loc,
          image: img || '/img/placeholder-project.jpg',
          hasImage,
          developer_name: resolveProjectDeveloperName(p),
          project_type_label: resolveProjectTypeLabel(p),
          status: contractStatus,
          contract_status: contractStatus,
          is_ready: p.is_ready ?? false,
          statusLabel,
          statusClass,
          total_units: total,
          available_units: p.available_units ?? p.availableUnits ?? Math.max(0, total - sold - reserved),
          reserved_units: reserved,
          sold_units: sold,
          assignee: p.team_name || p.marketer_name || p.marketer || null,
          setupProgress: setupProgressVal,
          soldUnitsPercent: soldPct,
          soldUnitsCount: sold,
          daysLeft,
          descriptionLine,
          description: desc || 'لا يوجد وصف متاح لهذا المشروع حالياً.',
          rakezStatusLabel,
          propertyTypeLabel,
          priceRangeText,
          bedroomsRange,
          areaRange,
        };
      });
    } catch (error) {
      logger.error('Error loading projects list:', error);
    } finally {
      isLoadingProjects.value = false;
    }
  };

  /** @param {string | number} projectId */
  const viewProjectDetails = projectId => {
    router.push({ name: 'ProjectTracker', params: { id: projectId } });
  };

  /** @param {string | number} projectId */
  const viewTracker = projectId => {
    router.push({ name: 'ProjectTracker', params: { id: projectId } });
  };

  return {
    projects,
    filteredProjects,
    isLoadingProjects,
    searchQuery,
    selectedProject,
    showProjectModal,
    isLoadingProjectDetails,
    projectUnits,
    isLoadingUnits,
    activeMenuId,
    projectsTab,
    loadProjects,
    viewProjectDetails,
    viewTracker,
    formatCurrency,
  };
}
