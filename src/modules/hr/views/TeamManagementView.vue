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
                <button class="action-btn add-members" @click="openAddMembersModal(team)" title="اضافة اعضاء للتيم">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
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

    <!-- Add Members Modal -->
    <div v-if="showAddMembersModal" class="modal-overlay" @click.self="showAddMembersModal = false">
      <div class="modal-content add-members-modal">
        <div class="modal-header">
          <h3>اضافة اعضاء للتيم: {{ addMembersTeam?.name }}</h3>
          <button class="close-btn" @click="showAddMembersModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="addMembersLoading" class="loading-state"><div class="spinner"></div><p>جاري التحميل...</p></div>
          <template v-else>
            <div v-if="availableMarketers.length === 0" class="empty-inline">لا يوجد موظفون متاحون للإضافة (الجميع معينون بالفعل أو لا توجد بيانات).</div>
            <ul v-else class="add-members-list">
              <li v-for="emp in availableMarketers" :key="emp.id" class="add-member-row">
                <span class="add-member-name">{{ emp.name || emp.full_name || emp.email }}</span>
                <button type="button" class="btn-add-one" @click="addMemberToTeam(emp.id)">إضافة</button>
              </li>
            </ul>
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
import hrService from '@/services/hrService';
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

    const showAddMembersModal = ref(false);
    const addMembersTeam = ref(null);
    const availableMarketers = ref([]);
    const addMembersLoading = ref(false);

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
          hrService.getHRTeamMembers(team.id),
          teamService.getTeamContracts(team.id),
        ]);
        const raw = members.status === 'fulfilled' ? (Array.isArray(members.value) ? members.value : []) : [];
        detailMembers.value = raw;
        const cRaw = contracts.status === 'fulfilled' ? contracts.value : [];
        detailContracts.value = Array.isArray(cRaw) ? cRaw : cRaw?.items ?? [];
      } catch (error) {
        logger.error('Error loading team details:', error);
      } finally {
        isLoadingDetail.value = false;
      }
    };

    const openAddMembersModal = async team => {
      addMembersTeam.value = team;
      showAddMembersModal.value = true;
      availableMarketers.value = [];
      addMembersLoading.value = true;
      try {
        const [employeesRes, currentRes] = await Promise.allSettled([
          hrService.getEmployees({ per_page: 200 }),
          hrService.getHRTeamMembers(team.id),
        ]);
        const employees = employeesRes.status === 'fulfilled' ? (employeesRes.value?.items ?? employeesRes.value?.data ?? (Array.isArray(employeesRes.value) ? employeesRes.value : []) ?? []) : [];
        const list = Array.isArray(employees) ? employees : [];
        const current = currentRes.status === 'fulfilled' ? (Array.isArray(currentRes.value) ? currentRes.value : []) : [];
        const currentIds = new Set(current.map(m => m.user_id ?? m.id).filter(Boolean));
        availableMarketers.value = list.filter(e => !currentIds.has(e.id));
      } catch (err) {
        logger.error('Error loading employees for add members:', err);
        toast.error('فشل تحميل قائمة الموظفين');
      } finally {
        addMembersLoading.value = false;
      }
    };

    const addMemberToTeam = async userId => {
      const team = addMembersTeam.value;
      if (!team || !userId) return;
      try {
        await hrService.assignTeamMember(team.id, { user_id: userId });
        toast.success('تم إضافة العضو إلى الفريق');
        availableMarketers.value = availableMarketers.value.filter(e => e.id !== userId);
        if (showDetailModal.value && detailTeam.value?.id === team.id) {
          const members = await hrService.getHRTeamMembers(team.id);
          detailMembers.value = Array.isArray(members) ? members : [];
        }
      } catch (err) {
        logger.error('Error assigning member:', err);
        toast.error('فشل إضافة العضو: ' + (err.response?.data?.message || err.message));
      }
    };

    const confirmRemoveMember = member => {
      const team = detailTeam.value;
      if (!team) return;
      const userId = member.user_id ?? member.id;
      const name = member.name || member.full_name || member.user?.name || 'هذا العضو';
      confirmModalConfig.value = {
        title: 'حذف مسوق',
        message: `هل أنت متأكد من إزالة "${name}" من الفريق؟`,
        type: 'danger',
        confirmText: 'حذف',
        resolve: async () => {
          try {
            await hrService.removeTeamMember(team.id, userId);
            toast.success('تم إزالة العضو من الفريق');
            detailMembers.value = detailMembers.value.filter(m => (m.user_id ?? m.id) !== userId);
          } catch (err) {
            logger.error('Error removing member:', err);
            toast.error('فشل إزالة العضو: ' + (err.response?.data?.message || err.message));
          }
        },
      };
      showConfirmModal.value = true;
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
      showAddMembersModal, addMembersTeam, availableMarketers, addMembersLoading,
      openAddMembersModal, addMemberToTeam, confirmRemoveMember,
      formatDate, chipColor,
    };
  },
};
</script>

<style scoped src="./styles/TeamManagementView.scoped.s1.css"></style>
<style scoped src="./styles/TeamManagementView.scoped.s2.css"></style>
