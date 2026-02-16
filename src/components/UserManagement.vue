<template>
  <div class="user-management">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إدارة المستخدمين</h2>
        <p class="section-subtitle">عرض وإنشاء وإدارة المستخدمين في النظام بصلاحيات مختلفة.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>مستخدم جديد</span>
      </button>
    </div>

    <!-- Users List Table -->
    <div class="data-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <p>لا يوجد مستخدمين لعرضهم حالياً.</p>
      </div>

      <table v-else class="data-table">
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
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ (user.name || '?').charAt(0).toUpperCase() }}</div>
                <div class="user-details">
                   <div class="user-name">{{ user.name || 'مستخدم غير معروف' }}</div>
                   <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="role-badge" :class="getRoleClass(user.type)">
                {{ getRoleLabel(user.type, user.is_manager) }}
              </div>
            </td>
            <td>{{ user.team || '-' }}</td>
            <td class="date-cell">{{ formatDate(user.created_at) }}</td>
            <td>
              <span class="status-badge" :class="user.disabled ? 'disabled' : 'active'">
                {{ user.disabled ? 'معطل' : 'نشط' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn status" @click="toggleUserStatus(user)" :title="user.disabled ? 'تفعيل' : 'تعطيل'">
                  <svg v-if="!user.disabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button class="action-btn edit" @click="editUser(user)" title="تعديل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(user)" title="حذف">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <AddUserModal 
      v-if="showModal" 
      :editUser="selectedUser"
      :isLoading="isSaving"
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
import { ref, onMounted } from 'vue'
import hrService from '../services/hrService'
import AddUserModal from './AddUserModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import Pagination from './Pagination.vue'
import { getRoleLabel, getRoleClass } from '../constants/roles'
import logger from '../utils/logger'
import { handleError } from '../utils/errorHandler'
import appConfig from '../config/appConfig'
import { toast } from '../composables/useToast'

export default {
  name: 'UserManagement',
  components: {
    AddUserModal,
    ConfirmModal,
    Pagination
  },
  setup() {
    const users = ref([])
    const loading = ref(true)
    const showModal = ref(false)
    const selectedUser = ref(null)
    const isSaving = ref(false)
    const showConfirmModal = ref(false)
    const confirmAction = ref(null)
    const confirmData = ref(null)
    const currentPage = ref(1)
    const perPage = ref(25)

    const totalItems = ref(0)

    const fetchUsers = async () => {
      loading.value = true
      try {
        const data = await hrService.getEmployees({
          page: currentPage.value,
          per_page: perPage.value
        })
        users.value = data?.items ?? (Array.isArray(data) ? data : (data?.data || data?.employees || []))
        totalItems.value = data?.total ?? users.value.length
      } catch (error) {
        logger.error('Failed to fetch users', error)
        users.value = []
        totalItems.value = 0

        // Use error handler to get appropriate message based on error type
        const errorInfo = handleError(error, {
          showNotification: false,
          log: false // Already logged above
        })
        
        // Show user-friendly message based on error type
        const status = error?.response?.status || error?.status
        
        if (status === 404) {
          toast.warning('المورد المطلوب غير موجود. قد يكون هذا المسار غير متاح في الخادم حالياً.')
        } else if (status === 401) {
          toast.warning('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.')
        } else if (status === 403) {
          toast.warning('ليس لديك صلاحية للوصول إلى هذا المورد.')
        } else if (errorInfo.message && !errorInfo.isExpected) {
          toast.error(errorInfo.message)
        } else {
          toast.error('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.')
        }
      } finally {
        loading.value = false
      }
    }

    const openAddModal = () => {
      selectedUser.value = null
      showModal.value = true
    }

    const editUser = async (user) => {
      loading.value = true
      try {
        const details = await hrService.getEmployeeById(user.id)
        selectedUser.value = details.data || details
        showModal.value = true
      } catch (error) {
        logger.error('Error fetching user details:', error)
        toast.error('حدث خطأ أثناء جلب تفاصيل المستخدم')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      showModal.value = false
      selectedUser.value = null
    }

    const handleSaveUser = async (userData) => {
      isSaving.value = true
      try {
        if (userData.id) {
          await hrService.updateEmployee(userData.id, userData)
        } else {
          await hrService.createEmployee(userData)
        }
        await fetchUsers()
        closeModal()
      } catch (error) {
        logger.error('Error saving user:', error)
        let errMsg = 'حدث خطأ أثناء حفظ المستخدم'
        
        if (error.response?.data?.message) {
            errMsg = error.response.data.message
        } else if (error.message) {
            errMsg = error.message
        }
        
        toast.error(errMsg)
      } finally {
        isSaving.value = false
      }
    }

    const toggleUserStatus = (user) => {
      const newStatus = !user.disabled
      confirmData.value = { user, newStatus }
      confirmAction.value = 'toggleStatus'
      showConfirmModal.value = true
    }

    const confirmDelete = (user) => {
      confirmData.value = { user }
      confirmAction.value = 'delete'
      showConfirmModal.value = true
    }

    const handleConfirm = async () => {
      if (!confirmAction.value || !confirmData.value) return

      try {
        if (confirmAction.value === 'toggleStatus') {
          const { user, newStatus } = confirmData.value
          
          // Log for debugging
          if (appConfig.isDevelopment) {
            logger.debug(`Toggling user status:`, { userId: user.id, currentStatus: user.disabled, newStatus })
          }
          
          // Update local state immediately for better UX
          const userIndex = users.value.findIndex(u => u.id === user.id)
          if (userIndex !== -1) {
            users.value[userIndex].disabled = newStatus
          }
          
          // Try using the dedicated status toggle endpoint first
          try {
            await hrService.toggleUserStatus({
              user_id: user.id,
              disabled: newStatus ? 1 : 0  // Convert boolean to integer (0/1)
            })
          } catch (toggleError) {
            // Fallback to updateEmployee if toggleUserStatus fails
            if (appConfig.isDevelopment) {
              logger.debug('toggleUserStatus failed, trying updateEmployee:', toggleError)
            }
            // Convert boolean to integer for API compatibility
            await hrService.updateEmployee(user.id, { disabled: newStatus ? 1 : 0 })
          }
          
          // Refresh from server to ensure consistency
          await fetchUsers()
          toast.success(`تم ${newStatus ? 'تعطيل' : 'تفعيل'} حساب ${user.name} بنجاح`)
        } else if (confirmAction.value === 'delete') {
          const { user } = confirmData.value
          await hrService.deleteEmployee(user.id)
          await fetchUsers()
          toast.success('تم حذف المستخدم بنجاح')
        }
        showConfirmModal.value = false
        confirmAction.value = null
        confirmData.value = null
      } catch (error) {
        logger.error(`Error ${confirmAction.value}`, error)
        let errorMsg = confirmAction.value === 'delete' 
          ? 'حدث خطأ أثناء حذف المستخدم'
          : 'حدث خطأ أثناء تغيير الحالة'
        
        // Check for foreign key constraint error
        const errorMessage = error?.message || error?.response?.data?.message || ''
        if (confirmAction.value === 'delete') {
          if (errorMessage.includes('foreign key') || 
              errorMessage.includes('Integrity constraint') ||
              errorMessage.includes('Cannot delete or update a parent row')) {
            errorMsg = 'لا يمكن حذف هذا المستخدم لأنه مرتبط ببيانات أخرى في النظام. يمكنك تعطيل الحساب بدلاً من ذلك.'
          } else if (error?.response?.status === 500) {
            errorMsg = 'حدث خطأ في الخادم أثناء محاولة الحذف. يرجى المحاولة لاحقاً.'
          } else if (error?.response?.data?.message) {
            errorMsg = error.response.data.message
          }
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message
        }
        
        toast.error(errorMsg)
      }
    }

    const handleCancelConfirm = () => {
      showConfirmModal.value = false
      confirmAction.value = null
      confirmData.value = null
    }

    const getConfirmTitle = () => {
      if (confirmAction.value === 'delete') {
        return 'تأكيد الحذف'
      }
      return 'تأكيد التغيير'
    }

    const getConfirmMessage = () => {
      if (!confirmData.value) return ''
      
      if (confirmAction.value === 'delete') {
        return `هل أنت متأكد من حذف المستخدم ${confirmData.value.user.name || 'هذا'}؟ لا يمكن التراجع عن هذا الإجراء.`
      } else if (confirmAction.value === 'toggleStatus') {
        const { user, newStatus } = confirmData.value
        return `هل أنت متأكد من ${newStatus ? 'تعطيل' : 'تفعيل'} حساب ${user.name}؟`
      }
      return ''
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toISOString().split('T')[0]
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchUsers()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handlePerPageChange = (newPerPage) => {
      perPage.value = newPerPage
      currentPage.value = 1
      fetchUsers()
    }

    onMounted(() => {
      fetchUsers()
    })

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
      getRoleClass
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 0;
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2);
  font-family: 'Tajawal', sans-serif;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.btn-icon-svg {
  width: 18px;
  height: 18px;
}

.data-table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.data-table th {
  color: #94a3b8;
  font-weight: 500;
  font-size: 14px;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.data-table td {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a5f;
  font-weight: 700;
  font-size: 18px;
  border: 1px solid #cbd5e1;
}

.user-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.user-email {
  font-size: 12px;
  color: #94a3b8;
}

.role-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  min-width: 100px;
}

.role-marketing { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.role-admin { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.role-pm { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.role-inventory { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.role-hr { background: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }
.role-default { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.active { background: #dcfce7; color: #16a34a; }
.status-badge.disabled { background: #fee2e2; color: #ef4444; }

.action-btn.status:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

.actions { 
  display: flex; 
  gap: 8px; 
}

.action-btn {
  background: white; 
  border: 1.5px solid #e2e8f0; 
  width: 38px; 
  height: 38px;
  border-radius: 10px; 
  cursor: pointer; 
  display: flex; 
  align-items: center;
  justify-content: center; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover { 
  border-color: #B1A28F; 
  color: #B1A28F; 
  background: #fdfbf7;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(161, 139, 92, 0.1);
}

.action-btn.delete:hover { 
  border-color: #ef4444; 
  color: #ef4444; 
  background: #fef2f2;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);
}

.spinner {
  width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #B1A28F;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
