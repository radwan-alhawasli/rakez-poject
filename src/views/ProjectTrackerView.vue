<template>
  <div class="project-tracker-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات المشروع...</p>
    </div>

    <template v-else-if="project">
      <header class="tracker-page-header">
        <div class="tracker-page-header__accent" aria-hidden="true"></div>
        <div class="tracker-page-header__inner">
          <div class="tracker-page-header__meta">
            <span>تاريخ التحديث: {{ currentDate }}</span>
            <span class="tracker-page-header__time">{{ currentTime }}</span>
          </div>
          <h1 class="tracker-page-header__title">{{ project.name }}</h1>
          <p v-if="project.notes" class="tracker-page-header__notes">{{ project.notes }}</p>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button
          v-if="!isSalesUser"
          class="nav-tab"
          :class="{ active: activeTab === 'progress' }"
          @click="activeTab = 'progress'"
        >
          تقدم المشروع والمستندات
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'units' }"
          @click="selectUnitsTab"
          :disabled="!isTrackerCompleted && !isManager && !isSalesUser"
        >
          الوحدات
        </button>
        <button
          v-if="isManager"
          class="nav-tab"
          :class="{ active: activeTab === 'photography' }"
          @click="activeTab = 'photography'"
        >
          التصوير
        </button>
        <button
          v-if="isManager"
          class="nav-tab"
          :class="{ active: activeTab === 'boards' }"
          @click="activeTab = 'boards'"
        >
          اللوحات
        </button>
        <button
          v-if="isManager && !isProjectManager"
          class="nav-tab"
          :class="{ active: activeTab === 'teams' }"
          @click="activeTab = 'teams'"
        >
          الفرق
        </button>
        <button
          v-if="isManager && !isProjectManager"
          class="nav-tab"
          :class="{ active: activeTab === 'reservations' }"
          @click="activeTab = 'reservations'"
        >
          الحجوزات
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="tracker-container">
        <ProjectProgressTab
          v-if="activeTab === 'progress'"
          :project-id="project.id"
          :is-sales-user="isSalesUser"
          :project-progress="projectProgress"
          @tracker-completed="onTrackerCompleted"
        />

        <ProjectPhotographyTab
          v-if="activeTab === 'photography'"
          :project-id="project.id"
          :project-name="project.name"
          :is-manager="isApprovalManager"
        />

        <ProjectBoardsTab
          v-else-if="activeTab === 'boards'"
          :project-id="project.id"
          :project-name="project.name"
        />

        <ProjectUnitsTab
          v-else-if="activeTab === 'units'"
          :project-id="project.id ?? project.contract_id ?? route.params.id"
          :project-name="project.name"
          :project="project"
          :is-sales-user="isSalesUser"
          :is-project-manager="isProjectManager"
          :can-reserve="canReserve"
        />

        <ProjectTeamsTab
          v-else-if="activeTab === 'teams'"
          :project-id="project.id"
        />

        <ProjectReservationsTab
          v-else-if="activeTab === 'reservations'"
          :project-id="project.id"
        />
      </div>
    </template>

    <div v-else class="error-state">
      <p>لم يتم العثور على المشروع.</p>
      <button @click="$router.push('/project-management')">العودة للقائمة</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import contractService from '@/services/contractService';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import ProjectProgressTab from '@/components/project/ProjectProgressTab.vue';
import ProjectUnitsTab from '@/components/project/ProjectUnitsTab.vue';
import ProjectPhotographyTab from '@/components/project/ProjectPhotographyTab.vue';
import ProjectBoardsTab from '@/components/project/ProjectBoardsTab.vue';
import ProjectTeamsTab from '@/components/project/ProjectTeamsTab.vue';
import ProjectReservationsTab from '@/components/project/ProjectReservationsTab.vue';

const route = useRoute();

const isLoading = ref(true);
const activeTab = ref(route.query.tab || 'progress');
const project = ref(null);

const projectProgress = ref(null);
const isTrackerCompleted = ref(false);
const currentDate = new Date().toISOString().split('T')[0];
const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 1 || user?.type == 2 || user?.type == 10;
});
/** Only admin or PM manager can approve/reject photography (not PM employee) */
const isApprovalManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 1 || user?.type == 10 || (user?.type == 2 && !!user?.is_manager);
});
const isSalesUser = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 6;
});
const isProjectManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 2;
});
const canReserve = computed(() => isSalesUser.value);

watch(
  isSalesUser,
  (sales) => { if (sales && activeTab.value === 'progress') activeTab.value = 'units'; },
  { immediate: true },
);

const selectUnitsTab = () => {
  if (!isTrackerCompleted.value && !isManager.value && !isSalesUser.value) {
    toast.warning('يجب إكمال جميع مراحل المتتبع أولاً');
    return;
  }
  activeTab.value = 'units';
};

const checkTrackerCompletion = (progress) => {
  if (!progress?.steps || !Array.isArray(progress.steps)) return false;
  return progress.steps.every(s => s.completed);
};

