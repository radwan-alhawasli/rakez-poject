<!-- eslint-disable max-lines -->
<template>
  <div class="targets-tab">
    <div class="welcome-header targets-hero">
      <div class="header-content">
        <h1 class="welcome-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          {{ isSalesLeaderView ? 'أهداف الفرق' : 'أهدافي' }}
        </h1>
        <p class="welcome-subtitle">
          {{
            isSalesLeaderView
              ? 'متابعة أهداف فريق المبيعات والمسوّقين المرتبطين بالمشروع.'
              : 'متابعة الأهداف التي أسندها مدير الفريق لك وما تم تكليفه لك.'
          }}
        </p>
        <p
          v-if="targetsMeta.total && !isLoadingTargets && !targetsLoadError"
          class="targets-meta-line"
        >
          {{ targetsMeta.total === 1 ? 'هدف واحد في القائمة' : `${targetsMeta.total} أهداف في القائمة` }}
        </p>
      </div>
      <button v-if="canCreateTarget" @click="openCreateTargetModalClick" class="btn-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة هدف جديد
      </button>
    </div>

    <!-- View for Sales Leader: Project Board -->
    <div v-if="isSalesLeaderView">
      <CardSkeleton v-if="isLoadingTeamProjects" :count="3" />
      
      <div v-else-if="teamProjectsLoadError" class="empty-state error-state">
        <p>{{ teamProjectsLoadError }}</p>
        <button type="button" class="btn-add" @click="loadTeamProjects()">إعادة المحاولة</button>
      </div>

      <div v-else-if="teamProjects.length === 0" class="empty-state">
        <p>لا توجد مشاريع مخصصة للفريق حالياً.</p>
      </div>

      <div v-else class="targets-grid">
        <ProjectBoardCard 
          v-for="project in teamProjects"
          :key="project.contract_id"
          :project="project"
          @view-details="openProjectDetails"
          @view-units="openUnitsDetails"
          @assign-target="openAssignProjectTargets"
        />
      </div>

    </div>

    <!-- View for Staff: Targets -->
    <div v-else>
      <div v-if="isSalesExecutiveView" class="empty-state" style="margin-bottom: 16px;">
        <div v-if="isLoadingExecutiveUnits">Loading available units...</div>
        <div v-else-if="executiveUnitsError" class="error-state">
          <p>{{ executiveUnitsError }}</p>
          <button type="button" class="btn-add" @click="loadExecutiveAvailableUnits">Retry</button>
        </div>
        <div v-else>
          <p style="margin-bottom: 8px; font-weight: 600;">Executive available units</p>
          <div v-if="executiveUnitsRows.length === 0">No available-units data found.</div>
          <div v-else class="targets-grid">
            <div v-for="(row, idx) in executiveUnitsRows" :key="row.key || idx" class="target-card">
              <div class="target-card-surface">
                <div class="target-header">
                  <div class="target-info">
                    <h3 class="target-project-name">{{ row.label }}</h3>
                  </div>
                  <div class="target-value-block">
                    <span class="target-value">{{ row.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TableSkeleton v-if="isLoadingTargets" :rows="4" :columns="5" />

      <div v-else-if="targetsLoadError" class="empty-state error-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ targetsLoadError }}</p>
        <button type="button" class="btn-add" @click="loadTargets()">إعادة المحاولة</button>
      </div>

      <div v-else-if="displayTargets.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        <p>لا توجد أهداف محددة للعرض حالياً.</p>
      </div>

      <SalesTargetList
        v-else
        :display-targets="displayTargets"
        :open-menu-id="openMenuId"
        :is-sales-leader-view="isSalesLeaderView"
        :is-manager="isSalesManagerView || isSalesLeaderView || hasPermission('sales.team.manage')"
        :is-target-updating="isTargetUpdating"
        :get-target-status-class="getTargetStatusClass"
        :get-target-status-text="getTargetStatusText"
        :get-progress-percentage="getProgressPercentage"
        :get-displayed-achieved-value="getDisplayedAchievedValue"
        :can-update-target="canUpdateTarget"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :assign-action-label="assignActionLabel"
        :allow-delete="isSalesExecutiveView"
        :can-view-target-details="isSalesExecutiveView"
        @open-units-modal="openUnitsModal"
        @toggle-card-menu="toggleCardMenu"
        @assign-marketers="openAssignMarketers"
        @update-target-status="updateTargetStatus"
        @delete-target="deleteTarget"
        @view-target-details="openExecutiveTargetDetails"
      />

      <Pagination
        v-if="targetsMeta.total > targetsMeta.perPage"
        :current-page="targetsMeta.currentPage"
        :total-items="targetsMeta.total"
        :per-page="targetsMeta.perPage"
        @page-change="p => loadTargets({ page: p })"
        @per-page-change="pp => loadTargets({ page: 1, perPage: pp })"
      />
    </div>


    <!-- Modals -->
    <SalesTargetsCreateTargetModal
      v-if="showCreateTargetModal"
      :open="showCreateTargetModal"
      :mode="salesTargetMode"
      :target-form="targetForm"
      :team-members-list="teamMembersList"
      :team-projects-list="teamProjectsList"
      :target-form-units="targetFormUnits"
      :is-loading-target-form-units="isLoadingTargetFormUnits"
      :target-form-units-error="targetFormUnitsError"
      :create-target-saving="createTargetSaving"
      :on-target-full-project-change="onTargetFullProjectChange"
      :toggle-target-unit="toggleTargetUnit"
      @close="closeCreateTargetModal"
      @submit="handleCreateTarget"
    />

    <SalesTargetsAssignMarketersModal
      v-if="assignTarget"
      v-model:selected-marketer-ids="selectedMarketerIds"
      :title="assignModalTitle"
      :project-name="assignTarget.project_name || 'هدف مبيعات'"
      :items-list="assignmentCandidates"
      :loading-team-members="assignModalLoading"
      :assign-saving="assignSaving"
      :empty-text="assignModalEmptyText"
      :loading-text="assignModalLoadingText"
      :save-label="assignActionLabel"
      @close="closeAssignMarketers"
      @save="saveAssignMarketers"
    />

    <SalesTargetsUnitsModal
      v-if="showUnitsModal"
      :project-name="unitsModalProjectName"
      :loading="unitsModalLoading"
      :error="unitsModalError"
      :unfiltered-count="unitsModalUnfilteredCount"
      :rows="filteredUnitsModalRows"
      :is-sales-leader-view="isSalesLeaderView"
      @close="closeUnitsModal"
    />

    <ProjectUnitsDetailsModal
      v-if="selectedProjectForUnits"
      :open="!!selectedProjectForUnits"
      :project="selectedProjectForUnits"
      @close="selectedProjectForUnits = null"
    />

    <ProjectDetailsModal
      v-if="selectedProjectForDetails"
      :open="!!selectedProjectForDetails"
      :project="selectedProjectForDetails"
      @close="selectedProjectForDetails = null"
    />

    <SalesTargetsProjectAssignModal
      v-if="projectForAssign"
      :open="!!projectForAssign"
      :project="projectForAssign"
      :team-members="teamMembersList"
      :loading="isAssigningProjectTargets"
      @close="projectForAssign = null"
      @submit="handleProjectAssignSubmit"
    />

    <div
      v-if="showExecutiveTargetModal"
      class="assign-overlay"
      dir="rtl"
      lang="ar"
      @click.self="closeExecutiveTargetModal"
    >
      <div class="assign-modal create-target-modal" role="dialog" aria-modal="true">
        <div class="assign-modal-header">
          <h3>Target details</h3>
          <button type="button" class="assign-close" aria-label="Close" @click="closeExecutiveTargetModal">&times;</button>
        </div>
        <div class="create-target-form">
          <div v-if="isLoadingExecutiveTargetDetails">Loading target details...</div>
          <template v-else>
            <div class="form-row">
              <label class="form-label" for="exec-target-line-type">Line type</label>
              <input
                id="exec-target-line-type"
                v-model="executiveTargetForm.line_type"
                type="text"
                class="form-input"
                placeholder="line type"
              />
            </div>

            <div class="form-row">
              <label class="form-label" for="exec-target-value">Value</label>
              <input
                id="exec-target-value"
                v-model.number="executiveTargetForm.value"
                type="number"
                min="0"
                step="1"
                class="form-input"
                placeholder="0"
              />
            </div>

            <div class="form-row">
              <label class="form-label">Status</label>
              <input :value="executiveTargetDetails?.status || '-'" type="text" class="form-input" disabled />
            </div>

            <div class="form-row">
              <label class="form-label">Team IDs</label>
              <input
                :value="(executiveTargetDetails?.team_ids || []).join(', ') || '-'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-row">
              <label class="form-label">Group IDs</label>
              <input
                :value="(executiveTargetDetails?.team_group_ids || []).join(', ') || '-'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="create-target-actions">
              <button type="button" class="btn-add" :disabled="isSavingExecutiveTargetDetails" @click="saveExecutiveTargetDetails">
                {{ isSavingExecutiveTargetDetails ? 'Saving...' : 'Save changes' }}
              </button>
              <button type="button" class="btn-secondary" @click="closeExecutiveTargetModal">Close</button>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
/* eslint-disable max-lines */
import { ref, reactive, computed, onMounted, onUnmounted, watch, inject, unref } from 'vue';
import { useRoute } from 'vue-router';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/Pagination.vue';
import SalesTargetsAssignMarketersModal from '@/modules/sales/tabs/targets/SalesTargetsAssignMarketersModal.vue';
import SalesTargetsCreateTargetModal from '@/modules/sales/tabs/targets/SalesTargetsCreateTargetModal.vue';
import SalesTargetsUnitsModal from '@/modules/sales/tabs/targets/SalesTargetsUnitsModal.vue';
import SalesTargetsProjectAssignModal from '@/modules/sales/tabs/targets/SalesTargetsProjectAssignModal.vue';
import ProjectBoardCard from '@/modules/sales/components/ProjectBoardCard.vue';
import ProjectDetailsModal from '@/modules/sales/components/ProjectDetailsModal.vue';
import ProjectUnitsDetailsModal from '@/modules/sales/components/ProjectUnitsDetailsModal.vue';
import SalesTargetList from '@/modules/sales/tabs/targets/components/SalesTargetList.vue';
import {
  useSalesTargets,
  normalizeSalesTargetItem,
  getSalesTargetPatchId,
} from '@/composables/sales/useSalesTargets';



import { buildUnitsModalRows } from '@/modules/sales/tabs/targets/salesTargetsUnitsModalRows.js';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';
import authService from '@/services/authService';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { isSalesExecutive, isSalesLeader, isSalesManager } from '@/utils/rbac';

const route = useRoute();
/** أولوية على query: لوحة المشروع تمرّر ref معرّف العقد */
const injectedContractId = inject('salesTargetsContractId', ref(null));

const {
  targets, targetsMeta, isLoadingTargets, targetsLoadError, showCreateTargetModal,
  targetForm, targetFormUnits, isLoadingTargetFormUnits, targetFormUnitsError,
  hasPermission, formatCurrency, formatDate,
  getTargetStatusClass, getTargetStatusText, getProgressPercentage, getDisplayedAchievedValue,
  loadTargets, patchTargetStatus, isTargetUpdating,
  openCreateTargetModal, onTargetFullProjectChange, toggleTargetUnit, createTarget,
  salesTargetMode, deleteTarget,
} = useSalesTargets();
const { teamMembers, teamProjects, loadTeamMembers, loadTeamProjects, isLoadingTeamProjects, teamProjectsLoadError } = useSalesTeam();

const selectedProjectForDetails = ref(null);
const selectedProjectForUnits = ref(null);

function openProjectDetails(project) {
  selectedProjectForDetails.value = project;
}

function openUnitsDetails(project) {
  selectedProjectForUnits.value = project;
}

const projectForAssign = ref(null);
const isAssigningProjectTargets = ref(false);

function openAssignProjectTargets(project) {
  projectForAssign.value = project;
}

async function handleProjectAssignSubmit(data) {
  isAssigningProjectTargets.value = true;
  try {
    const { marketer_ids, ...rest } = data;
    let successCount = 0;
    
    for (const marketer_id of marketer_ids) {
      await salesService.createTarget({
        marketer_id,
        ...rest
      });
      successCount++;
    }
    
    notificationService.addNotification(
      successCount > 1 
        ? `تم تعيين الأهداف لـ ${successCount} مسوقين بنجاح` 
        : 'تم تعيين الهدف للمسوق بنجاح', 
      'success'
    );
    projectForAssign.value = null;
    loadTargets({ contractId: resolveContractScopeFromContext() });
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'فشل تعيين الأهداف';
    notificationService.addNotification(msg, 'error');
  } finally {
    isAssigningProjectTargets.value = false;
  }
}

async function loadManagerTeams() {
  loadingManagerTeams.value = true;
  try {
    const list = await salesService.getSalesTeams();
    managerTeams.value = Array.isArray(list) ? list : [];
  } catch (err) {
    managerTeams.value = [];
    const msg = err?.response?.data?.message || err?.message || 'فشل تحميل الفرق.';
    notificationService.addNotification(msg, 'error');
  } finally {
    loadingManagerTeams.value = false;
  }
}

function normalizeExecutiveUnitsRows(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      key: item?.id ?? item?.key ?? `item-${index}`,
      label: item?.label ?? item?.line_type ?? item?.name ?? `Item ${index + 1}`,
      value:
        item?.count ??
        item?.value ??
        item?.available_units ??
        item?.units_count ??
        item?.total ??
        0,
    }));
  }

  if (data && typeof data === 'object') {
    const buckets = [
      data.available_units,
      data.units,
      data.items,
      data.line_types,
      data.types,
    ];
    for (const bucket of buckets) {
      if (Array.isArray(bucket)) return normalizeExecutiveUnitsRows(bucket);
    }

    return Object.entries(data)
      .filter(([, value]) => ['number', 'string'].includes(typeof value))
      .map(([key, value]) => ({
        key,
        label: key.replace(/_/g, ' '),
        value,
      }));
  }

  return [];
}

