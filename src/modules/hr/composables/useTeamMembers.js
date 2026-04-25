import { ref, computed } from 'vue';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/**
 * @param {Function} [fetchTeamsCallback]
 */
export function useTeamMembers(fetchTeamsCallback) {
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

  /**
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
      const list = await teamService.getSalesWithoutTeam();
      availableSalesWithoutTeam.value = Array.isArray(list) ? list : [];
    } catch (err) {
      logger.error('Error loading sales without team:', err);
      toast.error('فشل تحميل قائمة المندوبين');
    } finally {
      addMembersLoading.value = false;
    }
  };

  const closeAddMembersModal = () => {
    showAddMembersModal.value = false;
    addMembersTeam.value = null;
    availableSalesWithoutTeam.value = [];
    addMembersSearch.value = '';
  };

  /**
   * @param {any} emp
   */
  const addMemberToTeam = async emp => {
    const team = addMembersTeam.value;
    const userId = memberUserId(emp);
    if (!team || !userId) return;
    try {
      await teamService.addProjectManagementTeamMember(team.id, userId);
      toast.success('تم إضافة العضو إلى الفريق');
      availableSalesWithoutTeam.value = availableSalesWithoutTeam.value.filter(e => memberUserId(e) !== userId);
      if (fetchTeamsCallback) fetchTeamsCallback();
    } catch (err) {
      const error = /** @type {any} */ (err);
      logger.error('Error assigning member:', error);
      toast.error('فشل إضافة العضو: ' + (error.response?.data?.message || error.message));
    }
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
      const list = await teamService.getProjectManagementTeamMembers(team.id);
      removeMembersList.value = Array.isArray(list) ? list : [];
    } catch (err) {
      logger.error('Error loading PM team members:', err);
      toast.error('فشل تحميل أعضاء الفريق');
    } finally {
      removeMembersLoading.value = false;
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

  return {
    showAddMembersModal, addMembersTeam, availableSalesWithoutTeam, addMembersSearch, addMembersLoading,
    showRemoveMembersModal, removeMembersTeam, removeMembersList, removeMembersLoading, removeMembersSearch,
    selectedRemoveUserId, removeMembersDeleting,
    memberUserId, memberRowKey, salesRowKey,
    filteredSalesWithoutTeam, filteredRemoveMembersList,
    openAddMembersModal, closeAddMembersModal, addMemberToTeam,
    openRemoveMembersModal, closeRemoveMembersModal
  };
}
