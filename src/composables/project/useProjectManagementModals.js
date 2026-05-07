import contractService from '@/services/contractService';
import notificationService from '@/services/notificationService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { resolveProjectDeveloperName, resolveProjectTypeLabel } from '@/utils/projectMeta';

/**
 * Team assign, details, workspace, media modals + timeline helpers for project management list.
 * @param {any} deps
 */
export function useProjectManagementModals(deps) {
  const {
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
  } = deps;

  /** @param {any} project */
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
      const allTeams = await teamService.getTeams();
      assignTeamAvailable.value = Array.isArray(allTeams) ? allTeams : [];
      const assigned = await teamService.getProjectTeams(project.id);
      assignTeamAssigned.value = Array.isArray(assigned) ? assigned : [];
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
      await teamService.addTeamsToContract(project.id, [Number(assignTeamSelectedId.value)]);
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

  /** @param {any} team */
  const assignTeamRemove = async team => {
    const project = projectForAssignTeam.value;
    if (!project) return;
    const teamId = team.id;
    if (!teamId) return;
    assignTeamActionLoading.value = true;
    try {
      await teamService.removeTeamsFromContract(project.id, [teamId]);
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

  /** @param {any} project */
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
          developer_name: resolveProjectDeveloperName(details) || resolveProjectDeveloperName(selectedProject.value),
          project_type_label: resolveProjectTypeLabel(details),
        };
      }
    } catch (e) {
      logger.error('Failed to fetch detailed project info', e);
    }
  };

  const closeDetailsModal = () => (showDetailsModal.value = false);

  /** @param {any} project */
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

  /** @param {any} project */
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
      const err = /** @type {any} */ (error);
      const msg = err.response?.data?.message || err.message;
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

  /** @param {any} project */
  const goToUnits = project => {
    router.push({ name: 'ProjectTracker', params: { id: project.id }, query: { tab: 'units' } });
  };

  /** @param {any} status */
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

  /** @param {any} daysLeft */
  const timelineClass = daysLeft => {
    if (daysLeft === null) return '';
    if (daysLeft < 30) return 'timeline-red';
    if (daysLeft < 90) return 'timeline-orange';
    return 'timeline-green';
  };

  /** @param {any} daysLeft */
  const timelineLabel = daysLeft => {
    if (daysLeft === null) return 'المدة غير متاحة';
    if (daysLeft < 0) return 'العقد منتهي';
    if (daysLeft < 30) return `أحمر: ${daysLeft} يوم`;
    if (daysLeft < 90) return `برتقالي: ${daysLeft} يوم`;
    return `أخضر: ${daysLeft} يوم`;
  };

  return {
    onAssignTeam,
    loadAssignTeamData,
    assignTeamSubmit,
    assignTeamRemove,
    closeAssignTeamModal,
    openProjectDetails,
    closeDetailsModal,
    openWorkspace,
    closeWorkspaceModal,
    submitWorkspaceLink,
    openMediaModal,
    closeMediaModalState,
    submitMediaForm,
    goToUnits,
    getStatusClass,
    timelineClass,
    timelineLabel,
  };
}
