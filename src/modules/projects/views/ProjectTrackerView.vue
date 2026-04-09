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
import { extractSecondPartyShowRow, isProjectProgressFullyCompleted } from '@/utils/projectProgressSteps';
import { isSalesLeader } from '@/utils/rbac';
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
/** موظف مبيعات (6) أو قائد مبيعات (7) أو مسوّق مع علامة قائد — نفس واجهة تفاصيل المشروع */
const isSalesUser = computed(() => {
  const user = authService.getCurrentUser();
  if (!user) return false;
  const t = user.type;
  return t == 6 || t == 7 || isSalesLeader(user);
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

const checkTrackerCompletion = progress => isProjectProgressFullyCompleted(progress);

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
    const isSales =
      user && (user.type == 6 || user.type == 7 || isSalesLeader(user));

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
      const spRow = extractSecondPartyShowRow(trackerData);
      if (spRow) {
        const stageKeys = [
          'real_estate_papers_url',
          'plans_equipment_docs_url',
          'project_logo_url',
          'prices_units_url',
          'marketing_license_url',
          'advertiser_section_url',
        ];
        const allCompleted = stageKeys.every(k => !!spRow[k]);
        const hasProgressSteps =
          Array.isArray(projectProgress.value?.steps) && projectProgress.value.steps.length > 0;
        if (allCompleted && !hasProgressSteps) {
          isTrackerCompleted.value = true;
        }
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

<style scoped src="./styles/ProjectTrackerView.scoped.s1.css"></style>
