import { ref } from 'vue';
import creditService from '@/services/creditService';
import { toast } from '@/composables/useToast';
import logger from '@/utils/logger';
import { showApiError } from '@/utils/errorHandler';

export function useMarketingRequests() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const requestsList = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedRequest = ref(null);

  const form = ref({
    developer_name: '',
    developer_number: '',
    description: '',
    location: ''
  });

  const loadRequests = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getMarketingRequests({ page: currentPage.value, per_page: perPage.value });
      requestsList.value = data.items || [];
      totalItems.value = data.total || 0;
    } catch (e) {
      logger.error('Error loading marketing requests', e);
      requestsList.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} page */
  const handlePageChange = (page) => {
    currentPage.value = page;
    loadRequests();
  };

  /** @param {any} val */
  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadRequests();
  };

  const openCreate = () => {
    form.value = { developer_name: '', developer_number: '', description: '', location: '' };
    showCreateModal.value = true;
  };

  /** @param {any} req */
  const openEdit = (req) => {
    selectedRequest.value = req;
    form.value = {
      developer_name: req.developer_name || '',
      developer_number: req.developer_number || '',
      description: req.description || '',
      location: req.location || ''
    };
    showEditModal.value = true;
  };

  /** @param {any} req */
  const openDelete = (req) => {
    selectedRequest.value = req;
    showDeleteModal.value = true;
  };

  const isSaving = ref(false);

  const createRequest = async () => {
    isSaving.value = true;
    try {
      await creditService.createMarketingRequest(form.value);
      toast.success('تمت إضافة الطلب بنجاح');
      showCreateModal.value = false;
      loadRequests();
    } catch (e) {
      showApiError(e, 'حدث خطأ أثناء إضافة الطلب');
    } finally {
      isSaving.value = false;
    }
  };

  const updateRequest = async () => {
    if (!selectedRequest.value) return;
    isSaving.value = true;
    try {
      await creditService.updateMarketingRequest((/** @type {any} */ (selectedRequest.value)).id, form.value);
      toast.success('تم تحديث الطلب بنجاح');
      showEditModal.value = false;
      loadRequests();
    } catch (e) {
      showApiError(e, 'حدث خطأ أثناء تحديث الطلب');
    } finally {
      isSaving.value = false;
    }
  };

  const deleteRequest = async () => {
    if (!selectedRequest.value) return;
    isSaving.value = true;
    try {
      await creditService.deleteMarketingRequest((/** @type {any} */ (selectedRequest.value)).id);
      toast.success('تم حذف الطلب بنجاح');
      showDeleteModal.value = false;
      loadRequests();
    } catch (e) {
      showApiError(e, 'حدث خطأ أثناء حذف الطلب');
    } finally {
      isSaving.value = false;
    }
  };

  return {
    isLoading,
    requestsList,
    currentPage,
    perPage,
    totalItems,
    loadRequests,
    handlePageChange,
    handlePerPageChange,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    selectedRequest,
    form,
    isSaving,
    openCreate,
    openEdit,
    openDelete,
    createRequest,
    updateRequest,
    deleteRequest
  };
}