async function loadExecutiveAvailableUnits() {
  if (!isSalesExecutiveView.value) return;
  isLoadingExecutiveUnits.value = true;
  executiveUnitsError.value = '';
  try {
    const result = await salesService.getExecutiveAvailableUnits();
    executiveUnitsRows.value = normalizeExecutiveUnitsRows(result);
  } catch (err) {
    executiveUnitsRows.value = [];
    executiveUnitsError.value =
      err?.response?.data?.message || err?.message || 'Failed to load available units';
  } finally {
    isLoadingExecutiveUnits.value = false;
  }
}

async function openExecutiveTargetDetails(target) {
  if (!isSalesExecutiveView.value) return;
  const targetId = getSalesTargetPatchId(target);
  if (!targetId) {
    notificationService.addNotification('Missing target id.', 'error');
    return;
  }

  openMenuId.value = null;
  showExecutiveTargetModal.value = true;
  isLoadingExecutiveTargetDetails.value = true;
  try {
    const result = await salesService.getExecutiveTarget(targetId);
    const normalized = normalizeSalesTargetItem(result);
    executiveTargetDetails.value = normalized;
    executiveTargetForm.line_type = normalized?.line_type || '';
    executiveTargetForm.value =
      normalized?.value ?? normalized?.target_value ?? normalized?.assigned_target_value ?? '';
  } catch (err) {
    showExecutiveTargetModal.value = false;
    const msg = err?.response?.data?.message || err?.message || 'Failed to load target details';
    notificationService.addNotification(msg, 'error');
  } finally {
    isLoadingExecutiveTargetDetails.value = false;
  }
}

