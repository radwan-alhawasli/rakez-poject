<template>
  <div class="team-management-view">
    <!-- Header -->
    <div class="welcome-header team-mgmt-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة الفرق</h1>
        <p class="welcome-subtitle">إنشاء وتعديل وإدارة فرق العمل وتعيين الأعضاء والمشاريع.</p>
      </div>
      <button class="add-btn" @click="openCreateModal">
        <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>إضافة فريق جديد</span>
      </button>
    </div>

    <!-- Search -->
    <div class="search-container">
      <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input v-model="searchQuery" @input="debouncedSearch" type="text" class="search-input" placeholder="البحث عن فريق..." />
    </div>

    <!-- Table -->
    <div class="data-table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <div v-else-if="teams.length === 0" class="empty-state">
        <p>لا يوجد فرق لعرضها حالياً.</p>
        <button class="add-btn small" @click="openCreateModal">إنشاء فريق جديد</button>
      </div>

      <div v-else class="table-responsive">
      <table class="data-table table-mobile-stacked">
        <thead>
          <tr>
            <th>الفريق</th>
            <th>عدد الأعضاء</th>
            <th>القائد</th>
            <th>المشاريع المعينة</th>
            <th>تاريخ الإنشاء</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td data-label="الفريق">
              <div class="team-cell">
                <div class="team-avatar">{{ (team.name || '?').charAt(0) }}</div>
                <div class="team-details">
                  <div class="team-name-text">{{ team.name }}</div>
                  <div class="team-desc-text">{{ team.description || 'لا يوجد وصف' }}</div>
                </div>
              </div>
            </td>
            <td data-label="عدد الأعضاء">
              <span class="count-badge">{{ team.members_count ?? team.members?.length ?? 0 }}</span>
            </td>
            <td data-label="القائد">{{ team.leader_name || team.leader?.name || '—' }}</td>
            <td data-label="المشاريع المعينة">
              <span class="count-badge projects">{{ team.contracts_count ?? team.projects_count ?? 0 }}</span>
            </td>
            <td data-label="تاريخ الإنشاء" class="date-cell">{{ formatDate(team.created_at) }}</td>
            <td data-label="الحالة">
              <span class="status-badge" :class="team.is_active === false ? 'disabled' : 'active'">
                {{ team.is_active === false ? 'غير فعال' : 'فعال' }}
              </span>
            </td>
            <td data-label="الإجراءات">
              <div class="actions">
                <button class="action-btn add-members" @click="openAddMembersModal(team)" title="إضافة مندوب مبيعات للفريق">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </button>
                <button class="action-btn remove-members" @click="openRemoveMembersModal(team)" title="إزالة عضو من الفريق">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </button>
                <button class="action-btn view" @click="viewTeamDetails(team)" title="عرض التفاصيل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button class="action-btn edit" @click="openEditModal(team)" title="تعديل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(team)" title="حذف">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="team-modal modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'تعديل الفريق' : 'إضافة فريق جديد' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveTeam">
            <div class="form-group">
              <label>اسم الفريق *</label>
              <input v-model="teamForm.name" type="text" class="form-input" placeholder="أدخل اسم الفريق" required />
            </div>
            <div class="form-group">
              <label>الوصف</label>
              <textarea v-model="teamForm.description" class="form-input" rows="3" placeholder="وصف الفريق (اختياري)"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">إلغاء</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'جاري الحفظ...' : isEditing ? 'تحديث' : 'حفظ' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Team Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="detail-modal modal-content">
        <div class="modal-header">
          <h3>تفاصيل الفريق: {{ detailTeam?.name }}</h3>
          <button class="close-btn" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetail" class="loading-state">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
          </div>
          <template v-else>
            <div class="detail-section">
              <h4>الأعضاء ({{ detailMembers.length }})</h4>
              <div v-if="detailMembers.length === 0" class="empty-inline">لا يوجد أعضاء</div>
              <div v-else class="members-grid">
                <div v-for="member in detailMembers" :key="member.user_id ?? member.id" class="member-chip">
                  <div class="member-chip-avatar" :style="{ background: chipColor(member.user_id ?? member.id) }">
                    {{ (member.name || member.full_name || member.user?.name || '?').charAt(0) }}
                  </div>
                  <div class="member-chip-info">
                    <span class="chip-name">{{ member.name || member.full_name || member.user?.name }}</span>
                    <span class="chip-role">{{ member.role || member.job_title || 'عضو' }}</span>
                  </div>
                  <button type="button" class="btn-delete-member" @click="confirmRemoveMember(member)" title="حذف مسوق">حذف مسوق</button>
                </div>
              </div>
            </div>
            <div class="detail-section">
              <h4>المشاريع المعينة ({{ detailContracts.length }})</h4>
              <div v-if="detailContracts.length === 0" class="empty-inline">لا توجد مشاريع معينة</div>
              <div v-else class="contracts-list">
                <div v-for="c in detailContracts" :key="c.id" class="contract-chip">
                  {{ c.project_name || c.name || c.contract_name || `مشروع #${c.id}` }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Add sales members: list from GET .../sales-without-team, add via POST .../members/:teamId -->
    <div v-if="showAddMembersModal" class="modal-overlay" @click.self="closeAddMembersModal">
      <div class="modal-content add-members-modal">
        <div class="modal-header">
          <h3>إضافة مندوب مبيعات: {{ addMembersTeam?.name }}</h3>
          <button class="close-btn" @click="closeAddMembersModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="addMembersLoading" class="loading-state"><div class="spinner"></div><p>جاري التحميل...</p></div>
          <template v-else>
            <p v-if="availableSalesWithoutTeam.length" class="add-members-hint">قائمة مندوبي المبيعات غير المرتبطين بفريق (من إدارة المشاريع).</p>
            <div v-if="availableSalesWithoutTeam.length" class="add-members-search-wrap">
              <input
                v-model="addMembersSearch"
                type="search"
                class="form-input"
                placeholder="بحث بالاسم أو البريد..."
                autocomplete="off"
              />
            </div>
            <div v-if="filteredSalesWithoutTeam.length === 0 && availableSalesWithoutTeam.length" class="empty-inline">لا توجد نتائج مطابقة للبحث.</div>
            <div v-else-if="availableSalesWithoutTeam.length === 0" class="empty-inline">لا يوجد مندوبو مبيعات بلا فريق حالياً.</div>
            <ul v-else class="add-members-list">
              <li v-for="emp in filteredSalesWithoutTeam" :key="salesRowKey(emp)" class="add-member-row">
                <span class="add-member-name">{{ emp.name || emp.full_name || emp.user?.name || emp.email || '—' }}</span>
                <button type="button" class="btn-add-one" @click="addMemberToTeam(emp)">إضافة</button>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>

    <!-- Remove: list from GET .../members/:teamId, delete via DELETE .../members/:teamId/:userId -->
    <div v-if="showRemoveMembersModal" class="modal-overlay" @click.self="closeRemoveMembersModal">
      <div class="modal-content add-members-modal">
        <div class="modal-header">
          <h3>إزالة عضو من الفريق: {{ removeMembersTeam?.name }}</h3>
          <button class="close-btn" @click="closeRemoveMembersModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="removeMembersLoading" class="loading-state"><div class="spinner"></div><p>جاري التحميل...</p></div>
          <template v-else>
            <div v-if="removeMembersList.length === 0" class="empty-inline">لا يوجد أعضاء في هذا الفريق.</div>
            <template v-else>
              <p class="add-members-hint">اختر عضواً ثم اضغط «إزالة من الفريق».</p>
              <div class="add-members-search-wrap">
                <input
                  v-model="removeMembersSearch"
                  type="search"
                  class="form-input"
                  placeholder="بحث بالاسم أو البريد..."
                  autocomplete="off"
                />
              </div>
              <div v-if="filteredRemoveMembersList.length === 0" class="empty-inline">لا توجد نتائج مطابقة للبحث.</div>
              <ul v-else class="add-members-list remove-members-select-list" role="radiogroup" aria-label="أعضاء الفريق">
                <li
                  v-for="member in filteredRemoveMembersList"
                  :key="memberRowKey(member)"
                  class="add-member-row remove-member-select-row"
                  :class="{ 'is-selected': selectedRemoveUserId === memberUserId(member) }"
                  @click="selectedRemoveUserId = memberUserId(member)"
                >
                  <input
                    v-model="selectedRemoveUserId"
                    class="remove-member-radio"
                    type="radio"
                    :value="memberUserId(member)"
                    :name="'pm-remove-' + (removeMembersTeam?.id ?? '')"
                    @click.stop
                  />
                  <span class="add-member-name">{{ member.name || member.full_name || member.user?.name || member.email || '—' }}</span>
                </li>
              </ul>
              <div class="remove-members-modal-footer">
                <button type="button" class="btn-secondary" @click="closeRemoveMembersModal">إلغاء</button>
                <button
                  type="button"
                  class="btn-primary"
                  :disabled="!selectedRemoveUserId || removeMembersDeleting"
                  @click="confirmRemoveSelectedFromTeam"
                >
                  {{ removeMembersDeleting ? 'جاري الإزالة...' : 'إزالة من الفريق' }}
                </button>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useTeamManagementView } from '@/modules/hr/views/useTeamManagementView';

