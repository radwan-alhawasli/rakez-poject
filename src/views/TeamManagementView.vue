<template>
  <div class="team-management-view">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إدارة الفرق</h2>
        <p class="section-subtitle">إنشاء وتعديل وإدارة فرق العمل وتعيين الأعضاء والمشاريع.</p>
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
      <table class="data-table">
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
            <td>
              <div class="team-cell">
                <div class="team-avatar">{{ (team.name || '?').charAt(0) }}</div>
                <div class="team-details">
                  <div class="team-name-text">{{ team.name }}</div>
                  <div class="team-desc-text">{{ team.description || 'لا يوجد وصف' }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="count-badge">{{ team.members_count ?? team.members?.length ?? 0 }}</span>
            </td>
            <td>{{ team.leader_name || team.leader?.name || '—' }}</td>
            <td>
              <span class="count-badge projects">{{ team.contracts_count ?? team.projects_count ?? 0 }}</span>
            </td>
            <td class="date-cell">{{ formatDate(team.created_at) }}</td>
            <td>
              <span class="status-badge" :class="team.is_active === false ? 'disabled' : 'active'">
                {{ team.is_active === false ? 'غير فعال' : 'فعال' }}
              </span>
            </td>
            <td>
              <div class="actions">
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
                <div v-for="member in detailMembers" :key="member.id" class="member-chip">
                  <div class="member-chip-avatar" :style="{ background: chipColor(member.id) }">
                    {{ (member.name || member.full_name || '?').charAt(0) }}
                  </div>
                  <div class="member-chip-info">
                    <span class="chip-name">{{ member.name || member.full_name }}</span>
                    <span class="chip-role">{{ member.role || member.job_title || 'عضو' }}</span>
                  </div>
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

<script>
import { ref, reactive, onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export default {
  name: 'TeamManagementView',
  components: { ConfirmModal },
  setup() {
    const teams = ref([]);
    const isLoading = ref(false);
    const searchQuery = ref('');
    let searchTimeout = null;

    const showModal = ref(false);
    const isEditing = ref(false);
    const isSaving = ref(false);
    const teamForm = reactive({ id: null, name: '', description: '' });

    const showDetailModal = ref(false);
    const detailTeam = ref(null);
    const detailMembers = ref([]);
    const detailContracts = ref([]);
    const isLoadingDetail = ref(false);

    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });

    const fetchTeams = async (search = '') => {
      isLoading.value = true;
      try {
        const data = await teamService.getTeams(search);
        teams.value = Array.isArray(data) ? data : data?.items ?? [];
      } catch (error) {
        logger.error('Error fetching teams:', error);
        toast.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        isLoading.value = false;
      }
    };

    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => fetchTeams(searchQuery.value), 300);
    };

    const openCreateModal = () => {
      isEditing.value = false;
      Object.assign(teamForm, { id: null, name: '', description: '' });
      showModal.value = true;
    };

    const openEditModal = team => {
      isEditing.value = true;
      Object.assign(teamForm, { id: team.id, name: team.name, description: team.description || '' });
      showModal.value = true;
    };

    const closeModal = () => { showModal.value = false; };

    const saveTeam = async () => {
      isSaving.value = true;
      try {
        const payload = { name: teamForm.name, description: teamForm.description };
        if (isEditing.value) {
          await teamService.updateTeam(teamForm.id, payload);
          toast.success('تم تحديث الفريق بنجاح');
        } else {
          await teamService.createTeam(payload);
          toast.success('تم إنشاء الفريق بنجاح');
        }
        closeModal();
        fetchTeams(searchQuery.value);
      } catch (error) {
        logger.error('Error saving team:', error);
        toast.error('حدث خطأ أثناء الحفظ: ' + (error.response?.data?.message || error.message));
      } finally {
        isSaving.value = false;
      }
    };

    const viewTeamDetails = async team => {
      detailTeam.value = team;
      detailMembers.value = [];
      detailContracts.value = [];
      showDetailModal.value = true;
      isLoadingDetail.value = true;
      try {
        const [members, contracts] = await Promise.allSettled([
          teamService.getTeamMembers(team.id),
          teamService.getTeamContracts(team.id),
        ]);
        detailMembers.value = members.status === 'fulfilled' ? (Array.isArray(members.value) ? members.value : []) : [];
        const cRaw = contracts.status === 'fulfilled' ? contracts.value : [];
        detailContracts.value = Array.isArray(cRaw) ? cRaw : cRaw?.items ?? [];
      } catch (error) {
        logger.error('Error loading team details:', error);
      } finally {
        isLoadingDetail.value = false;
      }
    };

    const confirmDelete = team => {
      confirmModalConfig.value = {
        title: 'تأكيد الحذف',
        message: `هل أنت متأكد من حذف الفريق "${team.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        type: 'danger',
        confirmText: 'حذف',
        resolve: async () => {
          try {
            await teamService.deleteTeam(team.id);
            toast.success('تم حذف الفريق بنجاح');
            fetchTeams(searchQuery.value);
          } catch (error) {
            logger.error('Error deleting team:', error);
            const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء الحذف';
            toast.error(msg);
          }
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = () => {
      if (confirmModalConfig.value.resolve) confirmModalConfig.value.resolve();
      showConfirmModal.value = false;
    };

    const { formatDateISO: formatDate } = useFormatters();

    const chipColor = id => {
      const colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#f39c12'];
      return colors[(id || 0) % colors.length];
    };

    onMounted(() => fetchTeams());

    return {
      teams, isLoading, searchQuery, debouncedSearch,
      showModal, isEditing, isSaving, teamForm,
      openCreateModal, openEditModal, closeModal, saveTeam,
      showDetailModal, detailTeam, detailMembers, detailContracts, isLoadingDetail,
      viewTeamDetails, confirmDelete, showConfirmModal, confirmModalConfig, onConfirmModalConfirm,
      formatDate, chipColor,
    };
  },
};
</script>

<style scoped>
.team-management-view {
  direction: rtl;
  padding: 20px 30px;
  min-height: 100vh;
  background: #f8fafc;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header - matches UserManagement */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: clamp(22px, 2vw, 28px);
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 5px 0;
}

.section-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  font-size: 14px;
  white-space: nowrap;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.add-btn.small {
  padding: 10px 20px;
  font-size: 13px;
}

.btn-icon-svg {
  width: 18px;
  height: 18px;
}

/* Search */
.search-container {
  position: relative;
  margin-bottom: 20px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #b1a28f;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

/* Table - matches UserManagement */
.data-table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
  min-width: 800px;
}

.data-table th {
  color: #94a3b8;
  font-weight: 500;
  font-size: 14px;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.data-table td {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.team-avatar {
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
  flex-shrink: 0;
}

.team-name-text {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.team-desc-text {
  font-size: 12px;
  color: #94a3b8;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 10px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
}

.count-badge.projects {
  background: #fef3c7;
  color: #92400e;
}

.date-cell {
  white-space: nowrap;
  color: #64748b;
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.disabled {
  background: #fee2e2;
  color: #ef4444;
}

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
  border-color: #b1a28f;
  color: #b1a28f;
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

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.team-modal {
  max-width: 500px;
}

.detail-modal {
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e3a5f;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #b1a28f;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Detail modal sections */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 15px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.empty-inline {
  color: #94a3b8;
  font-size: 13px;
  padding: 8px 0;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.member-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.member-chip-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.chip-name {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
  display: block;
}

.chip-role {
  font-size: 11px;
  color: #94a3b8;
}

.contracts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contract-chip {
  padding: 6px 14px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

/* Loading / Empty */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================
   RESPONSIVE
   ============================ */
@media (max-width: 992px) {
  .team-management-view {
    padding: 16px 20px;
  }
  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .data-table-container {
    border-radius: 12px;
  }
  .detail-modal {
    max-width: 100%;
    max-height: 90vh;
  }
  .members-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .team-management-view {
    padding: 12px 14px;
  }
  .section-title {
    font-size: 20px;
  }
  .add-btn {
    padding: 10px 18px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
  }
  .modal-content {
    border-radius: 12px;
  }
  .modal-overlay {
    padding: 10px;
  }
  .actions {
    gap: 4px;
  }
  .action-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }
  .data-table-container {
    border-radius: 10px;
    -webkit-overflow-scrolling: touch;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .team-management-view {
    padding: 10px;
  }
  .section-title {
    font-size: 18px;
  }
  .section-subtitle {
    font-size: 13px;
  }
  .add-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
  .search-input {
    font-size: 13px;
    padding: 10px 12px 10px 38px;
  }
  .data-table th,
  .data-table td {
    padding: 14px 10px;
    font-size: 12px;
  }
  .team-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 8px;
  }
  .team-name-text {
    font-size: 13px;
  }
  .action-btn {
    width: 32px;
    height: 32px;
  }
  .modal-header h3 {
    font-size: 16px;
  }
  .modal-body {
    padding: 16px;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .data-table th,
  .data-table td {
    padding: 22px;
  }
}

@media (min-width: 1920px) {
  .team-management-view {
    padding: 28px 40px;
  }
  .data-table th, .data-table td {
    padding: 24px;
  }
  .team-avatar {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (min-width: 2560px) {
  .section-title {
    font-size: 32px;
  }
  .data-table th, .data-table td {
    padding: 28px;
    font-size: 16px;
  }
  .team-avatar {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
}

@media (min-width: 3840px) {
  .team-management-view {
    padding: 40px 60px;
  }
  .section-title {
    font-size: 38px;
  }
  .data-table th, .data-table td {
    padding: 32px;
    font-size: 18px;
  }
  .team-avatar {
    width: 64px;
    height: 64px;
    font-size: 26px;
  }
  .action-btn {
    width: 46px;
    height: 46px;
  }
}
</style>
