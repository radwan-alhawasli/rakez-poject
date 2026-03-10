<template>
  <div class="project-tracker-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل بيانات المشروع...</p>
    </div>

    <template v-else-if="project">
      <!-- Project Header -->
      <div class="project-header">
        <div class="header-image-container">
          <img
            :src="project.image || placeholderProjectSvg"
            alt="Project Image"
            class="header-image"
            @error="$event.target.src = placeholderProjectSvg"
          />
          <div class="header-overlay"></div>
          <div class="header-content">
            <div class="header-top">
              <span class="last-update">تاريخ التحديث: {{ currentDate }}</span>
              <span class="last-update-time">{{ currentTime }}</span>
            </div>
            <h1 class="project-title-large">{{ project.name }}</h1>
            <p v-if="project.notes" class="project-subtitle-large">{{ project.notes }}</p>
          </div>
        </div>
      </div>

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

const placeholderProjectSvg =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%221200%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

const isLoading = ref(true);
const activeTab = ref(route.query.tab || 'progress');
const project = ref(null);
const projectProgress = ref(null);
const isTrackerCompleted = ref(false);
const currentDate = new Date().toISOString().split('T')[0];
const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const isManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 1 || user?.type == 3 || user?.type == 10;
});
/** Only admin or PM manager can approve/reject photography (not PM employee) */
const isApprovalManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 1 || user?.type == 10 || (user?.type == 3 && !!user?.is_manager);
});
const isSalesUser = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 5;
});
const isProjectManager = computed(() => {
  const user = authService.getCurrentUser();
  return user?.type == 3;
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

const fetchProject = async () => {
  isLoading.value = true;
  try {
    const id = route.params.id;
    const user = authService.getCurrentUser();
    const isEditor = user && user.type == 4;
    const isSales = user && user.type == 5;

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
    } catch (e) {
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
      // Normalize from GET /contracts/show/:id (notes, project_progress, project_name)
      project.value = {
        ...data,
        name: data.project_name || data.name,
        image: data.project_image_url || data.image,
        notes: data.notes ?? null,
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
}

/* Header Styles */
.project-header {
  position: relative;
  height: 300px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0;
}
.header-image-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 100%);
}
.header-content {
  position: absolute;
  bottom: 30px;
  right: 30px;
  color: white;
  z-index: 2;
  text-align: right;
}
.header-top {
  display: flex;
  gap: 15px;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 10px;
}
.project-title-large {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 5px 0;
}
.project-subtitle-large {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* Tabs */
.tabs-nav {
  background: white;
  padding: 0 30px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}
.nav-tab {
  padding: 20px 5px;
  background: none;
  border: none;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}
.nav-tab.active {
  color: #1e3a5f;
  font-weight: 700;
}
.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #b1a28f;
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

/* Tracker Container */
.tracker-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  text-align: right;
  direction: rtl;
}

.loading-state,
.error-state {
  padding: 100px;
  text-align: center;
  color: #94a3b8;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Responsive ===== */
@media (max-width: 992px) {
  .project-header { height: 240px; }
  .project-title-large { font-size: 28px; }
  .project-subtitle-large { font-size: 14px; }
  .header-content { bottom: 20px; right: 20px; }
  .tabs-nav { padding: 0 20px; gap: 20px; }
  .tracker-container { padding: 20px 16px; }
}
@media (max-width: 768px) {
  .project-header { height: 200px; }
  .project-title-large { font-size: 24px; }
  .project-subtitle-large { font-size: 13px; }
  .header-content { bottom: 16px; right: 16px; }
  .header-top { font-size: 11px; gap: 10px; }
  .tabs-nav {
    padding: 0 12px;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .nav-tab {
    padding: 14px 8px;
    font-size: 13px;
    white-space: nowrap;
  }
  .tracker-container { padding: 16px 12px; }
}
@media (max-width: 576px) {
  .project-header { height: 160px; }
  .project-title-large { font-size: 20px; }
  .project-subtitle-large { font-size: 12px; }
  .header-content { bottom: 12px; right: 12px; left: 12px; }
  .header-top { font-size: 10px; gap: 8px; }
  .tabs-nav {
    padding: 0 8px;
    gap: 0;
    margin-bottom: 16px;
  }
  .nav-tab {
    padding: 12px 6px;
    font-size: 12px;
    min-height: 44px;
  }
  .tab-hint { display: none; }
  .tracker-container { padding: 12px 8px; }
  .loading-state,
  .error-state { padding: 40px 16px; }
}
@media (max-width: 320px) {
  .project-header { height: 130px; }
  .project-title-large { font-size: 17px; }
  .project-subtitle-large { font-size: 11px; }
  .header-content { bottom: 8px; right: 8px; left: 8px; }
  .nav-tab { font-size: 11px; padding: 10px 4px; }
}
@media (min-width: 1920px) {
  .project-header { height: 400px; }
  .project-title-large { font-size: 48px; }
  .project-subtitle-large { font-size: 20px; }
  .header-content { bottom: 40px; right: 40px; }
  .header-top { font-size: 14px; }
  .tabs-nav { padding: 0 40px; gap: 40px; }
  .nav-tab { padding: 24px 8px; font-size: 17px; }
  .tracker-container { max-width: 1500px; padding: 40px 28px; }
}
@media (min-width: 2560px) {
  .tracker-container { max-width: 1900px; }
  .project-title-large { font-size: 56px; }
}
</style>
