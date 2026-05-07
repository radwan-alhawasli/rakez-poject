<template>
  <section class="groups-panel">
    <div v-if="!hideHeader" class="groups-panel__header">
      <div>
        <h3 class="groups-panel__title">إدارة المجموعات وقادة الفرق</h3>
        <p class="groups-panel__subtitle">
          إدارة كاملة للمجموعات والأعضاء داخل الفرق.
        </p>
      </div>
      <button type="button" class="groups-panel__btn" @click="refreshAll" :disabled="isRefreshingAll">
        {{ isRefreshingAll ? 'جاري التحديث...' : 'تحديث' }}
      </button>
    </div>

    <div class="groups-panel__grid">
      <div class="groups-card">
        <h4 class="groups-card__title">المجموعات</h4>
        <div class="groups-form-row">
          <label>الفريق</label>
          <select v-model="selectedTeamId" class="groups-input" :disabled="Boolean(forcedTeamId)">
            <option value="">اختر فريقاً</option>
            <option v-for="team in teamOptions" :key="team.id" :value="String(team.id)">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div class="groups-form-row">
          <label>اسم المجموعة</label>
          <input v-model="groupForm.name" type="text" class="groups-input" placeholder="أدخل اسم المجموعة" />
        </div>
        <div class="groups-form-row">
          <label>الوصف</label>
          <textarea
            v-model="groupForm.description"
            rows="2"
            class="groups-input groups-input--textarea"
            placeholder="وصف المجموعة"
          ></textarea>
        </div>
        <div class="groups-actions">
          <button type="button" class="groups-panel__btn" @click="submitGroup" :disabled="groupsSaving">
            {{ groupsSaving ? 'جاري الحفظ...' : editingGroupId ? 'تحديث المجموعة' : 'إنشاء مجموعة' }}
          </button>
          <button
            v-if="editingGroupId"
            type="button"
            class="groups-panel__btn groups-panel__btn--secondary"
            @click="resetGroupForm"
          >
            إلغاء التعديل
          </button>
        </div>
        <div v-if="groupsLoading" class="groups-empty">جاري تحميل المجموعات...</div>
        <div v-else-if="groups.length === 0" class="groups-empty">لا توجد مجموعات حالياً.</div>
        <ul v-else class="groups-list">
          <li v-for="group in groups" :key="groupId(group)" class="groups-item">
            <div class="groups-item__main">
              <strong>{{ groupName(group) }}</strong>
              <small>{{ teamName(groupTeamId(group)) }}</small>
              <small>قائد المجموعة: {{ groupLeaderDisplayName(group) }}</small>
            </div>
            <div class="groups-item__actions">
              <button type="button" class="groups-link-btn" @click="showGroup(group)">التفاصيل</button>
              <button type="button" class="groups-link-btn" @click="startEditGroup(group)">تعديل</button>
              <button type="button" class="groups-link-btn groups-link-btn--danger" @click="removeGroup(group)">حذف</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="groups-card">
        <h4 class="groups-card__title">تفاصيل المجموعة</h4>
        <div v-if="groupDetailsLoading" class="groups-empty">جاري تحميل التفاصيل...</div>
        <div v-else-if="!selectedGroup" class="groups-empty">اختر مجموعة لعرض التفاصيل.</div>
        <template v-else>
          <div class="groups-detail">
            <p><strong>الاسم:</strong> {{ groupName(selectedGroup) }}</p>
            <p><strong>الفريق:</strong> {{ teamName(groupTeamId(selectedGroup)) }}</p>
            <p><strong>الوصف:</strong> {{ selectedGroup.description || '-' }}</p>
            <p><strong>قائد المجموعة:</strong> {{ selectedGroupLeaderLabel }}</p>
          </div>

          <div class="groups-form-row">
            <label>تعيين قائد المجموعة</label>
            <select v-model="groupLeaderFormUserId" class="groups-input">
              <option value="">اختر عضواً</option>
              <option v-for="member in groupMemberOptions" :key="'leader-' + member.value" :value="member.value">
                {{ member.label }}
              </option>
            </select>
          </div>
          <div class="groups-actions">
            <button type="button" class="groups-panel__btn" @click="assignGroupLeader" :disabled="groupLeaderSaving">
              {{ groupLeaderSaving ? 'جاري الحفظ...' : 'تعيين القائد' }}
            </button>
            <button
              type="button"
              class="groups-panel__btn groups-panel__btn--secondary"
              @click="clearGroupLeader"
              :disabled="groupLeaderSaving"
            >
              إزالة القائد
            </button>
          </div>

          <h5 class="groups-mini-title">الأعضاء</h5>
          <div class="groups-form-row">
            <label>إضافة عضو إلى هذه المجموعة</label>
            <select v-model="groupMemberFormUserId" class="groups-input">
              <option value="">اختر عضواً</option>
              <option v-for="member in freeTeamMemberOptions" :key="'member-' + member.value" :value="member.value">
                {{ member.label }}
              </option>
            </select>
          </div>
          <div class="groups-actions">
            <button type="button" class="groups-panel__btn" @click="addMember" :disabled="groupMemberAdding">
              {{ groupMemberAdding ? 'جاري الإضافة...' : 'إضافة عضو' }}
            </button>
          </div>

          <div v-if="groupMembers.length === 0" class="groups-empty">لا يوجد أعضاء في هذه المجموعة.</div>
          <ul v-else class="groups-list">
            <li v-for="member in groupMembers" :key="memberId(member)" class="groups-item">
              <div class="groups-item__main">
                <strong>{{ memberName(member) }}</strong>
                <small>المعرّف: {{ memberId(member) }}</small>
              </div>
              <div class="groups-item__actions">
                <button
                  type="button"
                  class="groups-link-btn groups-link-btn--danger"
                  @click="removeMember(member)"
                  :disabled="groupMemberRemovingId === memberId(member)"
                >
                  {{ groupMemberRemovingId === memberId(member) ? 'جاري الإزالة...' : 'إزالة العضو' }}
                </button>
              </div>
            </li>
          </ul>
        </template>
      </div>
    </div>

    <div v-if="!hideSalesLeaderSection" class="groups-panel__grid">
      <div class="groups-card">
        <h4 class="groups-card__title">تعيين قائد فريق</h4>
        <div class="groups-form-row">
          <label>الفريق</label>
          <select v-model="salesLeaderAssign.team_id" class="groups-input">
            <option value="">اختر الفريق</option>
            <option v-for="team in teamOptions" :key="team.id" :value="String(team.id)">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div class="groups-form-row">
          <label>القائد</label>
          <select v-model="salesLeaderAssign.user_id" class="groups-input">
            <option value="">اختر القائد</option>
            <option v-for="leader in salesLeaderOptions" :key="leader.value" :value="leader.value">
              {{ leader.label }}
            </option>
          </select>
        </div>
        <div class="groups-actions">
          <button type="button" class="groups-panel__btn" @click="assignSalesLeader" :disabled="salesLeaderSaving">
            {{ salesLeaderSaving ? 'جاري الحفظ...' : 'تعيين القائد' }}
          </button>
        </div>

        <h5 class="groups-mini-title">القادة المعيّنون</h5>
        <div v-if="salesLeadersLoading" class="groups-empty">جاري تحميل القادة...</div>
        <div v-else-if="salesLeaders.length === 0" class="groups-empty">لا يوجد قادة معيّنون.</div>
        <ul v-else class="groups-list">
          <li v-for="row in salesLeaders" :key="salesLeaderRowKey(row)" class="groups-item">
            <div class="groups-item__main">
              <strong>{{ salesLeaderName(row) }}</strong>
              <small>الفريق: {{ teamName(salesLeaderTeamId(row)) }} | المستخدم: {{ salesLeaderUserId(row) }}</small>
            </div>
            <div class="groups-item__actions">
              <button type="button" class="groups-link-btn groups-link-btn--danger" @click="removeSalesLeader(row)">
                إزالة
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div class="groups-card">
        <h4 class="groups-card__title">قادة المجموعات</h4>
        <div v-if="groupLeadersLoading" class="groups-empty">جاري تحميل القادة...</div>
        <div v-else-if="groupLeaders.length === 0" class="groups-empty">لا يوجد قادة مجموعات.</div>
        <ul v-else class="groups-list">
          <li v-for="row in groupLeaders" :key="groupLeaderRowKey(row)" class="groups-item">
            <div class="groups-item__main">
              <strong>{{ groupLeaderName(row) }}</strong>
              <small>المجموعة: {{ groupLeaderGroupId(row) }} | المستخدم: {{ groupLeaderUserId(row) }}</small>
            </div>
            <div class="groups-item__actions">
              <button
                type="button"
                class="groups-link-btn groups-link-btn--danger"
                @click="removeGroupLeaderFromRow(row)"
              >
                إزالة
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
/* eslint-disable max-lines */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

