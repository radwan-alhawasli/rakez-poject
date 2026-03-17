import { ref } from 'vue';
import creditService from '@/services/creditService';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { getClaimStatusClass } from '@/utils/statusHelpers';
import { showApiError } from '@/utils/errorHandler';

export function useCreditClaimFiles() {
  const isLoading = ref(false);
  const claimFiles = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showClaimModal = ref(false);
  const showCombinedClaimModal = ref(false);
  const combinedClaimModalRef = ref(null);
  const selectedClaim = ref(null);
  const isSavingClaim = ref(false);
  const claimCandidates = ref([]);
  const isLoadingCandidates = ref(false);
  const isSavingCombinedClaim = ref(false);

  const { formatCurrency, formatDate: _fmtDate } = useFormatters();
  const formatDate = dateStr => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));


  const loadClaimFiles = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getClaimFiles({
        page: currentPage.value,
        per_page: perPage.value,
      });
      claimFiles.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? claimFiles.value.length;
    } catch (error) {
      logger.error('Error loading claim files:', error);
      claimFiles.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const openClaimFileForm = () => {
    selectedClaim.value = null;
    showClaimModal.value = true;
  };

  const openCombinedClaimModal = async () => {
    showCombinedClaimModal.value = true;
    isLoadingCandidates.value = true;
    try {
      const data = await accountingService.getClaimFileCandidates({ per_page: 200 });
      claimCandidates.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading claim file candidates:', error);
      claimCandidates.value = [];
      toast.error('حدث خطأ أثناء تحميل الحجوزات المتاحة');
    } finally {
      isLoadingCandidates.value = false;
    }
  };

  const handleCombinedClaimSubmit = async payload => {
    isSavingCombinedClaim.value = true;
    try {
      const result = await creditService.createCombinedClaimFile(payload);
      const fileId = result?.id ?? '';
      toast.success(
        fileId
          ? `تم إنشاء ملف المطالبة المجمّع رقم ${fileId}`
          : 'تم إنشاء ملف المطالبة المجمّع بنجاح'
      );
      showCombinedClaimModal.value = false;
      loadClaimFiles();
    } catch (error) {
      logger.error('Error creating combined claim file:', error);
      const msg = error?.response?.data?.message;
      toast.error(msg || 'حدث خطأ أثناء إنشاء ملف المطالبة المجمّع');
    } finally {
      isSavingCombinedClaim.value = false;
    }
  };

  const handleBulkClaimSubmit = async payload => {
    isSavingCombinedClaim.value = true;
    try {
      const result = await creditService.generateBulkClaimFiles(payload);
      const created = result?.created ?? {};
      const errors = result?.errors ?? {};
      const createdCount = Object.keys(created).length;
      const errorCount = Object.keys(errors).length;

      if (combinedClaimModalRef.value?.showBulkResult) {
        combinedClaimModalRef.value.showBulkResult(result);
      }

      if (createdCount > 0 && errorCount === 0) {
        toast.success(`تم إنشاء ${createdCount} ملف مطالبة بنجاح`);
        showCombinedClaimModal.value = false;
      } else if (createdCount > 0) {
        toast.warning(`تم إنشاء ${createdCount} ملف، فشل ${errorCount}`);
      } else {
        toast.error('فشل إنشاء ملفات المطالبة');
      }
      loadClaimFiles();
    } catch (error) {
      logger.error('Error generating bulk claim files:', error);
      showApiError(error, 'حدث خطأ أثناء إنشاء ملفات المطالبة');
    } finally {
      isSavingCombinedClaim.value = false;
    }
  };

  const downloadClaimPdf = claim => {
    const url = creditService.getClaimFilePdfDownloadUrl(claim.id);
    window.open(url, '_blank');
  };

  const generateClaimPdf = async claim => {
    try {
      await creditService.generateClaimFilePdf(claim.id);
      toast.success('تم إنشاء ملف PDF بنجاح');
      loadClaimFiles();
    } catch (error) {
      logger.error('Error generating claim PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  const submitClaim = async claim => {
    try {
      await creditService.submitClaim(claim.id);
      toast.success('تم إرسال ملف المطالبة بنجاح');
      loadClaimFiles();
    } catch (error) {
      logger.error('Error submitting claim:', error);
      toast.error('حدث خطأ أثناء إرسال ملف المطالبة');
    }
  };

  const approveClaim = claim => {
    selectedClaim.value = claim;
    showClaimModal.value = true;
  };

  const handleClaimSubmit = async data => {
    isSavingClaim.value = true;
    try {
      if (selectedClaim.value && selectedClaim.value.id) {
        await creditService.approveClaim(selectedClaim.value.id, data);
        toast.success('تم الموافقة على ملف المطالبة بنجاح');
      } else {
        await creditService.createClaimFile(data);
        toast.success('تم إنشاء ملف المطالبة بنجاح');
      }
      showClaimModal.value = false;
      loadClaimFiles();
    } catch (error) {
      logger.error('Error saving claim file:', error);
      toast.error('حدث خطأ أثناء حفظ ملف المطالبة');
    } finally {
      isSavingClaim.value = false;
    }
  };

  const handlePageChange = page => {
    currentPage.value = page;
    loadClaimFiles();
  };

  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadClaimFiles();
  };

  return {
    isLoading,
    claimFiles,
    currentPage,
    perPage,
    totalItems,
    showClaimModal,
    showCombinedClaimModal,
    combinedClaimModalRef,
    selectedClaim,
    isSavingClaim,
    claimCandidates,
    isLoadingCandidates,
    isSavingCombinedClaim,
    formatCurrency,
    formatDate,
    getClaimStatusClass,
    loadClaimFiles,
    openClaimFileForm,
    openCombinedClaimModal,
    handleCombinedClaimSubmit,
    handleBulkClaimSubmit,
    downloadClaimPdf,
    generateClaimPdf,
    submitClaim,
    approveClaim,
    handleClaimSubmit,
    handlePageChange,
    handlePerPageChange,
  };
}
