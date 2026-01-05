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
                {{ getRoleLabel(user.type) }}
              </div>
            </td>
            <td>{{ user.team || '-' }}</td>
            <td class="date-cell">{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="actions">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import userService from '../services/userService'
import AddUserModal from './AddUserModal.vue'
import { getRoleLabel, getRoleClass } from '../constants/roles'

export default {
  name: 'UserManagement',
  components: {
    AddUserModal
  },
  setup() {
    const users = ref([])
    const loading = ref(true)
    const showModal = ref(false)
    const selectedUser = ref(null)
    const isSaving = ref(false)

    const fetchUsers = async () => {
      loading.value = true
      try {
        const data = await userService.getEmployees()
        // userService now guarantees an array return
        users.value = Array.isArray(data) ? data : []
        console.log('Processed users for UI:', users.value)
      } catch (error) {
        console.error('Failed to fetch users', error)
        users.value = []
        alert('فشل في جلب البيانات من الخادم. يرجى التأكد من تسجيل الدخول.')
      } finally {
        loading.value = false
      }
    }

    const openAddModal = () => {
      selectedUser.value = null
      showModal.value = true
    }

    const editUser = (user) => {
      selectedUser.value = user
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedUser.value = null
    }

    const handleSaveUser = async (userData) => {
      isSaving.value = true
      try {
        if (userData.id) {
          await userService.updateEmployee(userData.id, userData)
        } else {
          await userService.addEmployee(userData)
        }
        await fetchUsers()
        closeModal()
      } catch (error) {
        console.error('Error saving user:', error)
        let errMsg = 'حدث خطأ أثناء حفظ المستخدم'
        
        // Extract server-side validation messages if available
        if (error.data && error.data.errors) {
            const errors = error.data.errors
            const firstErrorKey = Object.keys(errors)[0]
            if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
                errMsg = `${errors[firstErrorKey][0]}`
            }
        } else if (error.message) {
            errMsg = error.message
        }
        
        alert(errMsg)
      } finally {
        isSaving.value = false
      }
    }

    const confirmDelete = async (user) => {
      console.log('Attempting to delete user object:', user)
      if (!user || !user.id) {
        console.error('No valid user ID found for deletion')
        alert('حدث خطأ: لم يتم العثور على معرّف للمستخدم')
        return
      }

      if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name || 'هذا'}؟`)) {
        try {
          await userService.deleteEmployee(user.id)
          await fetchUsers()
        } catch (error) {
          console.error('Error deleting user', error)
          alert('حدث خطأ أثناء حذف المستخدم')
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toISOString().split('T')[0]
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      loading,
      showModal,
      selectedUser,
      isSaving,
      openAddModal,
      editUser,
      closeModal,
      handleSaveUser,
      confirmDelete,
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
.role-default { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }

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
