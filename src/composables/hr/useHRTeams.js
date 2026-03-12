import { ref, computed, watch, shallowRef } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useHRTeams(_isHR) {
  const { formatCurrency } = useFormatters();

  const teamSearchQuery = ref('');
  const teamsLoadId = ref(0);
  const teamsData = shallowRef([]);

  const filteredTeams = computed(() => {
    const list = teamsData.value;
    return Array.isArray(list) ? list.filter(t => t != null) : [];
  });

  // Team modal states
  const showTeamModal = ref(false);
  const editingTeam = ref(null);
  const isSavingTeam = ref(false);

  // Link marketers modal states
  const showLinkModal = ref(false);
  const selectedTeamToLink = ref(null);
  const isLinking = ref(false);

  // Projects / Marketers modals
  const showProjectsModal = ref(false);
  const showMarketersModal = ref(false);
  const selectedTeamDetails = ref(null);
  const teamProjects = ref([]);
  const teamMarketers = ref([]);
  const isLoadingDetails = ref(false);
  const isLoadingMarketers = ref(false);

  // Confirm modal
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });

  const formatSalesAverage = value => {
    const n = Number(value);
    if (Number.isNaN(n) || n === 0) return '0';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace(/\.?0+$/, '');
  };

  const memberName = m => {
    if (m == null) return '';
    if (typeof m === 'string') return m.trim();
    return (
      m?.name ??
      m?.full_name ??
      m?.user?.name ??
      m?.user?.full_name ??
      m?.email ??
      (m?.id != null ? String(m.id) : '')
    );
  };

  const openProjectsModal = async team => {
    selectedTeamDetails.value = team;
    showProjectsModal.value = true;
    isLoadingDetails.value = true;
    try {
      const contractsResponse = await hrService.getTeamContracts(team.id);
      const contracts = contractsResponse.data || contractsResponse || [];

      const enrichedContracts = await Promise.all(
        contracts.map(async contract => {
          try {
            const locationsResponse = await hrService.getTeamContractLocations(team.id);
            const locations = locationsResponse.data || locationsResponse || [];
            const contractLocation =
              locations.find(loc => loc.contract_id === contract.id) || locations[0] || {};

            return {
              ...contract,
              city: contractLocation.city || contract.city || '',
              district: contractLocation.district || contract.district || '',
              location: contractLocation.location || contract.location || '',
              address: contractLocation.address || contract.address || '',
            };
          } catch (locErr) {
            logger.error('Error fetching location for contract:', locErr);
            return contract;
          }
        })
      );

      teamProjects.value = enrichedContracts;
    } catch (error) {
      logger.error('Error fetching team projects:', error);
      teamProjects.value = [];
    } finally {
      isLoadingDetails.value = false;
    }
  };

  const openMarketersModal = async team => {
    if (!team) return;
    selectedTeamDetails.value = team;
    teamMarketers.value = [];
    showMarketersModal.value = true;
    if (team.id == null) return;
    isLoadingMarketers.value = true;
    try {
      const membersList = await hrService.getHRTeamMembers(team.id);
      const list = Array.isArray(membersList) ? membersList : [];
      const names = list
        .map(m => {
          if (typeof m === 'string') return m.trim() || null;
          return memberName(m) || (m?.id != null ? String(m.id) : null) || null;
        })
        .filter(Boolean);
      teamMarketers.value = names;
    } catch (err) {
      logger.error('Error loading team marketers:', err);
      teamMarketers.value = [];
    } finally {
      isLoadingMarketers.value = false;
    }
  };

  const openAddTeamModal = () => {
    editingTeam.value = null;
    showTeamModal.value = true;
  };

  const openEditTeamModal = team => {
    editingTeam.value = { ...team };
    showTeamModal.value = true;
  };

  const handleTeamSubmit = async teamData => {
    isSavingTeam.value = true;
    try {
      if (editingTeam.value) {
        await hrService.updateTeam(editingTeam.value.id, teamData);
        toast.success('تم تحديث بيانات الفريق بنجاح');
      } else {
        await hrService.createTeam(teamData);
        toast.success('تم إنشاء الفريق بنجاح');
      }
      showTeamModal.value = false;
      loadTeams();
    } catch (error) {
      logger.error('Error saving team:', error);
      toast.error('حدث خطأ أثناء حفظ بيانات الفريق');
    } finally {
      isSavingTeam.value = false;
    }
  };

  const handleDeleteTeam = team => {
    confirmModalConfig.value = {
      title: 'حذف الفريق',
      message: `هل أنت متأكد من حذف فريق "${team.name}"؟`,
      type: 'danger',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await hrService.deleteTeam(team.id);
          toast.success('تم حذف الفريق بنجاح');
          loadTeams();
        } catch (error) {
          logger.error('Error deleting team:', error);
          toast.error('حدث خطأ أثناء حذف الفريق');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const handleLinkMarketers = team => {
    selectedTeamToLink.value = team;
    showLinkModal.value = true;
  };

  const handleLinkMarketersSubmit = async selectedIds => {
    isLinking.value = true;
    try {
      await hrService.linkMarketersToTeam(selectedTeamToLink.value.id, selectedIds);
      toast.success('تم ربط المسوقين بالفريق بنجاح');
      showLinkModal.value = false;
      loadTeams();
    } catch (error) {
      logger.error(error);
      toast.error('حدث خطأ أثناء ربط المسوقين');
    } finally {
      isLinking.value = false;
    }
  };

  const loadTeams = async () => {
    const currentLoadId = teamsLoadId.value + 1;
    teamsLoadId.value = currentLoadId;
    try {
      const params = {};
      if (teamSearchQuery.value) {
        params.search = teamSearchQuery.value;
      }
      const data = await hrService.getTeams(params);
      const teams = data?.items ?? (Array.isArray(data) ? data : data?.data || []);
      const safeTeams = Array.isArray(teams) ? teams : [];

      const toMemberNames = list => {
        if (!Array.isArray(list)) return [];
        return list
          .map(m =>
            typeof m === 'string'
              ? m
              : m?.name ?? m?.user?.name ?? m?.email ?? String(m?.id ?? '')
          )
          .filter(Boolean);
      };

      const toLocationsString = team => {
        const loc = team.locations;
        if (typeof loc === 'string' && loc.trim()) return loc.trim();
        if (Array.isArray(loc)) {
          const parts = loc
            .map(l => (typeof l === 'string' ? l : l?.city || l?.district || ''))
            .filter(Boolean);
          return parts.length ? parts.join('، ') : '';
        }
        if (Array.isArray(team.contract_locations)) {
          const parts = team.contract_locations
            .map(l =>
              typeof l === 'string' ? l.trim() : `${l?.city || ''} ${l?.district || ''}`.trim()
            )
            .filter(Boolean);
          return parts.length ? parts.join('، ') : '';
        }
        return '';
      };

      const basicTeams = safeTeams.map((team, idx) => {
        const rawMembers = team.members ?? team.users ?? team.team_members ?? [];
        const members = toMemberNames(rawMembers);
        const soldProjects =
          team.sold_projects ?? team.projects_count ?? team.contracts_count ?? 0;
        const salesAverage =
          team.sales_average ?? team.average_sales ?? team.sold_units_per_sales_employee ?? 0;
        const locationsStr = toLocationsString(team) || 'جاري التحميل...';
        const avg = typeof salesAverage === 'number' ? salesAverage : 0;
        return {
          ...team,
          id: team.id ?? `team-${idx}`,
          soldProjects: typeof soldProjects === 'number' ? soldProjects : 0,
          salesAverage: avg,
          salesAverageFormatted: formatSalesAverage(avg),
          locations: locationsStr,
          goalProgress: team.goal_progress ?? 0,
          members: Array.isArray(members) ? members : [],
          color: team.color || '#B1A28F',
        };
      });

      teamsData.value = basicTeams;

      safeTeams.forEach(async (team, index) => {
        const results = await Promise.allSettled([
          hrService.getTeamContracts(team.id),
          hrService.getTeamSalesAverage(team.id),
          hrService.getTeamContractLocations(team.id),
          hrService.getHRTeamMembers(team.id),
        ]);

        if (teamsLoadId.value !== currentLoadId) return;

        const contracts = results[0].status === 'fulfilled' ? results[0].value : [];
        const salesAvg = results[1].status === 'fulfilled' ? results[1].value : {};
        const locations = results[2].status === 'fulfilled' ? results[2].value : [];
        const membersList = results[3].status === 'fulfilled' ? results[3].value : [];

        const contractsArray = Array.isArray(contracts) ? contracts : contracts?.data || [];
        const avgValue =
          salesAvg?.average_sales?.sold_units_per_sales_employee ??
          salesAvg?.data?.average_sales?.sold_units_per_sales_employee ??
          0;
        const locationsArray = Array.isArray(locations) ? locations : locations?.data || [];
        const locationsText =
          locationsArray
            .map(loc => `${loc.city || ''} ${loc.district || ''}`)
            .filter(Boolean)
            .join('، ') || 'غير محدد';

        const memberNames = Array.isArray(membersList)
          ? membersList.map(m => memberName(m) || String(m?.id ?? '')).filter(Boolean)
          : [];

        const current = teamsData.value[index];
        if (
          teamsLoadId.value !== currentLoadId ||
          !current ||
          current.id !== (team.id ?? basicTeams[index]?.id)
        )
          return;
        const updatedTeams = [...teamsData.value];
        updatedTeams[index] = {
          ...updatedTeams[index],
          soldProjects: contractsArray.length,
          salesAverage: avgValue,
          salesAverageFormatted: formatSalesAverage(avgValue),
          locations: locationsText,
          members:
            Array.isArray(memberNames) && memberNames.length
              ? memberNames
              : Array.isArray(updatedTeams[index].members)
              ? updatedTeams[index].members
              : [],
        };
        teamsData.value = updatedTeams;
      });
    } catch (error) {
      logger.error('Error loading teams:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات الفرق');
      teamsData.value = [];
    }
  };

  watch(teamSearchQuery, () => {
    loadTeams();
  });

  return {
    teamSearchQuery,
    teamsData,
    filteredTeams,
    formatSalesAverage,
    memberName,
    formatCurrency,
    showTeamModal,
    editingTeam,
    isSavingTeam,
    openAddTeamModal,
    openEditTeamModal,
    handleTeamSubmit,
    handleDeleteTeam,
    showConfirmModal,
    confirmModalConfig,
    onConfirmModalConfirm,
    handleLinkMarketers,
    showLinkModal,
    selectedTeamToLink,
    isLinking,
    handleLinkMarketersSubmit,
    showProjectsModal,
    showMarketersModal,
    selectedTeamDetails,
    teamProjects,
    teamMarketers,
    isLoadingDetails,
    isLoadingMarketers,
    openProjectsModal,
    openMarketersModal,
    loadTeams,
  };
}