function closeExecutiveTargetModal() {
  showExecutiveTargetModal.value = false;
  executiveTargetDetails.value = null;
  executiveTargetForm.line_type = '';
  executiveTargetForm.value = '';
}

async function saveExecutiveTargetDetails() {
  const targetId = getSalesTargetPatchId(executiveTargetDetails.value);
  if (!targetId) {
    notificationService.addNotification('Missing target id.', 'error');
    return;
  }

  const lineType = String(executiveTargetForm.line_type || '').trim();
  const valueNumber = Number(executiveTargetForm.value);
  if (!lineType) {
    notificationService.addNotification('Line type is required.', 'warning');
    return;
  }
  if (!Number.isFinite(valueNumber) || valueNumber <= 0) {
    notificationService.addNotification('Target value must be greater than zero.', 'warning');
    return;
  }

  isSavingExecutiveTargetDetails.value = true;
  try {
    await salesService.updateExecutiveTarget(targetId, {
      line_type: lineType,
      value: String(valueNumber),
    });
    const refreshed = await salesService.getExecutiveTarget(targetId);
    executiveTargetDetails.value = normalizeSalesTargetItem(refreshed);
    notificationService.addNotification('Target updated successfully.', 'success');
    await loadTargets();
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to update target';
    notificationService.addNotification(msg, 'error');
  } finally {
    isSavingExecutiveTargetDetails.value = false;
  }
}


