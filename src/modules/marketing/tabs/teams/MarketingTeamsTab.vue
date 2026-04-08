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

<style scoped src="./styles/MarketingTeamsTab.scoped.css"></style>
