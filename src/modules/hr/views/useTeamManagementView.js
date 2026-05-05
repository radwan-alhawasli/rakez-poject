/* eslint-disable max-lines */
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

const isTruthyFlag = value => value === true || value === 1 || value === '1';
const groupTeamId = g => g?.team_id ?? g?.team?.id ?? g?.teamId ?? null;

/**
 * Exclude Sales Manager / Sales Executive from add-members picker.
 * @param {any} user
 * @returns {boolean}
 */
const isDisallowedSalesRole = user => {
  const role = Number(user?.type ?? user?.user?.type ?? user?.employee_type);
  if (role !== 6) return false;
  const isManager = isTruthyFlag(user?.is_manager ?? user?.user?.is_manager);
  const isExecutive = isTruthyFlag(
    user?.is_executive_director ?? user?.user?.is_executive_director
  );
  return isManager || isExecutive;
};

/**
 * @param {any} row
 * @returns {number|null}
 */
const salesLeaderTeamId = row => {
  const id = row?.team_id ?? row?.team?.id ?? row?.teamId ?? row?.sales_team_id ?? null;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * @param {any} row
 * @returns {number|null}
 */
const salesLeaderUserId = row => {
  const id =
    row?.user_id ??
    row?.leader_id ??
    row?.user?.id ??
    row?.leader?.id ??
    row?.member_user_id ??
    row?.employee_id ??
    row?.id ??
    null;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function useTeamManagementView() {
  const route = useRoute();
  const apiSource = computed(() => {
    const name = String(route?.name || '');
    const path = String(route?.path || '');
    if (name.startsWith('HR') || path.startsWith('/hr')) return 'hr';
    return 'project_management';
  });
  const apiOptions = () => ({ source: apiSource.value });

  /** @type {import('vue').Ref<any[]>} */
  const teams = ref([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  /** @type {ReturnType<typeof setTimeout> | null} */
  let searchTimeout = null;

  const showModal = ref(false);
  const isEditing = ref(false);
  const isSaving = ref(false);
  const teamForm = reactive({ id: /** @type {any} */ (null), name: '', description: '' });

  const showDetailModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const detailTeam = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const detailMembers = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const detailContracts = ref([]);
  const isLoadingDetail = ref(false);

  const showConfirmModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });

  const showAddMembersModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const addMembersTeam = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const availableSalesWithoutTeam = ref([]);
  const addMembersSearch = ref('');
  const addMembersLoading = ref(false);

  const showRemoveMembersModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const removeMembersTeam = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const removeMembersList = ref([]);
  const removeMembersLoading = ref(false);
  const removeMembersSearch = ref('');
  const selectedRemoveUserId = ref('');
  const removeMembersDeleting = ref(false);

  const showGroupsModal = ref(false);
  const groupsTeam = ref(null);

  const salesLeadersLoading = ref(false);
  const salesLeaderSaving = ref(false);
  const salesLeaders = ref([]);
  const salesLeaderAssign = reactive({
    team_id: '',
    user_id: '',
  });

  const showAssignLeaderModal = ref(false);
  const assignLeaderTeam = ref(null);

  /**
   * Stable user id for team member APIs.
   * @param {any} m
   * @returns {string}
   */
  const memberUserId = m => {
    if (m == null) return '';
    const v = m.user_id ?? m.id ?? m.user?.id;
    return v != null && v !== '' ? String(v) : '';
  };

  /**
   * @param {any} m
   * @returns {string}
   */
  const memberRowKey = m => memberUserId(m) || `m-${JSON.stringify(m).slice(0, 40)}`;

  /**
   * @param {any} e
   * @returns {string}
   */
  const salesRowKey = e => String(memberUserId(e) || e.email || JSON.stringify(e).slice(0, 30));

  const filteredSalesWithoutTeam = computed(() => {
    const q = addMembersSearch.value.trim().toLowerCase();
    const list = availableSalesWithoutTeam.value;
    if (!q) return list;
    return list.filter(e => {
      const n = String(e.name || e.full_name || e.user?.name || e.email || '').toLowerCase();
      return n.includes(q);
    });
  });

  const filteredRemoveMembersList = computed(() => {
    const q = removeMembersSearch.value.trim().toLowerCase();
    const list = removeMembersList.value;
    if (!q) return list;
    return list.filter(m => {
      const n = String(m.name || m.full_name || m.user?.name || m.email || '').toLowerCase();
      return n.includes(q);
    });
  });

  const salesLeaderOptions = computed(() => {
    const rows = Array.isArray(salesLeaders.value) ? salesLeaders.value : [];
    const seen = new Set();
    return rows
      .map(row => {
        const id = salesLeaderUserId(row);
        const teamId = salesLeaderTeamId(row);
        const name = row?.name || row?.leader?.name || row?.user?.name || row?.full_name || row?.email;
        return {
          value: id != null ? String(id) : '',
          label: name || (id != null ? `المستخدم #${id}` : ''),
          team_id: teamId != null ? String(teamId) : '',
        };
      })
      .filter(o => o.value && o.label)
      .filter(o => {
        if (seen.has(o.value)) return false;
        seen.add(o.value);
        return true;
      });
  });

  const selectedTeamCurrentLeader = computed(() => {
    const teamId = Number(assignLeaderTeam.value?.id);
    if (!Number.isFinite(teamId) || teamId <= 0) return null;
    return (
      (Array.isArray(salesLeaders.value) ? salesLeaders.value : []).find(
        row => salesLeaderTeamId(row) === teamId
      ) || null
    );
  });

  /**
   * Merge sales leader names into teams table rows.
   * @param {any[]} baseTeams
   */
  const applySalesLeadersToTeams = baseTeams => {
    const rows = Array.isArray(salesLeaders.value) ? salesLeaders.value : [];
    const byTeam = new Map();
    rows.forEach(row => {
      const teamId = salesLeaderTeamId(row);
      const leaderName =
        row?.name ||
        row?.leader?.name ||
        row?.user?.name ||
        row?.full_name ||
        row?.email ||
        null;
      if (teamId != null && leaderName && !byTeam.has(String(teamId))) {
        byTeam.set(String(teamId), leaderName);
      }
    });
    return (Array.isArray(baseTeams) ? baseTeams : []).map(team => ({
      ...team,
      leader_name:
        byTeam.get(String(team?.id ?? team?.team_id ?? '')) ??
        team?.leader_name ??
        team?.leader?.name ??
        team?.team_leader?.name ??
        team?.manager?.name ??
        null,
    }));
  };

  /**
   * @param {any} team
   */
  const resolveTeamMembersCount = async team => {
    const existingCount = Number(
      team?.members_count ??
        team?.members?.length ??
        team?.project_management_members_count ??
        team?.pm_members_count
    );
    if (Number.isFinite(existingCount) && existingCount > 0) {
      return { ...team, members_count: existingCount };
    }
    try {
      const [members, groups] = await Promise.all([
        teamService.getProjectManagementTeamMembers(team.id, apiOptions()),
        teamService.getTeamGroups({ team_id: team.id }, apiOptions()),
      ]);
      const groupList = Array.isArray(groups) ? groups : [];
      return {
        ...team,
        members_count: Array.isArray(members) ? members.length : 0,
        groups_count:
          Number(team?.groups_count ?? team?.team_groups_count ?? groupList.length) || groupList.length,
        groups: groupList,
      };
    } catch (error) {
      logger.warn('Error resolving team members count:', error);
      return { ...team, members_count: 0 };
    }
  };

  /**
   * @param {string} search
   */
  const fetchTeams = async (search = '') => {
    isLoading.value = true;
    try {
      const data = /** @type {any} */ (
        await teamService.getTeams({ search }, apiOptions())
      );
      const rawTeams = Array.isArray(data) ? data : data?.items ?? [];
      const resolved = await Promise.all(rawTeams.map(resolveTeamMembersCount));
      teams.value = applySalesLeadersToTeams(resolved);
    } catch (error) {
      logger.error('Error fetching teams:', error);
      toast.error('حدث خطأ أثناء جلب بيانات الفرق');
    } finally {
      isLoading.value = false;
    }
  };

  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchTeams(searchQuery.value), 300);
  };

  const openCreateModal = () => {
    isEditing.value = false;
    Object.assign(teamForm, { id: null, name: '', description: '' });
    showModal.value = true;
  };

  const openTeamGroupsModal = team => {
    groupsTeam.value = team;
    showGroupsModal.value = true;
  };

  const closeTeamGroupsModal = () => {
    showGroupsModal.value = false;
    groupsTeam.value = null;
  };

  const openAssignLeaderModal = team => {
    assignLeaderTeam.value = team;
    salesLeaderAssign.team_id = String(team?.id || '');
    salesLeaderAssign.user_id = '';
    showAssignLeaderModal.value = true;
  };

  const closeAssignLeaderModal = () => {
    showAssignLeaderModal.value = false;
    assignLeaderTeam.value = null;
    salesLeaderAssign.user_id = '';
  };

  /**
   * @param {any} team
   */
  const openEditModal = team => {
    isEditing.value = true;
    Object.assign(teamForm, { id: team.id, name: team.name, description: team.description || '' });
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const saveTeam = async () => {
    isSaving.value = true;
    try {
      const payload = { name: teamForm.name, description: teamForm.description };
      if (isEditing.value) {
        await teamService.updateTeam(/** @type {any} */ (teamForm.id), payload, apiOptions());
        toast.success('تم تحديث الفريق بنجاح');
      } else {
        await teamService.createTeam(payload, apiOptions());
        toast.success('تم إنشاء الفريق بنجاح');
      }
      closeModal();
      await fetchTeams(searchQuery.value);
    } catch (error) {
      const err = /** @type {any} */ (error);
      logger.error('Error saving team:', err);
      toast.error('فشل حفظ الفريق: ' + (err.response?.data?.message || err.message));
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * @param {any} team
   */
  const viewTeamDetails = async team => {
    detailTeam.value = team;
    detailMembers.value = [];
    detailContracts.value = [];
    showDetailModal.value = true;
    isLoadingDetail.value = true;
    try {
      const [teamDetailsResult, contracts, groups] = await Promise.allSettled([
        teamService.getTeamById(team.id, apiOptions()),
        teamService.getTeamContracts(team.id),
        teamService.getTeamGroups({ team_id: team.id }, apiOptions()),
      ]);
      const teamDetails =
        teamDetailsResult.status === 'fulfilled' && teamDetailsResult.value
          ? teamDetailsResult.value
          : null;
      const membersRaw = Array.isArray(teamDetails?.members)
        ? teamDetails.members
        : await teamService.getProjectManagementTeamMembers(team.id, apiOptions());
      detailMembers.value = (Array.isArray(membersRaw) ? membersRaw : []).map(m => ({
        ...m,
        assigned_group: null,
      }));
      const cRaw = /** @type {any} */ (contracts.status === 'fulfilled' ? contracts.value : []);
      const allGroups = groups.status === 'fulfilled' ? (Array.isArray(groups.value) ? groups.value : []) : [];
      detailContracts.value = Array.isArray(cRaw) ? cRaw : cRaw?.items ?? [];
      detailTeam.value = {
        ...team,
        ...(teamDetails && typeof teamDetails === 'object' ? teamDetails : {}),
        groups: allGroups.filter(g => String(groupTeamId(g)) === String(team.id)),
        leader_name:
          teamDetails?.leader_name ??
          teamDetails?.leader?.name ??
          teamDetails?.team_leader?.name ??
          teamDetails?.manager?.name ??
          team?.leader_name ??
          team?.leader?.name ??
          null,
      };
    } catch (error) {
      logger.error('Error loading team details:', error);
      toast.error('تعذر تحميل تفاصيل الفريق');
    } finally {
      isLoadingDetail.value = false;
    }
  };

  const closeAddMembersModal = () => {
    showAddMembersModal.value = false;
    addMembersTeam.value = null;
    availableSalesWithoutTeam.value = [];
    addMembersSearch.value = '';
  };

  /**
   * @param {any} team
   */
  const openAddMembersModal = async team => {
    addMembersTeam.value = team;
    showAddMembersModal.value = true;
    availableSalesWithoutTeam.value = [];
    addMembersSearch.value = '';
    addMembersLoading.value = true;
    try {
      const list = await teamService.getSalesWithoutTeam(apiOptions());
      const normalized = Array.isArray(list) ? list : [];
      availableSalesWithoutTeam.value = normalized.filter(u => !isDisallowedSalesRole(u));
      if (availableSalesWithoutTeam.value.length === 0) {
        toast.warning('لا يوجد مندوبي مبيعات متاحون للإضافة حالياً.');
      }
    } catch (err) {
      logger.error('Error loading sales without team:', err);
      toast.error('فشل تحميل قائمة المندوبين المتاحين');
    } finally {
      addMembersLoading.value = false;
    }
  };

  /**
   * @param {any} emp
   */
  const addMemberToTeam = async emp => {
    const team = addMembersTeam.value;
    const userId = memberUserId(emp);
    if (!team || !userId) return;
    try {
      await teamService.addProjectManagementTeamMember(team.id, userId, null, apiOptions());
      toast.success('تمت إضافة العضو إلى الفريق');
      availableSalesWithoutTeam.value = availableSalesWithoutTeam.value.filter(
        e => memberUserId(e) !== userId
      );
      if (showDetailModal.value && detailTeam.value?.id === team.id) {
        const members = await teamService.getProjectManagementTeamMembers(team.id, apiOptions());
        detailMembers.value = Array.isArray(members) ? members : [];
      }
      await fetchTeams(searchQuery.value);
    } catch (err) {
      const error = /** @type {any} */ (err);
      logger.error('Error assigning member:', error);
      toast.error('فشل إضافة العضو: ' + (error.response?.data?.message || error.message));
    }
  };

  const closeRemoveMembersModal = () => {
    showRemoveMembersModal.value = false;
    removeMembersTeam.value = null;
    removeMembersList.value = [];
    removeMembersSearch.value = '';
    selectedRemoveUserId.value = '';
    removeMembersDeleting.value = false;
  };

  /**
   * @param {any} team
   */
  const openRemoveMembersModal = async team => {
    removeMembersTeam.value = team;
    showRemoveMembersModal.value = true;
    removeMembersList.value = [];
    removeMembersSearch.value = '';
    selectedRemoveUserId.value = '';
    removeMembersLoading.value = true;
    try {
      const list = await teamService.getProjectManagementTeamMembers(team.id, apiOptions());
      removeMembersList.value = Array.isArray(list) ? list : [];
    } catch (err) {
      logger.error('Error loading team members:', err);
      toast.error('فشل تحميل أعضاء الفريق');
      removeMembersList.value = [];
    } finally {
      removeMembersLoading.value = false;
    }
  };

  const confirmRemoveSelectedFromTeam = () => {
    const team = removeMembersTeam.value;
    const userId = selectedRemoveUserId.value;
    if (!team || !userId) return;
    const member = removeMembersList.value.find(m => memberUserId(m) === userId);
    const name = member
      ? member.name || member.full_name || member.user?.name || 'هذا العضو'
      : 'هذا العضو';
    confirmModalConfig.value = {
      title: 'تأكيد إزالة العضو',
      message: `هل تريد إزالة «${name}» من الفريق؟`,
      type: 'danger',
      confirmText: 'إزالة',
      resolve: async () => {
        removeMembersDeleting.value = true;
        try {
          await teamService.removeProjectManagementTeamMember(team.id, userId, apiOptions());
          toast.success('تمت إزالة العضو من الفريق');
          removeMembersList.value = removeMembersList.value.filter(m => memberUserId(m) !== userId);
          selectedRemoveUserId.value = '';
          if (showDetailModal.value && detailTeam.value?.id === team.id) {
            detailMembers.value = detailMembers.value.filter(m => memberUserId(m) !== userId);
          }
          await fetchTeams(searchQuery.value);
        } catch (err) {
          const error = /** @type {any} */ (err);
          logger.error('Error removing member:', error);
          toast.error('فشل إزالة العضو: ' + (error.response?.data?.message || error.message));
        } finally {
          removeMembersDeleting.value = false;
        }
      },
    };
    showConfirmModal.value = true;
  };

  /**
   * @param {any} member
   */
  const confirmRemoveMember = member => {
    const team = detailTeam.value;
    if (!team) return;
    const userId = memberUserId(member);
    if (!userId) return;
    const name = member.name || member.full_name || member.user?.name || 'هذا العضو';
    confirmModalConfig.value = {
      title: 'إزالة عضو',
      message: `هل أنت متأكد من إزالة "${name}" من الفريق؟`,
      type: 'danger',
      confirmText: 'إزالة',
      resolve: async () => {
        try {
          await teamService.removeProjectManagementTeamMember(team.id, userId, apiOptions());
          toast.success('تمت إزالة العضو من الفريق');
          detailMembers.value = detailMembers.value.filter(m => memberUserId(m) !== userId);
          if (showRemoveMembersModal.value && removeMembersTeam.value?.id === team.id) {
            removeMembersList.value = removeMembersList.value.filter(m => memberUserId(m) !== userId);
          }
          await fetchTeams(searchQuery.value);
        } catch (err) {
          const error = /** @type {any} */ (err);
          logger.error('Error removing member:', error);
          toast.error('فشل إزالة العضو: ' + (error.response?.data?.message || error.message));
        }
      },
    };
    showConfirmModal.value = true;
  };

  /**
   * @param {any} team
   */
  const confirmDelete = team => {
    confirmModalConfig.value = {
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف الفريق "${team.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      type: 'danger',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await teamService.deleteTeam(team.id, apiOptions());
          toast.success('تم حذف الفريق بنجاح');
          await fetchTeams(searchQuery.value);
        } catch (error) {
          const err = /** @type {any} */ (error);
          logger.error('Error deleting team:', err);
          const msg = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء الحذف';
          toast.error(msg);
        }
      },
    };
    showConfirmModal.value = true;
  };

  const onConfirmModalConfirm = () => {
    if (confirmModalConfig.value.resolve) confirmModalConfig.value.resolve();
    showConfirmModal.value = false;
  };

  const { formatDateISO: formatDate } = useFormatters();

  const loadSalesLeaders = async () => {
    salesLeadersLoading.value = true;
    try {
      const list = await teamService.getSalesLeaders({}, apiOptions());
      salesLeaders.value = Array.isArray(list) ? list : [];
      teams.value = applySalesLeadersToTeams(teams.value);
    } catch (error) {
      logger.error('Error loading sales leaders:', error);
      salesLeaders.value = [];
      if (error?.response?.status !== 403) {
        toast.error('فشل تحميل قائمة قادة الفرق');
      }
    } finally {
      salesLeadersLoading.value = false;
    }
  };

  const assignSalesLeader = async () => {
    const teamId = Number(salesLeaderAssign.team_id);
    const userId = Number(salesLeaderAssign.user_id);
    if (!Number.isFinite(teamId) || teamId <= 0 || !Number.isFinite(userId) || userId <= 0) {
      toast.warning('اختر الفريق والقائد أولاً');
      return;
    }
    salesLeaderSaving.value = true;
    try {
      await teamService.assignSalesLeaderToTeam(teamId, userId, apiOptions());
      toast.success('تم تعيين قائد الفريق بنجاح');
      salesLeaderAssign.user_id = '';
      await loadSalesLeaders();
      await fetchTeams(searchQuery.value);
      closeAssignLeaderModal();
    } catch (error) {
      logger.error('Error assigning sales leader:', error);
      toast.error(error?.response?.data?.message || 'فشل تعيين قائد الفريق');
    } finally {
      salesLeaderSaving.value = false;
    }
  };

  /**
   * @param {any} row
   */
  const removeSalesLeader = async row => {
    const teamId = Number(salesLeaderTeamId(row) ?? row?.team_id ?? row?.team?.id);
    const userId = Number(salesLeaderUserId(row));
    if (!Number.isFinite(teamId) || teamId <= 0 || !Number.isFinite(userId) || userId <= 0) {
      toast.warning('تعذر تحديد القائد المراد إزالته');
      return;
    }
    try {
      await teamService.removeSalesLeaderFromTeam(teamId, userId, apiOptions());
      toast.success('تمت إزالة قائد الفريق');
      await loadSalesLeaders();
      await fetchTeams(searchQuery.value);
    } catch (error) {
      logger.error('Error removing sales leader:', error);
      toast.error(error?.response?.data?.message || 'فشل إزالة قائد الفريق');
    }
  };

  const removeLeaderFromTeam = async team => {
    const teamId = Number(team?.id);
    if (!Number.isFinite(teamId) || teamId <= 0) return;
    const row = (Array.isArray(salesLeaders.value) ? salesLeaders.value : []).find(
      item => salesLeaderTeamId(item) === teamId
    );
    if (!row) {
      toast.warning('لا يوجد قائد معيّن لهذا الفريق');
      return;
    }
    await removeSalesLeader(row);
  };

  /**
   * @param {any} id
   * @returns {string}
   */
  const chipColor = id => {
    const colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#f39c12'];
    return colors[(id || 0) % colors.length];
  };

  onMounted(async () => {
    await fetchTeams();
    await loadSalesLeaders();
  });

  return {
    apiSource,
    teams,
    isLoading,
    searchQuery,
    debouncedSearch,
    showModal,
    isEditing,
    isSaving,
    teamForm,
    openCreateModal,
    openEditModal,
    closeModal,
    saveTeam,
    showDetailModal,
    detailTeam,
    detailMembers,
    detailContracts,
    isLoadingDetail,
    viewTeamDetails,
    confirmDelete,
    showConfirmModal,
    confirmModalConfig,
    onConfirmModalConfirm,
    showAddMembersModal,
    addMembersTeam,
    availableSalesWithoutTeam,
    addMembersSearch,
    filteredSalesWithoutTeam,
    addMembersLoading,
    openAddMembersModal,
    closeAddMembersModal,
    addMemberToTeam,
    salesRowKey,
    showRemoveMembersModal,
    removeMembersTeam,
    removeMembersList,
    removeMembersLoading,
    removeMembersSearch,
    filteredRemoveMembersList,
    selectedRemoveUserId,
    removeMembersDeleting,
    openRemoveMembersModal,
    closeRemoveMembersModal,
    confirmRemoveSelectedFromTeam,
    memberUserId,
    memberRowKey,
    confirmRemoveMember,
    formatDate,
    chipColor,
    showGroupsModal,
    groupsTeam,
    openTeamGroupsModal,
    closeTeamGroupsModal,
    salesLeaders,
    salesLeadersLoading,
    salesLeaderSaving,
    salesLeaderAssign,
    salesLeaderOptions,
    assignSalesLeader,
    removeSalesLeader,
    showAssignLeaderModal,
    assignLeaderTeam,
    openAssignLeaderModal,
    closeAssignLeaderModal,
    selectedTeamCurrentLeader,
    removeLeaderFromTeam,
  };
}