function resolveContractScopeFromContext() {
  const inj = unref(injectedContractId);
  if (inj != null && inj !== '') return inj;
  const q = route.query.contract_id ?? route.query.contractId;
  if (q == null || q === '') return null;
  return Array.isArray(q) ? q[0] : q;
}

watch(
  () => [route.query.contract_id, route.query.contractId, unref(injectedContractId)],
  () => {
    loadTargets({ contractId: resolveContractScopeFromContext() });
  },
  { immediate: true },
);

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
const unitsModalUnfilteredCount = ref(0);
const managerTeams = ref([]);
const loadingManagerTeams = ref(false);
const executiveUnitsRows = ref([]);
const isLoadingExecutiveUnits = ref(false);
const executiveUnitsError = ref('');
const showExecutiveTargetModal = ref(false);
const isLoadingExecutiveTargetDetails = ref(false);
const isSavingExecutiveTargetDetails = ref(false);
const executiveTargetDetails = ref(null);
const executiveTargetForm = reactive({
  line_type: '',
  value: '',
});

const teamMembersList = computed(() => Array.isArray(teamMembers.value) ? teamMembers.value : []);
const teamProjectsList = computed(() => Array.isArray(teamProjects.value) ? teamProjects.value : []);
const isSalesLeaderView = computed(() => isSalesLeader(authService.getCurrentUser()));
const isSalesManagerView = computed(() => isSalesManager(authService.getCurrentUser()));
const isSalesExecutiveView = computed(() => isSalesExecutive(authService.getCurrentUser()));
watch(
  isSalesExecutiveView,
  (isExecutive) => {
    if (isExecutive) {
      loadExecutiveAvailableUnits();
      return;
    }
    executiveUnitsRows.value = [];
    executiveUnitsError.value = '';
  },
  { immediate: true }
);
const canCreateTarget = computed(
  () => !isSalesManagerView.value && (isSalesExecutiveView.value || isSalesLeaderView.value || hasPermission('sales.team.manage'))
);
const assignmentCandidates = computed(() => {
  if (isSalesManagerView.value) {
    return (Array.isArray(managerTeams.value) ? managerTeams.value : []).map(t => ({
      id: t.id ?? t.team_id,
      name: t.name || t.team_name || `Team #${t.id ?? t.team_id}`,
    }));
  }
  return teamMembersList.value;
});
const assignModalTitle = computed(() =>
  isSalesManagerView.value ? 'تعيين الهدف على الفرق' : 'إضافة مسوقين للمشروع'
);
const assignActionLabel = computed(() =>
  isSalesManagerView.value ? 'تعيين فرق للهدف' : 'إضافة مسوقين للمشروع'
);

