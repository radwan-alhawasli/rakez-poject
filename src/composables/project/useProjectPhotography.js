import { ref, reactive } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import { localeOpts } from '@/utils/intlLatn';

export function useProjectPhotography(projectId) {
  const isLoading = ref(false);
  const isPhotoSaving = ref(false);
  const isEditingPending = ref(false);
  const showRejectModal = ref(false);
  const rejectReasonInput = ref('');
  /** نافذة لعرض سبب الرفض فقط (زر واضح بجانب الشارة) */
  const showRejectionReasonModal = ref(false);

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

  const mapApiToFormStatus = p => {
    if (!p || typeof p !== 'object') return { status: 'pending', rejection_reason: null };
    const approved = p.approved;
    if (approved === '1' || approved === 1 || approved === true) {
      return { status: 'approved', rejection_reason: null };
    }
    if (approved === '0' || approved === 0 || approved === false) {
      const reason = (p.comment ?? p.rejection_reason ?? '').toString().trim() || null;
      return { status: 'rejected', rejection_reason: reason };
    }
    const st = String(p.status || '').toLowerCase();
    if (st === 'approved' || st.includes('معتمد')) {
      return { status: 'approved', rejection_reason: null };
    }
    if (st === 'rejected' || st.includes('مرفوض') || st.includes('رفض')) {
      const reason = (p.comment ?? p.rejection_reason ?? '').toString().trim() || null;
      return { status: 'rejected', rejection_reason: reason };
    }
    return {
      status: 'pending',
      rejection_reason: (p.rejection_reason ?? p.comment ?? null)
        ? String(p.rejection_reason ?? p.comment).trim()
        : null,
    };
  };

  const loadPhotography = async () => {
    isLoading.value = true;
    try {
      const photoData = await contractService.getPhotography(projectId);
      const root = photoData && typeof photoData === 'object' ? photoData : {};
      const p = root.data && typeof root.data === 'object' ? root.data : root;
      const hasPayload =
        p &&
        typeof p === 'object' &&
        (p.image_url ||
          p.video_url ||
          p.description ||
          p.id != null ||
          p.status != null ||
          p.approved != null);
      if (hasPayload) {
        photographyForm.image_url = p.image_url || '';
        photographyForm.video_url = p.video_url || '';
        photographyForm.description = p.description || '';
        const mapped = mapApiToFormStatus(p);
        photographyForm.status = mapped.status;
        photographyForm.rejection_reason = mapped.rejection_reason;
        if (p.updated_at) {
          photographyForm.updated_at = new Date(p.updated_at).toLocaleDateString('ar-SA', localeOpts());
        } else if (p.created_at) {
          photographyForm.updated_at = new Date(p.created_at).toLocaleDateString('ar-SA', localeOpts());
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
      };
      if (!photographyForm.isExisting) {
        payload.status = 'pending';
      }
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
      photographyForm.updated_at = new Date().toLocaleDateString('ar-SA', localeOpts());
      isEditingPending.value = false;
      await loadPhotography();
    } catch (error) {
      logger.error('Photography save error:', error);
      showApiError(error, 'حدث خطأ أثناء حفظ بيانات التصوير');
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
          await contractService.approvePhotography(projectId, { approved: '1' });
          toast.success('تم قبول الصور بنجاح');
          await loadPhotography();
        } catch (error) {
          logger.error('Approval error:', error);
          showApiError(error, 'حدث خطأ أثناء قبول الصور');
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
    const reason = String(rejectReasonInput.value || '').trim();
    if (!reason) {
      toast.warning('يرجى إدخال سبب الرفض');
      return;
    }
    try {
      await contractService.approvePhotography(projectId, {
        approved: '0',
        comment: reason,
      });
      showRejectModal.value = false;
      toast.success('تم رفض الصور');
      await loadPhotography();
    } catch (error) {
      logger.error(error);
      showApiError(error, 'حدث خطأ أثناء رفض الصور');
    }
  };

  function openRejectionReasonModal() {
    showRejectionReasonModal.value = true;
  }

  function closeRejectionReasonModal() {
    showRejectionReasonModal.value = false;
  }

  return {
    isLoading,
    photographyForm,
    isPhotoSaving,
    isEditingPending,
    showRejectModal,
    rejectReasonInput,
    showRejectionReasonModal,
    openRejectionReasonModal,
    closeRejectionReasonModal,
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
