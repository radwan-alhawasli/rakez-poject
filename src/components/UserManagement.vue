<template>
  <div class="user-management">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إدارة المستخدمين</h2>
        <p class="section-subtitle">عرض وإنشاء وإدارة المستخدمين في النظام بصلاحيات مختلفة.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <UserTable
        v-else
        :users="users"
        :use-hr-api="useHrApi"
        @toggle-status="toggleUserStatus"
        @edit="editUser"
        @assign="openAssignTeam"
        @delete="confirmDelete"
      />
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
    <AssignTeamModal
      v-if="showAssignModal"
      :user="userToAssign"
      :teams="teamsList"
      :is-assigning="isAssigning"
      @close="closeAssignModal"
      @submit="submitAssignTeam"
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

<script setup>
import { ref } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import AddUserModal from './AddUserModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import Pagination from './Pagination.vue';
import UserTable from './user-management/UserTable.vue';
import AssignTeamModal from './user-management/AssignTeamModal.vue';
import { useUserManagement } from './user-management/useUserManagement';
import hrService from '@/services/hrService';
import { toast } from '@/composables/useToast';
import logger from '@/utils/logger';

const props = defineProps({
  useHrApi: { type: Boolean, default: false },
  useAdminApi: { type: Boolean, default: false },
});

const {
  users, totalItems, loading, showModal, selectedUser, isSaving, showConfirmModal,
  confirmAction, confirmData, currentPage, perPage, fetchUsers, editUser,
  handleSaveUser, handleConfirm, openAddModal, toggleUserStatus, confirmDelete,
} = useUserManagement(props);

// Team assignment logic (separate from main management composable for clarity)
const showAssignModal = ref(false);
const userToAssign = ref(null);
const teamsList = ref([]);
const isAssigning = ref(false);

const openAssignTeam = async user => {
  userToAssign.value = user;
  showAssignModal.value = true;
  try {
    const data = await hrService.getTeams({ per_page: 100 });
    teamsList.value = data?.items ?? [];
  } catch (err) { logger.error('Load teams error', err); toast.error('خطأ في تحميل الفرق'); }
};

const closeAssignModal = () => { showAssignModal.value = false; userToAssign.value = null; };

const submitAssignTeam = async (teamId) => {
  isAssigning.value = true;
  try {
    await hrService.assignTeamMember(teamId, { user_id: userToAssign.value.id });
    toast.success('تم التعيين للفريق بنجاح');
    closeAssignModal(); await fetchUsers();
  } catch (err) { logger.error('Assign error', err); toast.error(err.response?.data?.message || 'خطأ في التعيين'); }
  finally { isAssigning.value = false; }
};

const handlePageChange = p => { currentPage.value = p; fetchUsers(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
const handlePerPageChange = pp => { perPage.value = pp; currentPage.value = 1; fetchUsers(); };
const closeModal = () => { showModal.value = false; selectedUser.value = null; };
const handleCancelConfirm = () => { showConfirmModal.value = false; confirmAction.value = null; };

const getConfirmTitle = () => confirmAction.value === 'delete' ? 'تأكيد الحذف' : 'تأكيد التغيير';
const getConfirmMessage = () => {
  if (!confirmData.value) return '';
  if (confirmAction.value === 'delete') return `هل أنت متأكد من حذف المستخدم ${confirmData.value.user.name || 'هذا'}؟`;
  return `هل أنت متأكد من ${confirmData.value.newStatus ? 'تعطيل' : 'تفعيل'} حساب ${confirmData.value.user.name}؟`;
};
</script>

<style scoped>
.user-management { padding: 0; animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title { font-size: 28px; font-weight: 700; color: #27374d; margin: 0 0 5px 0; }
.section-subtitle { color: #64748b; font-size: 15px; margin: 0; }
.add-btn { background: linear-gradient(135deg, #b5a99a 0%, #9a8d7d 100%); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2); }
.add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3); }
.data-table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.empty-state { padding: 40px; text-align: center; color: #64748b; }
</style>
