<template>
  <div class="targets-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          {{ isSalesLeaderView ? 'أهداف الفريق' : 'أهدافي' }}
        </h1>
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

    <div v-else class="targets-grid">
      <div
        v-for="target in displayTargets"
        :key="target.target_id || target.id"
        class="target-card"
        :class="{
          'target-card-clickable': target.contract_id,
          'target-card-completed': isTargetCompleted(target),
        }"
        role="button"
        tabindex="0"
        @click="onCardClick($event, target)"
        @keydown.enter="target.contract_id && openUnitsModal(target)"
      >
        <!-- شارة الإنجاز -->
        <div v-if="isTargetCompleted(target)" class="completed-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <!-- زر ثلاث نقاط — أعلى يسار البطاقة -->
        <div class="card-menu-wrap">
          <button
            type="button"
            class="card-menu-btn"
            aria-label="خيارات"
            @click.stop="toggleCardMenu(target.target_id || target.id)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
          <div v-if="openMenuId === (target.target_id || target.id)" class="card-dropdown" @click.stop>
            <button
              v-if="hasPermission('sales.team.manage')"
              type="button"
              class="card-dropdown-item"
              @click="openAssignMarketers(target)"
            >
              إضافة مسوقين للمشروع
            </button>
            <template v-if="canUpdateTarget(target)">
              <div class="card-dropdown-status">
                <span class="card-dropdown-label">تغيير الحالة</span>
                <select
                  :value="(target.status || '').toLowerCase()"
                  class="card-dropdown-select"
                  :disabled="updatingTargetId === (target.target_id || target.id)"
                  @change="updateTargetStatus(target, $event.target.value)"
                >
                  <option v-for="opt in TARGET_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <button
                v-if="(target.status || '').toLowerCase() !== 'completed'"
                type="button"
                class="card-dropdown-item card-dropdown-item-done"
                :disabled="updatingTargetId === (target.target_id || target.id)"
                @click="updateTargetStatus(target, 'completed')"
              >
                جعل منجز (تحقق)
              </button>
            </template>
          </div>
        </div>

        <div class="target-header">
          <div class="target-info">
            <h3 class="target-project-name">{{ target.project_name || 'هدف مبيعات' }}</h3>
            <p class="target-marketer">{{ getTargetAssigneeLine(target) }}</p>
            <p v-if="!isSalesLeaderView" class="target-marketer target-assigned-units">{{ getAssignedUnitsLine(target) }}</p>
          </div>
          <div class="target-value-block">
            <span class="target-value">{{ formatCurrency(target.target_value) }}</span>
            <span class="target-value-label">الهدف</span>
          </div>
        </div>

        <div class="target-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="getTargetStatusClass(target)"
              :style="{ width: getProgressPercentage(target) + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            <span>محقق: {{ formatCurrency(getDisplayedAchievedValue(target)) }}</span>
            <span class="progress-pct">{{ getProgressPercentage(target) }}%</span>
          </div>
        </div>

        <div class="target-footer">
          <div class="target-footer-left">
            <div class="target-deadline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>الموعد النهائي: {{ formatDate(target.end_date || target.deadline) }}</span>
            </div>
          </div>
          <span class="target-status" :class="getTargetStatusClass(target)">
            {{ target.status_label_ar || getTargetStatusText(target) }}
          </span>
        </div>
      </div>
    </div>

    <!-- مودال إضافة هدف جديد -->
    <div v-if="showCreateTargetModal" class="assign-overlay" @click.self="closeCreateTargetModal">
      <div class="assign-modal create-target-modal">
        <div class="assign-modal-header">
          <h3>إضافة هدف جديد</h3>
          <button type="button" class="assign-close" aria-label="إغلاق" @click="closeCreateTargetModal">&times;</button>
        </div>
        <form @submit.prevent="handleCreateTarget" class="create-target-form">
          <div class="form-row">
            <label class="form-label">المسوق</label>
            <select v-model="targetForm.marketer_id" class="form-select" required>
              <option value="">— اختر المسوق —</option>
              <option v-for="m in teamMembersList" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">المشروع</label>
            <select v-model="targetForm.contract_id" class="form-select" required>
              <option value="">— اختر المشروع —</option>
              <option v-for="p in teamProjectsList" :key="p.id" :value="p.id">{{ p.project_name || p.name }}</option>
            </select>
          </div>
          <div v-if="targetForm.contract_id" class="form-row">
            <label class="form-label">الوحدات (اختياري)</label>
            <label class="checkbox-row">
              <input type="checkbox" :checked="targetForm.contract_unit_ids.length === 0" @change="onTargetFullProjectChange" />
              <span>كل وحدات المشروع</span>
            </label>
            <p v-if="targetForm.contract_unit_ids.length === 0" class="units-hint">سيُنشأ هدف واحد للمشروع بدون ربط وحدة محددة. أو أزل التحديد واختر وحدات أدناه.</p>
            <div class="units-list">
              <LoadingSpinner v-if="isLoadingTargetFormUnits" text="جاري تحميل الوحدات..." />
              <p v-else-if="targetFormUnitsError" class="form-error">{{ targetFormUnitsError }}</p>
              <template v-else-if="targetFormUnits.length">
                <label v-for="u in targetFormUnits" :key="u.id" class="units-checkbox-row">
                  <input type="checkbox" :checked="targetForm.contract_unit_ids.includes(u.id)" @change="toggleTargetUnit(u.id)" />
                  <span>{{ u.unit_number ?? u.id }}</span>
                </label>
              </template>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">قيمة الهدف (ر.س)</label>
            <input v-model.number="targetForm.target_value" type="number" min="0" class="form-input" placeholder="0" />
          </div>
          <div class="form-row">
            <label class="form-label">الموعد النهائي</label>
            <input v-model="targetForm.deadline" type="date" class="form-input" required />
          </div>
          <div class="assign-modal-actions">
            <button type="button" class="btn-secondary" @click="closeCreateTargetModal">إلغاء</button>
            <button type="submit" class="btn-add" :disabled="createTargetSaving">
              {{ createTargetSaving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- نافذة إضافة مسوقين للمشروع -->
    <div v-if="assignTarget" class="assign-overlay" @click.self="closeAssignMarketers">
      <div class="assign-modal">
        <div class="assign-modal-header">
          <h3>إضافة مسوقين للمشروع</h3>
          <button type="button" class="assign-close" aria-label="إغلاق" @click="closeAssignMarketers">&times;</button>
        </div>
        <p class="assign-project-name">{{ assignTarget.project_name || 'هدف مبيعات' }}</p>
        <div class="assign-marketers-list">
          <label v-for="m in teamMembersList" :key="m.id" class="assign-marketer-row">
            <input type="checkbox" :value="m.id" v-model="selectedMarketerIds" />
            <span>{{ m.name }}</span>
          </label>
        </div>
        <p v-if="teamMembersList.length === 0 && !loadingTeamMembers" class="assign-empty">لا يوجد مسوقون في الفريق.</p>
        <p v-if="loadingTeamMembers" class="assign-loading">جاري تحميل المسوقين...</p>
        <div class="assign-modal-actions">
          <button type="button" class="btn-secondary" @click="closeAssignMarketers">إلغاء</button>
          <button type="button" class="btn-add" :disabled="selectedMarketerIds.length === 0 || assignSaving" @click="saveAssignMarketers">
            {{ assignSaving ? 'جاري الحفظ...' : `حفظ (${selectedMarketerIds.length})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- مودال الوحدات المعينة + المسؤول (عند الضغط على بطاقة الهدف) -->
    <div v-if="showUnitsModal" class="assign-overlay" @click.self="closeUnitsModal">
      <div class="units-modal assign-modal">
        <div class="assign-modal-header">
          <h3>{{ isSalesLeaderView ? 'الوحدات المعينة للفريق' : 'وحداتي المعينة' }}</h3>
          <button type="button" class="assign-close" aria-label="إغلاق" @click="closeUnitsModal">&times;</button>
        </div>
        <p class="assign-project-name">{{ unitsModalProjectName }}</p>
        <LoadingSpinner v-if="unitsModalLoading" text="جاري تحميل الوحدات المعينة..." />
        <div v-else-if="unitsModalError" class="units-modal-error">
          <p>{{ unitsModalError }}</p>
        </div>
        <div v-else-if="filteredUnitsModalRows.length === 0" class="units-modal-empty">
          <p>{{ isSalesLeaderView ? 'لا توجد وحدات معينة لهذا المشروع.' : 'لا توجد وحدات معينة لك في هذا المشروع.' }}</p>
        </div>
        <div v-else class="units-modal-table-wrap">
          <table class="units-modal-table">
            <thead>
              <tr>
                <th>رقم الوحدة</th>
                <th v-if="isSalesLeaderView">موظف المبيعات (المستلم)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredUnitsModalRows" :key="row.unit_id + '-' + idx">
                <td>{{ row.unit_number }}</td>
                <td v-if="isSalesLeaderView">{{ row.marketer_name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="assign-modal-actions">
          <button type="button" class="btn-secondary" @click="closeUnitsModal">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
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

// مودال الوحدات المعينة + المسؤول (عند الضغط على البطاقة)
const showUnitsModal = ref(false);
const unitsModalProjectName = ref('');
const unitsModalLoading = ref(false);
const unitsModalError = ref('');
const unitsModalRows = ref([]);

const teamMembersList = computed(() => Array.isArray(teamMembers.value) ? teamMembers.value : []);
const teamProjectsList = computed(() => Array.isArray(teamProjects.value) ? teamProjects.value : []);
const isSalesLeaderView = computed(() => isSalesLeader(authService.getCurrentUser()));

/** المدير يرى كل الصفوف؛ المستخدم العادي يرى وحداته فقط */
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

/** غير المدير يرى أهدافه فقط؛ المدير يرى أهداف الفريق كاملة (حسب ما يرجعه الـ API). */
const displayTargets = computed(() => {
  const list = Array.isArray(targets.value) ? targets.value : [];
  if (hasPermission('sales.team.manage')) return list;
  if (currentUserId.value == null) return [];
  return list.filter((t) => Number(t.marketer_id) === currentUserId.value);
});

function canUpdateTarget(target) {
  if (!target || currentUserId.value == null) return false;
  if (!hasPermission('sales.targets.update')) return false;
  const isOwner = Number(target.marketer_id) === currentUserId.value;
  const isManager = hasPermission('sales.team.manage');
  return isOwner || isManager;
}

function getTargetAssigneeLine(target) {
  if (isSalesLeaderView.value) return target.marketer_name || '—';
  return target.assigned_by ? `أُسند لك من: ${target.assigned_by}` : 'أُسند لك هذا الهدف';
}

function getAssignedUnitsLine(target) {
  const units = Array.isArray(target?.units) ? target.units : [];
  if (units.length > 0) {
    const unitNumbers = units.map((unit) => unit?.unit_number).filter(Boolean);
    if (unitNumbers.length > 0) return `المسند لك: ${unitNumbers.join('، ')}`;
  }
  if (target?.unit_number) return `المسند لك: ${target.unit_number}`;
  return 'المسند لك: كامل المشروع';
}

function isTargetCompleted(target) {
  const status = String(target?.status || '').toLowerCase();
  const label = String(target?.status_label_ar || '').trim();
  return status === 'completed' || status === 'achieved' || status === 'done' || label === 'منجز';
}

function getDisplayedAchievedValue(target) {
  const achieved = Number(target?.achieved_value || 0);
  const goal = Number(target?.target_value || 0);
  if (isTargetCompleted(target) && achieved === 0 && goal > 0) return goal;
  return achieved;
}

const updatingTargetId = ref(null);

async function updateTargetStatus(target, newStatus) {
  const targetId = target.target_id || target.id;
  if (!targetId || !['new', 'in_progress', 'completed'].includes(newStatus)) return;
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

function onCardClick(e, target) {
  if (target.contract_id) openUnitsModal(target);
}

async function openUnitsModal(target) {
  const contractId = target.contract_id;
  const projectName = target.project_name || 'هدف مبيعات';
  showUnitsModal.value = true;
  unitsModalProjectName.value = projectName;
  unitsModalError.value = '';
  unitsModalRows.value = [];
  unitsModalLoading.value = true;
  try {
    const data = await salesService.getTargetsByProject(contractId);
    const rows = (Array.isArray(data) ? data : []).flatMap((t) =>
      (t.units && t.units.length ? t.units : [{ id: t.target_id, unit_number: t.unit_number || '—' }]).map((u) => ({
        unit_id: u.id,
        unit_number: u.unit_number ?? '—',
        marketer_id: t.marketer_id,
        marketer_name: t.marketer_name ?? '—',
      }))
    );
    unitsModalRows.value = rows;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message;
    const status = err?.response?.status;
    unitsModalError.value =
      status === 403
        ? 'ليس لديك صلاحية عرض أهداف هذا المشروع.'
        : msg || 'فشل تحميل الوحدات المعينة.';
    unitsModalRows.value = [];
  } finally {
    unitsModalLoading.value = false;
  }
}

function closeUnitsModal() {
  showUnitsModal.value = false;
  unitsModalProjectName.value = '';
  unitsModalError.value = '';
  unitsModalRows.value = [];
}

function toggleCardMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id;
}

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

function closeAssignMarketers() {
  assignTarget.value = null;
  selectedMarketerIds.value = [];
}

async function saveAssignMarketers() {
  if (!assignTarget.value?.contract_id || selectedMarketerIds.value.length === 0 || !hasPermission('sales.team.manage')) return;
  const contractId = assignTarget.value.contract_id;
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = assignTarget.value.end_date || assignTarget.value.deadline || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const targetValue = assignTarget.value.target_value ?? 0;

  assignSaving.value = true;
  try {
    let created = 0;
    for (const marketerId of selectedMarketerIds.value) {
      await salesService.createTarget({
        marketer_id: marketerId,
        contract_id: contractId,
        target_type: 'reservation',
        start_date: startDate,
        end_date: endDate,
        target_value: targetValue,
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

function onDocumentClick() {
  openMenuId.value = null;
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  if (hasPermission('sales.team.manage')) loadTeamMembers({ with_ratings: false });
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});

loadTargets();
</script>

<style scoped src="./styles/SalesTargetsTab.scoped.s1.css"></style>
<style scoped src="./styles/SalesTargetsTab.scoped.s2.css"></style>