const props = defineProps({
  teams: { type: Array, default: () => [] },
  forcedTeamId: { type: [String, Number], default: '' },
  hideSalesLeaderSection: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  source: { type: String, default: 'project_management' },
});

const apiOptions = computed(() => ({ source: props.source === 'hr' ? 'hr' : 'project_management' }));

const selectedTeamId = ref('');
const groups = ref([]);
const groupsLoading = ref(false);
const groupsSaving = ref(false);
const editingGroupId = ref(null);
const groupForm = reactive({
  name: '',
  description: '',
});
const selectedGroup = ref(null);
const groupDetailsLoading = ref(false);
const groupMembers = ref([]);
const groupMemberRemovingId = ref('');
const groupMemberFormUserId = ref('');
const groupMemberAdding = ref(false);
const groupLeaderFormUserId = ref('');
const groupLeaderSaving = ref(false);
const selectedGroupTeamMembers = ref([]);
const groupLeaders = ref([]);
const groupLeadersLoading = ref(false);
const salesLeaderAssign = reactive({
  team_id: '',
  user_id: '',
});
const salesLeaders = ref([]);
const salesLeadersLoading = ref(false);
const salesLeaderSaving = ref(false);
const isRefreshingAll = ref(false);

const salesLeaderOptions = computed(() => {
  const seen = new Set();
  const options = [];
  const rows = Array.isArray(salesLeaders.value) ? salesLeaders.value : [];
  rows.forEach(row => {
    const id = salesLeaderUserId(row);
    if (id == null || id === '') return;
    const value = String(id);
    if (seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label: salesLeaderName(row),
    });
  });
  return options;
});