const assignModalLoading = computed(() =>
  isSalesManagerView.value ? loadingManagerTeams.value : loadingTeamMembers.value
);
const assignModalEmptyText = computed(() =>
  isSalesManagerView.value ? 'لا توجد فرق متاحة.' : 'لا يوجد مسوقون متاحون.'
);
const assignModalLoadingText = computed(() =>
  isSalesManagerView.value ? 'جاري تحميل الفرق...' : 'جاري تحميل أعضاء الفريق...'
);

const filteredUnitsModalRows = computed(() => {
  const rows = unitsModalRows.value;
  if (isSalesLeaderView.value || currentUserId.value == null) return rows;
  return rows.filter((r) => Number(r.marketer_id) === currentUserId.value);
});


const currentUserId = computed(() => {

  const u = authService.getCurrentUser();
  const rawId = u?.id ?? u?.user_id ?? u?.employee_id ?? u?.marketer_id;
  return rawId != null ? Number(rawId) : null;
});

/** قائد المبيعات أو من لديه إدارة الفريق يرى كل الأهداف؛ غير ذلك يُفلتر حسب المستخدم. */
const displayTargets = computed(() => {
  const list = Array.isArray(targets.value) ? targets.value : [];
  // قائد المبيعات يرى كل شيء؛ أو من لديه صلاحية إدارة الفريق.
  if (
    isSalesLeaderView.value ||
    isSalesManagerView.value ||
    isSalesExecutiveView.value ||
    hasPermission('sales.team.manage')
  ) {
    return list;
  }
  
  if (currentUserId.value == null) return [];
  
  return list.filter((t) => {
    // إذا كان معرّف المسوّق موجوداً في العنصر، نتأكد أنه يطابق المستخدم الحالي (منعاً لأي تداخل).
    // إذا لم يكن موجوداً، نثق في أن الـ API أرجع فقط أهداف هذا المستخدم (خاصة في مسار /my).
    const mId = t.marketer_id != null && t.marketer_id !== '' ? Number(t.marketer_id) : null;
    if (mId === null || Number.isNaN(mId)) return true;
    return mId === currentUserId.value;
  });
});

