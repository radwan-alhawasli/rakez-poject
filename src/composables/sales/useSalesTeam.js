import { ref, computed, shallowRef, watch } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesTeam() {
  const { hasPermission } = usePermissions();
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const teamMembers = shallowRef([]);
  const teamProjects = shallowRef([]);
  const isLoadingTeam = ref(false);
  const isLoadingTeamProjects = ref(false);
  const teamSortByRecommendation = ref(false);
  const teamRecommendations = shallowRef([]);
  const isLoadingTeamRecommendations = ref(false);
  const memberRatingSaving = ref(null);
  const memberCommentEditId = ref(null);
  const memberCommentDrafts = ref({});
  const memberToRemove = ref(null);
  const memberRemoveLoading = ref(false);

  const teamMembersDisplay = computed(() => {
    if (teamSortByRecommendation.value && teamRecommendations.value.length > 0) {
      return teamRecommendations.value;
    }
    const list = Array.isArray(teamMembers.value) ? teamMembers.value : [];
    const withScore = list.map(m => {
      const totalRes = Math.max(1, Number(m.total_reservations) || 0);
      const confirmedRate = (Number(m.confirmed_bookings) || 0) / totalRes;
      const villaCount = Number(m.villa_count) || 0;
      const totalVal = Number(m.total_value) || 0;
      const score = totalVal * 0.0001 + confirmedRate * 100 + villaCount * 50;
      return { ...m, recommendationScore: score };
    });
    if (teamSortByRecommendation.value) {
      return [...withScore].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
    }
    return withScore;
  });

  const loadTeamMembers = async () => {
    isLoadingTeam.value = true;
    try {
      teamMembers.value = await salesService.getTeamMembers();
    } catch (error) {
      logger.error('Error loading team members:', error);
    } finally {
      isLoadingTeam.value = false;
    }
  };

  const loadTeamProjects = async () => {
    isLoadingTeamProjects.value = true;
    try {
      const data = await salesService.getTeamProjects();
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      teamProjects.value = raw.map(p => ({
        ...p,
        id: p.contract_id ?? p.id,
        contract_id: p.contract_id ?? p.id,
        project_name:
          p.project_name ?? p.name ?? p.contract_name ?? `مشروع #${p.contract_id ?? p.id ?? ''}`,
      }));
    } catch (error) {
      logger.error('Error loading team projects:', error);
    } finally {
      isLoadingTeamProjects.value = false;
    }
  };

  const loadTeamRecommendations = async () => {
    isLoadingTeamRecommendations.value = true;
    try {
      teamRecommendations.value = await salesService.getTeamRecommendations();
    } catch (error) {
      logger.error('Error loading team recommendations:', error);
      teamRecommendations.value = [];
    } finally {
      isLoadingTeamRecommendations.value = false;
    }
  };

  const setMemberRating = async (memberId, rating) => {
    if (!hasPermission('sales.team.manage')) return;
    memberRatingSaving.value = memberId;
    try {
      await salesService.rateTeamMember(memberId, rating);
      const updateArr = (arr, id, fn) => Array.isArray(arr) ? arr.map(m => (m.id === id ? fn(m) : m)) : [];
      teamMembers.value = updateArr(teamMembers.value, memberId, m => ({ ...m, rating }));
      teamRecommendations.value = updateArr(teamRecommendations.value, memberId, m => ({ ...m, rating }));
      notificationService.addNotification('تم تحديث التقييم', 'success');
    } catch (error) {
      logger.error('Error rating team member:', error);
      notificationService.addNotification('حدث خطأ أثناء حفظ التقييم', 'error');
    } finally {
      memberRatingSaving.value = null;
    }
  };

  const openMemberComment = member => {
    if (!member?.id) return;
    memberCommentEditId.value = member.id;
    memberCommentDrafts.value = {
      ...memberCommentDrafts.value,
      [member.id]: member.comment || '',
    };
  };

  const cancelMemberComment = () => {
    memberCommentEditId.value = null;
  };

  const saveMemberComment = async member => {
    if (!hasPermission('sales.team.manage')) return;
    if (!member?.id) {
      notificationService.addNotification('خطأ: معرّف العضو غير متوفر', 'error');
      return;
    }
    const comment = String(memberCommentDrafts.value[member.id] ?? '').trim();
    if (!comment) {
      notificationService.addNotification('أدخل نص التعليق أولاً', 'error');
      return;
    }
    memberRatingSaving.value = member.id;
    try {
      await salesService.rateTeamMember(member.id, undefined, comment);
      const updateC = (arr, id) =>
        Array.isArray(arr) ? arr.map(m => (m.id === id ? { ...m, comment } : m)) : [];
      teamMembers.value = updateC(teamMembers.value, member.id);
      teamRecommendations.value = updateC(teamRecommendations.value, member.id);
      notificationService.addNotification('تم حفظ التعليق عن الموظف بنجاح', 'success');
      memberCommentEditId.value = null;
      const next = { ...memberCommentDrafts.value };
      delete next[member.id];
      memberCommentDrafts.value = next;
    } catch (error) {
      logger.error('Error saving member comment:', error);
      notificationService.addNotification(
        error?.response?.data?.message || 'حدث خطأ أثناء حفظ التعليق',
        'error'
      );
    } finally {
      memberRatingSaving.value = null;
    }
  };

  const confirmRemoveMember = member => {
    memberToRemove.value = member;
  };

  const doRemoveMember = async () => {
    if (!memberToRemove.value) return;
    memberRemoveLoading.value = true;
    try {
      await salesService.removeTeamMember(memberToRemove.value.id);
      notificationService.addNotification('تم إخراج العضو من الفريق', 'success');
      memberToRemove.value = null;
      await loadTeamMembers();
    } catch (error) {
      logger.error('Error removing team member:', error);
      notificationService.addNotification(
        error?.response?.data?.message || 'حدث خطأ أثناء إخراج العضو من الفريق',
        'error'
      );
    } finally {
      memberRemoveLoading.value = false;
    }
  };

  return {
    teamMembers,
    teamProjects,
    teamMembersDisplay,
    isLoadingTeam,
    isLoadingTeamProjects,
    isLoadingTeamRecommendations,
    teamSortByRecommendation,
    memberRatingSaving,
    memberCommentEditId,
    memberCommentDrafts,
    memberToRemove,
    memberRemoveLoading,
    loadTeamMembers,
    loadTeamProjects,
    loadTeamRecommendations,
    setMemberRating,
    openMemberComment,
    cancelMemberComment,
    saveMemberComment,
    confirmRemoveMember,
    doRemoveMember,
    hasPermission,
    formatCurrency,
  };
}
