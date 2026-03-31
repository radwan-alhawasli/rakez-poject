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
import LoadingSpinner from './LoadingSpinner.vue';
import AddUserModal from './AddUserModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import Pagination from './Pagination.vue';
import Button from '@/components/ui/Button.vue';
import Select from '@/components/ui/Select.vue';
import { useUserManagement } from '@/composables/useUserManagement';

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
    return useUserManagement(props);
  },
};
</script>

<style scoped src="./styles/UserManagement.scoped.s1.css"></style>