function canUpdateTarget(target) {
  if (!target) return false;
  if (isSalesManagerView.value) return false;
  if (isSalesExecutiveView.value) return true;
  const isManager = isSalesLeaderView.value || hasPermission('sales.team.manage');
  /** قائد الفريق / مدير الفريق: يحدّث أهداف أي مسوق — لا يعتمد على sales.targets.update أو تعرّف المستخدم إن نقصا من الـ API */
  if (isManager) return true;
  if (!hasPermission('sales.targets.update')) return false;
  if (currentUserId.value == null) return false;
  return Number(target.marketer_id) === currentUserId.value;
}

/**
 * PATCH أولاً ثم إغلاق القائمة — إن أُغلقت القائمة قبل await كان يُزال الـ select/الزر قبل اكتمال الطلب أو قبل change.
 */
async function updateTargetStatus(target, newStatus) {
  try {
    await patchTargetStatus(target, newStatus);
  } finally {
    openMenuId.value = null;
  }
}

const createTargetSaving = ref(false);

async function openCreateTargetModalClick() {
  await openCreateTargetModal(teamMembers, teamProjects, loadTeamMembers, loadTeamProjects);
}

function closeCreateTargetModal() {
  showCreateTargetModal.value = false;
}

async function handleCreateTarget() {
  createTargetSaving.value = true;
  try {
    await createTarget();
  } finally {
    createTargetSaving.value = false;
  }
}

async function openUnitsModal(target) {
  const contractId = target.contract_id;
  const projectName = target.project_name || 'هدف مبيعات';
  showUnitsModal.value = true;
  unitsModalProjectName.value = projectName;
  unitsModalError.value = '';
  unitsModalRows.value = [];
  unitsModalUnfilteredCount.value = 0;
  if (!contractId) {
    unitsModalError.value = 'لا يوجد معرّف عقد مرتبط بهذا الهدف. تحقق من بيانات المشروع من الخادم.';
    return;
  }
  unitsModalLoading.value = true;
  try {
    const data = await salesService.getTargetsByProject(contractId);
    const list = Array.isArray(data) ? data : data?.items ?? [];
    const rows = buildUnitsModalRows(list, normalizeSalesTargetItem);
    unitsModalRows.value = rows;
    unitsModalUnfilteredCount.value = rows.length;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message;
    const status = err?.response?.status;
    unitsModalError.value =
      status === 403
        ? 'ليس لديك صلاحية عرض أهداف هذا المشروع.'
        : msg || 'فشل تحميل الوحدات المعينة.';
    unitsModalRows.value = [];
    unitsModalUnfilteredCount.value = 0;
  } finally {
    unitsModalLoading.value = false;
  }
}

