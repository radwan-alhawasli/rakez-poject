<template>
  <div class="marketing-teams-page">
    <div class="mteams-toolbar">
      <button type="button" class="btn-secondary mteams-back" @click="goBackToProjects">مشاريع التسويق</button>
    </div>

    <div v-if="!hasQuery" class="overview-section mteams-empty-card">
      <p class="mteams-empty-text">افتح مشروعاً من «مشاريع التسويق»، ثم اضغط «إدارة فرق التسويق» للوصول إلى هذه الصفحة.</p>
      <button type="button" class="btn-primary" @click="goBackToProjects">الانتقال إلى المشاريع</button>
    </div>

    <div v-else-if="isLoadingProject && !projectDetails" class="overview-section mteams-loading">
      <div class="mteams-spinner" />
      <p class="mteams-muted">جاري تحميل المشروع...</p>
    </div>

    <div v-else-if="!projectDetails" class="overview-section mteams-empty-card">
      <p class="mteams-empty-text">تعذر تحميل بيانات المشروع. تحقق من الرابط أو الصلاحيات.</p>
      <button type="button" class="btn-primary" @click="goBackToProjects">العودة للمشاريع</button>
    </div>

    <template v-else>
      <section class="overview-section mteams-intro">
        <div class="section-header-compact">
          <h1 class="section-title">إدارة فرق التسويق</h1>
          <p class="section-subtitle">{{ projectTitle }}</p>
        </div>
        <div class="mteams-recommended-inline">
          <span class="mteams-rec-label">الموظف المقترح للتواصل</span>
          <span class="mteams-rec-value">{{ getRecommendedEmployee(projectDetails) }}</span>
        </div>
      </section>

      <section class="overview-section mteams-panel" aria-label="المسوق الأعلى تقييماً">
        <div class="section-header">
          <h2 class="section-title-chart">المسوق الأعلى تقييماً</h2>
          <p class="section-desc">يُحسب من بيانات أعضاء الفرق المرتبطة بالمشروع عند توفر حقول تقييم في الـ API.</p>
        </div>
        <div v-if="isLoadingMembers && !topMarketerEntry" class="mteams-muted">جاري تحميل بيانات الأعضاء...</div>
        <div v-else-if="!topMarketerEntry" class="mteams-placeholder-box">
          لا توجد بيانات تقييم متاحة حالياً. عندما يعيد الخادم تقييماً لأعضاء الفرق سيظهر المسوق الأعلى هنا تلقائياً.
        </div>
        <div v-else class="mteams-top-winner">
          <div class="mteams-top-name">{{ memberDisplayName(topMarketerEntry.member) }}</div>
          <div class="mteams-top-meta">
            <span class="mteams-pill">التقييم: {{ formatRating(topMarketerEntry.score) }}</span>
            <span v-if="topMarketerEntry.team" class="mteams-pill mteams-pill--soft">الفريق: {{ teamLabel(topMarketerEntry.team) }}</span>
          </div>
        </div>
      </section>

      <section class="overview-section mteams-panel">
        <div class="section-header">
          <h2 class="section-title-chart">فرق المشروع</h2>
          <p class="section-desc">تعيين الصلاحيات للفرق المسؤولة عن هذا المشروع.</p>
        </div>

        <div class="mteams-add-row">
          <button
            type="button"
            class="btn-primary mteams-add-btn"
            :disabled="!selectedTeamIdToAdd || isTeamActionLoading"
            @click="assignTeamToProject"
          >
            {{ isTeamActionLoading ? 'جاري...' : '+ إضافة' }}
          </button>
          <select v-model="selectedTeamIdToAdd" class="mteams-select">
            <option value="" disabled>اختر فريقاً للإضافة...</option>
            <option v-for="team in availableTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </div>

        <div v-if="(assignedTeams || []).length === 0" class="mteams-placeholder-box mteams-placeholder-box--compact">
          لا توجد فرق معينة لهذا المشروع بعد. اختر فريقاً من القائمة أعلاه ثم اضغط «إضافة».
        </div>
        <div v-else class="teams-grid">
          <div
            v-for="t in assignedTeams"
            :key="t.id"
            class="team-card"
            :class="{ active: selectedTeamId === String(t.id) }"
            role="button"
            tabindex="0"
            @click="selectTeam(t.id)"
            @keydown.enter.prevent="selectTeam(t.id)"
          >
            <div class="team-card-head">
              <span class="team-name">{{ teamLabel(t) }}</span>
              <button
                type="button"
                class="remove-team"
                title="إزالة"
                @click.stop="removeTeamFromProject(t)"
              >
                ×
              </button>
            </div>
            <span class="team-desc">{{ t.description || 'فريق تسويق' }}</span>
          </div>
        </div>
      </section>

      <section v-if="selectedTeamId" class="overview-section mteams-panel mteams-members-wrap">
        <div class="section-header">
          <h2 class="section-title-chart">مسوّقو الفريق المحدد</h2>
          <p class="section-desc">اختر فريقاً من البطاقات أعلاه لعرض الأعضاء.</p>
        </div>
        <div v-if="isLoadingMembers" class="mteams-muted">جاري التحميل...</div>
        <div v-else-if="selectedMembers.length" class="leads-table-container mteams-table-wrap">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>التقييم</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, idx) in selectedMembers" :key="memberKey(m, idx)">
                <td class="lead-name">{{ memberDisplayName(m) }}</td>
                <td>{{ m.email || m.user?.email || '—' }}</td>
                <td>{{ ratingCell(m) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="mteams-placeholder-box mteams-placeholder-box--compact">لا يوجد أعضاء لهذا الفريق أو لم تُرجع الـ API قائمة.</p>
      </section>
    </template>

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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import marketingService from '@/services/marketingService';
import teamService from '@/services/teamService';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useMarketingProjectTeams } from '@/composables/marketing/useMarketingProjectTeams';
import { getRecommendedEmployee as getRecommendedEmployeePure } from '@/modules/marketing/tabs/projects/marketingProjectsUiHelpers.js';

const route = useRoute();
const router = useRouter();

const projectDetails = ref(null);
const isLoadingProject = ref(false);
const recommendedEmployeeByProjectId = ref({});
const membersByTeamId = ref({});
const isLoadingMembers = ref(false);
const topMarketerEntry = ref(null);
const selectedTeamId = ref(null);

const hasQuery = computed(() => {
  const q = route.query;
  return !!(q.contractId || q.marketingProjectId);
});

const projectTitle = computed(() => {
  const d = projectDetails.value;
  if (!d) return '';
  return d.project_name || d.name || `مشروع #${d.id ?? ''}`;
});

const assignedTeams = computed(() => projectDetails.value?.marketing_project?.teams || []);

const selectedMembers = computed(() => {
  const id = selectedTeamId.value;
  if (!id) return [];
  const list = membersByTeamId.value[id];
  return Array.isArray(list) ? list : [];
});

function memberRatingScore(m) {
  if (!m || typeof m !== 'object') return null;
  const raw = m.leader_rating ?? m.rating ?? m.avg_rating ?? m.performance_score ?? m.score;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function memberDisplayName(m) {
  if (!m || typeof m !== 'object') return '—';
  return m.name ?? m.user?.name ?? m.user_name ?? `عضو #${m.id ?? m.user_id ?? '—'}`;
}

function memberKey(m, idx) {
  return m.id ?? m.user_id ?? idx;
}

function teamLabel(t) {
  if (!t) return '—';
  return t.name || t.user?.name || `فريق #${t.id}`;
}

function formatRating(score) {
  if (score == null || !Number.isFinite(Number(score))) return '—';
  return String(score);
}

function ratingCell(m) {
  const s = memberRatingScore(m);
  return s != null ? String(s) : '—';
}

function pickTopMarketer(teams, map) {
  let best = null;
  let bestScore = -Infinity;
  for (const t of teams) {
    if (t?.id == null) continue;
    const tid = String(t.id);
    const members = map[tid] || [];
    for (const m of members) {
      const score = memberRatingScore(m);
      if (score == null) continue;
      if (score > bestScore) {
        bestScore = score;
        best = { member: m, team: t, score };
      }
    }
  }
  return best;
}

async function fetchAllTeamMembers() {
  const teams = projectDetails.value?.marketing_project?.teams || [];
  topMarketerEntry.value = null;
  if (!teams.length) {
    membersByTeamId.value = {};
    selectedTeamId.value = null;
    return;
  }
  isLoadingMembers.value = true;
  const map = {};
  try {
    await Promise.all(
      teams.map(async t => {
        const id = t.id;
        if (id == null) return;
        try {
          const list = await teamService.getProjectManagementTeamMembers(id);
          map[String(id)] = Array.isArray(list) ? list : [];
        } catch {
          map[String(id)] = [];
        }
      })
    );
    membersByTeamId.value = map;
    topMarketerEntry.value = pickTopMarketer(teams, map);
    const validIds = new Set(teams.map(t => String(t.id)));
    if (!selectedTeamId.value || !validIds.has(selectedTeamId.value)) {
      selectedTeamId.value = teams[0]?.id != null ? String(teams[0].id) : null;
    }
  } finally {
    isLoadingMembers.value = false;
  }
}

function selectTeam(id) {
  if (id == null) return;
  selectedTeamId.value = String(id);
}

function getRecommendedEmployee(project) {
  return getRecommendedEmployeePure(project, recommendedEmployeeByProjectId.value);
}

async function loadFromRoute() {
  const contractId = route.query.contractId;
  const marketingProjectId = route.query.marketingProjectId;
  if (!contractId && !marketingProjectId) {
    projectDetails.value = null;
    return;
  }
  isLoadingProject.value = true;
  try {
    const pid = marketingProjectId ? String(marketingProjectId) : null;
    const [details, recommended] = await Promise.all([
      contractId
        ? marketingService.getProjectByContractId(contractId)
        : marketingService.getProjectById(marketingProjectId),
      pid ? marketingService.getRecommendedEmployee(pid) : Promise.resolve(null),
    ]);
    projectDetails.value = details;
    if (pid && recommended != null && typeof recommended === 'object') {
      recommendedEmployeeByProjectId.value = {
        ...recommendedEmployeeByProjectId.value,
        [pid]: recommended,
      };
    }
    await fetchAllTeamMembers();
  } catch {
    projectDetails.value = null;
    membersByTeamId.value = {};
    topMarketerEntry.value = null;
  } finally {
    isLoadingProject.value = false;
  }
}

const reloadProject = () => loadFromRoute();

const {
  availableTeams,
  selectedTeamIdToAdd,
  isTeamActionLoading,
  showConfirmModal,
  confirmModalConfig,
  loadAvailableTeams,
  assignTeamToProject,
  removeTeamFromProject,
  onConfirmModalConfirm,
} = useMarketingProjectTeams(projectDetails, reloadProject);

function goBackToProjects() {
  router.push({ name: 'MarketingProjects' }).catch(() => {});
}

onMounted(async () => {
  if (!hasQuery.value) return;
  await loadFromRoute();
  await loadAvailableTeams();
});

watch(
  () => [route.query.contractId, route.query.marketingProjectId],
  async () => {
    if (!hasQuery.value) {
      projectDetails.value = null;
      membersByTeamId.value = {};
      topMarketerEntry.value = null;
      selectedTeamId.value = null;
      return;
    }
    await loadFromRoute();
    await loadAvailableTeams();
  }
);
</script>

<style scoped>
/* لا نستخدم page-header / page-title العامة — تتعارض مع global-luxury (خلفية داكنة + نص) */
.marketing-teams-page {
  direction: rtl;
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mteams-toolbar {
  margin-bottom: 4px;
}

.mteams-back {
  font-size: 14px;
}

.mteams-intro {
  padding-bottom: 28px;
}

.mteams-recommended-inline {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(177, 162, 143, 0.2);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.mteams-rec-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.mteams-rec-value {
  font-size: 15px;
  font-weight: 600;
  color: #1e3a5f;
  line-height: 1.5;
}

.mteams-panel {
  margin-top: 0;
}

.mteams-muted {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.mteams-placeholder-box {
  margin-top: 8px;
  padding: 20px 22px;
  border-radius: 14px;
  border: 2px dashed rgba(177, 162, 143, 0.35);
  background: rgba(177, 162, 143, 0.04);
  color: #64748b;
  font-size: 14px;
  line-height: 1.65;
  text-align: right;
}

.mteams-placeholder-box--compact {
  padding: 16px 18px;
  margin-top: 12px;
}

.mteams-top-winner {
  margin-top: 12px;
  padding: 20px 22px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(39, 55, 77, 0.06) 0%, rgba(177, 162, 143, 0.1) 100%);
  border: 1px solid rgba(177, 162, 143, 0.25);
}

.mteams-top-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e3a5f;
  margin-bottom: 10px;
}

.mteams-top-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mteams-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(30, 58, 95, 0.1);
  color: #1e3a5f;
}

.mteams-pill--soft {
  background: rgba(177, 162, 143, 0.2);
  color: #5c4f3a;
}

.mteams-add-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.mteams-add-btn {
  flex-shrink: 0;
  min-width: 120px;
}

.mteams-select {
  flex: 1;
  min-width: 220px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(177, 162, 143, 0.35);
  background: #fff;
  color: #1e3a5f;
  font-size: 15px;
  font-weight: 500;
}

.mteams-select:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.2);
}

