<template>
  <div class="boards-view">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">اللوحات</h1>
        <p class="welcome-subtitle">إدارة لوحات المشاريع وإضافة تفاصيل الوحدات.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        المشاريع التي لم يتم إضافة لوحات لها ({{ pendingProjects.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'completed' }]"
        @click="activeTab = 'completed'"
      >
        تم إضافة لوحات لها ({{ completedProjects.length }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProjects">إعادة المحاولة</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Projects List -->
      <div v-if="projectsToDisplay.length === 0" class="empty-state">
        <p>لا توجد مشاريع في هذه القائمة.</p>
      </div>

      <div v-else class="projects-grid">
        <div v-for="project in projectsToDisplay" :key="project.id" class="project-card">
          <!-- Project Info -->
          <div class="project-header">
            <div class="project-title-row">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-id">#{{ project.id }}</span>
            </div>
            <p class="project-location">{{ project.location }}</p>
          </div>

          <!-- Add Board Action (Only for Pending) -->
          <div v-if="activeTab === 'pending'" class="card-actions">
            <button class="add-board-btn" @click="openBoardForm(project)">
              <span>+</span> إضافة اللوحات
            </button>
          </div>

          <!-- Completed State Info -->
          <div v-else class="card-actions">
            <div class="completed-badge">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              تم إضافة اللوحات
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Board Modal/Overlay -->
    <!-- Add Board Modal/Overlay -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <!-- Close Button -->
        <button class="close-btn" @click="closeForm">×</button>

        <!-- Header (Red Title) -->
        <div class="modal-header-strip">اعداد اللوحات</div>

        <div class="form-container">
          <!-- Purple Section -->
          <div class="section-card purple-theme">
            <div class="section-header">اضافة مميزات الوحدة</div>
            <div class="section-body vertical-layout">
              <input
                type="text"
                v-model="formData.projectSetback"
                placeholder="ارتداد المشروع"
                class="box-input"
              />
              <input
                type="text"
                v-model="formData.unitFoundation"
                placeholder="وحدة مؤسسة"
                class="box-input"
              />
              <input type="text" v-model="formData.view" placeholder="اطلالة" class="box-input" />
              <input
                type="text"
                v-model="formData.guardRoom"
                placeholder="غرفة حارس"
                class="box-input"
              />
              <input
                type="text"
                v-model="formData.maidRoom"
                placeholder="غرفة خادمة"
                class="box-input"
              />
            </div>
          </div>

          <!-- Yellow Section -->
          <div class="section-card yellow-theme">
            <div class="section-header">ارفاق تفاصيل</div>
            <div class="section-body grid-layout">
              <div class="grid-row">
                <input
                  type="text"
                  v-model="formData.electricity"
                  placeholder="كهرباء"
                  class="box-input"
                />
                <input type="text" v-model="formData.water" placeholder="ماء" class="box-input" />
              </div>
              <div class="grid-row">
                <input type="text" v-model="formData.sewage" placeholder="صرف" class="box-input" />
                <input
                  type="text"
                  v-model="formData.readyForHousing"
                  placeholder="جاهز للسكن"
                  class="box-input"
                />
              </div>
              <div class="grid-row single">
                <input
                  type="text"
                  v-model="formData.guardNumber"
                  placeholder="رقم الحارس"
                  class="box-input"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveBoard">حفظ اللوحات</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';

export default {
  name: 'BoardsView',
  setup() {
    const activeTab = ref('pending');
    const isLoading = ref(false);
    const error = ref(null);
    const allProjects = ref([]);
    const showForm = ref(false);
    const selectedProject = ref(null);

    // Form Data
    const formData = ref({
      projectSetback: '',
      unitFoundation: '',
      view: '',
      guardRoom: '',
      maidRoom: '',
      electricity: '',
      water: '',
      sewage: '',
      readyForHousing: '',
      guardNumber: '',
    });

    const fetchProjects = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const { items } = await contractService.getContracts({ page: 1, per_page: 500 });
        const data = items ?? [];
        allProjects.value = (Array.isArray(data) ? data : []).map(p => {
          const savedBoard = localStorage.getItem(`board_${p.id}`);
          return {
            id: p.id,
            name: p.project_name || p.name || `مشروع #${p.id}`,
            location: `${p.district || ''} - ${p.city || ''}`,
            hasBoard: !!savedBoard,
          };
        });
      } catch (err) {
        logger.error('Error fetching boards projects:', err);
        error.value = 'حدث خطأ في تحميل المشاريع';
      } finally {
        isLoading.value = false;
      }
    };

    const pendingProjects = computed(() => allProjects.value.filter(p => !p.hasBoard));
    const completedProjects = computed(() => allProjects.value.filter(p => p.hasBoard));

    const projectsToDisplay = computed(() => {
      return activeTab.value === 'pending' ? pendingProjects.value : completedProjects.value;
    });

    const openBoardForm = project => {
      selectedProject.value = project;
      // Reset Form
      formData.value = {
        projectSetback: '',
        unitFoundation: '',
        view: '',
        guardRoom: '',
        maidRoom: '',
        electricity: '',
        water: '',
        sewage: '',
        readyForHousing: '',
        guardNumber: '',
      };
      showForm.value = true;
    };

    const closeForm = () => {
      showForm.value = false;
      selectedProject.value = null;
    };

    const saveBoard = () => {
      if (!selectedProject.value) return;

      // Save to localStorage
      const boardData = {
        ...formData.value,
        projectId: selectedProject.value.id,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`board_${selectedProject.value.id}`, JSON.stringify(boardData));

      // Update local state
      const idx = allProjects.value.findIndex(p => p.id === selectedProject.value.id);
      if (idx !== -1) {
        allProjects.value[idx].hasBoard = true;
      }

      // Close and notify
      closeForm();
    };

    onMounted(fetchProjects);

    return {
      activeTab,
      isLoading,
      error,
      pendingProjects,
      completedProjects,
      projectsToDisplay,
      showForm,
      formData,
      openBoardForm,
      closeForm,
      saveBoard,
      fetchProjects,
    };
  },
};
</script>

<style scoped src="./styles/BoardsView.scoped.s1.css"></style>
<style scoped src="./styles/BoardsView.scoped.s2.css"></style>