function closeUnitsModal() {
  showUnitsModal.value = false;
  unitsModalProjectName.value = '';
  unitsModalError.value = '';
  unitsModalRows.value = [];
  unitsModalUnfilteredCount.value = 0;
}

function toggleCardMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id;
}

function openAssignMarketers(target) {
  openMenuId.value = null;
  assignTarget.value = target;
  selectedMarketerIds.value = [];
  if (isSalesManagerView.value) {
    if (assignmentCandidates.value.length === 0) {
      loadManagerTeams();
    }
    return;
  }
  if (teamMembersList.value.length === 0) {
    loadingTeamMembers.value = true;
    loadTeamMembers().finally(() => { loadingTeamMembers.value = false; });
  }
}

function closeAssignMarketers() {
  assignTarget.value = null;
  selectedMarketerIds.value = [];
}

async function saveAssignMarketers() {
  if (!assignTarget.value || selectedMarketerIds.value.length === 0) return;

  if (isSalesManagerView.value) {
    const targetId = getSalesTargetPatchId(assignTarget.value);
    if (!targetId) return;
    assignSaving.value = true;
    try {
      await salesService.assignTargetToTeams(targetId, selectedMarketerIds.value);
      notificationService.addNotification('تم تعيين الهدف على الفرق بنجاح', 'success');
      closeAssignMarketers();
      await loadTargets();
    } catch (err) {
      notificationService.addNotification(err?.response?.data?.message || 'فشل حفظ التعيين', 'error');
    } finally {
      assignSaving.value = false;
    }
    return;
  }

  if (!assignTarget.value?.contract_id || (!isSalesLeaderView.value && !hasPermission('sales.team.manage'))) return;
  const contractId = assignTarget.value.contract_id;
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = assignTarget.value.end_date || assignTarget.value.deadline || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const targetValue = assignTarget.value.target_value ?? 0;

  assignSaving.value = true;
  try {
    let created = 0;
    for (const marketerId of selectedMarketerIds.value) {
      await salesService.createTarget({
        assignee_marketer_id: marketerId,
        contract_id: contractId,
        target_type: 'reservation',
        start_date: startDate,
        end_date: endDate,
        assigned_target_value: targetValue,
      });
      created++;
    }
    notificationService.addNotification(
      created === 1 ? 'تم تعيين المسوق للمشروع بنجاح' : `تم تعيين ${created} مسوقين للمشروع بنجاح`,
      'success'
    );
    closeAssignMarketers();
    loadTargets();
  } catch (err) {
    notificationService.addNotification(err?.response?.data?.message || 'فشل حفظ التعيين', 'error');
  } finally {
    assignSaving.value = false;
  }
}

/**
 * إغلاق عند النقر خارج القائمة فقط.
 * تأجيل الإغلاق لدورة لاحقة حتى يُكمِل المتصفح حدث change على قائمة الحالة (قائمة النظام قد تُطلق click على document قبل change).
 */
function onDocumentClick(e) {
  const t = e?.target;
  if (t && typeof t.closest === 'function' && t.closest('.card-menu-wrap')) return;
  setTimeout(() => {
    openMenuId.value = null;
  }, 0);
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  if (isSalesManagerView.value) {
    loadManagerTeams();
  } else if (isSalesLeaderView.value || hasPermission('sales.team.manage')) {
    loadTeamMembers({ with_ratings: true });
    loadTeamProjects();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped src="./styles/SalesTargetsTab.scoped.s1.css"></style>
<style scoped src="./styles/SalesTargetsTab.scoped.s2.css"></style>