const selectedGroupTeamMemberOptions = computed(() => {
  const rows = Array.isArray(selectedGroupTeamMembers.value) ? selectedGroupTeamMembers.value : [];
  return rows
    .map(row => {
      const id = String(row?.user_id ?? row?.id ?? row?.user?.id ?? '');
      const name =
        row?.name || row?.full_name || row?.user?.name || row?.email || `المستخدم #${id || '-'}`;
      return { value: id, label: name };
    })
    .filter(o => o.value);
});

const groupMemberOptions = computed(() =>
  (Array.isArray(groupMembers.value) ? groupMembers.value : [])
    .map(member => ({
      value: String(memberId(member)),
      label: memberName(member),
    }))
    .filter(option => option.value)
);

const freeTeamMemberOptions = computed(() => {
  const used = new Set(
    (Array.isArray(groupMembers.value) ? groupMembers.value : [])
      .map(memberId)
      .filter(Boolean)
      .map(String)
  );
  return selectedGroupTeamMemberOptions.value.filter(o => !used.has(String(o.value)));
});

const selectedGroupLeaderLabel = computed(() => groupLeaderDisplayName(selectedGroup.value));

const teamOptions = computed(() =>
  (Array.isArray(props.teams) ? props.teams : [])
    .map(team => ({
      id: team?.id ?? team?.team_id,
      name: team?.name || team?.team_name || `الفريق #${team?.id ?? team?.team_id}`,
    }))
    .filter(team => team.id != null && team.id !== '')
);

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function groupId(group) {
  return group?.id ?? group?.team_group_id ?? group?.group_id ?? null;
}

function groupTeamId(group) {
  return group?.team_id ?? group?.team?.id ?? group?.teamId ?? null;
}

function groupName(group) {
  return group?.name || group?.group_name || `المجموعة #${groupId(group) ?? '-'}`;
}

function memberId(member) {
  return String(member?.user_id ?? member?.id ?? member?.user?.id ?? '');
}

function memberName(member) {
  return member?.name || member?.full_name || member?.user?.name || member?.email || `المستخدم #${memberId(member)}`;
}

function teamName(teamId) {
  const match = teamOptions.value.find(team => String(team.id) === String(teamId));
  return match?.name || (teamId ? `الفريق #${teamId}` : '-');
}

function groupLeaderDisplayName(group) {
  const inlineName =
    group?.leader?.user?.name ||
    group?.leader?.name ||
    group?.leader_name ||
    group?.user?.name ||
    '';
  if (String(inlineName || '').trim()) return String(inlineName).trim();

  const currentGroupId = groupId(group);
  if (!currentGroupId) return 'null';
  const row = (Array.isArray(groupLeaders.value) ? groupLeaders.value : []).find(
    item => String(groupLeaderGroupId(item)) === String(currentGroupId)
  );
  const resolvedName =
    row?.leader?.user?.name ||
    row?.leader?.name ||
    row?.user?.name ||
    row?.name ||
    '';
  return String(resolvedName || '').trim() || 'null';
}

