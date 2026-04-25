import { ref, onMounted } from 'vue';
import hrService from '@/services/hrService';
import adminEmployeeService from '@/services/adminEmployeeService';
import { getRoleLabel, getRoleClass } from '@/constants/roles';
import logger from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import appConfig from '@/config/appConfig';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

/**
 * @param {any} props
 */
export function useUserManagement(props) {
  /** @type {import('vue').Ref<any[]>} */
  const users = ref([]);
  const loading = ref(true);
  const showModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedUser = ref(null);
  const isSaving = ref(false);
  const showConfirmModal = ref(false);
  /** @type {import('vue').Ref<string|null>} */
  const confirmAction = ref(null);
  /** @type {import('vue').Ref<any>} */
  const confirmData = ref(null);
  const currentPage = ref(1);
  const perPage = ref(25);

  const totalItems = ref(0);

  /** @param {any} u */
  const normalizeUserForDisplay = u => ({
    ...u,
    id: u.id ?? u.employee_id,
    disabled:
      u.disabled !== undefined && u.disabled !== null
        ? !!u.disabled
        : u.is_active !== undefined && u.is_active !== null
          ? !u.is_active
          : false,
  });

  /** @param {any} user */
  const isUserDisabled = user => {
    if (user.disabled !== undefined && user.disabled !== null) return !!user.disabled;
    if (user.is_active !== undefined && user.is_active !== null) return !user.is_active;
    return false;
  };

  /** @param {any} team */
  const getTeamDisplay = team => {
    if (team == null) return '-';
    if (typeof team === 'object' && team !== null && team.name) return team.name;
    if (typeof team === 'string') return team;
    return '-';
  };

  const fetchUsers = async () => {
    loading.value = true;
    try {
      let data;
      if (props.useAdminApi) {
        /** @type {any} */
        const res = await adminEmployeeService.listEmployees({
          page: currentPage.value,
          per_page: perPage.value,
        });
        data = { items: res?.items ?? [], total: res?.total ?? 0 };
      } else if (props.useHrApi) {
        data = await hrService.listUsers({
          page: currentPage.value,
          per_page: perPage.value,
        });
      } else {
        data = await hrService.getEmployees({
          page: currentPage.value,
          per_page: perPage.value,
        });
      }
      const raw =
        data?.items ?? (Array.isArray(data) ? data : data?.data || data?.employees || []);
      users.value = raw.map(normalizeUserForDisplay);
      totalItems.value = data?.total ?? users.value.length;
    } catch (error) {
      logger.error('Failed to fetch users', error);
      users.value = [];
      totalItems.value = 0;

      const errorInfo = /** @type {any} */ (handleError(error, {
        showNotification: false,
        log: false,
      }));

      const status = (/** @type {any} */ (error))?.response?.status || (/** @type {any} */ (error))?.status;

      if (status === 404) {
        toast.warning('المورد المطلوب غير موجود. قد يكون هذا المسار غير متاح في الخادم حالياً.');
      } else if (status === 401) {
        toast.warning('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      } else if (status === 403) {
        toast.warning('ليس لديك صلاحية للوصول إلى هذا المورد.');
      } else if (errorInfo.message && !errorInfo.isExpected) {
        toast.error(errorInfo.message);
      } else {
        toast.error('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      loading.value = false;
    }
  };

  const openAddModal = () => {
    selectedUser.value = null;
    showModal.value = true;
  };

  /** @param {any} user */
  const editUser = async user => {
    loading.value = true;
    try {
      let details;
      if (props.useAdminApi) {
        details = await adminEmployeeService.showEmployee(user.id);
      } else if (props.useHrApi) {
        details = await hrService.showUser(user.id);
      } else {
        details = await hrService.getEmployeeById(user.id);
      }
      selectedUser.value = details?.data ?? details;
      showModal.value = true;
    } catch (error) {
      logger.error('Error fetching user details:', error);
      toast.error('حدث خطأ أثناء جلب تفاصيل المستخدم');
    } finally {
      loading.value = false;
    }
  };

  const closeModal = () => {
    showModal.value = false;
    selectedUser.value = null;
  };

  /** @param {any} userData */
  const handleSaveUser = async userData => {
    isSaving.value = true;
    const cvFile = userData.cv_file;
    const sigFile = userData.signature_file;
    delete userData.cv_file;
    delete userData.signature_file;

    try {
      let savedUserId = userData.id;
      if (props.useAdminApi) {
        if (userData.id) {
          await adminEmployeeService.updateEmployee(userData.id, userData);
        } else {
          /** @type {any} */
          const result = await adminEmployeeService.addEmployee(userData);
          savedUserId = result?.id ?? result?.data?.id ?? savedUserId;
        }
      } else if (props.useHrApi) {
        if (userData.id) {
          await hrService.updateUser(userData.id, userData);
        } else {
          /** @type {any} */
          const result = await hrService.createUser(userData);
          savedUserId = result?.id ?? result?.data?.id ?? savedUserId;
        }
      } else {
        if (userData.id) {
          await hrService.updateEmployee(userData.id, userData);
        } else {
          /** @type {any} */
          const result = await hrService.createEmployee(userData);
          savedUserId = result?.id ?? result?.data?.id ?? savedUserId;
        }
      }

      if (savedUserId && (cvFile || sigFile) && !props.useAdminApi) {
        try {
          const formData = new FormData();
          if (cvFile) formData.append('files[]', cvFile);
          if (sigFile) formData.append('files[]', sigFile);
          await hrService.uploadUserFiles(savedUserId, formData);
        } catch (uploadErr) {
          logger.error('Error uploading user files:', uploadErr);
          toast.error('تم حفظ المستخدم لكن حدث خطأ أثناء رفع الملفات');
        }
      }

      const isCreate = !userData.id;
      if (props.useAdminApi) {
        toast.success(isCreate ? 'تم إضافة الموظف بنجاح' : 'تم تحديث بيانات الموظف بنجاح');
      } else if (props.useHrApi) {
        toast.success(isCreate ? 'تم إنشاء المستخدم بنجاح' : 'تم تحديث بيانات المستخدم بنجاح');
      } else {
        toast.success(isCreate ? 'تم إضافة الموظف بنجاح' : 'تم تحديث بيانات الموظف بنجاح');
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      logger.error('Error saving user:', error);
      let errMsg = 'حدث خطأ أثناء حفظ المستخدم';

      const err = /** @type {any} */ (error);
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }

      toast.error(errMsg);
    } finally {
      isSaving.value = false;
    }
  };

  /** @param {any} user */
  const toggleUserStatus = user => {
    const newStatus = !isUserDisabled(user);
    confirmData.value = { user, newStatus };
    confirmAction.value = 'toggleStatus';
    showConfirmModal.value = true;
  };

  /** @param {any} user */
  const confirmDelete = user => {
    confirmData.value = { user };
    confirmAction.value = 'delete';
    showConfirmModal.value = true;
  };

  const handleConfirm = async () => {
    if (!confirmAction.value || !confirmData.value) return;

    try {
      if (confirmAction.value === 'toggleStatus') {
        const { user, newStatus } = confirmData.value;

        if (appConfig.isDevelopment) {
          logger.debug(`Toggling user status:`, {
            userId: user.id,
            currentStatus: user.disabled,
            newStatus,
          });
        }

        const userIndex = users.value.findIndex(u => (/** @type {any} */ (u)).id === user.id);
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            disabled: newStatus,
            is_active: newStatus ? 0 : 1,
          };
        }
        showConfirmModal.value = false;
        toast.success(`تم ${newStatus ? 'تعطيل' : 'تفعيل'} حساب ${user.name} بنجاح`);

        if (props.useAdminApi) {
          await adminEmployeeService.updateEmployee(user.id, {
            disabled: newStatus ? 1 : 0,
            is_active: newStatus ? 0 : 1,
          });
        } else if (props.useHrApi) {
          await hrService.toggleUserStatus(user.id, {
            is_active: newStatus ? 0 : 1,
          });
        } else {
          try {
            await hrService.toggleUserStatus(user.id, {
              is_active: newStatus ? 0 : 1,
            });
          } catch (toggleError) {
            if (appConfig.isDevelopment) {
              logger.debug('toggleUserStatus failed, trying updateEmployee:', toggleError);
            }
            await hrService.updateEmployee(user.id, { disabled: newStatus ? 1 : 0 });
          }
        }
        await fetchUsers();
        confirmAction.value = null;
        confirmData.value = null;
      } else if (confirmAction.value === 'delete') {
        const { user } = confirmData.value;
        const userId = user.id ?? user.employee_id;
        if (!userId) {
          toast.error('تعذر تحديد معرّف الموظف للحذف');
          return;
        }
        if (props.useAdminApi) {
          await adminEmployeeService.deleteEmployee(userId);
        } else if (props.useHrApi) {
          await hrService.deleteUser(userId);
        } else {
          await hrService.deleteEmployee(userId);
        }
        await fetchUsers();
        toast.success('تم حذف المستخدم بنجاح');
      }
      showConfirmModal.value = false;
      confirmAction.value = null;
      confirmData.value = null;
    } catch (error) {
      const action = confirmAction.value;
      /** @type {any} */
      const err = error;
      logger.error(`Error ${action}`, err);
      if (action === 'toggleStatus' && confirmData.value) {
        const data = /** @type {any} */ (confirmData.value);
        const { user, newStatus } = data;
        const idx = users.value.findIndex(u => (/** @type {any} */ (u)).id === user.id);
        if (idx !== -1) {
          users.value[idx] = {
            ...users.value[idx],
            disabled: !newStatus,
            is_active: newStatus ? 1 : 0,
          };
        }
      }
      let errorMsg =
        action === 'delete' ? 'حدث خطأ أثناء حذف المستخدم' : 'حدث خطأ أثناء تغيير الحالة';

      const errorMessage = err?.message || err?.response?.data?.message || '';
      if (action === 'delete') {
        if (
          errorMessage.includes('foreign key') ||
          errorMessage.includes('Integrity constraint') ||
          errorMessage.includes('Cannot delete or update a parent row')
        ) {
          errorMsg =
            'لا يمكن حذف هذا المستخدم لأنه مرتبط ببيانات أخرى في النظام. يمكنك تعطيل الحساب بدلاً من ذلك.';
        } else if (err?.response?.status === 500) {
          errorMsg = 'حدث خطأ في الخادم أثناء محاولة الحذف. يرجى المحاولة لاحقاً.';
        } else if (err?.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      toast.error(errorMsg);
      showConfirmModal.value = false;
      confirmAction.value = null;
      confirmData.value = null;
    }
  };

  const handleCancelConfirm = () => {
    showConfirmModal.value = false;
    confirmAction.value = null;
    confirmData.value = null;
  };

  const getConfirmTitle = () => {
    if (confirmAction.value === 'delete') {
      return 'تأكيد الحذف';
    }
    return 'تأكيد التغيير';
  };

  const getConfirmMessage = () => {
    const data = /** @type {any} */ (confirmData.value);
    if (!data) return '';

    if (confirmAction.value === 'delete') {
      return `هل أنت متأكد من حذف المستخدم ${
        data.user?.name || 'هذا'
      }؟ لا يمكن التراجع عن هذا الإجراء.`;
    } else if (confirmAction.value === 'toggleStatus') {
      const { user, newStatus } = data;
      return `هل أنت متأكد من ${newStatus ? 'تعطيل' : 'تفعيل'} حساب ${user?.name}؟`;
    }
    return '';
  };

  const { formatDateISO: formatDate } = useFormatters();

  /** @param {number} page */
  const handlePageChange = page => {
    currentPage.value = page;
    fetchUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** @param {number} newPerPage */
  const handlePerPageChange = newPerPage => {
    perPage.value = newPerPage;
    currentPage.value = 1;
    fetchUsers();
  };

  const showAssignModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const userToAssign = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const teamsList = ref([]);
  const selectedTeamId = ref('');
  const isAssigning = ref(false);

  /** @param {any} user */
  const openAssignTeam = async user => {
    userToAssign.value = user;
    selectedTeamId.value = '';
    showAssignModal.value = true;
    try {
      const data = await hrService.getTeams({ per_page: 100 });
      teamsList.value = data?.items ?? [];
    } catch (err) {
      logger.error('Error loading teams:', err);
      toast.error('حدث خطأ أثناء تحميل الفرق');
      teamsList.value = [];
    }
  };

  const closeAssignModal = () => {
    showAssignModal.value = false;
    userToAssign.value = null;
    selectedTeamId.value = '';
    teamsList.value = [];
  };

  const submitAssignTeam = async () => {
    if (!selectedTeamId.value || !userToAssign.value) return;
    isAssigning.value = true;
    try {
      await hrService.assignTeamMember(selectedTeamId.value, {
        user_id: (/** @type {any} */ (userToAssign.value)).id,
      });
      toast.success('تم تعيين الموظف للفريق بنجاح');
      closeAssignModal();
      await fetchUsers();
    } catch (err) {
      const error = /** @type {any} */ (err);
      logger.error('Error assigning to team:', error);
      const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء التعيين';
      toast.error(msg);
    } finally {
      isAssigning.value = false;
    }
  };

  onMounted(() => {
    fetchUsers();
  });

  return {
    users,
    totalItems,
    loading,
    showModal,
    selectedUser,
    isSaving,
    showConfirmModal,
    confirmAction,
    confirmData,
    currentPage,
    perPage,
    showAssignModal,
    userToAssign,
    teamsList,
    selectedTeamId,
    isAssigning,
    openAddModal,
    editUser,
    closeModal,
    handleSaveUser,
    confirmDelete,
    toggleUserStatus,
    handlePageChange,
    handlePerPageChange,
    handleConfirm,
    handleCancelConfirm,
    getConfirmTitle,
    getConfirmMessage,
    formatDate,
    getRoleLabel,
    getRoleClass,
    isUserDisabled,
    getTeamDisplay,
    openAssignTeam,
    closeAssignModal,
    submitAssignTeam,
  };
}
