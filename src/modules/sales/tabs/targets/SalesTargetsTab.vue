<template>
  <div class="targets-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">{{ isSalesLeaderView ? 'أهداف الفريق' : 'أهدافي' }}</h1>
        <p class="welcome-subtitle">{{ isSalesLeaderView ? 'متابعة أهداف الفريق والأداء المحدد للمبيعات.' : 'متابعة الأهداف التي أسندها مدير الفريق لك وما تم تكليفه لك.' }}</p>
      </div>
      <button v-if="hasPermission('sales.team.manage')" @click="openCreateTargetModalClick" class="btn-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة هدف جديد
      </button>
    </div>

    <LoadingSpinner v-if="isLoadingTargets" text="جاري تحميل الأهداف..." />

    <div v-else-if="targetsLoadError" class="empty-state error-state">
      <p>{{ targetsLoadError }}</p>
      <button type="button" class="btn-add" @click="loadTargets()">إعادة المحاولة</button>
    </div>

    <div v-else-if="displayTargets.length === 0" class="empty-state">
      <p>لا توجد أهداف محددة للعرض حالياً.</p>
    </div>

    <div v-else class="targets-grid">
      <TargetCard
        v-for="target in displayTargets"
        :key="target.target_id || target.id"
        :target="target"
        :is-open="openMenuId === (target.target_id || target.id)"
        :is-updating="updatingTargetId === (target.target_id || target.id)"
        :is-leader-view="isSalesLeaderView"
        :can-update="canUpdateTarget(target)"
        :status-options="TARGET_STATUS_OPTIONS"
        :has-permission="hasPermission"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :get-target-status-class="getTargetStatusClass"
        :get-target-status-text="getTargetStatusText"
        :get-progress-percentage="getProgressPercentage"
        @card-click="onCardClick"
        @open-units="openUnitsModal"
        @toggle-menu="toggleCardMenu"
        @assign-marketers="openAssignMarketers"
        @update-status="updateTargetStatus"
      />
    </div>

    <!-- Modals -->
    <TargetCreateModal
      v-if="showCreateTargetModal"
      :target-form="targetForm"
      :team-members="teamMembersList"
      :team-projects="teamProjectsList"
      :units="targetFormUnits"
      :is-loading-units="isLoadingTargetFormUnits"
      :units-error="targetFormUnitsError"
      :is-saving="createTargetSaving"
      @close="closeCreateTargetModal"
      @submit="handleCreateTarget"
      @toggle-full-project="onTargetFullProjectChange"
      @toggle-unit="toggleTargetUnit"
    />

    <TargetAssignMarketersModal
      v-if="assignTarget"
      :target="assignTarget"
      :team-members="teamMembersList"
      :selected-ids="selectedMarketerIds"
      :is-loading="loadingTeamMembers"
      :is-saving="assignSaving"
      @close="closeAssignMarketers"
      @toggle-marketer="id => selectedMarketerIds.includes(id) ? selectedMarketerIds = selectedMarketerIds.filter(x => x !== id) : selectedMarketerIds.push(id)"
      @save="saveAssignMarketers"
    />

    <TargetUnitsModal
      v-if="showUnitsModal"
      :project-name="unitsModalProjectName"
      :rows="filteredUnitsModalRows"
      :is-loading="unitsModalLoading"
      :error="unitsModalError"
      :is-leader-view="isSalesLeaderView"
      @close="closeUnitsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import TargetCard from './components/TargetCard.vue';
import TargetCreateModal from './components/TargetCreateModal.vue';
import TargetAssignMarketersModal from './components/TargetAssignMarketersModal.vue';
import TargetUnitsModal from './components/TargetUnitsModal.vue';

import { useSalesTargets } from '@/composables/sales/useSalesTargets';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';
import authService from '@/services/authService';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { isSalesLeader } from '@/utils/rbac';

const {
  targets, isLoadingTargets, targetsLoadError, showCreateTargetModal,
  targetForm, targetFormUnits, isLoadingTargetFormUnits, targetFormUnitsError,
  hasPermission, formatCurrency, formatDate,
  getTargetStatusClass, getTargetStatusText, getProgressPercentage,
  loadTargets, openCreateTargetModal, onTargetFullProjectChange, toggleTargetUnit, createTarget,
} = useSalesTargets();
const { teamMembers, teamProjects, loadTeamMembers, loadTeamProjects } = useSalesTeam();

const openMenuId = ref(null);
const assignTarget = ref(null);
const selectedMarketerIds = ref([]);
const assignSaving = ref(false);
const loadingTeamMembers = ref(false);

const showUnitsModal = ref(false);
const unitsModalProjectName = ref('');
const unitsModalLoading = ref(false);
const unitsModalError = ref('');
const unitsModalRows = ref([]);

const teamMembersList = computed(() => Array.isArray(teamMembers.value) ? teamMembers.value : []);
const teamProjectsList = computed(() => Array.isArray(teamProjects.value) ? teamProjects.value : []);
const isSalesLeaderView = computed(() => isSalesLeader(authService.getCurrentUser()));