function resetGroupForm() {
  editingGroupId.value = null;
  groupForm.name = '';
  groupForm.description = '';
}

async function loadGroups() {
  groupsLoading.value = true;
  try {
    const list = await teamService.getTeamGroups(
      { team_id: asNumber(selectedTeamId.value) || undefined },
      apiOptions.value
    );
    const allGroups = Array.isArray(list) ? list : [];
    const teamId = asNumber(selectedTeamId.value);
    groups.value = teamId
      ? allGroups.filter(g => String(groupTeamId(g)) === String(teamId))
      : allGroups;
  } catch (error) {
    logger.error('Team groups load failed:', error);
    groups.value = [];
    toast.error('فشل تحميل المجموعات.');
  } finally {
    groupsLoading.value = false;
  }
}

async function submitGroup() {
  const teamId = asNumber(selectedTeamId.value);
  if (!teamId) {
    toast.warning('اختر الفريق أولاً.');
    return;
  }
  if (!String(groupForm.name || '').trim()) {
    toast.warning('اسم المجموعة مطلوب.');
    return;
  }
  groupsSaving.value = true;
  try {
    const payload = {
      team_id: teamId,
      name: String(groupForm.name).trim(),
      description: String(groupForm.description || '').trim(),
    };
    if (editingGroupId.value) {
      await teamService.updateTeamGroup(editingGroupId.value, payload, apiOptions.value);
      toast.success('تم تحديث المجموعة.');
    } else {
      await teamService.createTeamGroup(payload, apiOptions.value);
      toast.success('تم إنشاء المجموعة.');
    }
    resetGroupForm();
    await loadGroups();
  } catch (error) {
    logger.error('Team group save failed:', error);
    toast.error(error?.response?.data?.message || 'فشل حفظ المجموعة.');
  } finally {
    groupsSaving.value = false;
  }
}

function startEditGroup(group) {
  editingGroupId.value = groupId(group);
  groupForm.name = group?.name || group?.group_name || '';
  groupForm.description = group?.description || '';
  const teamId = groupTeamId(group);
  if (teamId != null && teamId !== '') selectedTeamId.value = String(teamId);
}

async function removeGroup(group) {
  const id = groupId(group);
  if (!id) return;
  if (!window.confirm(`هل تريد حذف المجموعة "${groupName(group)}"؟`)) return;
  try {
    await teamService.deleteTeamGroup(id, apiOptions.value);
    toast.success('تم حذف المجموعة.');
    if (String(groupId(selectedGroup.value)) === String(id)) {
      selectedGroup.value = null;
      groupMembers.value = [];
    }
    await loadGroups();
  } catch (error) {
    logger.error('Team group delete failed:', error);
    toast.error(error?.response?.data?.message || 'فشل حذف المجموعة.');
  }
}

async function showGroup(group) {
  const id = groupId(group);
  if (!id) return;
  groupDetailsLoading.value = true;
  try {
    const [detail, members] = await Promise.all([
      teamService.getTeamGroupById(id, apiOptions.value),
      teamService.getTeamGroupMembers(id, apiOptions.value),
    ]);
    selectedGroup.value = detail || group;
    groupMembers.value = Array.isArray(members) ? members : [];
    const tid = asNumber(groupTeamId(selectedGroup.value));
    if (tid) {
      const teamMembers = await teamService.getProjectManagementTeamMembers(tid, apiOptions.value);
      selectedGroupTeamMembers.value = Array.isArray(teamMembers) ? teamMembers : [];
    } else {
      selectedGroupTeamMembers.value = [];
    }
  } catch (error) {
    logger.error('Team group details failed:', error);
    toast.error(error?.response?.data?.message || 'فشل تحميل تفاصيل المجموعة.');
  } finally {
    groupDetailsLoading.value = false;
  }
}

async function removeMember(member) {
  const currentGroupId = groupId(selectedGroup.value);
  const userId = memberId(member);
  if (!currentGroupId || !userId) return;
  groupMemberRemovingId.value = userId;
  try {
    await teamService.removeTeamGroupMember(currentGroupId, userId, apiOptions.value);
    toast.success('تمت إزالة العضو من المجموعة.');
    groupMembers.value = groupMembers.value.filter(item => memberId(item) !== userId);
  } catch (error) {
    logger.error('Team group member remove failed:', error);
    toast.error(error?.response?.data?.message || 'فشل إزالة العضو.');
  } finally {
    groupMemberRemovingId.value = '';
  }
}

