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

<style scoped>
/* تنسيقات أهداف المبيعات — من الأب SalesViewExtended */
.targets-tab {
  width: 100%;
  direction: rtl;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.empty-state.error-state {
  color: #b91c1c;
}

.empty-state.error-state p {
  color: inherit;
  margin-bottom: 12px;
}

.empty-state .btn-add {
  margin-top: 12px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.target-card {
  position: relative;
  background: var(--color-white);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 16px;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: visible;
}

.target-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--color-navy, #27374D);
  opacity: 0.9;
  border-radius: 16px 16px 0 0;
  transition: background 0.3s ease;
}

/* ===== بطاقة الهدف المنجز ===== */
.target-card-completed {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%);
  border-color: rgba(5, 150, 105, 0.25);
  box-shadow: 0 2px 12px rgba(5, 150, 105, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03);
}

.target-card-completed::before {
  height: 5px;
  background: linear-gradient(90deg, #10b981, #059669, #047857);
  opacity: 1;
}

.target-card-completed:hover {
  border-color: rgba(5, 150, 105, 0.35);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.target-card-completed .target-footer {
  background: rgba(236, 253, 245, 0.7);
  border-color: rgba(5, 150, 105, 0.1);
}

.completed-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);
  animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.completed-badge svg {
  width: 20px;
  height: 20px;
  color: white;
}

@keyframes badgePop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.target-card > .card-menu-wrap {
  top: 14px;
  left: 14px;
}

.card-menu-wrap {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.card-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-navy);
  cursor: pointer;
  transition: color 0.2s;
}

.card-menu-btn:hover {
  color: var(--color-navy);
  opacity: 0.85;
}

.card-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 200px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
}

.card-dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: right;
  font-size: 0.9375rem;
  color: var(--color-navy);
  cursor: pointer;
  transition: background 0.2s;
}

.card-dropdown-item:hover {
  background: #f1f5f9;
}

.card-dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-dropdown-status {
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
}

.card-dropdown-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-dark-gray);
  margin-bottom: 6px;
}

.card-dropdown-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--color-white);
  cursor: pointer;
}

.card-dropdown-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-dropdown-item-done {
  font-weight: 600;
  color: #059669;
}

.card-dropdown-item-done:hover:not(:disabled) {
  background: #ecfdf5;
}

.assign-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.assign-modal {
  background: var(--color-white);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.assign-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.assign-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-navy);
}

.assign-close {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-dark-gray);
  cursor: pointer;
  border-radius: 6px;
}

.assign-close:hover {
  background: #f1f5f9;
  color: var(--color-navy);
}

.assign-project-name {
  margin: 0;
  padding: 12px 20px;
  font-size: 0.9375rem;
  color: var(--color-dark-gray);
  border-bottom: 1px solid #f1f5f9;
}

.assign-marketers-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  max-height: 280px;
}

.assign-marketer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.assign-marketer-row:hover {
  background: #f8fafc;
}

.assign-marketer-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-navy);
}

/* مودال إضافة هدف جديد */
.create-target-modal.assign-modal {
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.create-target-form {
  padding: 16px 20px;
}

.create-target-form .form-row {
  margin-bottom: 14px;
}

.create-target-form .form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 6px;
}

.create-target-form .form-select,
.create-target-form .form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: var(--color-white);
}

.create-target-form .form-select:focus,
.create-target-form .form-input:focus {
  outline: none;
  border-color: var(--color-navy);
}

.create-target-form .checkbox-row,
.create-target-form .units-checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.create-target-form .units-checkbox-row input,
.create-target-form .checkbox-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-navy);
}

.create-target-form .units-hint {
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
  margin-top: 6px;
}

.create-target-form .units-list {
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
}

.create-target-form .form-error {
  margin: 0;
  font-size: 0.875rem;
  color: #b91c1c;
}

.create-target-form .assign-modal-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* مودال الوحدات المعينة + المسؤول */
.units-modal.assign-modal {
  max-width: 520px;
}

.units-modal .assign-project-name {
  border-bottom: 1px solid #f1f5f9;
}

.units-modal-error {
  padding: 20px;
  text-align: center;
  color: #b91c1c;
}

.units-modal-error p {
  margin: 0;
}

.units-modal-empty {
  padding: 24px 20px;
  text-align: center;
  color: var(--color-dark-gray);
}

.units-modal-empty p {
  margin: 0;
}

.units-modal-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 0 20px;
  max-height: 320px;
}

.units-modal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.units-modal-table th,
.units-modal-table td {
  padding: 10px 12px;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
}

.units-modal-table th {
  font-weight: 600;
  color: var(--color-navy);
  background: #f8fafc;
}

.units-modal-table tbody tr:hover {
  background: #f8fafc;
}

.assign-empty,
.assign-loading {
  margin: 0;
  padding: 20px;
  font-size: 0.9375rem;
  color: var(--color-dark-gray);
  text-align: center;
}

.assign-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 10px 18px;
  border: 1px solid var(--color-medium-gray);
  background: var(--color-white);
  color: var(--color-navy);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.target-card-clickable {
  cursor: pointer;
}

.target-card-clickable:hover {
  border-color: rgba(181, 169, 154, 0.4);
  box-shadow: 0 12px 28px rgba(39, 55, 77, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}

.target-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(39, 55, 77, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  border-color: rgba(39, 55, 77, 0.15);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 12px;
  padding: 20px 22px 0;
  /* في RTL: حجز يسار البطاقة للزر + مسافة بين الزر وكتلة الهدف */
  padding-inline-end: 54px;
}

.target-info {
  min-width: 0;
  flex: 1;
}

.target-project-name,
.target-info h3 {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  color: var(--color-navy, #27374D);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.target-marketer {
  margin: 0;
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.target-value-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  padding: 5px 9px;
  background: rgba(39, 55, 77, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(39, 55, 77, 0.08);
}

.target-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #047857;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.target-value-label {
  font-size: 0.6rem;
  color: #64748b;
  margin-top: 1px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.target-progress {
  margin-bottom: 18px;
  padding: 0 22px;
  padding-inline-end: 54px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(39, 55, 77, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill:not(.completed) {
  background: linear-gradient(90deg, #34d399 0%, #059669 100%);
  box-shadow: 0 0 12px rgba(4, 120, 87, 0.35);
}

.progress-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #047857 100%);
  box-shadow: 0 0 12px rgba(4, 120, 87, 0.3);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.progress-pct {
  font-weight: 700;
  color: var(--color-navy, #27374D);
  font-variant-numeric: tabular-nums;
}

.target-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 22px 22px;
  padding-inline-end: 54px;
  border-top: 1px solid rgba(39, 55, 77, 0.08);
  background: rgba(248, 250, 252, 0.8);
}

.target-footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.target-deadline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: #475569;
  font-weight: 500;
}

.target-deadline svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-navy, #27374D);
  opacity: 0.8;
}

.target-status {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.target-status.completed {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid rgba(5, 150, 105, 0.25);
}

.target-status.on-track {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.target-status.in-progress {
  background: #fef9c3;
  color: #a16207;
  border: 1px solid rgba(161, 98, 7, 0.2);
}

.target-status.at-risk {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.2);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .targets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