.mteams-empty-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 28px !important;
}

.mteams-empty-text {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
  max-width: 420px;
}

.mteams-loading {
  text-align: center;
  padding: 48px 24px !important;
}

.mteams-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid rgba(177, 162, 143, 0.25);
  border-top-color: #8c7851;
  border-radius: 50%;
  animation: mteams-spin 0.75s linear infinite;
}

@keyframes mteams-spin {
  to {
    transform: rotate(360deg);
  }
}

.mteams-table-wrap {
  margin-top: 8px;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.team-card {
  text-align: right;
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border: 1px solid rgba(177, 162, 143, 0.2);
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.04);
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(30, 58, 95, 0.08);
  border-color: rgba(177, 162, 143, 0.45);
}

.team-card.active {
  border-color: #b1a28f;
  box-shadow: 0 0 0 2px rgba(177, 162, 143, 0.35), 0 8px 24px rgba(30, 58, 95, 0.1);
}

.team-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.team-name {
  font-weight: 700;
  color: #1e3a5f;
  font-size: 15px;
}

.remove-team {
  background: rgba(239, 68, 68, 0.08);
  border: none;
  color: #dc2626;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.remove-team:hover {
  background: rgba(239, 68, 68, 0.18);
}

.team-desc {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin-top: 8px;
  line-height: 1.4;
}

.mteams-members-wrap {
  margin-bottom: 24px;
}

/* وضع داكن: ألوان صريحة حتى لا تختفي النصوص */
html.dark .mteams-select {
  background: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}

html.dark .mteams-placeholder-box {
  border-color: rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
}

html.dark .mteams-top-winner {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.5) 100%);
  border-color: rgba(148, 163, 184, 0.25);
}

html.dark .mteams-top-name {
  color: #f1f5f9;
}

html.dark .mteams-pill {
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
}

html.dark .mteams-pill--soft {
  background: rgba(177, 162, 143, 0.15);
  color: #d4c4a8;
}

html.dark .mteams-rec-value {
  color: #e2e8f0;
}

html.dark .team-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

html.dark .team-name {
  color: #f1f5f9;
}
</style>