async function addMember() {
  const currentGroupId = groupId(selectedGroup.value);
  const userId = asNumber(groupMemberFormUserId.value);
  if (!currentGroupId || !userId) {
    toast.warning('اختر المجموعة والعضو أولاً.');
    return;
  }
  groupMemberAdding.value = true;
  try {
    const teamId = asNumber(groupTeamId(selectedGroup.value));
    if (!teamId) {
      toast.warning('اختر الفريق أولاً.');
      return;
    }
    await teamService.addProjectManagementTeamMember(teamId, userId, currentGroupId, apiOptions.value);
    toast.success('تمت إضافة العضو إلى المجموعة.');
    groupMemberFormUserId.value = '';
    await showGroup(selectedGroup.value);
  } catch (error) {
    logger.error('Team group member add failed:', error);
    toast.error(error?.response?.data?.message || 'فشل إضافة العضو.');
  } finally {
    groupMemberAdding.value = false;
  }
}

async function assignGroupLeader() {
  const currentGroupId = groupId(selectedGroup.value);
  const userId = asNumber(groupLeaderFormUserId.value);
  if (!currentGroupId || !userId) {
    toast.warning('اختر المجموعة والعضو أولاً.');
    return;
  }
  groupLeaderSaving.value = true;
  try {
    await teamService.setTeamGroupLeader(currentGroupId, userId, apiOptions.value);
    toast.success('تم تعيين قائد المجموعة.');
    await Promise.all([loadGroupLeaders(), showGroup(selectedGroup.value)]);
    groupLeaderFormUserId.value = '';
  } catch (error) {
    logger.error('Set group leader failed:', error);
    toast.error(error?.response?.data?.message || 'فشل تعيين قائد المجموعة.');
  } finally {
    groupLeaderSaving.value = false;
  }
}

async function clearGroupLeader() {
  const currentGroupId = groupId(selectedGroup.value);
  if (!currentGroupId) return;
  groupLeaderSaving.value = true;
  try {
    await teamService.removeTeamGroupLeader(currentGroupId, apiOptions.value);
    toast.success('تمت إزالة قائد المجموعة.');
    await Promise.all([loadGroupLeaders(), showGroup(selectedGroup.value)]);
  } catch (error) {
    logger.error('Remove group leader failed:', error);
    toast.error(error?.response?.data?.message || 'فشل إزالة قائد المجموعة.');
  } finally {
    groupLeaderSaving.value = false;
  }
}

function groupLeaderGroupId(row) {
  return row?.team_group_id ?? row?.group_id ?? row?.team_group?.id ?? null;
}

function groupLeaderUserId(row) {
  return (
    row?.user_id ??
    row?.leader_id ??
    row?.user?.id ??
    row?.leader?.id ??
    row?.member_user_id ??
    row?.employee_id ??
    null
  );
}

function groupLeaderName(row) {
  return row?.name || row?.leader?.name || row?.user?.name || `المستخدم #${groupLeaderUserId(row) ?? '-'}`;
}

function groupLeaderRowKey(row) {
  return `${groupLeaderGroupId(row) ?? 'g'}-${groupLeaderUserId(row) ?? 'u'}`;
}

async function loadGroupLeaders() {
  groupLeadersLoading.value = true;
  try {
    const list = await teamService.getTeamGroupLeaders({}, apiOptions.value);
    groupLeaders.value = Array.isArray(list) ? list : [];
  } catch (error) {
    logger.error('Group leaders load failed:', error);
    groupLeaders.value = [];
    if (error?.response?.status !== 403) {
      toast.error('فشل تحميل قادة المجموعات.');
    }
  } finally {
    groupLeadersLoading.value = false;
  }
}

async function removeGroupLeaderFromRow(row) {
  const id = groupLeaderGroupId(row);
  if (!id) return;
  try {
    await teamService.removeTeamGroupLeader(id, apiOptions.value);
    toast.success('تمت إزالة قائد المجموعة.');
    await loadGroupLeaders();
    if (String(groupId(selectedGroup.value)) === String(id)) {
      await showGroup(selectedGroup.value);
    }
  } catch (error) {
    logger.error('Remove group leader row failed:', error);
    toast.error(error?.response?.data?.message || 'فشل إزالة قائد المجموعة.');
  }
}

