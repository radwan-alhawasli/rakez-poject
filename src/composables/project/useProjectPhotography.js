import { ref, reactive } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';

export function useProjectPhotography(projectId) {
  const isLoading = ref(false);
  const isPhotoSaving = ref(false);
  const isEditingPending = ref(false);
  const showRejectModal = ref(false);
  const rejectReasonInput = ref('');

  const photographyForm = reactive({
    image_url: '',
    video_url: '',
    description: '',
    status: null,
    rejection_reason: null,
    updated_at: null,
    isExisting: false,
  });

  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadPhotography = async () => {
    isLoading.value = true;
    try {
      const photoData = await contractService.getPhotography(projectId);
      if (photoData?.data) {
        const p = photoData.data;
        photographyForm.image_url = p.image_url || '';
        photographyForm.video_url = p.video_url || '';
        photographyForm.description = p.description || '';
        photographyForm.status = p.status || 'pending';
        photographyForm.rejection_reason = p.rejection_reason || null;
        if (p.updated_at) {
          photographyForm.updated_at = new Date(p.updated_at).toLocaleDateString('ar-SA');
        } else if (p.created_at) {
          photographyForm.updated_at = new Date(p.created_at).toLocaleDateString('ar-SA');
        }
        photographyForm.isExisting = true;
      } else {
        photographyForm.isExisting = false;
      }
    } catch (_) {
      photographyForm.isExisting = false;
    } finally {
      isLoading.value = false;
    }
  };

  const savePhotographyData = async () => {
    isPhotoSaving.value = true;
    try {
      const payload = {
        image_url: photographyForm.image_url,
        video_url: photographyForm.video_url,
        description: photographyForm.description,
        status: 'pending',
      };
      if (photographyForm.isExisting) {
        await contractService.updatePhotography(projectId, payload);
        toast.success('تم تحديث البيانات وإرسالها للموافقة');
      } else {
        await contractService.storePhotography(projectId, payload);
        toast.success('تم إرسال البيانات للموافقة بنجاح');
        photographyForm.isExisting = true;
      }
      photographyForm.status = 'pending';
      photographyForm.rejection_reason = null;
      photographyForm.updated_at = new Date().toLocaleDateString('ar-SA');
      isEditingPending.value = false;
    } catch (error) {
      logger.error('Photography save error:', error);
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء حفظ بيانات التصوير'));
      isEditingPending.value = false;
    } finally {
      isPhotoSaving.value = false;
    }
  };

  const cancelPhotoEdit = () => { isEditingPending.value = false; };

  const approvePhotography = () => {
    confirmModalConfig.value = {
      title: 'قبول الصور',
      message: 'هل تأكيد قبول الصور؟',
      type: 'info',
      confirmText: 'قبول',
      resolve: async () => {
        try {
          await contractService.approvePhotography(projectId, { status: 'approved' });
          photographyForm.status = 'approved';
          toast.success('تم قبول الصور بنجاح');
        } catch (error) {
          logger.error('Approval error:', error);
          toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء قبول الصور'));
        }
      },
    };
    showConfirmModal.value = true;
  };

  const openRejectModal = () => {
    rejectReasonInput.value = '';
    showRejectModal.value = true;
  };

  const rejectPhotography = async () => {
    if (!rejectReasonInput.value) {
      toast.warning('يرجى إدخال سبب الرفض');
      return;
    }
    try {
      await contractService.approvePhotography(projectId, {
        status: 'rejected',
        rejection_reason: rejectReasonInput.value,
      });
      photographyForm.status = 'rejected';
      photographyForm.rejection_reason = rejectReasonInput.value;
      showRejectModal.value = false;
      toast.success('تم رفض الصور');
    } catch (error) {
      logger.error(error);
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء رفض الصور'));
    }
  };

  return {
    isLoading,
    photographyForm,
    isPhotoSaving,
    isEditingPending,
    showRejectModal,
    rejectReasonInput,
    showConfirmModal,
    confirmModalConfig,
    onConfirmModalConfirm,
    loadPhotography,
    savePhotographyData,
    cancelPhotoEdit,
    approvePhotography,
    openRejectModal,
    rejectPhotography,
  };
}
