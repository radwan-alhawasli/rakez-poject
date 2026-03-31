<template>
  <div class="user-management">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إدارة المستخدمين</h2>
        <p class="section-subtitle">عرض وإنشاء وإدارة المستخدمين في النظام بصلاحيات مختلفة.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg
          class="btn-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>مستخدم جديد</span>
      </button>
    </div>

    <!-- Users List Table -->
    <div class="data-table-container">
      <LoadingSpinner v-if="loading" text="جاري تحميل البيانات..." />

      <div v-else-if="users.length === 0" class="empty-state">
        <p>لا يوجد مستخدمين لعرضهم حالياً.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table table-mobile-stacked">
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>الدور</th>
            <th>الفريق</th>
            <th>تاريخ الإنشاء</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td data-label="المستخدم">
              <div class="user-cell">
                <div class="user-avatar">{{ (user.name || '?').charAt(0).toUpperCase() }}</div>
                <div class="user-details">
                  <div class="user-name">{{ user.name || 'مستخدم غير معروف' }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td data-label="الدور">
              <div class="role-badge" :class="getRoleClass(user.type)">
                {{ getRoleLabel(user.type, user.is_manager) }}
              </div>
            </td>
            <td data-label="الفريق">{{ getTeamDisplay(user.team) }}</td>
            <td data-label="تاريخ الإنشاء" class="date-cell">{{ formatDate(user.created_at) }}</td>
            <td data-label="الحالة">
              <span class="status-badge" :class="isUserDisabled(user) ? 'disabled' : 'active'">
                {{ isUserDisabled(user) ? 'معطل' : 'نشط' }}
              </span>
            </td>
            <td data-label="الإجراءات">
              <div class="actions">
                <button
                  class="action-btn status"
                  @click="toggleUserStatus(user)"
                  :title="isUserDisabled(user) ? 'تفعيل' : 'تعطيل'"
                >
                  <svg
                    v-if="!isUserDisabled(user)"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button class="action-btn edit" @click="editUser(user)" title="تعديل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  v-if="useHrApi"
                  class="action-btn assign"
                  @click="openAssignTeam(user)"
                  title="تعيين لفريق"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(user)" title="حذف">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AddUserModal
      v-if="showModal"
      :editUser="selectedUser"
      :isLoading="isSaving"
      :useAdminApi="useAdminApi"
      @close="closeModal"
      @submit="handleSaveUser"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :title="getConfirmTitle()"
      :message="getConfirmMessage()"
      :type="confirmAction === 'delete' ? 'danger' : 'warning'"
      :confirmText="confirmAction === 'delete' ? 'حذف' : 'تأكيد'"
      @confirm="handleConfirm"
      @cancel="handleCancelConfirm"
      @close="handleCancelConfirm"
    />

    <!-- Assign to Team Modal (HR only) -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
      <div class="modal-content assign-modal">
        <div class="modal-header">
          <h3>تعيين موظف لفريق</h3>
          <button type="button" class="close-btn" @click="closeAssignModal">&times;</button>
        </div>
        <div class="modal-body">
          <p v-if="userToAssign" class="assign-user-name">
            {{ userToAssign.name || userToAssign.email }}
          </p>
          <div class="form-group">
            <label>الفريق</label>
            <Select v-model="selectedTeamId">
              <option value="">اختر الفريق...</option>
              <option v-for="t in teamsList" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </Select>
          </div>
        </div>
        <div class="modal-footer">
          <Button type="button" variant="secondary" @click="closeAssignModal">إلغاء</Button>
          <Button
            type="button"
            :disabled="!selectedTeamId || isAssigning"
            :loading="isAssigning"
            @click="submitAssignTeam"
          >
            تعيين
          </Button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-items="totalItems"
      :per-page="perPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import hrService from '@/services/hrService';
import adminEmployeeService from '@/services/adminEmployeeService';
import AddUserModal from './AddUserModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import Pagination from './Pagination.vue';
import Button from '@/components/ui/Button.vue';
import Select from '@/components/ui/Select.vue';
import { getRoleLabel, getRoleClass } from '@/constants/roles';
import logger from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import appConfig from '@/config/appConfig';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export default {
  name: 'UserManagement',
  components: {
    LoadingSpinner,
    AddUserModal,
    ConfirmModal,
    Pagination,
    Button,
    Select,
  },
  props: {
    /** When true, use HR API (GET/POST/PUT /hr/users) */
    useHrApi: {
      type: Boolean,
      default: false,
    },
    /** When true, use Admin employees API (GET/POST/PUT/DELETE /admin/employees/*) for list, add, edit, delete */
    useAdminApi: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
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

    /** Normalize user so disabled is set from API (is_active or disabled) for consistent display */
    const normalizeUserForDisplay = u => ({
      ...u,
      // توحيد المعرّف: قد يرجع الـ API (مثل list_employees) employee_id بدل id
      id: u.id ?? u.employee_id,
      disabled:
        u.disabled !== undefined && u.disabled !== null
          ? !!u.disabled
          : u.is_active !== undefined && u.is_active !== null
          ? !u.is_active
          : false,
    });

    /** Whether the user is disabled (from disabled or is_active) */
    const isUserDisabled = user => {
      if (user.disabled !== undefined && user.disabled !== null) return !!user.disabled;
      if (user.is_active !== undefined && user.is_active !== null) return !user.is_active;
      return false;
    };

    /** Team column: show name if object, else raw value */
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

        // Use error handler to get appropriate message based on error type
        const errorInfo = handleError(error, {
          showNotification: false,
          log: false, // Already logged above
        });

        // Show user-friendly message based on error type
        const status = error?.response?.status || error?.status;

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
            const result = await adminEmployeeService.addEmployee(userData);
            savedUserId = result?.id ?? result?.data?.id ?? savedUserId;
          }
        } else if (props.useHrApi) {
          if (userData.id) {
            await hrService.updateUser(userData.id, userData);
          } else {
            const result = await hrService.createUser(userData);
            savedUserId = result?.id ?? result?.data?.id ?? savedUserId;
          }
        } else {
          if (userData.id) {
            await hrService.updateEmployee(userData.id, userData);
          } else {
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

        if (error.response?.data?.message) {
          errMsg = error.response.data.message;
        } else if (error.message) {
          errMsg = error.message;
        }

        toast.error(errMsg);
      } finally {
        isSaving.value = false;
      }
    };

    const toggleUserStatus = user => {
      const newStatus = !isUserDisabled(user);
      confirmData.value = { user, newStatus };
      confirmAction.value = 'toggleStatus';
      showConfirmModal.value = true;
    };

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

          // Log for debugging
          if (appConfig.isDevelopment) {
            logger.debug(`Toggling user status:`, {
              userId: user.id,
              currentStatus: user.disabled,
              newStatus,
            });
          }

          // Update local state immediately so UI shows تعطل/نشط right away
          const userIndex = users.value.findIndex(u => u.id === user.id);
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
        logger.error(`Error ${action}`, error);
        if (action === 'toggleStatus' && confirmData.value) {
          const { user, newStatus } = confirmData.value;
          const idx = users.value.findIndex(u => u.id === user.id);
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

        // Check for foreign key constraint error
        const errorMessage = error?.message || error?.response?.data?.message || '';
        if (action === 'delete') {
          if (
            errorMessage.includes('foreign key') ||
            errorMessage.includes('Integrity constraint') ||
            errorMessage.includes('Cannot delete or update a parent row')
          ) {
            errorMsg =
              'لا يمكن حذف هذا المستخدم لأنه مرتبط ببيانات أخرى في النظام. يمكنك تعطيل الحساب بدلاً من ذلك.';
          } else if (error?.response?.status === 500) {
            errorMsg = 'حدث خطأ في الخادم أثناء محاولة الحذف. يرجى المحاولة لاحقاً.';
          } else if (error?.response?.data?.message) {
            errorMsg = error.response.data.message;
          }
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
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
      if (!confirmData.value) return '';

      if (confirmAction.value === 'delete') {
        return `هل أنت متأكد من حذف المستخدم ${
          confirmData.value.user.name || 'هذا'
        }؟ لا يمكن التراجع عن هذا الإجراء.`;
      } else if (confirmAction.value === 'toggleStatus') {
        const { user, newStatus } = confirmData.value;
        return `هل أنت متأكد من ${newStatus ? 'تعطيل' : 'تفعيل'} حساب ${user.name}؟`;
      }
      return '';
    };

    const { formatDateISO: formatDate } = useFormatters();

    const handlePageChange = page => {
      currentPage.value = page;
      fetchUsers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePerPageChange = newPerPage => {
      perPage.value = newPerPage;
      currentPage.value = 1;
      fetchUsers();
    };

    // Assign to team (HR only)
    const showAssignModal = ref(false);
    const userToAssign = ref(null);
    const teamsList = ref([]);
    const selectedTeamId = ref('');
    const isAssigning = ref(false);

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
          user_id: userToAssign.value.id,
        });
        toast.success('تم تعيين الموظف للفريق بنجاح');
        closeAssignModal();
        await fetchUsers();
      } catch (err) {
        logger.error('Error assigning to team:', err);
        const msg = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء التعيين';
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
  },
};
</script>

<style scoped src="./styles/UserManagement.scoped.s1.css"></style>