const onTrackerCompleted = () => {
  isTrackerCompleted.value = true;
  fetchProject();
};

const fetchProject = async () => {
  isLoading.value = true;
  try {
    const id = route.params.id;
    const user = authService.getCurrentUser();
    const isEditor = user && user.type == 3;
    const isSales = user && user.type == 6;

    let data = null;
    try {
      if (isEditor) {
        data = await contractService.getEditorContractById(id);
      } else if (isSales) {
        const res = await salesService.getProjectDetails(id);
        const raw = res.data?.data || res.data || res;
        project.value = {
          ...raw,
          id: raw.contract_id ?? raw.id ?? id,
          name: raw.project_name || raw.name,
          advertiser_number: raw.advertiser_number || raw.advertiser_section_url || raw.advertiser_num_id || '—',
          developer_name: raw.developer_name || raw.developer || raw.developer_info?.name,
          location: raw.location || [raw.city, raw.district].filter(Boolean).join(' - '),
          description: raw.description || raw.project_description || raw.details,
          avgPrice: raw.average_unit_price || raw.avg_unit_price || raw.price,
        };
        data = project.value;
      } else {
        data = await contractService.getContractById(id);
      }
    } catch (_e) {
      logger.debug('Main fetch failed, utilizing fallback');
    }

    if (!data || !data.project_name) {
      let list = [];
      if (isEditor) {
        list = await contractService.getEditorContracts();
      } else {
        const res = await contractService.getContracts({ page: 1, per_page: 100 });
        list = res.items || [];
      }
      const found = list.find(p => (p.id ?? p.contract_id) == id);
      if (found) {
        project.value = found;
        if (found.project_progress) {
          projectProgress.value = found.project_progress;
          isTrackerCompleted.value = checkTrackerCompletion(found.project_progress);
        }
      }
    } else {
      // Normalize from GET /contracts/show/:id — تضمين الحقول المرجعة (unit_count, total_price, user, ...)
      const photo = data.photography_department;
      const projectImage =
        data.project_image_url ||
        (photo && (photo.image_url || photo.image)) ||
        data.image;
      project.value = {
        ...data,
        name: data.project_name || data.name,
        image: projectImage,
        notes: data.notes ?? data.note ?? null,
        unit_count: data.unit_count ?? null,
        total_price: data.total_price ?? null,
        user: data.user ?? null,
        commission_percentage: data.commission_percent ?? data.commission_percentage ?? null,
        commission_from: data.commission_from ?? null,
        info: data.info ?? null,
        second_party_data: data.second_party_data ?? null,
        photography_department: data.photography_department ?? null,
        boards_department: data.boards_department ?? null,
        montage_department: data.montage_department ?? null,
      };
    }

    if (!project.value) {
      project.value = { id, name: 'أدوار رحاب 1 - حي التعاون الرياض' };
    }

    if (data?.project_progress) {
      projectProgress.value = data.project_progress;
      isTrackerCompleted.value = checkTrackerCompletion(data.project_progress);
    }

    try {
      const trackerData = await contractService.getSecondPartyData(id);
      if (trackerData?.data) {
        const stageKeys = [
          'real_estate_papers_url', 'plans_equipment_docs_url', 'project_logo_url',
          'completion_certificate_url', 'prices_units_url', 'marketing_license_url',
          'advertiser_section_url',
        ];
        const allCompleted = stageKeys.every(k => !!trackerData.data[k]);
        if (allCompleted) isTrackerCompleted.value = true;
      }
    } catch (_) { /* restricted access */ }
  } catch (e) {
    logger.error('Error loading project view:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchProject();
  if (isProjectManager.value && (activeTab.value === 'teams' || activeTab.value === 'reservations')) {
    activeTab.value = 'progress';
  }
});
</script>

<style scoped>
.project-tracker-view {
  padding-bottom: 50px;
  min-height: 100%;
  background: linear-gradient(
    180deg,
    var(--color-cream-gold-light, #f8f4ec) 0%,
    var(--color-off-white, #fdfbf7) 320px,
    var(--color-off-white, #fdfbf7) 100%
  );
}

/* رأس الصفحة — بدون صور، طبقات لونية خفيفة وهوية راكز */
.tracker-page-header {
  position: relative;
  direction: rtl;
  /* inline-start = بداية السطر في RTL = أقصى اليمين */
  text-align: start;
  background: linear-gradient(
    145deg,
    var(--color-white, #fff) 0%,
    var(--color-cream-gold, #faf6f0) 42%,
    var(--color-white, #fff) 100%
  );
  border-bottom: 1px solid rgba(181, 169, 154, 0.35);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
}
.tracker-page-header__accent {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--color-navy-dark, #1a2636) 0%,
    var(--color-gold, #b5a99a) 45%,
    var(--color-navy, #27374d) 100%
  );
}
.tracker-page-header__inner {
  position: relative;
  max-width: 1200px;
  margin-inline-start: 0;
  margin-inline-end: auto;
  padding: 26px 30px 26px 36px;
}
.tracker-page-header__inner::before {
  content: '';
  position: absolute;
  top: 50%;
  inset-inline-start: 22px;
  inset-inline-end: auto;
  transform: translateY(-50%);
  width: 5px;
  height: clamp(48px, 12vw, 72px);
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(
    180deg,
    var(--color-gold-light, #c5baad),
    var(--color-gold-dark, #9a8d7d)
  );
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.18);
  pointer-events: none;
}
.tracker-page-header__meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 12px;
  padding: 6px 12px;
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--color-navy, #27374d);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(181, 169, 154, 0.45);
  border-radius: var(--radius-full, 9999px);
  box-shadow: 0 1px 4px rgba(39, 55, 77, 0.06);
}
.tracker-page-header__time {
  opacity: 0.88;
  font-variant-numeric: tabular-nums;
}
.tracker-page-header__title {
  margin: 0 0 8px 0;
  font-size: clamp(1.4rem, 3.2vw, 2.05rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-navy, #27374d);
  line-height: 1.28;
}
.tracker-page-header__notes {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-dark-gray, #64748b);
  max-width: 56rem;
}

/* Tabs */
.tabs-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky, 200);
  background: var(--color-white, #fff);
  padding: 10px clamp(12px, 3vw, 28px) 0;
  border-bottom: 1px solid var(--color-medium-gray, #e2e8f0);
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 28px;
  box-shadow: 0 8px 32px -20px rgba(39, 55, 77, 0.18);
}
.nav-tab {
  padding: 16px 14px;
  background: none;
  border: none;
  font-size: 15px;
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  position: relative;
  font-weight: 500;
  border-radius: var(--radius-sm, 8px) var(--radius-sm, 8px) 0 0;
  transition:
    color var(--transition-fast, 0.15s ease),
    background var(--transition-fast, 0.15s ease);
}
.nav-tab:hover:not(:disabled) {
  color: var(--color-navy, #27374d);
  background: rgba(39, 55, 77, 0.05);
}
.nav-tab.active {
  color: var(--color-navy, #27374d);
  font-weight: 700;
  background: linear-gradient(
    180deg,
    rgba(181, 169, 154, 0.14) 0%,
    transparent 72%
  );
}
.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-navy, #27374d),
    var(--color-gold, #b5a99a)
  );
  border-radius: 3px 3px 0 0;
}
.nav-tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.tab-hint {
  font-size: 10px;
  opacity: 0.7;
}

/* Tracker Container — تباعد أفقي أخف لاستغلال عرض الشبكة */
.tracker-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6px clamp(12px, 3vw, 28px) 32px;
  text-align: right;
  direction: rtl;
}

.loading-state,
.error-state {
  padding: 100px;
  text-align: center;
  color: var(--color-dark-gray, #64748b);
}
.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-light-gray, #f8fafc);
  border-top-color: var(--color-gold, #b5a99a);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.08);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Responsive ===== */
@media (max-width: 992px) {
  .tracker-page-header__inner { padding: 22px 20px 22px 28px; }
  .tracker-page-header__inner::before { inset-inline-start: 16px; height: 52px; }
  .tracker-page-header__notes { font-size: 14px; }
  .tabs-nav { padding: 8px 18px 0; gap: 12px; }
  .tracker-container { padding: 6px 16px 28px; }
}
@media (max-width: 768px) {
  .tracker-page-header__inner { padding: 18px 20px 18px 14px; }
  .tracker-page-header__inner::before { display: none; }
  .tracker-page-header__title,
  .tracker-page-header__notes { padding-left: 0; padding-right: 0; }
  .tracker-page-header__meta { font-size: 11px; padding: 6px 12px; }
  .tabs-nav {
    padding: 6px 12px 0;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .nav-tab {
    padding: 14px 8px;
    font-size: 13px;
    white-space: nowrap;
  }
  .tracker-container { padding: 4px 12px 24px; }
}
@media (max-width: 576px) {
  .tracker-page-header__inner { padding: 16px 14px 16px 12px; }
  .tabs-nav {
    padding: 4px 8px 0;
    gap: 0;
    margin-bottom: 16px;
  }
  .nav-tab {
    padding: 12px 6px;
    font-size: 12px;
    min-height: 44px;
  }
  .tab-hint { display: none; }
  .tracker-container { padding: 4px 8px 20px; }
  .loading-state,
  .error-state { padding: 40px 16px; }
}
@media (max-width: 320px) {
  .nav-tab { font-size: 11px; padding: 10px 4px; }
}
@media (min-width: 1920px) {
  .tracker-page-header__inner { padding: 30px 44px 30px 36px; }
  .tracker-page-header__title { font-size: 2.25rem; }
  .tabs-nav { padding: 12px 40px 0; gap: 28px; }
  .nav-tab { padding: 20px 16px; font-size: 17px; }
  .tracker-container { max-width: 1500px; padding: 12px 28px 44px; }
}
@media (min-width: 2560px) {
  .tracker-container { max-width: 1900px; }
  .tracker-page-header__title { font-size: 2.5rem; }
}
</style>
