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
        <div class="tracker-page-header__mesh" aria-hidden="true"></div>
        <div class="tracker-page-header__inner">
          <div class="tracker-page-header__luxury-row">
            <div class="tracker-brand-mark">
              <span class="tracker-brand-mark__pillar" aria-hidden="true"></span>
              <div class="tracker-brand-mark__lockup">
                <span class="tracker-brand-mark__en">RAKEZ</span>
                <span class="tracker-brand-mark__ar">راكز العقارية</span>
              </div>
            </div>
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
/* شفافة — تظهر خلفية المنطقة الرئيسية في MainLayout (الصورة + الطبقة الشفافة) */
.project-tracker-view {
  padding-bottom: 50px;
  min-height: 100%;
  background: transparent;
}

/* رأس المتتبع — طبقة فاخرة بعيدة عن أسلوب بطاقات الوحدات */
.tracker-page-header {
  position: relative;
  direction: rtl;
  text-align: start;
  overflow: hidden;
  background: linear-gradient(
    155deg,
    #fdfcfa 0%,
    #f4efe6 38%,
    #faf7f2 72%,
    #ffffff 100%
  );
  border-bottom: 1px solid rgba(26, 38, 54, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 24px 48px -32px rgba(26, 38, 54, 0.12);
}
.tracker-page-header__mesh {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.45;
  background-image:
    radial-gradient(ellipse 120% 80% at 100% 0%, rgba(181, 169, 154, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 90% 60% at 0% 100%, rgba(39, 55, 77, 0.06) 0%, transparent 50%);
}
.tracker-page-header__accent {
  height: 3px;
  background: linear-gradient(
    90deg,
    #0f172a 0%,
    #c4a574 38%,
    #d4bc94 52%,
    #1e293b 100%
  );
  box-shadow: 0 0 20px rgba(196, 165, 116, 0.35);
}
.tracker-page-header__inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-inline-start: 0;
  margin-inline-end: auto;
  padding: 22px 28px 28px 32px;
}
.tracker-page-header__luxury-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
}
.tracker-brand-mark {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 52px;
}
/* شعار راكز — عمود ذهبي + كلمة إنجليزية + سطر عربي */
.tracker-brand-mark__pillar {
  position: relative;
  width: 6px;
  align-self: stretch;
  min-height: 48px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    #e8dcc8 0%,
    #b8956a 42%,
    #8b6914 78%,
    #4a3728 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(74, 55, 40, 0.25);
}
.tracker-brand-mark__pillar::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 60%);
  pointer-events: none;
}
.tracker-brand-mark__lockup {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tracker-brand-mark__en {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  font-weight: 700;
  letter-spacing: 0.38em;
  text-indent: 0.38em;
  color: #0f172a;
  line-height: 1.1;
}
.tracker-brand-mark__ar {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(15, 23, 42, 0.55);
  text-transform: none;
}
.tracker-page-header__title {
  margin: 0 0 10px 0;
  font-size: clamp(1.45rem, 3.2vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-navy, #1e293b);
  line-height: 1.25;
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
  .tracker-page-header__inner { padding: 20px 18px 24px 22px; }
  .tracker-page-header__luxury-row { gap: 14px; }
  .tracker-page-header__notes { font-size: 14px; }
  .tabs-nav { padding: 8px 18px 0; gap: 12px; }
  .tracker-container { padding: 6px 16px 28px; }
}
@media (max-width: 768px) {
  .tracker-page-header__inner { padding: 16px 16px 22px 16px; }
  .tracker-page-header__luxury-row {
    justify-content: center;
  }
  .tracker-brand-mark__en { letter-spacing: 0.28em; text-indent: 0.28em; }
  .tracker-page-header__title,
  .tracker-page-header__notes { padding-left: 0; padding-right: 0; }
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
  .tracker-page-header__inner { padding: 14px 12px 18px 12px; }
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