function salesLeaderTeamId(row) {
  return (
    row?.team_id ??
    row?.team?.id ??
    row?.teamId ??
    row?.sales_team_id ??
    row?.pivot?.team_id ??
    null
  );
}

function salesLeaderUserId(row) {
  return (
    row?.user_id ??
    row?.leader_id ??
    row?.user?.id ??
    row?.leader?.id ??
    row?.member_user_id ??
    row?.employee_id ??
    row?.pivot?.user_id ??
    null
  );
}

function salesLeaderName(row) {
  return row?.name || row?.leader?.name || row?.user?.name || `المستخدم #${salesLeaderUserId(row) ?? '-'}`;
}

function salesLeaderRowKey(row) {
  return `${salesLeaderTeamId(row) ?? 't'}-${salesLeaderUserId(row) ?? 'u'}`;
}

async function loadSalesLeaders() {
  if (props.hideSalesLeaderSection) {
    salesLeaders.value = [];
    return;
  }
  salesLeadersLoading.value = true;
  try {
    const list = await teamService.getSalesLeaders({}, apiOptions.value);
    salesLeaders.value = Array.isArray(list) ? list : [];
  } catch (error) {
    logger.error('Sales leaders load failed:', error);
    salesLeaders.value = [];
    if (error?.response?.status !== 403) {
      toast.error('فشل تحميل قادة الفرق.');
    }
  } finally {
    salesLeadersLoading.value = false;
  }
}

async function assignSalesLeader() {
  const teamId = asNumber(salesLeaderAssign.team_id);
  const userId = asNumber(salesLeaderAssign.user_id);
  if (!teamId || !userId) {
    toast.warning('اختر الفريق والقائد أولاً.');
    return;
  }
  salesLeaderSaving.value = true;
  try {
    await teamService.assignSalesLeaderToTeam(teamId, userId, apiOptions.value);
    toast.success('تم تعيين القائد للفريق.');
    salesLeaderAssign.user_id = '';
    await loadSalesLeaders();
  } catch (error) {
    logger.error('Assign sales leader failed:', error);
    toast.error(error?.response?.data?.message || 'فشل تعيين القائد.');
  } finally {
    salesLeaderSaving.value = false;
  }
}

async function removeSalesLeader(row) {
  const teamIdCandidates = [
    asNumber(salesLeaderTeamId(row)),
    asNumber(salesLeaderAssign.team_id),
  ].filter(Boolean);
  const userIdCandidates = [
    asNumber(salesLeaderUserId(row)),
    asNumber(row?.id),
  ].filter(Boolean);
  if (teamIdCandidates.length === 0 || userIdCandidates.length === 0) {
    toast.warning('بيانات القائد غير مكتملة.');
    return;
  }
  try {
    let removed = false;
    for (const teamId of teamIdCandidates) {
      for (const userId of userIdCandidates) {
        try {
          await teamService.removeSalesLeaderFromTeam(teamId, userId, apiOptions.value);
          removed = true;
          break;
        } catch (_innerError) {
          // try next possible identifier pair
        }
      }
      if (removed) break;
    }
    if (!removed) throw new Error('Failed to remove sales leader with available identifiers.');
    toast.success('تمت إزالة القائد من الفريق.');
    await loadSalesLeaders();
  } catch (error) {
    logger.error('Remove sales leader failed:', error);
    toast.error(error?.response?.data?.message || 'فشل إزالة القائد.');
  }
}

async function refreshAll() {
  isRefreshingAll.value = true;
  try {
    await Promise.all([loadGroupLeaders(), loadSalesLeaders()]);
  } finally {
    isRefreshingAll.value = false;
  }
}

watch(
  teamOptions,
  (options) => {
    if (!selectedTeamId.value && options.length > 0 && !(props.forcedTeamId != null && props.forcedTeamId !== '')) {
      selectedTeamId.value = String(options[0].id);
      salesLeaderAssign.team_id = String(options[0].id);
    }
  },
  { immediate: true }
);

watch(selectedTeamId, () => {
  loadGroups();
});

watch(
  () => props.forcedTeamId,
  (teamId) => {
    if (teamId != null && teamId !== '') {
      selectedTeamId.value = String(teamId);
      salesLeaderAssign.team_id = String(teamId);
      loadGroups();
    }
  },
  { immediate: true }
);

onMounted(() => {
  refreshAll();
});
</script>

<style scoped src="./styles/TeamGroupsManagementPanel.scoped.css"></style>