const filteredUnitsModalRows = computed(() => {
  const rows = unitsModalRows.value;
  if (isSalesLeaderView.value || currentUserId.value == null) return rows;
  return rows.filter((r) => Number(r.marketer_id) === currentUserId.value);
});

const TARGET_STATUS_OPTIONS = [
  { value: 'new', label: 'جديد' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'منجز' },
];

const currentUserId = computed(() => {
  const u = authService.getCurrentUser();
  const rawId = u?.id ?? u?.user_id ?? u?.employee_id ?? u?.marketer_id;
  return rawId != null ? Number(rawId) : null;
});

const displayTargets = computed(() => {
  const list = Array.isArray(targets.value) ? targets.value : [];
  if (hasPermission('sales.team.manage')) return list;
  if (currentUserId.value == null) return [];
  return list.filter((t) => Number(t.marketer_id) === currentUserId.value);
});

function canUpdateTarget(target) {
  if (!target || currentUserId.value == null) return false;
  if (!hasPermission('sales.targets.update')) return false;
  return Number(target.marketer_id) === currentUserId.value || hasPermission('sales.team.manage');
}

const updatingTargetId = ref(null);

async function updateTargetStatus(target, newStatus) {
  const targetId = target.target_id || target.id;
  if (!targetId) return;
  updatingTargetId.value = targetId;
  openMenuId.value = null;
  try {
    await salesService.updateTarget(targetId, { status: newStatus });
    notificationService.addNotification('تم تحديث حالة الهدف', 'success');
    loadTargets();
  } catch (err) {
    notificationService.addNotification(err?.response?.data?.message || 'فشل تحديث الحالة', 'error');
  } finally {
    updatingTargetId.value = null;
  }
}

const createTargetSaving = ref(false);
async function openCreateTargetModalClick() { await openCreateTargetModal(teamMembers, teamProjects, loadTeamMembers, loadTeamProjects); }
function closeCreateTargetModal() { showCreateTargetModal.value = false; }
async function handleCreateTarget() {
  createTargetSaving.value = true;
  try { await createTarget(); } finally { createTargetSaving.value = false; }
}

function onCardClick(target) { if (target.contract_id) openUnitsModal(target); }

async function openUnitsModal(target) {
  const contractId = target.contract_id;
  showUnitsModal.value = true;
  unitsModalProjectName.value = target.project_name || 'هدف مبيعات';
  unitsModalError.value = '';
  unitsModalRows.value = [];
  unitsModalLoading.value = true;
  try {
    const data = await salesService.getTargetsByProject(contractId);
    unitsModalRows.value = (Array.isArray(data) ? data : []).flatMap((t) =>
      (t.units && t.units.length ? t.units : [{ id: t.target_id, unit_number: t.unit_number || '—' }]).map((u) => ({
        unit_id: u.id,
        unit_number: u.unit_number ?? '—',
        marketer_id: t.marketer_id,
        marketer_name: t.marketer_name ?? '—',
      }))
    );
  } catch (err) {
    unitsModalError.value = err?.response?.status === 403 ? 'ليس لديك صلاحية عرض أهداف هذا المشروع.' : 'فشل تحميل الوحدات المعينة.';
  } finally { unitsModalLoading.value = false; }
}

function closeUnitsModal() { showUnitsModal.value = false; }
function toggleCardMenu(id) { openMenuId.value = openMenuId.value === id ? null : id; }
function openAssignMarketers(target) {
  openMenuId.value = null;
  if (!target.contract_id) return;
  assignTarget.value = target;
  selectedMarketerIds.value = [];
  if (teamMembersList.value.length === 0) {
    loadingTeamMembers.value = true;
    loadTeamMembers().finally(() => { loadingTeamMembers.value = false; });
  }
}
function closeAssignMarketers() { assignTarget.value = null; }

async function saveAssignMarketers() {
  if (!assignTarget.value?.contract_id || selectedMarketerIds.value.length === 0) return;
  assignSaving.value = true;
  try {
    for (const marketerId of selectedMarketerIds.value) {
      await salesService.createTarget({
        marketer_id: marketerId,
        contract_id: assignTarget.value.contract_id,
        target_type: 'reservation',
        start_date: new Date().toISOString().split('T')[0],
        end_date: assignTarget.value.end_date || assignTarget.value.deadline,
        target_value: assignTarget.value.target_value ?? 0,
      });
    }
    notificationService.addNotification('تم التعيين بنجاح', 'success');
    closeAssignMarketers();
    loadTargets();
  } catch (err) {
    notificationService.addNotification('فشل حفظ التعيين', 'error');
  } finally { assignSaving.value = false; }
}

function onDocumentClick() { openMenuId.value = null; }
onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  if (hasPermission('sales.team.manage')) loadTeamMembers({ with_ratings: false });
});
onUnmounted(() => { document.removeEventListener('click', onDocumentClick); });
loadTargets();
</script>

<style scoped>
.targets-tab { width: 100%; direction: rtl; }
.welcome-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.btn-add {
  padding: 10px 20px; background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
}
.empty-state { padding: 60px 20px; text-align: center; color: var(--color-dark-gray); }
.targets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
@media (max-width: 768px) { .targets-grid { grid-template-columns: 1fr; } }
</style>
