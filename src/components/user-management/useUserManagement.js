import { ref, onMounted } from 'vue';
import hrService from '@/services/hrService';
import adminEmployeeService from '@/services/adminEmployeeService';
import logger from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import appConfig from '@/config/appConfig';
import { toast } from '@/composables/useToast';

export function useUserManagement(props) {
  const users = ref([]);
  const loading = ref(true);
  const showModal = ref(false);
  const selectedUser = ref(null);
  const isSaving = ref(false);
  const showConfirmModal = ref(false);
  const confirmAction = ref(null);
  const confirmData = ref(null);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const normalizeUserForDisplay = u => ({
    ...u,
    id: u.id ?? u.employee_id,
    disabled: u.disabled !== undefined ? !!u.disabled : (u.is_active !== undefined ? !u.is_active : false),
  });

  const fetchUsers = async () => {
    loading.value = true;
    try {
      let data;
      const params = { page: currentPage.value, per_page: perPage.value };
      if (props.useAdminApi) data = await adminEmployeeService.listEmployees(params);
      else if (props.useHrApi) data = await hrService.listUsers(params);
      else data = await hrService.getEmployees(params);

      const raw = data?.items ?? (Array.isArray(data) ? data : data?.data || data?.employees || []);
      users.value = raw.map(normalizeUserForDisplay);
      totalItems.value = data?.total ?? users.value.length;
    } catch (error) {
      logger.error('Fetch users error', error);
      users.value = []; totalItems.value = 0;
      const err = handleError(error, { showNotification: false, log: false });
      const status = error?.response?.status || error?.status;
      if (status === 404) toast.warning('المورد غير موجود.');
      else if (status === 401) toast.warning('انتهت الجلسة.');
      else if (status === 403) toast.warning('لا تملك الصلاحية.');
      else toast.error(err.message || 'حدث خطأ جلب البيانات');
    } finally { loading.value = false; }
  };

  const editUser = async user => {
    loading.value = true;
    try {
      let details;
      if (props.useAdminApi) details = await adminEmployeeService.showEmployee(user.id);
      else if (props.useHrApi) details = await hrService.showUser(user.id);
      else details = await hrService.getEmployeeById(user.id);
      selectedUser.value = details?.data ?? details;
      showModal.value = true;
    } catch (error) { logger.error('User details error', error); toast.error('خطأ في جلب التفاصيل'); }
    finally { loading.value = false; }
  };

  const handleSaveUser = async userData => {
    isSaving.value = true;
    const { cv_file, signature_file, id } = userData;
    const cleanedData = { ...userData }; delete cleanedData.cv_file; delete cleanedData.signature_file;
    try {
      let savedId = id;
      if (props.useAdminApi) {
        if (id) await adminEmployeeService.updateEmployee(id, cleanedData);
        else { const res = await adminEmployeeService.addEmployee(cleanedData); savedId = res?.id || res?.data?.id; }
      } else if (props.useHrApi) {
        if (id) await hrService.updateUser(id, cleanedData);
        else { const res = await hrService.createUser(cleanedData); savedId = res?.id || res?.data?.id; }
      } else {
        if (id) await hrService.updateEmployee(id, cleanedData);
        else { const res = await hrService.createEmployee(cleanedData); savedId = res?.id || res?.data?.id; }
      }
      if (savedId && (cv_file || signature_file) && !props.useAdminApi) {
        const formData = new FormData();
        if (cv_file) formData.append('files[]', cv_file);
        if (signature_file) formData.append('files[]', signature_file);
        await hrService.uploadUserFiles(savedId, formData);
      }
      toast.success(id ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
      await fetchUsers(); showModal.value = false;
    } catch (error) { logger.error('Save user error', error); toast.error(error.message || 'خطأ في الحفظ'); }
    finally { isSaving.value = false; }
  };

  const handleConfirm = async () => {
    if (!confirmAction.value || !confirmData.value) return;
    try {
      if (confirmAction.value === 'toggleStatus') {
        const { user, newStatus } = confirmData.value;
        const idx = users.value.findIndex(u => u.id === user.id);
        if (idx !== -1) { users.value[idx] = { ...users.value[idx], disabled: newStatus, is_active: newStatus ? 0 : 1 }; }
        showConfirmModal.value = false;
        if (props.useAdminApi) await adminEmployeeService.updateEmployee(user.id, { disabled: newStatus ? 1 : 0 });
        else await hrService.toggleUserStatus(user.id, { is_active: newStatus ? 0 : 1 });
        await fetchUsers(); toast.success('تم تغيير الحالة بنجاح');
      } else if (confirmAction.value === 'delete') {
        const userId = confirmData.value.user.id;
        if (props.useAdminApi) await adminEmployeeService.deleteEmployee(userId);
        else await hrService.deleteUser(userId);
        await fetchUsers(); toast.success('تم الحذف بنجاح');
      }
    } catch (error) {
      logger.error('Action error', error);
      toast.error(error.response?.data?.message || 'تعذر إتمام الإجراء');
    } finally { showConfirmModal.value = false; confirmAction.value = null; }
  };

  onMounted(fetchUsers);

  return {
    users, totalItems, loading, showModal, selectedUser, isSaving, showConfirmModal,
    confirmAction, confirmData, currentPage, perPage, fetchUsers, editUser,
    handleSaveUser, handleConfirm,
    openAddModal: () => { selectedUser.value = null; showModal.value = true; },
    toggleUserStatus: (user) => { confirmData.value = { user, newStatus: !user.disabled }; confirmAction.value = 'toggleStatus'; showConfirmModal.value = true; },
    confirmDelete: (user) => { confirmData.value = { user }; confirmAction.value = 'delete'; showConfirmModal.value = true; },
  };
}
