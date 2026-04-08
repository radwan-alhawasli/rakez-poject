import { ref, reactive, onMounted, computed } from 'vue';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useTeamManagementView() {
  const teams = ref([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  let searchTimeout = null;

  const showModal = ref(false);
  const isEditing = ref(false);
  const isSaving = ref(false);
  const teamForm = reactive({ id: null, name: '', description: '' });

  const showDetailModal = ref(false);
  const detailTeam = ref(null);
  const detailMembers = ref([]);
  const detailContracts = ref([]);
  const isLoadingDetail = ref(false);

  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'تأكيد',
    resolve: null,
  });

  const showAddMembersModal = ref(false);
  const addMembersTeam = ref(null);
  const availableSalesWithoutTeam = ref([]);
  const addMembersSearch = ref('');
  const addMembersLoading = ref(false);

  const showRemoveMembersModal = ref(false);
  const removeMembersTeam = ref(null);
  const removeMembersList = ref([]);
  const removeMembersLoading = ref(false);
  const removeMembersSearch = ref('');
  const selectedRemoveUserId = ref('');
  const removeMembersDeleting = ref(false);

  /** Stable user id for PM team APIs (POST/DELETE members). */
  const memberUserId = m => {
    if (m == null) return '';
    const v = m.user_id ?? m.id ?? m.user?.id;
    return v != null && v !== '' ? String(v) : '';
  };

  const memberRowKey = m => memberUserId(m) || `m-${JSON.stringify(m).slice(0, 40)}`;
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
      const members = await teamService.getProjectManagementTeamMembers(team.id);
      return { ...team, members_count: Array.isArray(members) ? members.length : 0 };
    } catch (error) {
      logger.warn('Error resolving team members count:', error);
      return { ...team, members_count: 0 };
    }
  };

  const fetchTeams = async (search = '') => {
    isLoading.value = true;
    try {
      const data = await teamService.getTeams(search);
      const rawTeams = Array.isArray(data) ? data : data?.items ?? [];
      teams.value = await Promise.all(rawTeams.map(resolveTeamMembersCount));
    } catch (error) {
      logger.error('Error fetching teams:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      isLoading.value = false;
    }
  };

  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchTeams(searchQuery.value), 300);
  };

  const openCreateModal = () => {
    isEditing.value = false;
    Object.assign(teamForm, { id: null, name: '', description: '' });
    showModal.value = true;
  };

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
        await teamService.updateTeam(teamForm.id, payload);
        toast.success('تم تحديث الفريق بنجاح');
      } else {
        await teamService.createTeam(payload);
        toast.success('تم إنشاء الفريق بنجاح');
      }
      closeModal();
      fetchTeams(searchQuery.value);
    } catch (error) {
      logger.error('Error saving team:', error);
      toast.error('حدث خطأ أثناء الحفظ: ' + (error.response?.data?.message || error.message));
    } finally {
      isSaving.value = false;
    }
  };

  const viewTeamDetails = async team => {
    detailTeam.value = team;
    detailMembers.value = [];
    detailContracts.value = [];
    showDetailModal.value = true;
    isLoadingDetail.value = true;
    try {
      const [members, contracts] = await Promise.allSettled([
        teamService.getProjectManagementTeamMembers(team.id),
        teamService.getTeamContracts(team.id),
      ]);
      const raw = members.status === 'fulfilled' ? (Array.isArray(members.value) ? members.value : []) : [];
      detailMembers.value = raw;
      const cRaw = contracts.status === 'fulfilled' ? contracts.value : [];
      detailContracts.value = Array.isArray(cRaw) ? cRaw : cRaw?.items ?? [];
    } catch (error) {
      logger.error('Error loading team details:', error);
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

  const openAddMembersModal = async team => {
    addMembersTeam.value = team;
    showAddMembersModal.value = true;
    availableSalesWithoutTeam.value = [];
    addMembersSearch.value = '';
    addMembersLoading.value = true;
    try {
      const list = await teamService.getSalesWithoutTeam();
      availableSalesWithoutTeam.value = Array.isArray(list) ? list : [];
      if (availableSalesWithoutTeam.value.length === 0) {
        toast.warning('لا يوجد مندوبو مبيعات بلا فريق أو فشل التحميل.');
      }
    } catch (err) {
      logger.error('Error loading sales without team:', err);
      toast.error('فشل تحميل قائمة المندوبين');
    } finally {
      addMembersLoading.value = false;
    }
  };

  const addMemberToTeam = async emp => {
    const team = addMembersTeam.value;
    const userId = memberUserId(emp);
    if (!team || !userId) return;
    try {
      await teamService.addProjectManagementTeamMember(team.id, userId);
      toast.success('تم إضافة العضو إلى الفريق');
      availableSalesWithoutTeam.value = availableSalesWithoutTeam.value.filter(
        e => memberUserId(e) !== userId
      );
      if (showDetailModal.value && detailTeam.value?.id === team.id) {
        const members = await teamService.getProjectManagementTeamMembers(team.id);
        detailMembers.value = Array.isArray(members) ? members : [];
      }
      fetchTeams(searchQuery.value);
    } catch (err) {
      logger.error('Error assigning member:', err);
      toast.error('فشل إضافة العضو: ' + (err.response?.data?.message || err.message));
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

  const openRemoveMembersModal = async team => {
    removeMembersTeam.value = team;
    showRemoveMembersModal.value = true;
    removeMembersList.value = [];
    removeMembersSearch.value = '';
    selectedRemoveUserId.value = '';
    removeMembersLoading.value = true;
    try {
      const list = await teamService.getProjectManagementTeamMembers(team.id);
      removeMembersList.value = Array.isArray(list) ? list : [];
    } catch (err) {
      logger.error('Error loading PM team members:', err);
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
      confirmText: 'حذف',
      resolve: async () => {
        removeMembersDeleting.value = true;
        try {
          await teamService.removeProjectManagementTeamMember(team.id, userId);
          toast.success('تم إزالة العضو من الفريق');
          removeMembersList.value = removeMembersList.value.filter(m => memberUserId(m) !== userId);
          selectedRemoveUserId.value = '';
          if (showDetailModal.value && detailTeam.value?.id === team.id) {
            detailMembers.value = detailMembers.value.filter(m => memberUserId(m) !== userId);
          }
          fetchTeams(searchQuery.value);
        } catch (err) {
          logger.error('Error removing member:', err);
          toast.error('فشل إزالة العضو: ' + (err.response?.data?.message || err.message));
        } finally {
          removeMembersDeleting.value = false;
        }
      },
    };
    showConfirmModal.value = true;
  };

  const confirmRemoveMember = member => {
    const team = detailTeam.value;
    if (!team) return;
    const userId = memberUserId(member);
    if (!userId) return;
    const name = member.name || member.full_name || member.user?.name || 'هذا العضو';
    confirmModalConfig.value = {
      title: 'حذف مسوق',
      message: `هل أنت متأكد من إزالة "${name}" من الفريق؟`,
      type: 'danger',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await teamService.removeProjectManagementTeamMember(team.id, userId);
          toast.success('تم إزالة العضو من الفريق');
          detailMembers.value = detailMembers.value.filter(m => memberUserId(m) !== userId);
          if (showRemoveMembersModal.value && removeMembersTeam.value?.id === team.id) {
            removeMembersList.value = removeMembersList.value.filter(m => memberUserId(m) !== userId);
          }
          fetchTeams(searchQuery.value);
        } catch (err) {
          logger.error('Error removing member:', err);
          toast.error('فشل إزالة العضو: ' + (err.response?.data?.message || err.message));
        }
      },
    };
    showConfirmModal.value = true;
  };

  const confirmDelete = team => {
    confirmModalConfig.value = {
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف الفريق "${team.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      type: 'danger',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await teamService.deleteTeam(team.id);
          toast.success('تم حذف الفريق بنجاح');
          fetchTeams(searchQuery.value);
        } catch (error) {
          logger.error('Error deleting team:', error);
          const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء الحذف';
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

  const chipColor = id => {
    const colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#f39c12'];
    return colors[(id || 0) % colors.length];
  };

  onMounted(() => fetchTeams());

  return {
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
  };
}