const {
  teams,
  isLoading,
  searchQuery,
  debouncedSearch,
  showModal,
  isEditing,
  isSaving,
  teamForm,
  openCreateModal,
  openEditModal,
  closeModal,
  saveTeam,
  showDetailModal,
  detailTeam,
  detailMembers,
  detailContracts,
  isLoadingDetail,
  viewTeamDetails,
  confirmDelete,
  showConfirmModal,
  confirmModalConfig,
  onConfirmModalConfirm,
  showAddMembersModal,
  addMembersTeam,
  availableSalesWithoutTeam,
  addMembersSearch,
  filteredSalesWithoutTeam,
  addMembersLoading,
  openAddMembersModal,
  closeAddMembersModal,
  addMemberToTeam,
  salesRowKey,
  showRemoveMembersModal,
  removeMembersTeam,
  removeMembersList,
  removeMembersLoading,
  removeMembersSearch,
  filteredRemoveMembersList,
  selectedRemoveUserId,
  removeMembersDeleting,
  openRemoveMembersModal,
  closeRemoveMembersModal,
  confirmRemoveSelectedFromTeam,
  memberUserId,
  memberRowKey,
  confirmRemoveMember,
  formatDate,
  chipColor,
} = useTeamManagementView();
</script>

<style scoped src="./styles/TeamManagementView.scoped.css"></style>
