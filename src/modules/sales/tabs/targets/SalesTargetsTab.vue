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

    <div>
      <div v-if="isDetectingSalesRole" class="empty-state">
        <div class="spinner"></div>
        <p>جاري تحديد دور المستخدم...</p>
      </div>

      <template v-else>
      <div v-if="showNoLedGroupsHint" class="role-detection-hint">
        <p>لا توجد مجموعات تقودها، سيتم عرض أهدافك الشخصية.</p>
      </div>

      <div v-if="showMemberOverviewCards" class="member-overview-grid">
        <div class="member-overview-card">
          <span class="member-overview-label">إجمالي الأهداف</span>
          <strong class="member-overview-value">{{ targetsOverview.assigned_lines_count }}</strong>
        </div>
        <div class="member-overview-card">
          <span class="member-overview-label">قيد التنفيذ</span>
          <strong class="member-overview-value">{{ targetsOverview.in_progress_lines_count }}</strong>
        </div>
        <div class="member-overview-card">
          <span class="member-overview-label">مكتمل</span>
          <strong class="member-overview-value">{{ targetsOverview.completed_lines_count }}</strong>
        </div>
        <div class="member-overview-card">
          <span class="member-overview-label">معدل الإنجاز</span>
          <strong class="member-overview-value">{{ Number(targetsOverview.completion_rate || 0).toFixed(1) }}%</strong>
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
        :is-manager="['manager', 'leader', 'group_leader'].includes(assignmentRoleMode)"
        :assignment-role-mode="assignmentRoleMode"
        :is-target-updating="isTargetUpdating"
        :get-target-status-class="getTargetStatusClass"
        :get-target-status-text="getTargetStatusText"
        :get-progress-percentage="getProgressPercentage"
        :get-displayed-achieved-value="getDisplayedAchievedValue"
        :get-assigned-value-for-target="getAssignedValueForTarget"
        :get-remaining-value-for-target="getRemainingValueForTarget"
        :get-distribution-line-for-target="getDistributionLineForTarget"
        :can-update-target="canUpdateTarget"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :assign-action-label="assignActionLabel"
        :allow-delete="isSalesExecutiveView"
        :can-view-target-details="isSalesExecutiveView"
        :is-executive-view="isSalesExecutiveView"
        :is-manager-view="isSalesManagerView"
        :is-group-leader-view="isGroupLeaderView"
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
      </template>
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
      v-model:selected-assignments="selectedAssignments"
      :title="assignModalTitle"
      :project-name="assignTarget.project_name || 'هدف مبيعات'"
      :items-list="assignmentCandidates"
      :loading-team-members="assignModalLoading"
      :assign-saving="assignSaving"
      :empty-text="assignModalEmptyText"
      :loading-text="assignModalLoadingText"
      save-label="حفظ الهدف"
      :target-type-name="assignTargetTypeLabel"
      :total-target-value="assignTargetTotalValue"
      :already-assigned-value="assignTargetAlreadyAssignedValue"
      :available-value="availableAssignmentValue"
      :show-totals="showAssignmentTotals"
      :show-value-inputs="showAssignmentTotals"
      :require-full-distribution="distributionValidation.requireExactDistribution"
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

    <div
      v-if="showExecutiveTargetModal"
      class="assign-overlay"
      dir="rtl"
      lang="ar"
      @click.self="closeExecutiveTargetModal"
    >
      <div class="assign-modal create-target-modal" role="dialog" aria-modal="true">
        <div class="assign-modal-header">
          <h3>تفاصيل الهدف</h3>
          <button type="button" class="assign-close" aria-label="إغلاق" @click="closeExecutiveTargetModal">&times;</button>
        </div>
        <div class="create-target-form">
          <div v-if="isLoadingExecutiveTargetDetails">جاري تحميل تفاصيل الهدف...</div>
          <template v-else>
            <div class="form-row">
              <label class="form-label" for="exec-target-line-type">نوع الهدف</label>
              <select id="exec-target-line-type" v-model="executiveTargetForm.line_type" class="form-select">
                <option value="">اختر النوع</option>
                <option
                  v-for="option in SALES_EXECUTIVE_TARGET_TYPES"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label" for="exec-target-value">القيمة</label>
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
              <label class="form-label">الحالة</label>
              <input :value="executiveTargetDetails?.status || '-'" type="text" class="form-input" disabled />
            </div>

            <div class="form-row">
              <label class="form-label">معرفات الفرق</label>
              <input
                :value="(executiveTargetDetails?.team_ids || []).join(', ') || '-'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-row">
              <label class="form-label">معرفات المجموعات</label>
              <input
                :value="(executiveTargetDetails?.team_group_ids || []).join(', ') || '-'"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="create-target-actions">
              <button type="button" class="btn-add" :disabled="isSavingExecutiveTargetDetails" @click="saveExecutiveTargetDetails">
                {{ isSavingExecutiveTargetDetails ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
              </button>
              <button type="button" class="btn-secondary" @click="closeExecutiveTargetModal">إغلاق</button>
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
import { TableSkeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/Pagination.vue';
import SalesTargetsAssignMarketersModal from '@/modules/sales/tabs/targets/SalesTargetsAssignMarketersModal.vue';
import SalesTargetsCreateTargetModal from '@/modules/sales/tabs/targets/SalesTargetsCreateTargetModal.vue';
import SalesTargetsUnitsModal from '@/modules/sales/tabs/targets/SalesTargetsUnitsModal.vue';
import SalesTargetList from '@/modules/sales/tabs/targets/components/SalesTargetList.vue';
import {
  useSalesTargets,
  normalizeSalesTargetItem,
  getSalesTargetPatchId,
  num,
} from '@/composables/sales/useSalesTargets';



import { buildUnitsModalRows } from '@/modules/sales/tabs/targets/salesTargetsUnitsModalRows.js';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';
import authService from '@/services/authService';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { isSalesExecutive, isSalesLeader, isSalesManager, normalizeRole } from '@/utils/rbac';
import {
  SALES_EXECUTIVE_TARGET_TYPES,
  normalizeSalesExecutiveLineType,
} from '@/constants/salesTargetLineTypes';

const route = useRoute();
/** أولوية على query: لوحة المشروع تمرّر ref معرّف العقد */
const injectedContractId = inject('salesTargetsContractId', ref(null));

const {
  targets, targetsMeta, isLoadingTargets, targetsLoadError, showCreateTargetModal,
  targetForm, targetFormUnits, isLoadingTargetFormUnits, targetFormUnitsError,
  targetsOverview, distributionValidation,
  hasPermission, formatCurrency, formatDate,
  getTargetStatusClass, getTargetStatusText, getProgressPercentage, getDisplayedAchievedValue,
  loadTargets, patchTargetStatus, isTargetUpdating,
  openCreateTargetModal, onTargetFullProjectChange, toggleTargetUnit, createTarget,
  salesTargetMode, deleteTarget, setSalesTargetModeOverride,
} = useSalesTargets();
const { teamMembers, teamProjects, loadTeamMembers, loadTeamProjects } = useSalesTeam();

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

<<<<<<< Updated upstream
function normalizeExecutiveUnitsRows(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      key: item?.id ?? item?.key ?? `item-${index}`,
      label: item?.label ?? item?.line_type ?? item?.name ?? `عنصر ${index + 1}`,
      value:
        item?.count ??
        item?.value ??
        item?.available_units ??
        item?.units_count ??
        item?.total ??
        0,
=======
const UNIT_TYPE_LABELS = Object.freeze({
  apartment: 'شقة',
  penthouse: 'بنتهاوس',
  townhouse: 'تاون هاوس',
  villa: 'فيلا',
  duplex: 'دوبلكس',
  land: 'أرض',
});

function normalizeUnitTypeLabel(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 'غير محدد';
  return UNIT_TYPE_LABELS[raw.toLowerCase()] || raw;
}

function normalizeExecutiveUnitsSummary(payload) {
  const data = payload?.summary ?? payload?.data?.summary ?? payload?.data ?? payload ?? {};
  const byTypeListRaw = Array.isArray(data?.by_type_list) ? data.by_type_list : [];
  const byTypeObj = data?.by_type && typeof data.by_type === 'object' ? data.by_type : {};
  const byTypePriceObj =
    data?.by_type_total_price && typeof data.by_type_total_price === 'object'
      ? data.by_type_total_price
      : {};

  let by_type_list = byTypeListRaw.map(item => ({
    unit_type: item?.unit_type ?? item?.type ?? 'unknown',
    unit_type_label: normalizeUnitTypeLabel(item?.unit_type ?? item?.type),
    count: Number(item?.count ?? 0) || 0,
    total_price: Number(item?.total_price ?? 0) || 0,
  }));

  if (by_type_list.length === 0 && Object.keys(byTypeObj).length > 0) {
    by_type_list = Object.keys(byTypeObj).map(key => ({
      unit_type: key,
      unit_type_label: normalizeUnitTypeLabel(key),
      count: Number(byTypeObj[key] ?? 0) || 0,
      total_price: Number(byTypePriceObj[key] ?? 0) || 0,
>>>>>>> Stashed changes
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
      err?.response?.data?.message || err?.message || 'فشل تحميل الوحدات المتاحة';
  } finally {
    isLoadingExecutiveUnits.value = false;
  }
}

async function openExecutiveTargetDetails(target) {
  if (!isSalesExecutiveView.value) return;
  const targetId = getSalesTargetPatchId(target);
  if (!targetId) {
    notificationService.addNotification('معرف الهدف غير متوفر.', 'error');
    return;
  }

  openMenuId.value = null;
  showExecutiveTargetModal.value = true;
  isLoadingExecutiveTargetDetails.value = true;
  try {
    const result = await salesService.getExecutiveTarget(targetId);
    const normalized = normalizeSalesTargetItem(result);
    executiveTargetDetails.value = normalized;
    executiveTargetForm.line_type = normalizeSalesExecutiveLineType(normalized?.line_type || '');
    executiveTargetForm.value =
      normalized?.value ?? normalized?.target_value ?? normalized?.assigned_target_value ?? '';
  } catch (err) {
    showExecutiveTargetModal.value = false;
    const msg = err?.response?.data?.message || err?.message || 'فشل تحميل تفاصيل الهدف';
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
    notificationService.addNotification('معرف الهدف غير متوفر.', 'error');
    return;
  }

  const lineType = normalizeSalesExecutiveLineType(executiveTargetForm.line_type);
  const valueNumber = Number(executiveTargetForm.value);
  if (!lineType) {
    notificationService.addNotification('نوع الهدف مطلوب.', 'warning');
    return;
  }
  if (!Number.isFinite(valueNumber) || valueNumber <= 0) {
    notificationService.addNotification('قيمة الهدف يجب أن تكون أكبر من صفر.', 'warning');
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
    notificationService.addNotification('تم تحديث الهدف بنجاح.', 'success');
    await loadTargetsByCurrentRole();
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'فشل تحديث الهدف';
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

async function loadTargetsByCurrentRole() {
  if (isDetectingSalesRole.value) return;
  await loadTargets({
    contractId: resolveContractScopeFromContext(),
    mode: assignmentRoleMode.value,
  });
}

const openMenuId = ref(null);
const assignTarget = ref(null);
const selectedMarketerIds = ref([]);
const selectedAssignments = ref([]);
const assignSaving = ref(false);
const loadingTeamMembers = ref(false);
const leaderTeamGroups = ref([]);
const loadingLeaderTeamGroups = ref(false);
const groupLeaderMembers = ref([]);
const loadingGroupLeaderMembers = ref(false);
const ledTeam = ref(null);
const ledGroups = ref([]);

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
const currentUser = computed(() => /** @type {any} */ (authService.getCurrentUser() || {}));
const isTruthyFlag = v => v === true || v === 1 || v === '1';
const isSalesManagerView = computed(() => isSalesManager(currentUser.value));
const isSalesExecutiveView = computed(() => isSalesExecutive(currentUser.value));
const isGroupLeaderFlag = computed(() =>
  isTruthyFlag(currentUser.value?.is_group_leader) ||
  isTruthyFlag(currentUser.value?.is_team_group_leader) ||
  String(currentUser.value?.role_key || '').toLowerCase() === 'group_leader'
);
const isSalesLeaderByFlags = computed(() => {
  if (isSalesManagerView.value || isSalesExecutiveView.value || isGroupLeaderFlag.value) return false;
  const role = normalizeRole(currentUser.value?.type);
  if (role === 7) return true;
  return isSalesLeader(currentUser.value);
});
const needsSalesRoleDetection = computed(
  () => !isSalesManagerView.value && !isSalesExecutiveView.value && !isSalesLeaderByFlags.value
);
const isDetectingSalesRole = ref(false);
const detectedSalesUserMode = ref('member');
const detectedLedGroups = ref([]);
const effectiveRoleMode = computed(() => {
  if (isSalesManagerView.value) return 'manager';
  if (isSalesExecutiveView.value) return 'executive';
  if (isSalesLeaderByFlags.value) return 'leader';
  return detectedSalesUserMode.value === 'group_leader' ? 'group_leader' : 'member';
});
const isGroupLeaderView = computed(() => effectiveRoleMode.value === 'group_leader');
const isSalesLeaderView = computed(() => effectiveRoleMode.value === 'leader');
const assignmentRoleMode = computed(() => {
  if (effectiveRoleMode.value === 'executive') return 'executive';
  if (effectiveRoleMode.value === 'manager') return 'manager';
  if (effectiveRoleMode.value === 'leader') return 'leader';
  if (effectiveRoleMode.value === 'group_leader') return 'group_leader';
  return 'member';
});
const showNoLedGroupsHint = computed(() =>
  needsSalesRoleDetection.value &&
  !isDetectingSalesRole.value &&
  assignmentRoleMode.value === 'member' &&
  detectedLedGroups.value.length === 0
);
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
  () =>
    (isSalesExecutiveView.value || isSalesLeaderView.value) &&
    !isSalesManagerView.value &&
    !isGroupLeaderView.value
);

watch(
  () => [route.query.contract_id, route.query.contractId, unref(injectedContractId), assignmentRoleMode.value],
  () => {
    loadTargetsByCurrentRole();
  },
);

const assignmentCandidates = computed(() => {
  if (assignmentRoleMode.value === 'manager') {
    return (Array.isArray(managerTeams.value) ? managerTeams.value : []).map(t => ({
      id: t.id ?? t.team_id,
      name: t.name || t.team_name || `Team #${t.id ?? t.team_id}`,
    }));
  }
  if (assignmentRoleMode.value === 'leader') {
    return (Array.isArray(leaderTeamGroups.value) ? leaderTeamGroups.value : []).map(group => ({
      id: group.id ?? group.team_group_id,
      name: group.name || group.group_name || `Group #${group.id ?? group.team_group_id}`,
    }));
  }
  if (assignmentRoleMode.value === 'group_leader') {
    return (Array.isArray(groupLeaderMembers.value) ? groupLeaderMembers.value : []).map(member => ({
      id: member.id ?? member.user_id,
      name: member.name || member.full_name || member.email || `User #${member.id ?? member.user_id}`,
    }));
  }
  return [];
});
const assignModalTitle = computed(() => {
  if (assignmentRoleMode.value === 'manager') return 'تعيين الهدف لفريق';
  if (assignmentRoleMode.value === 'leader') return 'تعيين الهدف للمجموعات';
  if (assignmentRoleMode.value === 'group_leader') return 'تعيين الهدف للأعضاء';
  return 'تعيين الهدف';
});
const assignActionLabel = computed(() => {
  if (assignmentRoleMode.value === 'manager') return 'تعيين الهدف لفريق';
  if (assignmentRoleMode.value === 'leader') return 'تعيين الهدف للمجموعات';
  if (assignmentRoleMode.value === 'group_leader') return 'تعيين الهدف للأعضاء';
  return 'تعيين الهدف';
});

const assignModalLoading = computed(() => {
  if (assignmentRoleMode.value === 'manager') return loadingManagerTeams.value;
  if (assignmentRoleMode.value === 'leader') return loadingLeaderTeamGroups.value;
  if (assignmentRoleMode.value === 'group_leader') return loadingGroupLeaderMembers.value;
  return loadingTeamMembers.value;
});
const assignModalEmptyText = computed(() => {
  if (assignmentRoleMode.value === 'manager') return 'لا توجد فرق متاحة.';
  if (assignmentRoleMode.value === 'leader') return 'لا توجد مجموعات متاحة.';
  if (assignmentRoleMode.value === 'group_leader') return 'لا يوجد أعضاء متاحون.';
  return 'لا توجد عناصر متاحة.';
});
const assignModalLoadingText = computed(() => {
  if (assignmentRoleMode.value === 'manager') return 'جاري تحميل الفرق...';
  if (assignmentRoleMode.value === 'leader') return 'جاري تحميل المجموعات...';
  if (assignmentRoleMode.value === 'group_leader') return 'جاري تحميل الأعضاء...';
  return 'جاري التحميل...';
});

const showAssignmentTotals = computed(() =>
  ['manager', 'leader', 'group_leader'].includes(assignmentRoleMode.value)
);

function resolveAvailableAssignmentValue(target) {
  if (!target || typeof target !== 'object') return 0;
  const directValue = num(target?.value_target ?? target?.target_value ?? target?.value ?? 0, 0);
  if (assignmentRoleMode.value === 'manager') return directValue;

  if (assignmentRoleMode.value === 'leader') {
    const myTeamId = ledTeam.value?.id ?? ledTeam.value?.team_id ?? null;
    if (myTeamId != null && Array.isArray(target?.teams)) {
      const found = target.teams.find(team => Number(team?.id ?? team?.team_id) === Number(myTeamId));
      if (found) return num(found?.value_target ?? found?.target_value ?? 0, 0);
    }
    return directValue;
  }

  if (assignmentRoleMode.value === 'group_leader') {
    const groups = Array.isArray(ledGroups.value) ? ledGroups.value : [];
    const ledGroupIds = new Set(
      groups
        .map(group => Number(group?.id ?? group?.team_group_id))
        .filter(id => Number.isFinite(id)),
    );
    if (ledGroupIds.size > 0 && Array.isArray(target?.team_groups)) {
      const found = target.team_groups.find(group =>
        ledGroupIds.has(Number(group?.id ?? group?.team_group_id)),
      );
      if (found) return num(found?.value_target ?? found?.target_value ?? 0, 0);
    }
    return directValue;
  }

  return directValue;
}

function findLeaderTeamAssignment(target) {
  const myTeamId = ledTeam.value?.id ?? ledTeam.value?.team_id ?? null;
  if (myTeamId == null || !Array.isArray(target?.teams)) return null;
  return (
    target.teams.find(team => Number(team?.id ?? team?.team_id) === Number(myTeamId)) || null
  );
}

function findGroupLeaderAssignment(target) {
  if (!Array.isArray(target?.team_groups)) return null;
  const groups = Array.isArray(ledGroups.value) ? ledGroups.value : [];
  const ledGroupIds = new Set(
    groups
      .map(group => Number(group?.id ?? group?.team_group_id))
      .filter(id => Number.isFinite(id))
  );
  if (ledGroupIds.size === 0) return null;
  return (
    target.team_groups.find(group => ledGroupIds.has(Number(group?.id ?? group?.team_group_id))) || null
  );
}

function findMemberAssignment(target) {
  const userId = currentUserId.value;
  if (userId == null || !Array.isArray(target?.member_users)) return null;
  return (
    target.member_users.find(member => Number(member?.id ?? member?.user_id) === Number(userId)) || null
  );
}

function getAssignedValueForTarget(target) {
  if (!target || typeof target !== 'object') return 0;
  const targetTotal = num(target?.target_value ?? target?.value_target ?? target?.value ?? 0, 0);

  if (assignmentRoleMode.value === 'leader') {
    const teamAssignment = findLeaderTeamAssignment(target);
    const scopedValue = resolveAvailableAssignmentValue(target);
    return num(
      teamAssignment?.value_target ?? teamAssignment?.target_value ?? scopedValue,
      scopedValue,
    );
  }

  if (assignmentRoleMode.value === 'group_leader') {
    const groupAssignment = findGroupLeaderAssignment(target);
    const scopedValue = resolveAvailableAssignmentValue(target);
    return num(
      groupAssignment?.value_target ?? groupAssignment?.target_value ?? scopedValue,
      scopedValue,
    );
  }

  if (assignmentRoleMode.value === 'member') {
    const memberAssignment = findMemberAssignment(target);
    return num(
      memberAssignment?.value_target ?? memberAssignment?.target_value ?? target?.value_target ?? targetTotal,
      num(target?.value_target ?? targetTotal, targetTotal),
    );
  }

  return targetTotal;
}

function getRemainingValueForTarget(target) {
  if (!target || typeof target !== 'object') return 0;
  const achieved = num(target?.achieved_value, 0);
  const assignedValue = getAssignedValueForTarget(target);

  if (assignmentRoleMode.value === 'leader') {
    const teamAssignment = findLeaderTeamAssignment(target);
    return num(
      teamAssignment?.remaining_value ?? teamAssignment?.total_remaining_value,
      Math.max(assignedValue - achieved, 0),
    );
  }

  if (assignmentRoleMode.value === 'group_leader') {
    const groupAssignment = findGroupLeaderAssignment(target);
    return num(
      groupAssignment?.remaining_value ?? groupAssignment?.total_remaining_value,
      Math.max(assignedValue - achieved, 0),
    );
  }

  if (assignmentRoleMode.value === 'member') {
    const memberAssignment = findMemberAssignment(target);
    return num(
      memberAssignment?.remaining_value ?? memberAssignment?.total_remaining_value,
      Math.max(assignedValue - achieved, 0),
    );
  }

  return num(
    target?.remaining_value ?? target?.total_remaining_value,
    Math.max(assignedValue - achieved, 0),
  );
}

function getDistributionLineForTarget(target) {
  if (!target || typeof target !== 'object') return '';

  let label = '';
  let list = [];

  if (assignmentRoleMode.value === 'leader') {
    label = 'المجموعات المسندة';
    list = Array.isArray(target?.team_groups) ? target.team_groups : [];
  } else if (assignmentRoleMode.value === 'group_leader') {
    label = 'الأعضاء المسند لهم';
    list = Array.isArray(target?.member_users) ? target.member_users : [];
  } else if (assignmentRoleMode.value === 'manager') {
    label = 'الفرق المسندة';
    list = Array.isArray(target?.teams) ? target.teams : [];
  } else {
    return '';
  }

  const names = list
    .map(item => String(item?.name || item?.group_name || item?.team_name || item?.full_name || '').trim())
    .filter(Boolean);

  if (names.length === 0) return '';
  const preview = names.slice(0, 3).join('، ');
  if (names.length <= 3) return `${label}: ${preview}`;
  return `${label}: ${preview} (+${names.length - 3})`;
}

const availableAssignmentValue = computed(() => resolveAvailableAssignmentValue(assignTarget.value));
const assignTargetTotalValue = computed(() =>
  num(assignTarget.value?.target_value ?? assignTarget.value?.value_target ?? assignTarget.value?.value ?? 0, 0)
);
const assignTargetTypeLabel = computed(() =>
  String(
    assignTarget.value?.line_type ||
    assignTarget.value?.target_type ||
    assignTarget.value?.project_name ||
    'هدف المبيعات'
  ).trim()
);
const assignTargetAlreadyAssignedValue = computed(() => {
  const explicit = num(
    assignTarget.value?.already_assigned_value ??
      assignTarget.value?.assigned_value ??
      assignTarget.value?.distributed_value ??
      assignTarget.value?.assigned_target_value ??
      NaN,
    NaN
  );
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;
  const total = assignTargetTotalValue.value;
  const available = num(availableAssignmentValue.value, 0);
  return total > 0 && available >= 0 ? Math.max(total - available, 0) : 0;
});
const filteredUnitsModalRows = computed(() => {
  const rows = unitsModalRows.value;
  if (isSalesLeaderView.value || currentUserId.value == null) return rows;
  return rows.filter((r) => Number(r.marketer_id) === currentUserId.value);
});

const showMemberOverviewCards = computed(() =>
  assignmentRoleMode.value === 'member' &&
  !isLoadingTargets.value &&
  !targetsLoadError.value &&
  Number(targetsOverview.assigned_lines_count || 0) > 0
);


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
    isGroupLeaderView.value ||
    hasPermission('sales.team.manage')
  ) {
    return list;
  }
  
  if (currentUserId.value == null) return [];
  
  return list.filter((t) => {
    const directMemberId = Number(t?.user_id ?? t?.member_id ?? t?.assignee_id);
    if (Number.isFinite(directMemberId) && directMemberId === currentUserId.value) return true;

    const memberUsers = Array.isArray(t?.member_users) ? t.member_users : [];
    const hasMemberRow = memberUsers.some(member =>
      Number(member?.id ?? member?.user_id) === currentUserId.value,
    );
    if (hasMemberRow) return true;

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

async function loadLeaderTeamContext() {
  if (loadingLeaderTeamGroups.value) return;
  loadingLeaderTeamGroups.value = true;
  try {
    const [teamInfo, groups] = await Promise.all([
      salesService.getLedTeam().catch(() => null),
      salesService.getTeamGroups().catch(() => []),
    ]);
    ledTeam.value = teamInfo || null;

    const list = Array.isArray(groups) ? groups : [];
    const myTeamId = teamInfo?.id ?? teamInfo?.team_id ?? null;
    leaderTeamGroups.value = myTeamId == null
      ? list
      : list.filter(group => Number(group?.team_id) === Number(myTeamId));
  } catch (err) {
    leaderTeamGroups.value = [];
    notificationService.addNotification(err?.response?.data?.message || 'فشل تحميل مجموعات الفريق', 'error');
  } finally {
    loadingLeaderTeamGroups.value = false;
  }
}

async function loadGroupLeaderContext(options = {}) {
  if (loadingGroupLeaderMembers.value) return;
  loadingGroupLeaderMembers.value = true;
  try {
    const prefetchedGroups = Array.isArray(options?.groups) ? options.groups : null;
    const [teamInfo, groups, members] = await Promise.all([
      salesService.getGroupLeaderLedTeam().catch(() => null),
      prefetchedGroups ? Promise.resolve(prefetchedGroups) : salesService.getGroupLeaderLedGroups().catch(() => []),
      salesService.getGroupLeaderMembers().catch(() => []),
    ]);
    ledTeam.value = teamInfo || null;
    ledGroups.value = Array.isArray(groups) ? groups : [];
    groupLeaderMembers.value = Array.isArray(members) ? members : [];
  } catch (err) {
    groupLeaderMembers.value = [];
    ledGroups.value = [];
    notificationService.addNotification(err?.response?.data?.message || 'فشل تحميل أعضاء المجموعة', 'error');
  } finally {
    loadingGroupLeaderMembers.value = false;
  }
}

async function detectSalesRoleAndLoadTargets() {
  if (!needsSalesRoleDetection.value) {
    detectedSalesUserMode.value = 'member';
    detectedLedGroups.value = [];
    setSalesTargetModeOverride(assignmentRoleMode.value);
    await loadTargetsByCurrentRole();
    return;
  }

  isDetectingSalesRole.value = true;
  try {
    const groups = await salesService.getGroupLeaderLedGroups().catch(() => []);
    const list = Array.isArray(groups) ? groups : [];
    detectedLedGroups.value = list;
    detectedSalesUserMode.value = list.length > 0 ? 'group_leader' : 'member';
    setSalesTargetModeOverride(detectedSalesUserMode.value);

    if (detectedSalesUserMode.value === 'group_leader') {
      await loadGroupLeaderContext({ groups: list });
    } else {
      ledTeam.value = null;
      ledGroups.value = [];
      groupLeaderMembers.value = [];
    }
  } catch (err) {
    detectedSalesUserMode.value = 'member';
    detectedLedGroups.value = [];
    setSalesTargetModeOverride('member');
    notificationService.addNotification(
      err?.response?.data?.message || 'تعذر تحديد دور قائد المجموعة، سيتم عرض أهدافك الشخصية.',
      'warning',
    );
  } finally {
    isDetectingSalesRole.value = false;
  }

  await loadTargetsByCurrentRole();
}

function openAssignMarketers(target) {
  openMenuId.value = null;
  assignTarget.value = target;
  selectedMarketerIds.value = [];
  selectedAssignments.value = [];

  if (assignmentRoleMode.value === 'manager') {
    if (assignmentCandidates.value.length === 0) loadManagerTeams();
    return;
  }

  if (assignmentRoleMode.value === 'leader') {
    if (assignmentCandidates.value.length === 0) loadLeaderTeamContext();
    return;
  }

  if (assignmentRoleMode.value === 'group_leader') {
    if (assignmentCandidates.value.length === 0) loadGroupLeaderContext();
  }
}

function closeAssignMarketers() {
  assignTarget.value = null;
  selectedMarketerIds.value = [];
  selectedAssignments.value = [];
}

async function saveAssignMarketers() {
  if (!assignTarget.value) return;

  const selectedIds = (Array.isArray(selectedMarketerIds.value) ? selectedMarketerIds.value : [])
    .map(id => Number(id))
    .filter(id => Number.isFinite(id) && id > 0);

  if (selectedIds.length === 0) {
    const selectMessage = assignmentRoleMode.value === 'group_leader'
      ? 'يرجى اختيار عضو واحد على الأقل.'
      : assignmentRoleMode.value === 'leader'
        ? 'يرجى اختيار مجموعة واحدة على الأقل.'
        : 'يرجى اختيار فريق واحد على الأقل.';
    notificationService.addNotification(selectMessage, 'warning');
    return;
  }

  const assignmentsMap = new Map(
    (Array.isArray(selectedAssignments.value) ? selectedAssignments.value : [])
      .map(row => [Number(row?.id), Number(row?.value_target ?? 0)])
      .filter(([id]) => Number.isFinite(id))
  );

  const hasMissingOrInvalidValue = selectedIds.some(id => {
    const value = assignmentsMap.get(id);
    return !Number.isFinite(value) || value <= 0;
  });
  if (hasMissingOrInvalidValue) {
    notificationService.addNotification('يرجى إدخال قيمة هدف صحيحة لكل عنصر محدد.', 'warning');
    return;
  }

  const selectedRows = selectedIds.map(id => ({ id, value_target: Number(assignmentsMap.get(id)) }));
  const availableValue = num(availableAssignmentValue.value, 0);
  const assignedTotal = selectedRows.reduce((sum, row) => sum + Number(row.value_target || 0), 0);
  if (assignedTotal > availableValue) {
    notificationService.addNotification('إجمالي المخصص يتجاوز قيمة الهدف المتاحة.', 'warning');
    return;
  }
  if (
    distributionValidation.requireExactDistribution &&
    availableValue > 0 &&
    Math.abs(assignedTotal - availableValue) > 0.000001
  ) {
    notificationService.addNotification('يجب أن يساوي إجمالي المخصص قيمة الهدف المتاحة.', 'warning');
    return;
  }

  const targetId = getSalesTargetPatchId(assignTarget.value) ?? assignTarget.value?.line_id ?? assignTarget.value?.id;
  if (!targetId) {
    notificationService.addNotification('تعذر تحديد معرف الهدف.', 'error');
    return;
  }

  assignSaving.value = true;
  try {
    if (assignmentRoleMode.value === 'manager') {
      await salesService.assignTargetToTeams(
        targetId,
        selectedRows.map(row => ({ team_id: row.id, value_target: row.value_target })),
      );
      notificationService.addNotification('تم تعيين الهدف للفرق بنجاح', 'success');
    } else if (assignmentRoleMode.value === 'leader') {
      await salesService.assignTargetToTeamGroups(
        targetId,
        selectedRows.map(row => ({ team_group_id: row.id, value_target: row.value_target })),
      );
      notificationService.addNotification('تم تعيين الهدف للمجموعات بنجاح', 'success');
    } else if (assignmentRoleMode.value === 'group_leader') {
      await salesService.assignTargetToMembers(
        targetId,
        selectedRows.map(row => ({ user_id: row.id, value_target: row.value_target })),
      );
      notificationService.addNotification('تم تعيين الهدف للأعضاء بنجاح', 'success');
    } else {
      notificationService.addNotification('لا يمكن تنفيذ التعيين لهذا الدور.', 'warning');
      return;
    }

    closeAssignMarketers();
    await loadTargetsByCurrentRole();
  } catch (err) {
    notificationService.addNotification(err?.response?.data?.message || 'فشل حفظ الهدف', 'error');
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

onMounted(async () => {
  document.addEventListener('click', onDocumentClick);
  if (isSalesManagerView.value) {
    setSalesTargetModeOverride('manager');
    loadManagerTeams();
    await loadTargetsByCurrentRole();
  } else if (isSalesLeaderView.value) {
    setSalesTargetModeOverride('leader');
    loadLeaderTeamContext();
    await loadTargetsByCurrentRole();
  } else if (isSalesExecutiveView.value) {
    setSalesTargetModeOverride('executive');
    await loadTargetsByCurrentRole();
  } else {
    await detectSalesRoleAndLoadTargets();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped>
.member-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.member-overview-card {
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  background: var(--surface-color, #fff);
}

.member-overview-label {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.member-overview-value {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 18px;
}

.role-detection-hint {
  margin-bottom: 12px;
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 10px;
  background: rgba(39, 55, 77, 0.05);
  color: #334155;
  padding: 10px 12px;
}

.role-detection-hint p {
  margin: 0;
  font-weight: 600;
}

.executive-units-panel {
  margin-bottom: 14px;
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 12px;
  background: #fff;
  padding: 12px;
}

.executive-units-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.executive-units-panel__title {
  margin: 0;
  color: var(--color-navy, #27374d);
  font-size: 1rem;
  font-weight: 800;
}

.executive-units-panel__state {
  color: #475569;
  font-weight: 600;
}

.executive-units-panel__state--error {
  color: #b91c1c;
}

.executive-units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
<<<<<<< Updated upstream
  gap: 12px;
=======
  gap: 10px;
  margin-bottom: 10px;
}

.executive-units-by-type {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
>>>>>>> Stashed changes
}

.executive-units-card {
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.executive-units-card__label {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.executive-units-card__value {
  color: var(--color-navy, #27374d);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}
</style>

<style scoped src="./styles/SalesTargetsTab.scoped.s1.css"></style>
<style scoped src="./styles/SalesTargetsTab.scoped.s2.css"></style>




